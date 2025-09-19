# Task 3.4: Test Coverage and Quality Audit

## Objective

Analyze test coverage and quality to ensure the implementation follows test-driven development principles and that tests will help validate the Rust migration.

## Rationale

Tests serve as:

- Specification for expected behavior
- Validation during Rust migration
- Documentation of API contracts
- Safety net for refactoring

## Analysis Steps

### Step 1: Create Test Coverage Analyzer

Create `scripts/analyze-test-coverage.py`:

```python
#!/usr/bin/env python3
import os
import re
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Set

class TestCoverageAnalyzer:
    def __init__(self):
        self.api_functions = set()
        self.tested_functions = set()
        self.test_files = []
        self.coverage_data = {}
        self.issues = []
        self.recommendations = []
    
    def discover_api_functions(self):
        """Find all API functions that need testing"""
        print("🔍 Discovering API functions...")
        
        api_file = Path('lib/workflow-core/api.ts')
        if not api_file.exists():
            self.issues.append("API file not found")
            return
        
        content = api_file.read_text()
        
        # Find exported functions
        functions = re.findall(r'export\s+function\s+(\w+)', content)
        self.api_functions = set(functions)
        
        print(f"  ✓ Found {len(self.api_functions)} API functions")
        return self.api_functions
    
    def discover_test_files(self):
        """Find all test files"""
        print("🔍 Discovering test files...")
        
        test_patterns = ['*.test.ts', '*.spec.ts', '*.test.tsx', '*.spec.tsx']
        
        for pattern in test_patterns:
            for test_file in Path('.').rglob(pattern):
                if 'node_modules' not in str(test_file):
                    self.test_files.append(test_file)
        
        print(f"  ✓ Found {len(self.test_files)} test files")
        return self.test_files
    
    def analyze_test_content(self):
        """Analyze what functions are being tested"""
        print("🔍 Analyzing test content...")
        
        for test_file in self.test_files:
            content = test_file.read_text()
            
            # Find imports from API
            api_imports = re.findall(
                r'import\s+{([^}]+)}\s+from\s+[\'"].*workflow-core/api',
                content
            )
            
            if api_imports:
                imported = [f.strip() for f in api_imports[0].split(',')]
                self.tested_functions.update(imported)
            
            # Count test cases
            describe_blocks = len(re.findall(r'describe\(', content))
            it_blocks = len(re.findall(r'it\(|test\(', content))
            
            self.coverage_data[str(test_file)] = {
                'describes': describe_blocks,
                'tests': it_blocks,
                'functions_tested': imported if api_imports else []
            }
        
        print(f"  ✓ Found tests for {len(self.tested_functions)} functions")
    
    def check_test_patterns(self):
        """Check for good testing patterns"""
        print("🔍 Checking test patterns...")
        
        patterns_found = {
            'result_pattern_tests': False,
            'error_case_tests': False,
            'validation_tests': False,
            'edge_case_tests': False,
            'integration_tests': False
        }
        
        for test_file in self.test_files:
            content = test_file.read_text()
            
            # Check for Result pattern testing
            if 'success: true' in content and 'success: false' in content:
                patterns_found['result_pattern_tests'] = True
            
            # Check for error case testing
            if 'should throw' in content or 'should return error' in content or 'should fail' in content:
                patterns_found['error_case_tests'] = True
            
            # Check for validation testing
            if 'validate' in content.lower():
                patterns_found['validation_tests'] = True
            
            # Check for edge cases
            if 'edge case' in content.lower() or 'boundary' in content.lower():
                patterns_found['edge_case_tests'] = True
            
            # Check for integration tests
            if 'integration' in str(test_file) or 'e2e' in str(test_file):
                patterns_found['integration_tests'] = True
        
        return patterns_found
    
    def run_coverage_command(self):
        """Try to run coverage command if available"""
        print("🔍 Attempting to run coverage analysis...")
        
        coverage_commands = [
            'pnpm test:coverage',
            'npm run test:coverage',
            'pnpm test -- --coverage'
        ]
        
        for cmd in coverage_commands:
            try:
                result = subprocess.run(
                    cmd.split(),
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                if result.returncode == 0:
                    print("  ✓ Coverage command executed successfully")
                    # Try to parse coverage output
                    if 'Coverage' in result.stdout:
                        lines = result.stdout.split('\n')
                        for line in lines:
                            if '%' in line and 'workflow-core' in line:
                                print(f"    {line.strip()}")
                    return True
            except:
                continue
        
        print("  ⚠️ No coverage command available")
        return False
    
    def calculate_coverage(self):
        """Calculate test coverage metrics"""
        untested = self.api_functions - self.tested_functions
        
        coverage = {
            'total_api_functions': len(self.api_functions),
            'tested_functions': len(self.tested_functions),
            'untested_functions': list(untested),
            'coverage_percentage': (
                len(self.tested_functions) / len(self.api_functions) * 100
                if self.api_functions else 0
            ),
            'test_files_count': len(self.test_files),
            'total_test_cases': sum(
                data['tests'] for data in self.coverage_data.values()
            )
        }
        
        return coverage
    
    def generate_missing_tests(self):
        """Generate template for missing tests"""
        untested = self.api_functions - self.tested_functions
        
        if not untested:
            return None
        
        template = """import { describe, it, expect } from 'vitest';
import {
%s
} from '@/lib/workflow-core/api';

// TODO: Add these missing tests
""" % ',\n  '.join(f"  {func}" for func in sorted(untested))
        
        for func in sorted(untested):
            template += f"""
describe('{func}', () => {{
  it('should handle valid input', () => {{
    // TODO: Implement test
    expect(true).toBe(false);
  }});
  
  it('should handle invalid input', () => {{
    // TODO: Implement test
    expect(true).toBe(false);
  }});
  
  it('should return proper Result type', () => {{
    // TODO: Implement test
    expect(true).toBe(false);
  }});
}});
"""
        
        return template
    
    def generate_report(self):
        """Generate test coverage report"""
        coverage = self.calculate_coverage()
        patterns = self.check_test_patterns()
        
        report = {
            'summary': {
                'good_coverage': coverage['coverage_percentage'] >= 80,
                'coverage_percentage': round(coverage['coverage_percentage'], 2),
                'total_functions': coverage['total_api_functions'],
                'tested_functions': coverage['tested_functions'],
                'test_files': coverage['test_files_count'],
                'total_tests': coverage['total_test_cases']
            },
            'untested_functions': coverage['untested_functions'],
            'test_patterns': patterns,
            'test_files': [
                {
                    'file': str(f),
                    'tests': self.coverage_data.get(str(f), {}).get('tests', 0)
                }
                for f in self.test_files
            ],
            'recommendations': []
        }
        
        # Add recommendations
        if coverage['coverage_percentage'] < 80:
            report['recommendations'].append(
                f"CRITICAL: Increase test coverage from {coverage['coverage_percentage']:.1f}% to at least 80%"
            )
        
        if coverage['untested_functions']:
            report['recommendations'].append(
                f"Add tests for: {', '.join(coverage['untested_functions'][:5])}"
            )
        
        if not patterns['error_case_tests']:
            report['recommendations'].append(
                "Add error case testing for all API functions"
            )
        
        if not patterns['integration_tests']:
            report['recommendations'].append(
                "Add integration tests for complete workflows"
            )
        
        return report
    
    def save_report(self, report):
        """Save test coverage report"""
        output_dir = Path('reports')
        output_dir.mkdir(exist_ok=True)
        
        # Save JSON report
        output_file = output_dir / 'test-coverage-audit.json'
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Save markdown report
        md_file = output_dir / 'test-coverage-audit.md'
        with open(md_file, 'w') as f:
            f.write("# Test Coverage Audit Report\n\n")
            
            summary = report['summary']
            status = "✅" if summary['good_coverage'] else "⚠️"
            f.write(f"## {status} Coverage: {summary['coverage_percentage']}%\n\n")
            
            f.write("## Summary\n\n")
            f.write(f"- **API Functions**: {summary['total_functions']}\n")
            f.write(f"- **Tested Functions**: {summary['tested_functions']}\n")
            f.write(f"- **Test Files**: {summary['test_files']}\n")
            f.write(f"- **Total Test Cases**: {summary['total_tests']}\n\n")
            
            if report['untested_functions']:
                f.write("## ❌ Untested Functions\n\n")
                for func in report['untested_functions']:
                    f.write(f"- `{func}()`\n")
                f.write("\n")
            
            f.write("## Test Patterns\n\n")
            for pattern, found in report['test_patterns'].items():
                status = "✅" if found else "❌"
                pattern_name = pattern.replace('_', ' ').title()
                f.write(f"- {status} {pattern_name}\n")
            
            if report['recommendations']:
                f.write("\n## Recommendations\n\n")
                for rec in report['recommendations']:
                    f.write(f"- {rec}\n")
            
            f.write("\n## Test Files\n\n")
            f.write("| File | Test Cases |\n")
            f.write("|------|------------|\n")
            for file_data in sorted(report['test_files'], 
                                   key=lambda x: x['tests'], 
                                   reverse=True):
                f.write(f"| {Path(file_data['file']).name} | {file_data['tests']} |\n")
        
        # Save missing tests template if needed
        if report['untested_functions']:
            template = self.generate_missing_tests()
            if template:
                template_file = output_dir / 'missing-tests.template.ts'
                with open(template_file, 'w') as f:
                    f.write(template)
                print(f"✅ Missing tests template saved to {template_file}")
        
        print(f"✅ Report saved to {output_file}")
        print(f"✅ Markdown report saved to {md_file}")
        
        return output_file

def main():
    analyzer = TestCoverageAnalyzer()
    
    print("🧪 Analyzing Test Coverage...\n")
    
    # Run analysis
    analyzer.discover_api_functions()
    analyzer.discover_test_files()
    analyzer.analyze_test_content()
    analyzer.check_test_patterns()
    analyzer.run_coverage_command()
    
    # Generate report
    report = analyzer.generate_report()
    
    print("\n" + "="*50)
    print("TEST COVERAGE AUDIT")
    print("="*50)
    
    summary = report['summary']
    if summary['good_coverage']:
        print(f"\n✅ Good coverage: {summary['coverage_percentage']}%")
    else:
        print(f"\n⚠️ Low coverage: {summary['coverage_percentage']}%")
    
    print(f"\nTested: {summary['tested_functions']}/{summary['total_functions']} functions")
    print(f"Test files: {summary['test_files']}")
    print(f"Total tests: {summary['total_tests']}")
    
    if report['untested_functions']:
        print(f"\n❌ Untested functions ({len(report['untested_functions'])}):")
        for func in report['untested_functions'][:5]:
            print(f"  - {func}")
        if len(report['untested_functions']) > 5:
            print(f"  ... and {len(report['untested_functions']) - 5} more")
    
    # Save report
    analyzer.save_report(report)
    
    return 0 if summary['good_coverage'] else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
```

