#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def generate_typescript():
    """Generate TypeScript definitions from proto file"""
    proto_file = "schemas/flowspec.v1.proto"
    output_dir = "lib/workflow-core/generated"
    
    if not os.path.exists(proto_file):
        print(f"Error: {proto_file} not found")
        sys.exit(1)
    
    # Ensure output directory exists
    ensure_dir(output_dir)
    
    # Generate static TypeScript code
    cmd = [
        "pnpm", "exec", "pbjs",
        "-t", "static-module",
        "-w", "es6",
        "--es6",
        "--no-create",
        "--no-verify",
        "--no-convert",
        "--no-delimited",
        proto_file,
        "-o", f"{output_dir}/flowspec.js"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error generating JavaScript: {result.stderr}")
        sys.exit(1)
    
    print("✅ Generated flowspec.js")
    
    # Generate TypeScript definitions
    cmd = [
        "pnpm", "exec", "pbts",
        f"{output_dir}/flowspec.js",
        "-o", f"{output_dir}/flowspec.d.ts"
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error generating TypeScript definitions: {result.stderr}")
        sys.exit(1)
    
    print("✅ Generated flowspec.d.ts")
    
    # Create index file for clean imports
    index_content = """// Generated protobuf types
export * as Proto from './flowspec';

// The generated code will create a namespace flowspec.v1 with interfaces
// We create type aliases for cleaner usage throughout the app
import { flowspec } from './flowspec';

// Type aliases for the generated interfaces
export type Flow = flowspec.v1.IFlow;
export type Step = flowspec.v1.IStep;
export type Policy = flowspec.v1.IPolicy;
export type Context = flowspec.v1.IContext;
export type Parameter = flowspec.v1.IParameter;
export type Role = flowspec.v1.IRole;
export type Artifacts = flowspec.v1.IArtifacts;
export type Events = flowspec.v1.IEvents;
export type Token = flowspec.v1.IToken;
export type TokenScope = flowspec.v1.ITokenScope;
export type TokenClaims = flowspec.v1.ITokenClaims;
export type Prompts = flowspec.v1.IPrompts;
export type Acceptance = flowspec.v1.IAcceptance;
export type Check = flowspec.v1.ICheck;
export type NextStep = flowspec.v1.INextStep;
"""
    
    with open(f"{output_dir}/index.ts", 'w') as f:
        f.write(index_content)
    
    print("✅ Created index.ts")

def main():
    print("Generating TypeScript types from Protobuf schema...")
    generate_typescript()
    print("\n🎉 Schema generation complete!")

if __name__ == "__main__":
    main()
