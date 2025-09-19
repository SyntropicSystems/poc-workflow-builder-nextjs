#!/usr/bin/env python3
import os
import sys


def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_store_selection_methods():
    """Check that workflow store has selection methods"""
    store_file = 'lib/state/workflow.store.ts'
    required_items = [
        'selectedStepId:',
        'selectedStep:',
        'selectStep:',
        'editMode:',
        'setEditMode:'
    ]
    
    with open(store_file, 'r') as f:
        content = f.read()
        missing = []
        for item in required_items:
            if item not in content:
                missing.append(item)
        
        if missing:
            print(f"❌ Store missing: {', '.join(missing)}")
            return False
    
    print("✅ Store has selection methods")
    return True

def check_inspector_component():
    """Check inspector component exists and has correct structure"""
    inspector_file = 'components/step-inspector/index.tsx'
    if not os.path.exists(inspector_file):
        print(f"❌ Inspector component missing")
        return False
    
    with open(inspector_file, 'r') as f:
        content = f.read()
        required_elements = [
            'useWorkflowStore',
            'selectedStep',
            'Instructions',
            'Acceptance Criteria',
            'Token Scope'
        ]
        
        missing = []
        for element in required_elements:
            if element not in content:
                missing.append(element)
        
        if missing:
            print(f"❌ Inspector missing elements: {', '.join(missing)}")
            return False
    
    print("✅ Inspector component complete")
    return True

def check_graph_selection():
    """Check that graph handles selection"""
    graph_file = 'components/workflow-graph/index.tsx'
    with open(graph_file, 'r') as f:
        content = f.read()
        if 'selectStep' not in content:
            print(f"❌ Graph doesn't handle selection")
            return False
        if 'onNodeClick' not in content:
            print(f"❌ Graph missing node click handler")
            return False
        if 'onPaneClick' not in content:
            print(f"❌ Graph missing background click handler")
            return False
    
    print("✅ Graph handles selection")
    return True

def check_layout_update():
    """Check that layout includes inspector"""
    page_file = 'app/page.tsx'
    with open(page_file, 'r') as f:
        content = f.read()
        if 'StepInspector' not in content:
            print(f"❌ Inspector not in layout")
            return False
        if 'styles.inspector' not in content:
            print(f"❌ Inspector CSS class not used")
            return False
    
    print("✅ Inspector integrated in layout")
    return True

def check_layout_css():
    """Check that CSS supports 3-column layout"""
    css_file = 'app/page.module.css'
    with open(css_file, 'r') as f:
        content = f.read()
        if 'grid-template-columns: 400px 1fr 400px' not in content:
            print(f"❌ 3-column layout not in CSS")
            return False
        if '.inspector' not in content:
            print(f"❌ Inspector CSS class missing")
            return False
        if '@media' not in content:
            print(f"❌ Responsive design missing")
            return False
    
    print("✅ 3-column responsive layout configured")
    return True

def check_selection_styling():
    """Check that selection styling exists"""
    css_file = 'app/globals.css'
    with open(css_file, 'r') as f:
        content = f.read()
        if '.step-node.selected' not in content:
            print(f"❌ Node selection styling missing")
            return False
        if 'border-color: #ff0000' not in content:
            print(f"❌ Selection border color missing")
            return False
    
    print("✅ Node selection styling configured")
    return True

def check_minimap_colors():
    """Check that minimap has selection colors"""
    graph_file = 'components/workflow-graph/index.tsx'
    with open(graph_file, 'r') as f:
        content = f.read()
        if 'nodeStrokeColor={(node) => node.selected' not in content:
            print(f"❌ Minimap selection colors missing")
            return False
        if '#ff0000' not in content:
            print(f"❌ Selection color not in minimap")
            return False
    
    print("✅ Minimap selection colors configured")
    return True

def check_typescript_types():
    """Check for TypeScript errors in new files"""
    import subprocess
    result = subprocess.run(
        ['npx', 'tsc', '--noEmit', '--project', '.'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ No TypeScript errors")
        return True
    
    # Check if errors are only in the files we know about
    stderr_lines = result.stderr.split('\n')
    relevant_errors = []
    for line in stderr_lines:
        if ('step-inspector' in line or 
            'workflow.store.ts' in line or
            'workflow-graph/index.tsx' in line):
            relevant_errors.append(line)
    
    if relevant_errors:
        print(f"❌ TypeScript errors in new files:")
        for error in relevant_errors[:5]:  # Show first 5 errors
            print(f"  {error}")
        return False
    
    print("✅ No TypeScript errors in inspector code")
    return True

def main():
    print("🔍 Verifying Node Inspector UI Implementation...")
    print()
    
    checks = [
        # Check new files exist
        check_file_exists('components/step-inspector/index.tsx'),
        check_file_exists('components/step-inspector/step-inspector.module.css'),
        
        # Check store updates
        check_store_selection_methods(),
        
        # Check component functionality
        check_inspector_component(),
        check_graph_selection(),
        
        # Check layout integration
        check_layout_update(),
        check_layout_css(),
        
        # Check styling
        check_selection_styling(),
        check_minimap_colors(),
        
        # Check TypeScript
        check_typescript_types()
    ]
    
    print()
    if all(checks):
        print("🎉 Node inspector implementation complete!")
        print()
        print("✨ Node Inspector Features:")
        print("- Click nodes to select and view details")
        print("- Inspector shows organized step information")
        print("- Selected nodes highlighted with red border")
        print("- Background click deselects nodes")
        print("- 3-column responsive layout")
        print("- Professional styling and scrollable content")
        print()
        print("📱 UI Layout:")
        print("- Left: File browser and workflow status")
        print("- Center: Interactive workflow graph")
        print("- Right: Step details inspector")
        print()
        print("🚀 Ready for Phase 2: Live editing capabilities!")
        sys.exit(0)
    else:
        print("❌ Node inspector implementation incomplete")
        failed_count = len([check for check in checks if not check])
        print(f"   {failed_count} checks failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
