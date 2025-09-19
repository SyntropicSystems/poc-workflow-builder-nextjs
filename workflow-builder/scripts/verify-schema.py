#!/usr/bin/env python3
import os
import sys


def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_proto_syntax():
    """Verify proto file has correct syntax marker"""
    with open('schemas/flowspec.v1.proto', 'r') as f:
        content = f.read()
        if 'syntax = "proto3"' not in content:
            print("❌ Proto file missing proto3 syntax declaration")
            return False
        if 'message Flow {' not in content:
            print("❌ Proto file missing Flow message definition")
            return False
    print("✅ Proto file structure valid")
    return True

def check_generated_files():
    """Check all expected generated files exist"""
    files = [
        'lib/workflow-core/generated/flowspec.js',
        'lib/workflow-core/generated/flowspec.d.ts',
        'lib/workflow-core/generated/index.ts'
    ]
    return all(check_file_exists(f) for f in files)

def main():
    checks = [
        check_file_exists('schemas/flowspec.v1.proto'),
        check_proto_syntax(),
        check_generated_files()
    ]
    
    if all(checks):
        print("\n🎉 Schema generation verified!")
        sys.exit(0)
    else:
        print("\n❌ Schema generation incomplete")
        sys.exit(1)

if __name__ == "__main__":
    main()
