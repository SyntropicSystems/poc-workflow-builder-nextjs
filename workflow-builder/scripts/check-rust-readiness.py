#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple


class RustReadinessAnalyzer:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.recommendations = []
        self.rust_compatible = {
            'error_handling': True,
            'data_structures': True,
            'no_dynamic_typing': True,
            'pure_functions': True,
            'clear_ownership': True
        }
    
    def check_error_handling(self):
        """Check if error handling follows Rust patterns"""
        print("🔍 Checking error handling patterns...")
        
        # Check for Result type in types.ts
        types_file = Path('lib/workflow-core/types.ts')
        has_result_type = False
        if types_file.exists():
            types_content = types_file.read_text()
            if 'type Result<T' in types_content or 'interface Result<T' in types_content:
                has_result_type = True
        
        if not has_result_type:
            self.issues.append("Missing Result<T> type (Rust pattern)")
            self.rust_compatible['error_handling'] = False
        
        api_file = Path('lib/workflow-core/api.ts')
        if not api_file.exists():
            self.issues.append("API file not found")
            return False
        
        content = api_file.read_text()
        
        # Check for try-catch (not Rust-like)
        if 'try {' in content:
            # This is OK if wrapped in Result
            try_blocks = re.findall(r'try\s*{[^}]+}\s*catch', content, re.DOTALL)
            for block in try_blocks:
                if 'return {' not in block or 'success:' not in block:
                    self.warnings.append("Try-catch should return Result type")
        
        # Check that API functions return Result
        # Use a more specific pattern to capture function signatures properly
        func_pattern = r'export\s+(?:async\s+)?function\s+(\w+)[^:]*:\s*([^{]+?)\s*{'
        functions = re.findall(func_pattern, content, re.DOTALL)
        
        non_result_functions = []
        for func_name, return_type in functions:
            # Skip internal helper functions and validateWorkflow (which returns errors directly)
            if func_name in ['wouldCreateCycle', 'validateWorkflow']:
                continue
            
            return_type = return_type.strip()
            # Check for Result in return type (may be wrapped in Promise for async)
            # For async functions, Result might be inside Promise<Result<T>>
            if 'Result<' not in return_type and 'Result ' not in return_type:
                # Double check by looking at the actual function body for Result returns
                func_body_pattern = rf'export\s+(?:async\s+)?function\s+{func_name}[^{{]*{{[^}}]*}}'
                func_match = re.search(func_body_pattern, content, re.DOTALL)
                if func_match:
                    func_body = func_match.group()
                    # Check if function returns Result in its body
                    if 'Result<' not in func_body or '{ success:' not in func_body:
                        non_result_functions.append(func_name)
                else:
                    non_result_functions.append(func_name)
        
        if non_result_functions:
            self.issues.append(f"Functions not returning Result<T>: {', '.join(non_result_functions)}")
            self.rust_compatible['error_handling'] = False
        
        # Check for null/undefined checks (Rust uses Option<T>)
        null_checks = re.findall(r'if\s*\([^)]*(?:===|!==)\s*(?:null|undefined)', content)
        if len(null_checks) > 10:
            self.warnings.append(f"Many null checks ({len(null_checks)}): Consider Option<T> pattern")
        
        print(f"  ✓ Analyzed error handling patterns")
        return True
    
    def check_data_structures(self):
        """Check if data structures are Rust-compatible"""
        print("🔍 Checking data structures...")
        
        api_file = Path('lib/workflow-core/api.ts')
        if api_file.exists():
            content = api_file.read_text()
            
            # Check for any (dynamic typing)
            if ': any' in content or '<any>' in content:
                self.issues.append("Using 'any' type (not Rust compatible)")
                self.rust_compatible['no_dynamic_typing'] = False
            
            # Check for complex nested structures with optional chaining
            if '?.' in content:
                optional_chains = re.findall(r'\w+\?\.\w+', content)
                if len(optional_chains) > 10:  # Increased threshold
                    self.warnings.append(f"Heavy use of optional chaining ({len(optional_chains)})")
            
            # Check for spreading (Rust doesn't have spread operator)
            if '...' in content:
                spreads = re.findall(r'\.\.\.', content)
                self.warnings.append(f"Uses spread operator {len(spreads)} times (needs explicit cloning in Rust)")
            
            # Check for Map/Set (different in Rust)
            if 'new Map(' in content or 'new Set(' in content:
                self.warnings.append("Uses JavaScript Map/Set (different API in Rust)")
            
            # Check for Promise/async patterns
            if 'Promise<' in content or 'async' in content:
                # Some async is OK, especially for I/O operations
                async_count = content.count('async')
                if async_count > 5:  # Only warn if excessive
                    self.warnings.append(f"Has {async_count} async functions (consider reducing for Rust port)")
        
        print(f"  ✓ Analyzed data structures")
        return True
    
    def check_pure_functions(self):
        """Verify functions are pure and don't rely on external state"""
        print("🔍 Checking function purity...")
        
        api_file = Path('lib/workflow-core/api.ts')
        if api_file.exists():
            content = api_file.read_text()
            
            # Check for global state access
            if re.search(r'\bwindow\.|document\.|global\.|process\.', content):
                self.issues.append("Accessing global state in core logic")
                self.rust_compatible['pure_functions'] = False
            
            # Check for side effects (console, file I/O in core)
            if 'console.' in content:
                self.warnings.append("Console logging in core (remove for Rust)")
            
            if 'readFile' in content or 'writeFile' in content:
                self.warnings.append("File I/O in core logic (should be separated)")
            
            # Check for date/time dependencies
            if 'new Date()' in content or 'Date.now()' in content:
                self.warnings.append("Time-dependent code (pass as parameter for determinism)")
            
            # Check for random number generation
            if 'Math.random()' in content:
                self.issues.append("Non-deterministic random generation")
                self.rust_compatible['pure_functions'] = False
        
        print(f"  ✓ Analyzed function purity")
        return True
    
    def check_ownership_patterns(self):
        """Check for clear ownership patterns"""
        print("🔍 Checking ownership patterns...")
        
        api_file = Path('lib/workflow-core/api.ts')
        if api_file.exists():
            content = api_file.read_text()
            
            # Check for mutations - but exclude object creation patterns
            mutations = re.findall(r'(\w+)\.(\w+)\s*=\s*[^=]', content)
            if mutations:
                # Check if they're mutating parameters (bad for Rust)
                param_mutations = []
                for obj, prop in mutations:
                    # Skip if it's part of object creation or property definition
                    # Look for actual mutations to existing objects
                    pattern = f'{obj}\\.{prop}\\s*='
                    matches = re.findall(f'{pattern}[^=]', content)
                    if matches:
                        # Check if obj is likely a parameter (lowercase, not 'this', 'self', or a type)
                        if obj[0].islower() and obj not in ['this', 'self', 'updatedStep', 'updatedWorkflow', 'cleanWorkflow']:
                            # Also check it's not a newly created object
                            if f'const {obj} =' not in content and f'let {obj} =' not in content:
                                param_mutations.append(f"{obj}.{prop}")
                
                if param_mutations:
                    # Filter out false positives from destructuring or property access
                    actual_mutations = []
                    for mut in param_mutations:
                        obj_name = mut.split('.')[0]
                        # Check if this is actually being mutated (assignment to property)
                        if re.search(f'\\b{obj_name}\\.[\\w]+\\s*=\\s*[^=]', content):
                            actual_mutations.append(mut)
                    
                    if actual_mutations:
                        self.issues.append(f"Mutating parameters: {', '.join(actual_mutations[:3])}")
                        self.rust_compatible['clear_ownership'] = False
            
            # Check for deep cloning (good - shows ownership awareness)
            if 'JSON.parse(JSON.stringify' in content:
                self.recommendations.append("Good: Using deep cloning (maps to Rust's Clone trait)")
            
            # Check for circular references
            if 'circular' in content.lower() or 'cycle' in content.lower():
                self.warnings.append("Mentions cycles/circular refs (complex in Rust)")
        
        print(f"  ✓ Analyzed ownership patterns")
        return True
    
    def check_type_safety(self):
        """Check for strong typing throughout"""
        print("🔍 Checking type safety...")
        
        for ts_file in Path('lib/workflow-core').rglob('*.ts'):
            if 'test' in str(ts_file) or 'generated' in str(ts_file):
                continue
                
            content = ts_file.read_text()
            
            # Check for type assertions (as)
            type_assertions = re.findall(r'as\s+\w+', content)
            if len(type_assertions) > 5:
                self.warnings.append(f"Many type assertions in {ts_file.name}: {len(type_assertions)}")
            
            # Check for any type
            if ': any' in content:
                self.issues.append(f"Uses 'any' type in {ts_file.name}")
                self.rust_compatible['no_dynamic_typing'] = False
            
            # Check for unknown type
            if ': unknown' in content:
                self.warnings.append(f"Uses 'unknown' type in {ts_file.name}")
        
        print(f"  ✓ Analyzed type safety")
        return True
    
    def generate_rust_migration_plan(self):
        """Generate a migration plan based on findings"""
        plan = []
        
        if not self.rust_compatible['error_handling']:
            plan.append({
                'task': 'Refactor error handling',
                'description': 'Convert all functions to return Result<T>',
                'rust_equivalent': 'Result<T, Error>',
                'priority': 'HIGH'
            })
        
        if not self.rust_compatible['no_dynamic_typing']:
            plan.append({
                'task': 'Remove dynamic typing',
                'description': 'Replace all "any" with specific types',
                'rust_equivalent': 'Strong static types',
                'priority': 'HIGH'
            })
        
        if not self.rust_compatible['pure_functions']:
            plan.append({
                'task': 'Make functions pure',
                'description': 'Remove side effects and global state access',
                'rust_equivalent': 'Pure functions with explicit parameters',
                'priority': 'MEDIUM'
            })
        
        if not self.rust_compatible['clear_ownership']:
            plan.append({
                'task': 'Clarify ownership',
                'description': 'Use immutable data, explicit cloning',
                'rust_equivalent': 'Ownership and borrowing rules',
                'priority': 'MEDIUM'
            })
        
        # Add recommendations for warnings
        if any('spread operator' in w for w in self.warnings):
            plan.append({
                'task': 'Replace spread operators',
                'description': 'Use explicit cloning/copying',
                'rust_equivalent': 'Clone trait or explicit field copying',
                'priority': 'LOW'
            })
        
        return plan
    
    def generate_report(self):
        """Generate migration readiness report"""
        migration_plan = self.generate_rust_migration_plan()
        
        report = {
            'ready_for_rust': all(self.rust_compatible.values()),
            'compatibility': self.rust_compatible,
            'issues': self.issues,
            'warnings': self.warnings,
            'recommendations': self.recommendations,
            'migration_plan': migration_plan,
            'estimated_effort': self._estimate_effort()
        }
        
        return report
    
    def _estimate_effort(self):
        """Estimate migration effort"""
        if all(self.rust_compatible.values()):
            return 'LOW - Direct port possible'
        elif len(self.issues) < 5:
            return 'MEDIUM - Some refactoring needed'
        else:
            return 'HIGH - Significant refactoring required'
    
    def save_report(self, report):
        """Save report to file"""
        output_dir = Path('reports')
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / 'rust-readiness.json'
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Create markdown report
        md_file = output_dir / 'rust-readiness.md'
        with open(md_file, 'w') as f:
            f.write("# Rust Migration Readiness Report\n\n")
            
            if report['ready_for_rust']:
                f.write("## ✅ READY FOR RUST MIGRATION\n\n")
            else:
                f.write("## ⚠️ REFACTORING NEEDED\n\n")
            
            f.write(f"**Estimated Effort**: {report['estimated_effort']}\n\n")
            
            f.write("## Compatibility Assessment\n\n")
            for key, value in report['compatibility'].items():
                status = "✅" if value else "❌"
                f.write(f"- {status} {key.replace('_', ' ').title()}\n")
            
            if report['migration_plan']:
                f.write("\n## Migration Plan\n\n")
                for item in report['migration_plan']:
                    f.write(f"### {item['task']} ({item['priority']})\n")
                    f.write(f"- **Description**: {item['description']}\n")
                    f.write(f"- **Rust Equivalent**: {item['rust_equivalent']}\n\n")
            
            if report['issues']:
                f.write("## Critical Issues\n\n")
                for issue in report['issues']:
                    f.write(f"- {issue}\n")
            
            f.write("\n## Rust Migration Checklist\n\n")
            f.write("- [ ] All functions return Result<T, Error>\n")
            f.write("- [ ] No use of 'any' type\n")
            f.write("- [ ] No parameter mutations\n")
            f.write("- [ ] All async removed from core logic\n")
            f.write("- [ ] Deep cloning explicit (Clone trait)\n")
            f.write("- [ ] No global state access\n")
            f.write("- [ ] Types generated from Protobuf\n")
        
        print(f"✅ Report saved to {output_file}")
        print(f"✅ Markdown report saved to {md_file}")
        
        return output_file

def main():
    analyzer = RustReadinessAnalyzer()
    
    print("🦀 Analyzing Rust Migration Readiness...\n")
    
    # Run analysis
    analyzer.check_error_handling()
    analyzer.check_data_structures()
    analyzer.check_pure_functions()
    analyzer.check_ownership_patterns()
    analyzer.check_type_safety()
    
    # Generate report
    report = analyzer.generate_report()
    
    print("\n" + "="*50)
    print("RUST READINESS ASSESSMENT")
    print("="*50)
    
    if report['ready_for_rust']:
        print("\n✅ Code is READY for Rust migration!")
    else:
        print("\n⚠️ Refactoring needed before Rust migration")
        print(f"\nEstimated effort: {report['estimated_effort']}")
        
        if report['issues']:
            print(f"\nCritical issues ({len(report['issues'])}):")
            for issue in report['issues'][:3]:
                print(f"  - {issue}")
    
    # Save report
    analyzer.save_report(report)
    
    return 0 if report['ready_for_rust'] else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
