# Task 3.3: Rust Migration Readiness Assessment

## Objective

Identify TypeScript-specific patterns that would be difficult to migrate to Rust and verify that the core logic is written in a way that translates cleanly to Rust idioms.

## Rationale

The core workflow logic will eventually be rewritten in Rust. We need to ensure:

- No JavaScript-specific patterns that don’t exist in Rust
- Error handling follows Rust patterns
- Data structures are compatible with Rust’s ownership model
- No reliance on JavaScript’s dynamic typing

## Analysis Steps

### Step 1: Create Rust Readiness Analyzer

Create `scripts/check-rust-readiness.py`:

```python
#!/usr/bin/env python3
import os
import re
import json
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
        
        api_file = Path('lib/workflow-core/api.ts')
        if not api_file.exists():
            self.issues.append("API file not found")
            return False
        
        content = api_file.read_text()
        
        # Check for Result type
        if 'type Result<T>' not in content:
            self.issues.append("Missing Result<T> type (Rust pattern)")
            self.rust_compatible['error_handling'] = False
        
        # Check for try-catch (not Rust-like)
        if 'try {' in content:
            # This is OK if wrapped in Result
            try_blocks = re.findall(r'try\s*{[^}]+}\s*catch', content, re.DOTALL)
            for block in try_blocks:
                if 'return {' not in block or 'success:' not in block:
                    self.warnings.append("Try-catch should return Result type")
        
        # Check for thrown errors not wrapped in Result
        if re.search(r'throw\s+new\s+Error', content):
            # Check if it's inside a function that returns Result
            functions = re.findall(r'export function.*?^}', content, re.MULTILINE | re.DOTALL)
            for func in functions:
                if 'throw new Error' in func and 'Result<' not in func:
                    self.issues.append("Throwing errors instead of returning Result")
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
                if len(optional_chains) > 5:
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
                # In core API, we should minimize async for easier Rust port
                async_count = content.count('async')
                if async_count > 0:
                    self.warnings.append(f"Has {async_count} async functions (consider sync for core logic)")
        
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
            
            # Check for mutations
            mutations = re.findall(r'(\w+)\.(\w+)\s*=\s*', content)
            if mutations:
                # Check if they're mutating parameters (bad for Rust)
                param_mutations = []
                for obj, prop in mutations:
                    # Simple heuristic: lowercase start usually means parameter
                    if obj[0].islower() and obj not in ['this', 'self']:
                        param_mutations.append(f"{obj}.{prop}")
                
                if param_mutations:
                    self.issues.append(f"Mutating parameters: {', '.join(param_mutations[:3])}")
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
```

### Step 2: Create TypeScript to Rust Mapping Guide

Create `scripts/generate-rust-mapping.py`:

```python
#!/usr/bin/env python3
import json
from pathlib import Path

def generate_mapping_guide():
    """Generate a guide showing how TypeScript patterns map to Rust"""
    
    mappings = {
        'types': {
            'string': 'String or &str',
            'number': 'i32, i64, f64, etc.',
            'boolean': 'bool',
            'any': 'AVOID - use specific type',
            'unknown': 'AVOID - use specific type',
            'void': '()',
            'null | undefined': 'Option<T>',
            'T | Error': 'Result<T, Error>',
            'T[]': 'Vec<T>',
            'Map<K,V>': 'HashMap<K,V>',
            'Set<T>': 'HashSet<T>',
            'Promise<T>': 'Future<Output = T>'
        },
        'patterns': {
            'try { } catch { }': 'match result { Ok() => {}, Err() => {} }',
            'throw new Error()': 'return Err(Error::new())',
            'if (x === null)': 'if let None = x',
            'x?.y?.z': 'x.and_then(|x| x.y).and_then(|y| y.z)',
            '...spread': 'explicit cloning or field-by-field',
            'async/await': 'async/.await (or remove if not needed)',
            'JSON.parse()': 'serde_json::from_str()',
            'JSON.stringify()': 'serde_json::to_string()'
        },
        'api_functions': {
            'loadWorkflow(yaml: string): Result<Flow>': 
                'fn load_workflow(yaml: &str) -> Result<Flow, Error>',
            'saveWorkflow(flow: Flow): Result<string>':
                'fn save_workflow(flow: &Flow) -> Result<String, Error>',
            'validateWorkflow(flow: Flow): ValidationError[]':
                'fn validate_workflow(flow: &Flow) -> Vec<ValidationError>',
            'addStep(flow: Flow, step: Step): Result<Flow>':
                'fn add_step(flow: Flow, step: Step) -> Result<Flow, Error>'
        }
    }
    
    # Save as JSON
    output_dir = Path('reports')
    output_dir.mkdir(exist_ok=True)
    
    with open(output_dir / 'typescript-to-rust-mapping.json', 'w') as f:
        json.dump(mappings, f, indent=2)
    
    # Create markdown guide
    with open(output_dir / 'typescript-to-rust-guide.md', 'w') as f:
        f.write("# TypeScript to Rust Migration Guide\n\n")
        
        f.write("## Type Mappings\n\n")
        f.write("| TypeScript | Rust |\n")
        f.write("|------------|------|\n")
        for ts, rust in mappings['types'].items():
            f.write(f"| `{ts}` | `{rust}` |\n")
        
        f.write("\n## Pattern Mappings\n\n")
        f.write("| TypeScript Pattern | Rust Pattern |\n")
        f.write("|-------------------|-------------|\n")
        for ts, rust in mappings['patterns'].items():
            f.write(f"| `{ts}` | `{rust}` |\n")
        
        f.write("\n## API Function Signatures\n\n")
        f.write("### TypeScript\n```typescript\n")
        for ts in mappings['api_functions'].keys():
            f.write(f"{ts}\n")
        f.write("```\n\n### Rust\n```rust\n")
        for rust in mappings['api_functions'].values():
            f.write(f"{rust}\n")
        f.write("```\n")
    
    print("✅ Generated TypeScript to Rust mapping guide")

if __name__ == "__main__":
    generate_mapping_guide()
```

## Expected Output

After running all scripts:

1. `reports/rust-readiness.json` - Detailed readiness assessment
1. `reports/rust-readiness.md` - Readiness report with migration plan
1. `reports/typescript-to-rust-mapping.json` - Type/pattern mappings
1. `reports/typescript-to-rust-guide.md` - Migration guide

## Success Criteria

- [ ] All API functions return Result<T>
- [ ] No use of ‘any’ type in core
- [ ] No parameter mutations
- [ ] Pure functions (no side effects)
- [ ] Clear ownership patterns
- [ ] No framework dependencies in core
- [ ] Async minimized or eliminated in core
- [ ] Types match Protobuf schema

## Common Issues and Fixes

### Issue: Using ‘any’ type

**Fix**: Replace with specific generated types

### Issue: Throwing errors

**Fix**: Return Result<T, Error> instead

### Issue: Parameter mutation

**Fix**: Return new objects instead of mutating

### Issue: Async in core logic

**Fix**: Make synchronous or clearly separate I/O layer

### Issue: Global state access

**Fix**: Pass all dependencies as parameters

## Migration Effort Levels

### LOW (Direct Port)

- All functions return Result<T>
- No dynamic typing
- Pure functions
- Clear ownership

### MEDIUM (Some Refactoring)

- Minor issues (< 5)
- Mostly Result pattern
- Some type assertions

### HIGH (Major Refactoring)

- Many violations (> 10)
- Heavy async usage
- Dynamic typing
- Side effects in core