### Step 2: Create Test Quality Checker

Create `scripts/check-test-quality.py`:

```python
#!/usr/bin/env python3
import re
from pathlib import Path
import json

def analyze_test_quality(test_file):
    """Analyze quality of individual test file"""
    content = test_file.read_text()
    
    quality_metrics = {
        'has_describes': 'describe(' in content,
        'has_assertions': 'expect(' in content,
        'tests_success_cases': 'success: true' in content or 'toBe(true)' in content,
        'tests_error_cases': 'success: false' in content or 'toThrow' in content,
        'has_setup_teardown': 'beforeEach' in content or 'afterEach' in content,
        'uses_mocks': 'mock' in content.lower() or 'spy' in content.lower(),
        'good_test_names': bool(re.findall(r'it\([\'"]should\s+\w+', content)),
        'tests_edge_cases': 'null' in content or 'undefined' in content or 'empty' in content
    }
    
    score = sum(1 for v in quality_metrics.values() if v)
    max_score = len(quality_metrics)
    
    return {
        'file': str(test_file),
        'metrics': quality_metrics,
        'score': score,
        'max_score': max_score,
        'percentage': (score / max_score) * 100
    }

def main():
    test_files = list(Path('.').rglob('*.test.ts')) + list(Path('.').rglob('*.spec.ts'))
    test_files = [f for f in test_files if 'node_modules' not in str(f)]
    
    results = []
    for test_file in test_files:
        quality = analyze_test_quality(test_file)
        results.append(quality)
    
    # Calculate average quality
    if results:
        avg_quality = sum(r['percentage'] for r in results) / len(results)
        
        print(f"\n📊 Test Quality Analysis")
        print(f"{'='*40}")
        print(f"Average Quality Score: {avg_quality:.1f}%")
        print(f"Files Analyzed: {len(results)}")
        
        # Show best and worst
        sorted_results = sorted(results, key=lambda x: x['percentage'], reverse=True)
        
        print(f"\n✅ Best Quality:")
        for result in sorted_results[:3]:
            print(f"  - {Path(result['file']).name}: {result['percentage']:.1f}%")
        
        if len(sorted_results) > 3:
            print(f"\n⚠️ Needs Improvement:")
            for result in sorted_results[-3:]:
                print(f"  - {Path(result['file']).name}: {result['percentage']:.1f}%")
        
        # Save detailed report
        output_dir = Path('reports')
        output_dir.mkdir(exist_ok=True)
        
        with open(output_dir / 'test-quality-details.json', 'w') as f:
            json.dump({
                'average_quality': avg_quality,
                'files': results
            }, f, indent=2)
        
        print(f"\n✅ Detailed report saved to reports/test-quality-details.json")
    else:
        print("No test files found")

if __name__ == "__main__":
    main()
```

