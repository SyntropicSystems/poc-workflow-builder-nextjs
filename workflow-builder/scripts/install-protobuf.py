#!/usr/bin/env python3
import os
import subprocess
import sys

dev_dependencies = [
    "protobufjs@7.2.5",
    "protobufjs-cli@1.1.2"
]

def run_pnpm_add(packages):
    cmd = ["pnpm", "add", "-D"] + packages
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error installing packages: {result.stderr}")
        sys.exit(1)
    print(f"Successfully installed protobuf tools")

def update_package_json():
    """Add protobuf generation script to package.json"""
    import json
    
    with open('package.json', 'r') as f:
        pkg = json.load(f)
    
    pkg['scripts']['gen:proto'] = 'python3 scripts/generate-proto.py'
    
    with open('package.json', 'w') as f:
        json.dump(pkg, f, indent=2)
    
    print("Updated package.json with gen:proto script")

run_pnpm_add(dev_dependencies)
update_package_json()
