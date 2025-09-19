#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path


def analyze_imports(file_path):
    """Analyze imports in a TypeScript file"""
    content = file_path.read_text()
    
    imports = {
        'api': [],
        'types': [],
        'utils': [],
        'ui_libs': [],
        'suspicious': []
    }
    
    # Check for API imports
    api_imports = re.findall(r'from [\'"]@/lib/workflow-core/api[\'"]', content)
    if api_imports:
        imports['api'].append('workflow-core/api')
    
    # Check for direct type imports (should use API types)
    type_imports = re.findall(r'from [\'"]@/lib/workflow-core/generated[\'"]', content)
    if type_imports:
        imports['suspicious'].append('Importing types directly instead of through API')
    
    # Check for business logic in wrong places
    if 'yaml' in content.lower() and '/api' not in str(file_path):
        imports['suspicious'].append('YAML operations outside API')
    
    return imports


def main():
    components_dir = Path('components')
    results = {}
    
    if not components_dir.exists():
        print("⚠️ Components directory not found")
        return
    
    print("🔍 Checking Component Dependencies...")
    
    for tsx_file in components_dir.rglob('*.tsx'):
        imports = analyze_imports(tsx_file)
        if imports['suspicious']:
            results[str(tsx_file)] = imports
    
    print("\n" + "="*50)
    print("COMPONENT DEPENDENCY CHECK COMPLETE")
    print("="*50)
    
    if results:
        print(f"\n⚠️ Found {len(results)} component(s) with suspicious imports:")
        for file, issues in results.items():
            print(f"\n{file}:")
            for issue in issues['suspicious']:
                print(f"  - {issue}")
    else:
        print("\n✅ All component dependencies look good!")
    
    # Save results to reports directory
    output_dir = Path('reports')
    output_dir.mkdir(exist_ok=True)
    
    output_file = output_dir / 'component-dependencies.json'
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    if results:
        print(f"\n✅ Detailed results saved to {output_file}")
    
    return 1 if results else 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
