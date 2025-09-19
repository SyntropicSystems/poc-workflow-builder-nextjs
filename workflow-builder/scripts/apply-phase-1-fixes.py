#!/usr/bin/env python3
"""
Apply all critical fixes for Phase 1 to ensure consistency and correctness.
Run this after Phase 1 tasks are implemented to fix all identified issues.
"""

import os
import re
import sys


def update_file_content(filepath, old_pattern, new_content, regex=False):
    """Update file content with pattern replacement."""
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        return False
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    if regex:
        updated = re.sub(old_pattern, new_content, content)
    else:
        updated = content.replace(old_pattern, new_content)
    
    if updated != content:
        with open(filepath, 'w') as f:
            f.write(updated)
        print(f"✅ Updated: {filepath}")
        return True
    else:
        print(f"ℹ️  No changes needed: {filepath}")
        return False

def fix_file_discovery_types():
    """Fix TypeScript type narrowing in file discovery."""
    filepath = 'lib/fs/file-discovery.ts'
    old_code = "const file = await entry.getFile();"
    new_code = "const file = await (entry as FileSystemFileHandle).getFile();"
    update_file_content(filepath, old_code, new_code)

def fix_id_validation_regex():
    """Fix ID validation regex to match documented pattern."""
    filepath = 'lib/workflow-core/validator.ts'
    old_pattern = r"\\/\^\\[a-z0-9_.-\\]\+\\\\.v\\[0-9\\]\+\$/"
    new_pattern = "/^[a-z0-9_.-]+\\.[a-z0-9_.-]+\\.v[0-9]+$/"
    
    # Try simpler replacement
    old_code = "!/^[a-z0-9_.-]+\\.v[0-9]+$/.test"
    new_code = "!/^[a-z0-9_.-]+\\.[a-z0-9_.-]+\\.v[0-9]+$/.test"
    update_file_content(filepath, old_code, new_code)

def move_reactflow_css_import():
    """Move React Flow CSS import from component to layout."""
    # Remove from component
    graph_file = 'components/workflow-graph/index.tsx'
    if os.path.exists(graph_file):
        update_file_content(graph_file, "import 'reactflow/dist/style.css';\n", "")
    
    # Add to layout if not present
    layout_file = 'app/layout.tsx'
    if os.path.exists(layout_file):
        with open(layout_file, 'r') as f:
            content = f.read()
        
        if "import 'reactflow/dist/style.css'" not in content:
            # Add after other imports
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('import') and 'globals.css' in line:
                    lines.insert(i + 1, "import 'reactflow/dist/style.css';")
                    break
            
            with open(layout_file, 'w') as f:
                f.write('\n'.join(lines))
            print(f"✅ Added React Flow CSS to layout.tsx")

def add_graph_state_sync():
    """Add useEffect to sync React Flow state when workflow changes."""
    filepath = 'components/workflow-graph/index.tsx'
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        return
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if useEffect already exists for this
    if "useEffect(() => {" in content and "setNodes(initialNodes)" in content:
        print(f"ℹ️  Graph state sync already exists")
        return
    
    # Add useEffect import if not present
    if "import { useEffect" not in content:
        if "import { useCallback, useMemo } from 'react';" in content:
            update_file_content(
                filepath,
                "import { useCallback, useMemo } from 'react';",
                "import { useCallback, useMemo, useEffect } from 'react';"
            )
        elif "import React" in content:
            # Add to existing React import
            pass
        else:
            # Add new import
            update_file_content(
                filepath,
                "import ReactFlow",
                "import { useEffect } from 'react';\nimport ReactFlow"
            )
    
    # Add useEffect after state initialization
    effect_code = """
  // Sync state when workflow changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
"""
    
    # Find where to insert (after useNodesState/useEdgesState)
    pattern = r"const \[edges, setEdges, onEdgesChange\] = useEdgesState\(initialEdges\);"
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    if pattern in content:
        updated = content.replace(pattern, pattern + effect_code)
        with open(filepath, 'w') as f:
            f.write(updated)
        print(f"✅ Added graph state sync")

def remove_page_client_directive():
    """Remove unnecessary 'use client' from page.tsx."""
    filepath = 'app/page.tsx'
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        if lines and lines[0].strip() == "'use client';":
            lines = lines[1:]
            with open(filepath, 'w') as f:
                f.writelines(lines)
            print(f"✅ Removed 'use client' from page.tsx")

def update_api_shape_tests():
    """Update Phase 0 tests to not expect 'Not implemented' errors."""
    filepath = 'lib/workflow-core/api.shape.test.ts'
    if not os.path.exists(filepath):
        print(f"⚠️  Test file not found: {filepath}")
        return
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Comment out the "not implemented" expectations
    patterns_to_comment = [
        "await expect(api.loadWorkflow('test')).rejects.toThrow('Not implemented')",
        "await expect(api.saveWorkflow({} as Flow)).rejects.toThrow('Not implemented')",
        "await expect(api.validateWorkflow({} as Flow)).rejects.toThrow('Not implemented')"
    ]
    
    for pattern in patterns_to_comment:
        if pattern in content:
            content = content.replace(pattern, f"// {pattern} // Implemented in Phase 1")
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"✅ Updated API shape tests")

def update_verification_scripts():
    """Update verification scripts to match correct structure."""
    # Fix verify-directory-access.py
    script_file = 'scripts/verify-directory-access.py'
    if os.path.exists(script_file):
        with open(script_file, 'r') as f:
            content = f.read()
        
        # Remove page.tsx client directive check
        content = re.sub(
            r"check_client_directive\('src/app/page\.tsx'\),?\n\s*",
            "",
            content
        )
        
        # Update paths from src/ to root
        content = content.replace("'src/components/", "'components/")
        content = content.replace("'src/app/", "'app/")
        
        with open(script_file, 'w') as f:
            f.write(content)
        print(f"✅ Updated verify-directory-access.py")

def create_page_module_css():
    """Ensure page.module.css exists."""
    filepath = 'app/page.module.css'
    if not os.path.exists(filepath):
        content = """/* Page module styles */

.main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  margin-top: 20px;
  height: calc(100vh - 200px);
  min-height: 600px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.canvas {
  min-width: 0;
  height: 100%;
}

.columns {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 20px;
  margin-top: 20px;
}

.content {
  min-width: 0;
}
"""
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✅ Created page.module.css")

def main():
    """Run all Phase 1 fixes."""
    print("🔧 Applying Phase 1 fixes...\n")
    
    # Change to project root
    if os.path.exists('workflow-builder'):
        os.chdir('workflow-builder')
    
    fixes = [
        ("Fixing file discovery type narrowing", fix_file_discovery_types),
        ("Fixing ID validation regex", fix_id_validation_regex),
        ("Moving React Flow CSS import", move_reactflow_css_import),
        ("Adding graph state sync", add_graph_state_sync),
        ("Removing page client directive", remove_page_client_directive),
        ("Updating API shape tests", update_api_shape_tests),
        ("Updating verification scripts", update_verification_scripts),
        ("Ensuring page.module.css exists", create_page_module_css),
    ]
    
    for description, fix_func in fixes:
        print(f"\n{description}...")
        try:
            fix_func()
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n✅ Phase 1 fixes applied!")
    print("\nNext steps:")
    print("1. Run: pnpm test --run")
    print("2. Run: pnpm dev")
    print("3. Test the workflow viewer in browser")

if __name__ == "__main__":
    main()