### Step 3: Run Complete Test Audit

```bash
# Make scripts executable
chmod +x scripts/analyze-test-coverage.py
chmod +x scripts/check-test-quality.py

# Run test audit
python3 scripts/analyze-test-coverage.py
python3 scripts/check-test-quality.py
```

## Expected Output

The audit should produce:

1. `reports/test-coverage-audit.json` - Coverage metrics
1. `reports/test-coverage-audit.md` - Coverage report
1. `reports/test-quality-details.json` - Quality analysis
1. `reports/missing-tests.template.ts` - Template for missing tests

## Success Criteria

- [ ] Test coverage ≥ 80% for API functions
- [ ] All critical functions have tests
- [ ] Error cases are tested
- [ ] Result pattern is tested
- [ ] Validation logic is tested
- [ ] Integration tests exist
- [ ] Test files follow naming convention
- [ ] Tests have descriptive names

## Test Quality Metrics

### Good Tests Should Have:

1. **Clear names**: “should return error when ID is invalid”
1. **Arrange-Act-Assert**: Clear test structure
1. **Error testing**: Both success and failure cases
1. **Edge cases**: Null, undefined, empty values
1. **Isolated**: No dependencies between tests
1. **Fast**: No unnecessary delays
1. **Deterministic**: Same result every time

## Critical Functions to Test

### Must Have Tests:

- `loadWorkflow()` - Core functionality
- `saveWorkflow()` - Core functionality
- `validateWorkflow()` - Critical for correctness
- `createWorkflow()` - Needed for Phase 4
- `addStep()` - Data manipulation
- `removeStep()` - Data manipulation
- `addEdge()` - Graph manipulation
- `removeEdge()` - Graph manipulation

## Test-Driven Migration Strategy

When migrating to Rust:

1. **Tests as Spec**: Use tests to define expected behavior
1. **Port Tests First**: Rewrite tests in Rust
1. **Implement to Pass**: Write Rust code to pass tests
1. **Compare Results**: Run both TS and Rust versions
1. **Validate Parity**: Ensure identical behavior

## Red Flags

1. **No tests for function**: Critical API function untested
1. **Only happy path**: No error case testing
1. **Test without assertions**: Test that doesn’t verify anything
1. **Commented tests**: Disabled tests that might be important
1. **Low coverage**: < 60% coverage is concerning