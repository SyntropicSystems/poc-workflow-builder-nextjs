#!/usr/bin/env python3
import os
import subprocess
import sys


def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_no_css_import_in_component():
    """Check that component does NOT import React Flow CSS"""
    graph_file = 'components/workflow-graph/index.tsx'
    if os.path.exists(graph_file):
        with open(graph_file, 'r') as f:
            content = f.read()
            if "import 'reactflow/dist/style.css'" in content:
                print(f"❌ React Flow CSS should NOT be imported in component")
                return False
    print("✅ React Flow CSS not in component (correct)")
    return True

def check_css_import_in_layout():
    """Check that layout imports React Flow CSS"""
    layout_file = 'app/layout.tsx'
    with open(layout_file, 'r') as f:
        content = f.read()
        if "import 'reactflow/dist/style.css'" not in content:
            print(f"❌ React Flow CSS missing from layout.tsx")
            return False
    print("✅ React Flow CSS imported in layout.tsx")
    return True

def check_state_sync():
    """Check that graph has useEffect for state sync"""
    graph_file = 'components/workflow-graph/index.tsx'
    with open(graph_file, 'r') as f:
        content = f.read()
        if 'useEffect' not in content:
            print(f"❌ Missing useEffect import")
            return False
        if 'setNodes(initialNodes)' not in content:
            print(f"❌ Missing state sync in useEffect")
            return False
    print("✅ Graph state sync implemented")
    return True

def check_store_integration():
    """Check that workflow store is used"""
    loader_file = 'components/workflow-loader.tsx'
    with open(loader_file, 'r') as f:
        content = f.read()
        if 'useWorkflowStore' not in content:
            print(f"❌ WorkflowLoader not using workflow store")
            return False
    
    print("✅ Workflow store integrated")
    return True

def check_layout_update():
    """Check that main page has graph viewer"""
    page_file = 'app/page.tsx'
    with open(page_file, 'r') as f:
        content = f.read()
        if 'WorkflowViewer' not in content:
            print(f"❌ WorkflowViewer not in main page")
            return False
        # Should NOT have 'use client'
        first_line = content.split('\n')[0]
        if first_line.strip() == "'use client';":
            print(f"❌ app/page.tsx should NOT have 'use client' directive")
            return False
    
    print("✅ WorkflowViewer integrated in layout")
    print("✅ app/page.tsx has no 'use client' directive")
    return True

def check_styling():
    """Check that styling is present"""
    css_file = 'app/globals.css'
    with open(css_file, 'r') as f:
        content = f.read()
        required_classes = [
            '.workflow-graph-container',
            '.step-node',
            '.step-node-header',
            '.workflow-viewer',
            '.workflow-viewer-empty',
            '.workflow-viewer-error'
        ]
        for css_class in required_classes:
            if css_class not in content:
                print(f"❌ Missing CSS class: {css_class}")
                return False
    
    print("✅ All required CSS classes present")
    return True

def check_background_variant():
    """Check that BackgroundVariant is used correctly"""
    graph_file = 'components/workflow-graph/index.tsx'
    with open(graph_file, 'r') as f:
        content = f.read()
        if 'BackgroundVariant' not in content:
            print(f"❌ BackgroundVariant not imported")
            return False
        if 'variant={BackgroundVariant.Dots}' not in content:
            print(f"❌ BackgroundVariant.Dots not used")
            return False
    
    print("✅ BackgroundVariant correctly used")
    return True

def run_tests():
    """Run flow-to-nodes tests"""
    result = subprocess.run(
        ['pnpm', 'test', '--run', 'lib/workflow-core/flow-to-nodes.test.ts'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ Flow-to-nodes tests pass")
        return True
    
    print(f"❌ Tests failed:")
    print(result.stderr)
    return False

def check_type_errors():
    """Check for TypeScript errors"""
    result = subprocess.run(
        ['pnpm', 'exec', 'tsc', '--noEmit'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ No TypeScript errors")
        return True
    
    print(f"❌ TypeScript errors detected:")
    print(result.stdout)
    print(result.stderr)
    return False

def main():
    print("🔍 Verifying Visual React Flow Rendering Implementation...")
    print()
    
    checks = [
        # Check new files exist
        check_file_exists('lib/state/workflow.store.ts'),
        check_file_exists('lib/workflow-core/flow-to-nodes.ts'),
        check_file_exists('components/workflow-graph/index.tsx'),
        check_file_exists('components/workflow-graph/step-node.tsx'),
        check_file_exists('components/workflow-viewer.tsx'),
        check_file_exists('lib/workflow-core/flow-to-nodes.test.ts'),
        
        # Check React Flow CSS fixes
        check_no_css_import_in_component(),
        check_css_import_in_layout(),
        
        # Check state sync fix
        check_state_sync(),
        
        # Check store usage
        check_store_integration(),
        
        # Check layout
        check_layout_update(),
        
        # Check styling
        check_styling(),
        
        # Check BackgroundVariant fix
        check_background_variant(),
        
        # Check TypeScript
        check_type_errors(),
        
        # Run tests
        run_tests()
    ]
    
    print()
    if all(checks):
        print("🎉 Visual rendering implementation complete!")
        print()
        print("Phase 1 (Read-Only Viewer) is COMPLETE!")
        print()
        print("✨ You can now:")
        print("1. Select a directory")
        print("2. Choose a .flow.yaml file")
        print("3. See validation results")
        print("4. View the workflow as a visual graph")
        print()
        print("🚀 To test the application:")
        print("   pnpm run dev")
        print("   Open http://localhost:3000")
        sys.exit(0)
    else:
        print("❌ Visual rendering implementation incomplete")
        failed_count = len([check for check in checks if not check])
        print(f"   {failed_count} checks failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
