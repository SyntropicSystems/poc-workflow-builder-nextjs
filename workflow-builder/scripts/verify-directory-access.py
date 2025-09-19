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

def check_no_client_directive(filepath):
    """Check that file does NOT have 'use client' directive"""
    with open(filepath, 'r') as f:
        first_line = f.readline().strip()
        if first_line == "'use client';":
            print(f"❌ {filepath} should NOT have 'use client' directive")
            return False
    print(f"✅ {filepath} correctly has no 'use client' directive")
    return True

def check_imports(filepath, required_imports):
    """Check that file has required imports"""
    with open(filepath, 'r') as f:
        content = f.read()
        missing = []
        for imp in required_imports:
            if imp not in content:
                missing.append(imp)
        
        if missing:
            print(f"❌ {filepath} missing imports: {', '.join(missing)}")
            return False
    
    print(f"✅ {filepath} has all required imports")
    return True

def run_tests():
    """Run filesystem tests"""
    result = subprocess.run(
        ['pnpm', 'test', '--run', 'lib/fs/browser-fs.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ File system tests pass")
        return True
    
    print(f"❌ Tests failed")
    return False

def main():
    checks = [
        # Check files exist
        check_file_exists('lib/state/filesystem.store.ts'),
        check_file_exists('lib/fs/browser-fs.ts'),
        check_file_exists('components/directory-selector.tsx'),
        check_file_exists('app/page.tsx'),
        check_file_exists('app/page.module.css'),
        check_file_exists('lib/fs/browser-fs.test.ts'),
        
        # Check 'use client' directives - only where needed!
        check_client_directive('lib/state/filesystem.store.ts'),
        check_client_directive('lib/fs/browser-fs.ts'),
        check_client_directive('components/directory-selector.tsx'),
        check_no_client_directive('app/page.tsx'),  # Should NOT have 'use client'
        
        # Check key imports
        check_imports('components/directory-selector.tsx', [
            'useFileSystemStore',
            'requestDirectoryAccess',
            'verifyDirectoryPermission'
        ]),
        
        # Run tests
        run_tests()
    ]
    
    if all(checks):
        print("\n🎉 Directory access implementation complete!")
        print("Users can now select and grant permission to local directories.")
        sys.exit(0)
    else:
        print("\n❌ Directory access implementation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
