# Task 3.5: Consolidate Reports and Create Action Plan

## Objective

Consolidate all analysis reports from Phase 3 tasks and create a clear action plan for any necessary refactoring before proceeding to Phase 4.

## Prerequisites

Complete all previous Phase 3 analysis tasks:

- Task 3.1: API Boundary Analysis
- Task 3.2: Architecture Compliance Check
- Task 3.3: Rust Migration Readiness
- Task 3.4: Test Coverage Audit

## Implementation Steps

### Step 1: Create Report Consolidator

Create `scripts/consolidate-analysis.py`:

```python
#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List

class ReportConsolidator:
    def __init__(self):
        self.reports = {}
        self.critical_issues = []
        self.refactoring_tasks = []
        self.migration_blockers = []
        
    def load_reports(self):
        """Load all analysis reports"""
        print("📂 Loading analysis reports...")
        
        report_files = {
            'api_boundary': 'api-boundary-analysis.json',
            'architecture': 'architecture-compliance.json',
            'rust_readiness': 'rust-readiness.json',
            'test_coverage': 'test-coverage-audit.json'
        }
        
        reports_dir = Path('reports')
        
        for key, filename in report_files.items():
            filepath = reports_dir / filename
            if filepath.exists():
                with open(filepath, 'r') as f:
                    self.reports[key] = json.load(f)
                    print(f"  ✓ Loaded {filename}")
            else:
                print(f"  ⚠️ Missing {filename}")
                self.reports[key] = None
        
        return self.reports
    
    def analyze_critical_issues(self):
        """Identify critical issues that block progress"""
        print("\n🔍 Analyzing critical issues...")
        
        # API Boundary violations
        if self.reports.get('api_boundary'):
            violations = self.reports['api_boundary'].get('violations', [])
            for violation in violations:
                self.critical_issues.append({
                    'category': 'API Boundary',
                    'file': violation['file'],
                    'issue': violation['issues'][0],
                    'severity': 'HIGH'
                })
        
        # Architecture compliance issues
        if self.reports.get('architecture'):
            if not self.reports['architecture'].get('compliant'):
                for issue in self.reports['architecture'].get('issues', []):
                    self.critical_issues.append({
                        'category': 'Architecture',
                        'issue': issue,
                        'severity': 'HIGH'
                    })
        
        # Rust migration blockers
        if self.reports.get('rust_readiness'):
            if not self.reports['rust_readiness'].get('ready_for_rust'):
                for issue in self.reports['rust_readiness'].get('issues', []):
                    self.migration_blockers.append({
                        'issue': issue,
                        'severity': 'BLOCKER'
                    })
        
        # Low test coverage
        if self.reports.get('test_coverage'):
            coverage = self.reports['test_coverage']['summary'].get('coverage_percentage', 0)
            if coverage < 60:
                self.critical_issues.append({
                    'category': 'Testing',
                    'issue': f'Critical: Test coverage only {coverage}%',
                    'severity': 'HIGH'
                })
        
        print(f"  Found {len(self.critical_issues)} critical issues")
        print(f"  Found {len(self.migration_blockers)} migration blockers")
    
    def generate_refactoring_tasks(self):
        """Generate specific refactoring tasks"""
        print("\n📝 Generating refactoring tasks...")
        
        # Based on API boundary issues
        if self.reports.get('api_boundary'):
            for violation in self.reports['api_boundary'].get('violations', []):
                if 'YAML operations' in str(violation['issues']):
                    self.refactoring_tasks.append({
                        'id': f"refactor-{len(self.refactoring_tasks)+1}",
                        'title': 'Move YAML operations to API',
                        'description': f"Move YAML parsing/serialization from {violation['file']} to api.ts",
                        'priority': 'HIGH',
                        'estimated_hours': 1
                    })
                
                if 'Direct step manipulation' in str(violation['issues']):
                    self.refactoring_tasks.append({
                        'id': f"refactor-{len(self.refactoring_tasks)+1}",
                        'title': 'Use API for step manipulation',
                        'description': f"Replace direct manipulation in {violation['file']} with API calls",
                        'priority': 'HIGH',
                        'estimated_hours': 2
                    })
        
        # Based on Rust readiness
        if self.reports.get('rust_readiness'):
            plan = self.reports['rust_readiness'].get('migration_plan', [])
            for item in plan:
                if item['priority'] == 'HIGH':
                    self.refactoring_tasks.append({
                        'id': f"refactor-{len(self.refactoring_tasks)+1}",
                        'title': item['task'],
                        'description': item['description'],
                        'priority': item['priority'],
                        'estimated_hours': 3
                    })
        
        # Based on test coverage
        if self.reports.get('test_coverage'):
            untested = self.reports['test_coverage'].get('untested_functions', [])
            if untested:
                self.refactoring_tasks.append({
                    'id': f"refactor-{len(self.refactoring_tasks)+1}",
                    'title': 'Add missing tests',
                    'description': f"Write tests for: {', '.join(untested[:5])}",
                    'priority': 'MEDIUM',
                    'estimated_hours': 4
                })
        
        print(f"  Generated {len(self.refactoring_tasks)} refactoring tasks")
    
    def calculate_readiness_score(self):
        """Calculate overall readiness score"""
        scores = {
            'api_boundary': 0,
            'architecture': 0,
            'rust_readiness': 0,
            'test_coverage': 0
        }
        
        # API Boundary score
        if self.reports.get('api_boundary'):
            violations = len(self.reports['api_boundary'].get('violations', []))
            scores['api_boundary'] = max(0, 100 - (violations * 10))
        
        # Architecture score
        if self.reports.get('architecture'):
            if self.reports['architecture'].get('compliant'):
                scores['architecture'] = 100
            else:
                issues = len(self.reports['architecture'].get('issues', []))
                scores['architecture'] = max(0, 100 - (issues * 15))
        
        # Rust readiness score
        if self.reports.get('rust_readiness'):
            if self.reports['rust_readiness'].get('ready_for_rust'):
                scores['rust_readiness'] = 100
            else:
                compatibility = self.reports['rust_readiness'].get('compatibility', {})
                true_count = sum(1 for v in compatibility.values() if v)
                scores['rust_readiness'] = (true_count / len(compatibility)) * 100 if compatibility else 0
        
        # Test coverage score
        if self.reports.get('test_coverage'):
            scores['test_coverage'] = self.reports['test_coverage']['summary'].get('coverage_percentage', 0)
        
        overall_score = sum(scores.values()) / len(scores)
        
        return {
            'scores': scores,
            'overall': round(overall_score, 1)
        }
    
    def generate_action_plan(self):
        """Generate prioritized action plan"""
        action_plan = {
            'ready_for_phase_4': False,
            'ready_for_rust': False,
            'immediate_actions': [],
            'before_phase_4': [],
            'before_rust_migration': []
        }
        
        readiness = self.calculate_readiness_score()
        
        # Determine overall readiness
        action_plan['ready_for_phase_4'] = (
            len(self.critical_issues) == 0 and 
            readiness['overall'] >= 70
        )
        
        action_plan['ready_for_rust'] = (
            len(self.migration_blockers) == 0 and
            readiness['overall'] >= 85
        )
        
        # Categorize tasks
        for task in self.refactoring_tasks:
            if task['priority'] == 'HIGH':
                action_plan['immediate_actions'].append(task)
            elif task['priority'] == 'MEDIUM':
                action_plan['before_phase_4'].append(task)
            else:
                action_plan['before_rust_migration'].append(task)
        
        # Add specific recommendations
        if readiness['scores']['test_coverage'] < 80:
            action_plan['before_phase_4'].append({
                'title': 'Improve test coverage',
                'description': f"Increase from {readiness['scores']['test_coverage']:.1f}% to at least 80%"
            })
        
        return action_plan, readiness
    
    def generate_final_report(self):
        """Generate consolidated final report"""
        action_plan, readiness = self.generate_action_plan()
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'readiness_scores': readiness,
            'critical_issues': self.critical_issues,
            'migration_blockers': self.migration_blockers,
            'refactoring_tasks': self.refactoring_tasks,
            'action_plan': action_plan,
            'summary': {
                'phase_4_ready': action_plan['ready_for_phase_4'],
                'rust_ready': action_plan['ready_for_rust'],
                'critical_issue_count': len(self.critical_issues),
                'blocker_count': len(self.migration_blockers),
                'total_refactoring_hours': sum(
                    task.get('estimated_hours', 0) 
                    for task in self.refactoring_tasks
                )
            }
        }
        
        return report
    
    def save_consolidated_report(self, report):
        """Save the consolidated report"""
        output_dir = Path('reports')
        output_dir.mkdir(exist_ok=True)
        
        # Save JSON
        json_file = output_dir / 'consolidated-analysis.json'
        with open(json_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Save Markdown
        md_file = output_dir / 'PHASE-3-FINAL-REPORT.md'
        with open(md_file, 'w') as f:
            f.write("# Phase 3 Analysis: Final Report\n\n")
            f.write(f"**Generated**: {report['timestamp']}\n\n")
            
            # Readiness Overview
            f.write("## 🎯 Readiness Overview\n\n")
            overall = report['readiness_scores']['overall']
            if overall >= 85:
                f.write(f"### ✅ EXCELLENT ({overall}%)\n")
            elif overall >= 70:
                f.write(f"### ⚠️ GOOD ({overall}%)\n")
            else:
                f.write(f"### ❌ NEEDS WORK ({overall}%)\n")
            
            f.write("\n### Readiness Scores\n\n")
            for category, score in report['readiness_scores']['scores'].items():
                emoji = "✅" if score >= 80 else "⚠️" if score >= 60 else "❌"
                f.write(f"- {emoji} **{category.replace('_', ' ').title()}**: {score:.1f}%\n")
            
            # Decision
            f.write("\n## 🚦 Decision\n\n")
            if report['summary']['phase_4_ready']:
                f.write("### ✅ Ready for Phase 4\n")
                f.write("The codebase is ready to proceed with workflow creation features.\n\n")
            else:
                f.write("### ⚠️ Refactoring Required Before Phase 4\n")
                f.write(f"Address {len(report['action_plan']['immediate_actions'])} immediate actions first.\n\n")
            
            if report['summary']['rust_ready']:
                f.write("### ✅ Ready for Rust Migration\n")
                f.write("The architecture is clean and ready for Rust port.\n\n")
            else:
                f.write("### ⚠️ Not Ready for Rust Migration\n")
                f.write(f"Fix {report['summary']['blocker_count']} blockers before attempting Rust migration.\n\n")
            
            # Critical Issues
            if report['critical_issues']:
                f.write("## ⚠️ Critical Issues\n\n")
                for issue in report['critical_issues'][:10]:
                    f.write(f"- **{issue.get('category', 'General')}**: {issue['issue']}\n")
                f.write("\n")
            
            # Action Plan
            f.write("## 📋 Action Plan\n\n")
            
            if report['action_plan']['immediate_actions']:
                f.write("### 🔴 Immediate Actions (Do Now)\n\n")
                for task in report['action_plan']['immediate_actions']:
                    f.write(f"#### {task['title']}\n")
                    f.write(f"- {task['description']}\n")
                    f.write(f"- **Estimated**: {task.get('estimated_hours', '?')} hours\n\n")
            
            if report['action_plan']['before_phase_4']:
                f.write("### 🟡 Before Phase 4\n\n")
                for task in report['action_plan']['before_phase_4']:
                    f.write(f"- {task['title']}: {task['description']}\n")
                f.write("\n")
            
            if report['action_plan']['before_rust_migration']:
                f.write("### 🟢 Before Rust Migration\n\n")
                for task in report['action_plan']['before_rust_migration']:
                    f.write(f"- {task['title']}: {task['description']}\n")
                f.write("\n")
            
            # Estimated Effort
            f.write("## ⏱️ Estimated Effort\n\n")
            hours = report['summary']['total_refactoring_hours']
            f.write(f"- **Total Refactoring**: ~{hours} hours\n")
            f.write(f"- **Suggested Timeline**: {(hours/8):.1f} days\n\n")
            
            # Next Steps
            f.write("## 🚀 Next Steps\n\n")
            if report['summary']['phase_4_ready']:
                f.write("1. Review this report with the team\n")
                f.write("2. Proceed to Phase 4 implementation\n")
                f.write("3. Schedule refactoring sprint for medium-priority items\n")
            else:
                f.write("1. Address immediate action items\n")
                f.write("2. Re-run Phase 3 analysis\n")
                f.write("3. Once clean, proceed to Phase 4\n")
        
        print(f"✅ Consolidated report saved to {json_file}")
        print(f"✅ Final report saved to {md_file}")
        
        return json_file, md_file

def main():
    consolidator = ReportConsolidator()
    
    print("📊 Consolidating Phase 3 Analysis Reports\n")
    print("="*50)
    
    # Load all reports
    consolidator.load_reports()
    
    # Analyze issues
    consolidator.analyze_critical_issues()
    
    # Generate tasks
    consolidator.generate_refactoring_tasks()
    
    # Generate final report
    report = consolidator.generate_final_report()
    
    # Save report
    json_file, md_file = consolidator.save_consolidated_report(report)
    
    # Print summary
    print("\n" + "="*50)
    print("PHASE 3 ANALYSIS COMPLETE")
    print("="*50)
    
    readiness = report['readiness_scores']['overall']
    print(f"\nOverall Readiness: {readiness}%")
    
    if report['summary']['phase_4_ready']:
        print("✅ Ready for Phase 4!")
    else:
        print(f"⚠️ {len(report['action_plan']['immediate_actions'])} immediate actions required")
    
    if report['summary']['rust_ready']:
        print("✅ Ready for Rust migration!")
    else:
        print(f"⚠️ {report['summary']['blocker_count']} Rust migration blockers")
    
    print(f"\nEstimated refactoring effort: {report['summary']['total_refactoring_hours']} hours")
    
    print(f"\n📄 View detailed report: {md_file}")
    
    return 0 if report['summary']['phase_4_ready'] else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
```

