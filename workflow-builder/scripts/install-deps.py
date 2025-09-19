#!/usr/bin/env python3
import subprocess
import sys

dependencies = [
    "next@15.0.3",
    "reactflow@11.11.4",
    "zustand@4.5.0",
    "js-yaml@4.1.0",
    "@types/js-yaml@4.0.9"
]

dev_dependencies = [
    "typescript@5.6.2",
    "vite@5.0.10",
    "@vitejs/plugin-react@4.2.1",
    "vitest@1.2.0",
    "@testing-library/react@14.1.2",
    "@testing-library/dom@9.3.3",
    "@testing-library/jest-dom@6.1.5",
    "jsdom@23.2.0"
]

def run_pnpm_add(packages, dev=False):
    cmd = ["pnpm", "add"]
    if dev:
        cmd.append("-D")
    cmd.extend(packages)
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error installing packages: {result.stderr}")
        sys.exit(1)
    print(f"Successfully installed: {', '.join(packages)}")

print("Installing production dependencies...")
run_pnpm_add(dependencies)

print("Installing dev dependencies...")
run_pnpm_add(dev_dependencies, dev=True)

print("All dependencies installed successfully!")
