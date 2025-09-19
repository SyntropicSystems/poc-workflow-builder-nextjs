#!/usr/bin/env python3
import json
import os
import subprocess
import sys


def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing file: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_package_installed(package_name, version=None, exact=False):
    with open('package.json', 'r') as f:
        pkg = json.load(f)
    
    all_deps = {**pkg.get('dependencies', {}), **pkg.get('devDependencies', {})}
    
    if package_name in all_deps:
        installed_version = all_deps[package_name]
        if exact and installed_version != version:
            print(f"❌ {package_name} wrong version: {installed_version} (expected exactly {version})")
            return False
        elif version and version not in installed_version:
            print(f"❌ {package_name} wrong version: {installed_version} (expected {version})")
            return False
        print(f"✅ {package_name}: {installed_version}")
        return True
    
    print(f"❌ Missing package: {package_name}")
    return False

def run_test():
    result = subprocess.run(['pnpm', 'test:run'], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ Tests pass")
        return True
    print(f"❌ Tests failed: {result.stderr}")
    return False

def main():
    checks = [
        check_file_exists('package.json'),
        check_file_exists('tsconfig.json'),
        check_file_exists('vitest.config.ts'),
        check_file_exists('test-setup.ts'),
        check_package_installed('next', '15.0.3', exact=True),
        check_package_installed('typescript', '5.6.2', exact=True),
        check_package_installed('reactflow', '11.11.4'),
        check_package_installed('zustand'),
        check_package_installed('js-yaml'),
        check_package_installed('vite'),
        check_package_installed('@vitejs/plugin-react'),
        check_package_installed('vitest'),
        check_package_installed('@testing-library/jest-dom'),
        run_test()
    ]
    
    if all(checks):
        print("\n🎉 All checks passed!")
        sys.exit(0)
    else:
        print("\n❌ Some checks failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
