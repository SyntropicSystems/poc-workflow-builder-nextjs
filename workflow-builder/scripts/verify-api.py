#!/usr/bin/env python3
import os
import subprocess
import sys


def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    
    # Check file has content
    with open(filepath, 'r') as f:
        content = f.read().strip()
        if len(content) < 50:
            print(f"❌ File too small: {filepath}")
            return False
    
    print(f"✅ Found: {filepath}")
    return True

def check_api_exports():
    """Verify API module has expected exports"""
    api_file = 'lib/workflow-core/api.ts'
    required_functions = [
        'loadWorkflow',
        'saveWorkflow',
        'validateWorkflow',
        'updateStep',
        'addStep',
        'removeStep',
        'createWorkflowFromTemplate'
    ]
    
    with open(api_file, 'r') as f:
        content = f.read()
        missing = []
        for func in required_functions:
            if f'export async function {func}' not in content and f'export function {func}' not in content:
                missing.append(func)
        
        if missing:
            print(f"❌ Missing exports: {', '.join(missing)}")
            return False
    
    print("✅ All API functions exported")
    return True

def run_tests():
    """Run the API shape tests"""
    result = subprocess.run(
        ['pnpm', 'test', '--run', 'lib/workflow-core/api.shape.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ API shape tests pass")
        return True
    
    print(f"❌ Tests failed:\n{result.stdout}")
    return False

def main():
    checks = [
        check_file_exists('lib/workflow-core/types.ts'),
        check_file_exists('lib/workflow-core/api.ts'),
        check_file_exists('lib/workflow-core/index.ts'),
        check_file_exists('lib/workflow-core/api.shape.test.ts'),
        check_api_exports(),
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 Core API scaffolding complete!")
        print("API boundary established and ready for implementation.")
        sys.exit(0)
    else:
        print("\n❌ API scaffolding incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
