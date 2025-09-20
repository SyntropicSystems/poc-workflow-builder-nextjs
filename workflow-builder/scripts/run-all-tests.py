#!/usr/bin/env python3
"""
Run all tests and generate coverage report for the workflow-core API functions
"""
import re
import subprocess
import sys
from pathlib import Path


def run_tests():
    """Run all tests with coverage"""
    
    print("🧪 Running all tests with coverage...\n")
    
    # Run tests with coverage (--run ensures it exits, not watch mode)
    result = subprocess.run(
        ['pnpm', 'test', '--run', '--coverage'],
        capture_output=True,
        text=True
    )
    
    print(result.stdout)
    
    if result.stderr:
        print("STDERR:", result.stderr)
    
    success = result.returncode == 0
    
    if not success:
        print("❌ Some tests failed")
        return False, result.stdout
    
    return True, result.stdout

def check_test_files():
    """Verify all test files exist"""
    test_files = [
        'lib/workflow-core/api.core.test.ts',
        'lib/workflow-core/api.steps.new.test.ts', 
        'lib/workflow-core/api.edges.new.test.ts'
    ]
    
    missing = []
    existing = []
    
    for file in test_files:
        if Path(file).exists():
            existing.append(file)
        else:
            missing.append(file)
    
    print(f"✅ Found {len(existing)} new test files:")
    for file in existing:
        print(f"  - {file}")
    
    if missing:
        print(f"\n⚠️  Missing test files:")
        for file in missing:
            print(f"  - {file}")
        return False
    
    return True

def count_tests():
    """Count total number of test cases"""
    test_patterns = [
        ("Core API tests", "lib/workflow-core/api.core.test.ts"),
        ("Step management tests", "lib/workflow-core/api.steps.new.test.ts"),
        ("Edge management tests", "lib/workflow-core/api.edges.new.test.ts")
    ]
    
    total_tests = 0
    
    print(f"\n📊 Test Case Breakdown:")
    
    for name, file_path in test_patterns:
        if Path(file_path).exists():
            content = Path(file_path).read_text()
            
            # Count 'it(' calls
            it_matches = re.findall(r"it\s*\(\s*['\"]", content)
            count = len(it_matches)
            total_tests += count
            
            print(f"  - {name}: {count} test cases")
        else:
            print(f"  - {name}: MISSING")
    
    print(f"\n📈 Total test cases: {total_tests}")
    
    # Check if we meet the target
    target = 50
    if total_tests >= target:
        print(f"✅ Meets target of {target}+ test cases")
    else:
        print(f"⚠️  Below target of {target} test cases (need {target - total_tests} more)")
    
    return total_tests

def extract_coverage_info(output):
    """Extract coverage information from test output"""
    lines = output.split('\n')
    coverage_info = []
    
    for line in lines:
        line = line.strip()
        
        # Look for coverage summary lines
        if 'workflow-core' in line and ('|' in line or '%' in line):
            coverage_info.append(line)
        
        # Look for overall coverage
        if 'All files' in line and '%' in line:
            coverage_info.append(f"OVERALL: {line}")
    
    return coverage_info

def analyze_api_coverage():
    """Analyze which API functions are covered by tests"""
    api_file = Path('lib/workflow-core/api.ts')
    
    if not api_file.exists():
        print("⚠️  API file not found")
        return
    
    content = api_file.read_text()
    
    # Find all exported functions
    functions = re.findall(r'export (?:async )?function (\w+)', content)
    
    print(f"\n🎯 API Functions Analysis:")
    print(f"Total API functions: {len(functions)}")
    
    # List all functions
    for i, func in enumerate(functions, 1):
        print(f"  {i}. {func}")
    
    # Check which ones have tests
    test_files = [
        'lib/workflow-core/api.core.test.ts',
        'lib/workflow-core/api.steps.new.test.ts',
        'lib/workflow-core/api.edges.new.test.ts'
    ]
    
    tested_functions = set()
    
    for test_file in test_files:
        if Path(test_file).exists():
            test_content = Path(test_file).read_text()
            for func in functions:
                if func in test_content:
                    tested_functions.add(func)
    
    untested = set(functions) - tested_functions
    
    print(f"\n✅ Functions with tests: {len(tested_functions)}")
    for func in sorted(tested_functions):
        print(f"  - {func}")
    
    if untested:
        print(f"\n❌ Functions without tests: {len(untested)}")
        for func in sorted(untested):
            print(f"  - {func}")
    else:
        print(f"\n🎉 All API functions have tests!")
    
    coverage_percentage = (len(tested_functions) / len(functions)) * 100
    print(f"\n📊 API Function Coverage: {coverage_percentage:.1f}%")
    
    return coverage_percentage >= 100

def main():
    print("="*60)
    print("🧪 WORKFLOW-CORE API TEST RUNNER")
    print("="*60)
    
    # Check if test files exist
    if not check_test_files():
        print("\n❌ Create missing test files first")
        sys.exit(1)
    
    # Count test cases
    test_count = count_tests()
    
    # Analyze API coverage
    all_functions_tested = analyze_api_coverage()
    
    # Run the tests
    tests_passed, output = run_tests()
    
    if tests_passed:
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        
        # Extract and display coverage info
        coverage_info = extract_coverage_info(output)
        if coverage_info:
            print("\n📊 Coverage Summary:")
            for info in coverage_info:
                print(f"  {info}")
        
        print("\n🎯 Summary:")
        print(f"  - Test cases: {test_count}")
        print(f"  - All functions tested: {'✅' if all_functions_tested else '❌'}")
        print(f"  - Tests passing: ✅")
        
        if test_count >= 50 and all_functions_tested:
            print("\n🎉 EXCELLENT! Ready for production!")
            sys.exit(0)
        else:
            print("\n⚠️  Good progress, but consider adding more tests")
            sys.exit(0)
    else:
        print("\n" + "="*60)
        print("❌ TESTS FAILED")
        print("Fix failing tests before proceeding")
        sys.exit(1)

if __name__ == "__main__":
    main()
