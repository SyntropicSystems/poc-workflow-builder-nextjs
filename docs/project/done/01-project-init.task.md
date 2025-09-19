# Task 0.1: Project Initialization

## Objective

Create the Next.js project foundation with exact dependencies and verify the development environment.

## Prerequisites

- PNPM installed globally
- Node.js 18+ installed

## Implementation Steps

### Step 1: Create Next.js Project

```bash
pnpm create next-app@latest workflow-builder --typescript --app --no-tailwind --no-eslint --import-alias "@/*"
cd workflow-builder
```

### Step 2: Install Exact Dependencies

Create `scripts/install-deps.py`:

```python
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
```

Run: `python3 scripts/install-deps.py`

### Step 3: Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Step 4: Create Test Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-setup.ts']
  }
})
```

Create `test-setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

### Step 5: Create Initial Test

Create `lib/workflow-core/api.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'

describe('Workflow Core API', () => {
  it('should be defined', () => {
    expect(true).toBe(true)
  })
})
```

### Step 6: Update package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

## Acceptance Tests

Create `scripts/verify-setup.py`:

```python
#!/usr/bin/env python3
import subprocess
import json
import os
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
```

## Success Criteria

- [ ] Next.js dev server starts without errors
- [ ] All specified dependencies installed with correct versions
- [ ] Test framework configured and passing
- [ ] TypeScript strict mode enabled
- [ ] All verification checks pass