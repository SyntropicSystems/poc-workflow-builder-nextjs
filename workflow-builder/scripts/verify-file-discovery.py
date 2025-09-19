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

def check_client_directive(filepath):
    """Check that file has 'use client' directive"""
    with open(filepath, 'r') as f:
        first_line = f.readline().strip()
        if first_line != "'use client';":
            print(f"❌ {filepath} missing 'use client' directive")
            return False
    print(f"✅ {filepath} has 'use client' directive")
    return True

def check_type_assertion():
    """Check that file discovery has type assertion for FileSystemFileHandle"""
    filepath = 'lib/fs/file-discovery.ts'
    with open(filepath, 'r') as f:
        content = f.read()
        if '(entry as FileSystemFileHandle)' not in content:
            print(f"❌ Missing type assertion for FileSystemFileHandle")
            return False
    print("✅ Type assertion for FileSystemFileHandle present")
    return True

def check_store_updates():
    """Verify store has new fields"""
    store_file = 'lib/state/filesystem.store.ts'
    required_fields = [
        'workflowFiles:',
        'selectedFile:',
        'fileContent:',
        'setWorkflowFiles:',
        'selectFile:',
        'clearSelection:'
    ]
    
    with open(store_file, 'r') as f:
        content = f.read()
        missing = []
        for field in required_fields:
            if field not in content:
                missing.append(field)
        
        if missing:
            print(f"❌ Store missing fields: {', '.join(missing)}")
            return False
    
    print("✅ Store has all required fields")
    return True

def check_component_integration():
    """Check that FileList is imported in page"""
    page_file = 'app/page.tsx'
    with open(page_file, 'r') as f:
        content = f.read()
        if 'FileList' not in content or "import { FileList }" not in content:
            print(f"❌ FileList not integrated in main page")
            return False
    
    print("✅ FileList integrated in main page")
    return True

def run_tests():
    """Run file discovery tests"""
    result = subprocess.run(
        ['pnpm', 'test', '--run', 'lib/fs/file-discovery.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ File discovery tests pass")
        return True
    
    print(f"❌ Tests failed")
    return False

def main():
    checks = [
        # Check new files exist
        check_file_exists('lib/fs/file-discovery.ts'),
        check_file_exists('components/file-list.tsx'),
        check_file_exists('lib/fs/file-discovery.test.ts'),
        
        # Check client directives
        check_client_directive('lib/fs/file-discovery.ts'),
        check_client_directive('components/file-list.tsx'),
        
        # Check type assertion fix
        check_type_assertion(),
        
        # Check store updates
        check_store_updates(),
        
        # Check integration
        check_component_integration(),
        
        # Run tests
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 File discovery implementation complete!")
        print("Users can now see and select workflow files from the directory.")
        sys.exit(0)
    else:
        print("\n❌ File discovery implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
