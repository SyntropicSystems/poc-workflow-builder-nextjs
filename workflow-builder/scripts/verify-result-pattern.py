#!/usr/bin/env python3
"""
Verify that the Result<T> pattern is implemented correctly
"""
import re
from pathlib import Path


def check_result_pattern():
    api_file = Path('lib/workflow-core/api.ts')
    
    if not api_file.exists():
        print("❌ API file not found")
        return False
    
    content = api_file.read_text()
    
    # Check for Result type usage
    if 'Result<' not in content:
        print("❌ Result<T> type not used in API")
        return False
    
    # Find all exported functions
    functions = re.findall(r'export function (\w+)', content)
    
    issues = []
    exceptions = ['validateWorkflow']  # Functions that should NOT return Result
    
    for func in functions:
        if func in exceptions:
            # Check that it doesn't return Result
            pattern = rf'export function {func}[^{{]+{{'
            match = re.search(pattern, content, re.DOTALL)
            if match and 'Result<' in match.group(0):
                issues.append(f"{func} should NOT return Result<T>")
        else:
            # Check that it returns Result
            pattern = rf'export function {func}[^{{]+{{'
            match = re.search(pattern, content, re.DOTALL)
            if match:
                signature = match.group(0)
                if 'Result<' not in signature and 'Promise<Result<' not in signature:
                    issues.append(f"{func} does not return Result<T>")
    
    if issues:
        print("❌ Functions not using Result<T> pattern correctly:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    
    print("✅ All API functions use Result<T> pattern correctly")
    return True

def check_error_handling():
    api_file = Path('lib/workflow-core/api.ts')
    content = api_file.read_text()
    
    # Check for throw statements (should be minimal)
    throws = re.findall(r'throw\s+', content)
    if len(throws) > 2:  # Allow a couple in helper functions
        print(f"⚠️  Found {len(throws)} throw statements - consider using Result.err() instead")
    
    # Check for Result.ok and Result.err usage or inline result creation
    ok_count = content.count('success: true')
    err_count = content.count('success: false')
    
    print(f"✅ Found {ok_count} success returns and {err_count} error returns")
    
    return True

def check_helper_functions():
    types_file = Path('lib/workflow-core/types.ts')
    
    if not types_file.exists():
        print("❌ types.ts file not found")
        return False
    
    content = types_file.read_text()
    
    # Check for Result helper functions
    helpers = ['ok', 'err', 'isOk', 'isErr', 'map', 'flatMap', 'unwrap', 'unwrapOr']
    missing = []
    
    for helper in helpers:
        if f'{helper}<' not in content and f'{helper}(' not in content:
            missing.append(helper)
    
    if missing:
        print(f"❌ Missing Result helper functions: {', '.join(missing)}")
        return False
    
    print("✅ Result helper functions are defined")
    return True

def check_missing_functions():
    api_file = Path('lib/workflow-core/api.ts')
    content = api_file.read_text()
    
    required_functions = [
        'loadWorkflow',
        'saveWorkflow', 
        'validateWorkflow',
        'createWorkflow',
        'createWorkflowFromTemplate',
        'addStep',
        'removeStep',
        'updateStep',
        'duplicateStep',
        'addEdge',
        'removeEdge',
        'updateEdge'
    ]
    
    missing = []
    for func in required_functions:
        if f'export function {func}' not in content and f'export async function {func}' not in content:
            missing.append(func)
    
    if missing:
        print(f"❌ Missing required functions: {', '.join(missing)}")
        return False
    
    print("✅ All required functions are implemented")
    return True

def main():
    print("=== Verifying Result<T> Pattern Implementation ===\n")
    
    all_good = True
    
    # Check Result pattern usage
    if not check_result_pattern():
        all_good = False
    
    # Check helper functions
    if not check_helper_functions():
        all_good = False
    
    # Check missing functions
    if not check_missing_functions():
        all_good = False
    
    # Check error handling
    check_error_handling()
    
    if all_good:
        print("\n✅ Result<T> pattern is properly implemented")
        return 0
    else:
        print("\n❌ Issues found - fix the violations above")
        return 1

if __name__ == "__main__":
    exit(main())
