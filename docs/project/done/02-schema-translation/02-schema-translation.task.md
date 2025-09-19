# Task 0.2: Schema Translation & Generation

## Objective

Create the Protobuf schema definition and generate TypeScript types as the single source of truth for the workflow data model.

## Prerequisites

- Task 0.1 completed (project initialized)

## Implementation Steps

### Step 1: Install Protobuf Dependencies

Create `scripts/install-protobuf.py`:

```python
#!/usr/bin/env python3
import subprocess
import sys
import os

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
```

Run: `python3 scripts/install-protobuf.py`

### Step 2: Create Protobuf Schema

Create `schemas/flowspec.v1.proto`:

```proto
syntax = "proto3";

package flowspec.v1;

// Root workflow definition
message Flow {
  string schema = 1;
  string id = 2;
  string title = 3;
  string owner = 4;
  repeated string labels = 5;
  Policy policy = 6;
  Context context = 7;
  map<string, Parameter> parameters = 8;
  repeated Role roles = 9;
  Artifacts artifacts = 10;
  Events events = 11;
  repeated Step steps = 12;
}

message Policy {
  string enforcement = 1; // none, advice, guard, hard
  bool tokens_required = 2;
  bool events_required = 3;
}

message Context {
  string domain = 1;
  string brief = 2;
  repeated string links = 3;
}

message Parameter {
  string type = 1; // string, number, boolean, enum
  bool required = 2;
  string default_value = 3;
  repeated string enum_values = 4;
  string example = 5;
}

message Role {
  string id = 1;
  string kind = 2; // human, human_ai, ai, automation
  string uid = 3;
  string desc = 4;
}

message Artifacts {
  repeated string inputs = 1;
  repeated string outputs = 2;
  repeated string scratch = 3;
}

message Events {
  string stream = 1;
  repeated string types = 2;
}

message Step {
  string id = 1;
  string title = 2;
  string desc = 3;
  string role = 4;
  string when = 5;
  Token token = 6;
  repeated string instructions = 7;
  Prompts prompts = 8;
  Acceptance acceptance = 9;
  repeated string emit_events = 10;
  map<string, string> metrics = 11;
  repeated NextStep next = 12;
  int32 timeout_ms = 13;
  int32 max_attempts = 14;
}

message Token {
  bool advisory = 1;
  TokenScope scope = 2;
  TokenClaims claims = 3;
}

message TokenScope {
  repeated string fs_read = 1;
  repeated string fs_write = 2;
  string net = 3;
  repeated string exec = 4;
  repeated string secrets = 5;
  int32 lease_ms = 6;
}

message TokenClaims {
  string aud = 1;
  string sub = 2;
  string nonce = 3;
}

message Prompts {
  string system = 1;
  string user = 2;
  string notes = 3;
}

message Acceptance {
  repeated Check checks = 1;
}

message Check {
  string kind = 1;
  string path = 2;
  string file = 3;
  repeated string keys = 4;
  repeated string allowed = 5;
  int32 min = 6;
  string expr = 7;
  string schema = 8;
  string on_fail = 9;
  string severity = 10;
}

message NextStep {
  string to = 1;
  string when = 2;
}
```

### Step 3: Create Generation Script

Create `scripts/generate-proto.py`:

```python
#!/usr/bin/env python3
import subprocess
import os
import sys
import shutil

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
```

Run: `python3 scripts/generate-proto.py`

### Step 4: Create Type Test

Create `lib/workflow-core/generated/types.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import type { Flow, Step, Policy } from './index'

describe('Generated Protobuf Types', () => {
  it('should have Flow type with required fields', () => {
    // Note: These are interfaces, not classes, so we create plain objects
    const flow: Flow = {
      schema: 'flowspec.v1',
      id: 'test.flow.v1',
      title: 'Test Flow',
      owner: 'test@example.com',
      labels: [],
      policy: {
        enforcement: 'advice',
        tokensRequired: false,  // Note: protobuf uses camelCase
        eventsRequired: false
      } as Policy,
      context: undefined,
      parameters: {},
      roles: [],
      artifacts: undefined,
      events: undefined,
      steps: []
    }
    
    expect(flow.schema).toBe('flowspec.v1')
    expect(flow.steps).toEqual([])
  })
  
  it('should have Step type with instructions array', () => {
    const step: Partial<Step> = {
      id: 'test_step',
      title: 'Test Step',
      instructions: ['Do this', 'Then that'],
      role: 'human_ai'
    }
    
    expect(step.instructions).toHaveLength(2)
  })
})
```

## Acceptance Tests

Create `scripts/verify-schema.py`:

```python
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
```

## Success Criteria

- [ ] Protobuf schema file created and valid
- [ ] TypeScript types generated successfully
- [ ] Generated types can be imported and used
- [ ] Type test passes
- [ ] All verification checks pass