### Step 2: Run Consolidation

```bash
# After running all other Phase 3 analysis scripts
chmod +x scripts/consolidate-analysis.py
python3 scripts/consolidate-analysis.py
```

## Expected Output

The consolidation will produce:

1. `reports/consolidated-analysis.json` - Complete data
1. `reports/PHASE-3-FINAL-REPORT.md` - Executive summary and action plan

## Success Criteria

- [ ] All individual reports loaded successfully
- [ ] Critical issues identified and categorized
- [ ] Refactoring tasks generated with estimates
- [ ] Clear go/no-go decision for Phase 4
- [ ] Rust migration readiness assessed
- [ ] Action plan is prioritized and actionable
- [ ] Timeline estimate provided

## Decision Matrix

### Ready for Phase 4 if:

- ✅ No critical API boundary violations
- ✅ Architecture mostly compliant
- ✅ Test coverage ≥ 60%
- ✅ Overall readiness ≥ 70%

### Ready for Rust if:

- ✅ All API functions use Result<T>
- ✅ No dynamic typing in core
- ✅ Clean layer separation
- ✅ Test coverage ≥ 80%
- ✅ Overall readiness ≥ 85%

## How to Use This Report

1. **Run with AI Agent**: Have Claude Code/Cline execute all Phase 3 scripts
1. **Review Final Report**: Check `PHASE-3-FINAL-REPORT.md`
1. **Make Decision**:
- If ready → Proceed to Phase 4
- If not → Execute refactoring tasks
1. **Re-run if Needed**: After refactoring, re-run Phase 3 to verify

## Refactoring Priority

### HIGH (Block Phase 4)

- API boundary violations
- Missing critical functions
- Architecture non-compliance

### MEDIUM (Before Production)

- Low test coverage
- Type safety issues
- Documentation gaps

### LOW (Nice to Have)

- Code style issues
- Performance optimizations
- Additional tests

## Final Checklist

Before proceeding to Phase 4:

- [ ] All HIGH priority refactoring complete
- [ ] Phase 3 analysis shows “Ready for Phase 4”
- [ ] Team has reviewed the report
- [ ] Git branch created for Phase 4 work
- [ ] Backup of current state created

This completes Phase 3 analysis and provides a clear path forward!