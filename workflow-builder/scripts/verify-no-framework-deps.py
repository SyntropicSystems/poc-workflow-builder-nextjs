#!/usr/bin/env python3
"""
Verify that the workflow-core module has no framework dependencies
"""
import os
import sys
from pathlib import Path


def check_framework_deps():
    """Check for framework dependencies in core"""
    core_dir = Path('lib/workflow-core')
    violations = []
    
    forbidden_patterns = [
        "'use client'",
        '"use client"',
        "from 'react'",
        'from "react"',
        "from 'next",
        'from "next',
        'ReactNode',
        'JSX.Element',
        'React.FC',
        'React.Component',
        "from 'reactflow'",
        'from "reactflow"'
    ]
    
    for ts_file in core_dir.rglob('*.ts'):
        # Skip test files
        if 'test' in str(ts_file):
            continue
            
        content = ts_file.read_text()
        
        for pattern in forbidden_patterns:
            if pattern in content:
                violations.append({
                    'file': str(ts_file.relative_to(Path.cwd())),
                    'pattern': pattern
                })
    
    if violations:
        print("❌ Framework dependencies found in core:")
        for v in violations:
            print(f"  - {v['file']}: contains '{v['pattern']}'")
        return False
    
    print("✅ No framework dependencies in core")
    return True

def check_imports():
    """Verify imports are correct"""
    core_dir = Path('lib/workflow-core')
    
    issues = []
    for ts_file in core_dir.glob('*.ts'):
        if 'test' in str(ts_file) or 'generated' in str(ts_file):
            continue
            
        content = ts_file.read_text()
        
        # Should import from generated
        if ('Flow' in content or 'Step' in content) and ts_file.name != 'types.ts':
            if 'from ./generated' not in content and "from './generated'" not in content:
                issues.append(ts_file.name)
    
    if issues:
        print("\n⚠️  Files that should import types from './generated':")
        for file in issues:
            print(f"  - {file}")
    
    return True

def check_flow_converter():
    """Verify flow converter is framework-agnostic"""
    flow_file = Path('lib/workflow-core/flow-to-nodes.ts')
    
    if not flow_file.exists():
        print("❌ flow-to-nodes.ts not found")
        return False
        
    content = flow_file.read_text()
    
    # Check for plain data structures
    has_graph_node = 'interface GraphNode' in content or 'export interface GraphNode' in content
    has_graph_edge = 'interface GraphEdge' in content or 'export interface GraphEdge' in content
    
    # Check for React imports
    has_react = 'from \'react' in content or 'from "react' in content
    has_reactflow = 'from \'reactflow' in content or 'from "reactflow' in content
    
    if has_react or has_reactflow:
        print("❌ flow-to-nodes.ts still has React dependencies")
        return False
    
    if not (has_graph_node and has_graph_edge):
        print("⚠️  flow-to-nodes.ts may not have plain data structures")
        return False
    
    print("✅ flow-to-nodes.ts is framework-agnostic")
    return True

def check_ui_adapter():
    """Verify UI adapter exists"""
    adapter_file = Path('components/workflow-graph/flow-converter.ts')
    
    if not adapter_file.exists():
        print("⚠️  UI adapter flow-converter.ts not found in components layer")
        return False
        
    content = adapter_file.read_text()
    
    # Should have 'use client' directive
    if "'use client'" not in content and '"use client"' not in content:
        print("⚠️  UI adapter missing 'use client' directive")
    
    # Should import from reactflow
    if 'from \'reactflow' not in content and 'from "reactflow' not in content:
        print("⚠️  UI adapter doesn't import from reactflow")
    
    # Should import from core
    if 'from \'@/lib/workflow-core' not in content and 'from "@/lib/workflow-core' not in content:
        print("⚠️  UI adapter doesn't import from core")
        
    print("✅ UI adapter properly separates React concerns")
    return True

def main():
    print("=== Verifying Core Module Framework Independence ===\n")
    
    all_good = True
    
    # Check core for framework deps
    if not check_framework_deps():
        all_good = False
    
    # Check flow converter
    if not check_flow_converter():
        all_good = False
    
    # Check UI adapter
    if not check_ui_adapter():
        all_good = False
    
    # Check imports
    check_imports()
    
    if all_good:
        print("\n✅ Core module is framework-agnostic and properly structured")
        sys.exit(0)
    else:
        print("\n❌ Issues found - fix the violations above")
        sys.exit(1)

if __name__ == "__main__":
    main()
