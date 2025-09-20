#!/usr/bin/env python3
"""
Verify that all TypeScript files use the generated Protobuf types consistently
"""
import re
from pathlib import Path


def check_type_imports():
    core_dir = Path('lib/workflow-core')
    issues = []
    
    for ts_file in core_dir.glob('*.ts'):
        if 'generated' in str(ts_file) or 'test' in str(ts_file):
            continue
            
        content = ts_file.read_text()
        
        # Check if file uses Flow or Step
        uses_types = ('Flow' in content or 'Step' in content or 
                     'Policy' in content or 'Token' in content or
                     'Check' in content or 'NextStep' in content)
        
        if uses_types:
            # Check for proper import
            has_import = (
                "from './generated'" in content or
                'from "./generated"' in content or
                "from '@/lib/workflow-core/generated'" in content
            )
            
            if not has_import and ts_file.name != 'index.ts':
                issues.append(str(ts_file.relative_to(Path.cwd())))
        
        # Check for handwritten type definitions
        if re.search(r'(interface|type)\s+(Flow|Step|Policy)\s*[{=]', content):
            issues.append(f"{ts_file.name}: defines types manually")
    
    if issues:
        print("❌ Type import issues:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    
    print("✅ All files use generated types correctly")
    return True


def check_any_types():
    core_dir = Path('lib/workflow-core')
    issues = []
    
    for ts_file in core_dir.glob('*.ts'):
        if 'test' in str(ts_file) or 'generated' in str(ts_file):
            continue
            
        content = ts_file.read_text()
        
        # Check for 'any' type usage
        any_matches = re.findall(r':\s*any(?:\s|;|,|\)|\])', content)
        if any_matches:
            issues.append({
                'file': ts_file.name,
                'count': len(any_matches)
            })
    
    if issues:
        print("⚠️  Files using 'any' type:")
        for issue in issues:
            print(f"  - {issue['file']}: {issue['count']} occurrences")
        return False
    
    print("✅ No 'any' types found in core module")
    return True


def check_exports():
    index_file = Path('lib/workflow-core/index.ts')
    
    if not index_file.exists():
        print("❌ Missing lib/workflow-core/index.ts")
        return False
    
    content = index_file.read_text()
    
    # Check for type re-exports
    if 'export type { Flow, Step' not in content and "export type { Flow, Step" not in content:
        print("⚠️  Index doesn't re-export generated types")
    
    # Check for API exports
    required_exports = [
        'loadWorkflow',
        'saveWorkflow',
        'validateWorkflow',
        'createWorkflow',
        'createWorkflowFromTemplate'
    ]
    
    missing = []
    for func in required_exports:
        if func not in content:
            missing.append(func)
    
    if missing:
        print(f"⚠️  Missing exports: {', '.join(missing)}")
    
    return True


def check_type_guards():
    types_file = Path('lib/workflow-core/types.ts')
    
    if not types_file.exists():
        print("❌ types.ts file not found")
        return False
    
    content = types_file.read_text()
    
    # Check for type guard functions
    guards = ['isFlow', 'isStep']
    missing_guards = []
    
    for guard in guards:
        if f'function {guard}' not in content and f'const {guard}' not in content:
            missing_guards.append(guard)
    
    if missing_guards:
        print(f"⚠️  Consider adding type guards: {', '.join(missing_guards)}")
        # Not a failure, just a warning
    
    return True


def main():
    print("=== Verifying Type Imports and Usage ===\n")
    
    all_good = True
    
    # Check type imports
    if not check_type_imports():
        all_good = False
    
    # Check for any types
    if not check_any_types():
        all_good = False
    
    # Check exports
    check_exports()
    
    # Check type guards
    check_type_guards()
    
    if all_good:
        print("\n✅ Type imports and usage are correct")
        return 0
    else:
        print("\n❌ Issues found - fix the violations above")
        return 1


if __name__ == "__main__":
    exit(main())
