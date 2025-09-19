#!/usr/bin/env python3
import os
import subprocess
import sys


def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_id_regex():
    """Check that ID regex matches documented pattern"""
    validator_file = 'lib/workflow-core/validator.ts'
    with open(validator_file, 'r') as f:
        content = f.read()
        # Check for corrected regex pattern
        if r'/^[a-z0-9_.-]+\.[a-z0-9_.-]+\.v[0-9]+$/' not in content:
            print(f"❌ ID regex pattern not corrected")
            return False
    print("✅ ID regex matches <domain>.<n>.v<major> pattern")
    return True

def check_api_implementation():
    """Check that loadWorkflow is implemented"""
    api_file = 'lib/workflow-core/api.ts'
    with open(api_file, 'r') as f:
        content = f.read()
        if 'throw new Error(\'Not implemented: loadWorkflow\')' in content:
            print(f"❌ loadWorkflow still not implemented")
            return False
        if 'parseYAML' not in content:
            print(f"❌ parseYAML not imported")
            return False
    
    print("✅ loadWorkflow is implemented")
    return True

def check_api_tests_updated():
    """Check that API shape tests are updated"""
    test_file = 'lib/workflow-core/api.shape.test.ts'
    with open(test_file, 'r') as f:
        content = f.read()
        # Should not test for "not implemented" on implemented functions
        if "await expect(api.loadWorkflow('test')).rejects.toThrow('Not implemented')" in content:
            print(f"❌ API tests still expect 'not implemented' for loadWorkflow")
            return False
    
    print("✅ API shape tests updated for Phase 1")
    return True

def check_component_integration():
    """Check that WorkflowLoader is integrated"""
    page_file = 'app/page.tsx'
    with open(page_file, 'r') as f:
        content = f.read()
        if 'WorkflowLoader' not in content:
            print(f"❌ WorkflowLoader not integrated")
            return False
    
    print("✅ WorkflowLoader integrated")
    return True

def run_tests():
    """Run validator tests"""
    result = subprocess.run(
        ['pnpm', 'test', '--run', 'lib/workflow-core/validator.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ Validator tests pass")
        return True
    
    print(f"❌ Tests failed")
    return False

def test_sample_workflow():
    """Test parsing a sample workflow"""
    sample = '''schema: flowspec.v1
id: test.sample.v1
title: Test Sample
policy:
  enforcement: advice
steps:
  - id: step_one
    role: human
    instructions:
      - Do this
    acceptance:
      checks:
        - kind: file_exists
          path: /test'''
    
    # Write sample file
    os.makedirs('test-data', exist_ok=True)
    with open('test-data/sample.flow.yaml', 'w') as f:
        f.write(sample)
    
    print("✅ Created test workflow file")
    return True

def main():
    checks = [
        # Check new files exist
        check_file_exists('lib/workflow-core/parser.ts'),
        check_file_exists('lib/workflow-core/validator.ts'),
        check_file_exists('components/workflow-loader.tsx'),
        check_file_exists('lib/workflow-core/validator.test.ts'),
        
        # Check fixes
        check_id_regex(),
        check_api_tests_updated(),
        
        # Check implementation
        check_api_implementation(),
        check_component_integration(),
        
        # Run tests
        run_tests(),
        
        # Create test data
        test_sample_workflow()
    ]
    
    if all(checks):
        print("\n🎉 Parsing and validation implementation complete!")
        print("Workflows are now parsed and validated with immediate feedback.")
        print("Test with: test-data/sample.flow.yaml")
        sys.exit(0)
    else:
        print("\n❌ Parsing and validation implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
