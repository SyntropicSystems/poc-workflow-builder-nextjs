#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Set


class APIBoundaryAnalyzer:
    def __init__(self):
        self.violations = []
        self.warnings = []
        self.api_functions = set()
        self.ui_components = []
        self.store_files = []
        
    def scan_api_module(self):
        """Identify all exported API functions"""
        api_file = Path('lib/workflow-core/api.ts')
        if not api_file.exists():
            self.violations.append(f"Core API file not found: {api_file}")
            return
            
        content = api_file.read_text()
        # Find all exported functions
        exports = re.findall(r'export\s+function\s+(\w+)', content)
        self.api_functions = set(exports)
        
        print(f"Found {len(self.api_functions)} API functions:")
        for func in sorted(self.api_functions):
            print(f"  - {func}")
            
        return self.api_functions
    
    def scan_ui_components(self):
        """Check UI components for business logic violations"""
        components_dir = Path('components')
        if not components_dir.exists():
            return
            
        for tsx_file in components_dir.rglob('*.tsx'):
            content = tsx_file.read_text()
            relative_path = tsx_file
            
            # Check for direct workflow manipulation
            violations = []
            
            # Pattern 1: Direct step manipulation
            if re.search(r'workflow\.steps\[.*\]\s*=', content):
                violations.append("Direct step array manipulation")
            
            # Pattern 2: Direct next manipulation
            if re.search(r'step\.next\[.*\]\s*=', content):
                violations.append("Direct next object manipulation")
                
            # Pattern 3: Creating Flow/Step objects without API
            if 'as Flow' in content or 'as Step' in content:
                # Check if it's importing from API
                if 'from @/lib/workflow-core/api' not in content:
                    violations.append("Creating typed objects without API")
            
            # Pattern 4: YAML operations in UI
            if 'yaml.dump' in content or 'yaml.load' in content:
                violations.append("YAML operations should be in API")
                
            # Pattern 5: Validation logic in UI
            if 'validateWorkflow' in content and 'from @/lib/workflow-core/api' not in content:
                violations.append("Validation logic outside API")
            
            if violations:
                self.violations.append({
                    'file': str(relative_path),
                    'issues': violations
                })
            
            # Check for proper API usage
            api_imports = re.findall(r'import\s+{([^}]+)}\s+from\s+[\'"]@/lib/workflow-core/api', content)
            if api_imports:
                imported_funcs = [f.strip() for f in api_imports[0].split(',')]
                self.ui_components.append({
                    'file': str(relative_path),
                    'uses_api': imported_funcs
                })
    
    def scan_state_stores(self):
        """Analyze Zustand stores for business logic"""
        store_dir = Path('lib/state')
        if not store_dir.exists():
            return
            
        for ts_file in store_dir.glob('*.ts'):
            content = ts_file.read_text()
            relative_path = ts_file
            
            issues = []
            
            # Check if store manipulates workflows directly
            if 'JSON.parse(JSON.stringify(' in content:
                # Deep cloning is OK for state management
                pass
            
            # Check for business logic that should be in API
            if re.search(r'steps\.push\(|steps\.splice\(', content):
                if 'addStep' not in content or 'from @/lib/workflow-core/api' not in content:
                    issues.append("Step manipulation should use API functions")
            
            # Check for validation logic
            if 'if (!step.id || !step.role' in content:
                issues.append("Validation logic should be in API")
            
            # Verify store uses API functions
            api_usage = re.findall(r'import\s+{([^}]+)}\s+from\s+[\'"]@/lib/workflow-core/api', content)
            
            self.store_files.append({
                'file': str(relative_path),
                'uses_api': api_usage[0].split(',') if api_usage else [],
                'issues': issues
            })
            
            if issues:
                self.violations.append({
                    'file': str(relative_path),
                    'issues': issues
                })
    
    def check_file_operations(self):
        """Verify file operations are properly abstracted"""
        fs_files = list(Path('lib/fs').glob('*.ts')) if Path('lib/fs').exists() else []
        
        for fs_file in fs_files:
            content = fs_file.read_text()
            
            # File operations should be thin wrappers
            if 'validateWorkflow' in content or 'steps' in content:
                self.violations.append({
                    'file': str(fs_file),
                    'issues': ['File operations mixing with business logic']
                })
    
    def generate_report(self):
        """Generate analysis report"""
        report = {
            'summary': {
                'api_functions_count': len(self.api_functions),
                'ui_components_analyzed': len(self.ui_components),
                'stores_analyzed': len(self.store_files),
                'violations_found': len(self.violations),
                'warnings_count': len(self.warnings)
            },
            'api_functions': sorted(list(self.api_functions)),
            'violations': self.violations,
            'warnings': self.warnings,
            'ui_api_usage': self.ui_components,
            'store_api_usage': self.store_files,
            'recommendations': []
        }
        
        # Generate recommendations
        if self.violations:
            report['recommendations'].append(
                "CRITICAL: Move all business logic to lib/workflow-core/api.ts"
            )
            
        # Check for missing API functions
        expected_functions = [
            'loadWorkflow', 'saveWorkflow', 'validateWorkflow',
            'createWorkflow', 'updateStep', 'addStep', 'removeStep',
            'addEdge', 'removeEdge', 'duplicateStep'
        ]
        
        missing = set(expected_functions) - self.api_functions
        if missing:
            report['recommendations'].append(
                f"Missing expected API functions: {', '.join(missing)}"
            )
        
        # Check for UI components not using API
        components_not_using_api = []
        for comp_file in Path('components').rglob('*.tsx') if Path('components').exists() else []:
            rel_path = str(comp_file)
            if not any(c['file'] == rel_path for c in self.ui_components):
                content = comp_file.read_text()
                if 'workflow' in content.lower() or 'step' in content.lower():
                    components_not_using_api.append(rel_path)
        
        if components_not_using_api:
            report['warnings'].append({
                'type': 'Components not using API',
                'files': components_not_using_api
            })
        
        return report
    
    def save_report(self, report):
        """Save report to file"""
        output_dir = Path('reports')
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / 'api-boundary-analysis.json'
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Also create markdown report
        md_file = output_dir / 'api-boundary-analysis.md'
        with open(md_file, 'w') as f:
            f.write("# API Boundary Analysis Report\n\n")
            f.write(f"## Summary\n")
            f.write(f"- API Functions: {report['summary']['api_functions_count']}\n")
            f.write(f"- Components Analyzed: {report['summary']['ui_components_analyzed']}\n")
            f.write(f"- Violations Found: {report['summary']['violations_found']}\n\n")
            
            if report['violations']:
                f.write("## ⚠️ VIOLATIONS\n\n")
                for violation in report['violations']:
                    f.write(f"### {violation['file']}\n")
                    for issue in violation['issues']:
                        f.write(f"- {issue}\n")
                    f.write("\n")
            
            if report['recommendations']:
                f.write("## 📋 Recommendations\n\n")
                for rec in report['recommendations']:
                    f.write(f"- {rec}\n")
                f.write("\n")
            
            f.write("## API Functions Found\n\n")
            for func in report['api_functions']:
                f.write(f"- `{func}()`\n")
        
        print(f"\n✅ Report saved to {output_file}")
        print(f"✅ Markdown report saved to {md_file}")
        
        return output_file

def main():
    analyzer = APIBoundaryAnalyzer()
    
    print("🔍 Analyzing API Boundary...\n")
    
    # Run analysis
    analyzer.scan_api_module()
    print("\n📁 Scanning UI Components...")
    analyzer.scan_ui_components()
    print("\n📦 Scanning State Stores...")
    analyzer.scan_state_stores()
    print("\n📂 Checking File Operations...")
    analyzer.check_file_operations()
    
    # Generate report
    report = analyzer.generate_report()
    
    # Print summary
    print("\n" + "="*50)
    print("ANALYSIS COMPLETE")
    print("="*50)
    
    if report['violations']:
        print(f"\n❌ Found {len(report['violations'])} violation(s)")
        for v in report['violations'][:3]:  # Show first 3
            print(f"  - {v['file']}: {v['issues'][0]}")
        if len(report['violations']) > 3:
            print(f"  ... and {len(report['violations']) - 3} more")
    else:
        print("\n✅ No API boundary violations found!")
    
    # Save report
    analyzer.save_report(report)
    
    # Return exit code based on violations
    exit_code = 1 if report['violations'] else 0
    return exit_code

if __name__ == "__main__":
    import sys
    sys.exit(main())
