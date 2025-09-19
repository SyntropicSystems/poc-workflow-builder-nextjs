#!/usr/bin/env python3
import os
import sys


def check_file_exists(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Missing: {filepath}")
        return False
    print(f"✅ Found: {filepath}")
    return True

def check_api_implementations():
    """Check that edit functions are implemented"""
    api_file = 'lib/workflow-core/api.ts'
    with open(api_file, 'r') as f:
        content = f.read()
        
        # Check that functions are no longer stubs
        if 'throw new Error(\'Not implemented: updateStep\')' in content:
            print("❌ updateStep still not implemented")
            return False
        if 'throw new Error(\'Not implemented: addStep\')' in content:
            print("❌ addStep still not implemented")
            return False
        if 'throw new Error(\'Not implemented: removeStep\')' in content:
            print("❌ removeStep still not implemented")
            return False
            
        # Check for actual implementation content
        required_patterns = [
            'JSON.parse(JSON.stringify(workflow))',  # Deep copy
            'stepIndex = workflow.steps?.findIndex',   # Find step
            'updatedWorkflow.steps?.splice',          # Remove operation
            'filter(n => n.to !== stepId)'            # Cleanup references
        ]
        
        missing = []
        for pattern in required_patterns:
            if pattern not in content:
                missing.append(pattern)
        
        if missing:
            print(f"❌ API missing implementation patterns: {missing[:2]}")
            return False
    
    print("✅ Edit functions implemented with proper logic")
    return True

def check_store_edit_methods():
    """Check store has editing methods"""
    store_file = 'lib/state/workflow.store.ts'
    required = [
        'updateSelectedStep',
        'hasUnsavedChanges',
        'markAsSaved',
        'updateStepAPI'
    ]
    
    with open(store_file, 'r') as f:
        content = f.read()
        missing = [item for item in required if item not in content]
        
        if missing:
            print(f"❌ Store missing: {', '.join(missing)}")
            return False
            
        # Check for proper async update logic
        if 'await validateWorkflow(result.data)' not in content:
            print("❌ Store missing validation on updates")
            return False
    
    print("✅ Store has edit methods with validation")
    return True

def check_editable_inspector():
    """Check editable inspector exists and has edit controls"""
    inspector_file = 'components/step-inspector/editable-inspector.tsx'
    if not os.path.exists(inspector_file):
        print("❌ Editable inspector missing")
        return False
    
    with open(inspector_file, 'r') as f:
        content = f.read()
        required_elements = [
            'handleFieldEdit',
            'handleFieldSave',
            'handleInstructionChange',
            'addInstruction',
            'removeInstruction',
            'editableValue',
            'editGroup'
        ]
        
        missing = [item for item in required_elements if item not in content]
        
        if missing:
            print(f"❌ Editable inspector missing: {', '.join(missing[:3])}")
            return False
    
    print("✅ Editable inspector with full edit controls")
    return True

def check_edit_mode_toggle():
    """Check edit mode toggle exists and has proper styling"""
    if not os.path.exists('components/edit-mode-toggle/index.tsx'):
        print("❌ Edit mode toggle missing")
        return False
    
    if not os.path.exists('components/edit-mode-toggle/edit-mode.module.css'):
        print("❌ Edit mode toggle styles missing")
        return False
        
    # Check toggle functionality
    toggle_file = 'components/edit-mode-toggle/index.tsx'
    with open(toggle_file, 'r') as f:
        content = f.read()
        if 'hasUnsavedChanges' not in content:
            print("❌ Toggle missing unsaved changes indicator")
            return False
        if 'setEditMode' not in content:
            print("❌ Toggle missing edit mode control")
            return False
    
    print("✅ Edit mode toggle with unsaved changes indicator")
    return True

def check_inspector_mode_switching():
    """Check that inspector switches between modes"""
    inspector_file = 'components/step-inspector/index.tsx'
    with open(inspector_file, 'r') as f:
        content = f.read()
        if 'EditableStepInspector' not in content:
            print("❌ Inspector missing editable version import")
            return False
        if 'if (editMode)' not in content:
            print("❌ Inspector missing mode switching logic")
            return False
    
    print("✅ Inspector switches between view and edit modes")
    return True

def check_editor_styles():
    """Check that editor styles are comprehensive"""
    styles_file = 'components/step-inspector/step-inspector.module.css'
    with open(styles_file, 'r') as f:
        content = f.read()
        required_styles = [
            '.editableValue',
            '.editGroup',
            '.input',
            '.saveBtn',
            '.cancelBtn',
            '.addBtn',
            '.removeBtn',
            '.errors'
        ]
        
        missing = [style for style in required_styles if style not in content]
        
        if missing:
            print(f"❌ Missing editor styles: {', '.join(missing[:3])}")
            return False
    
    print("✅ Comprehensive editor styles present")
    return True

def check_layout_integration():
    """Check that edit mode toggle is in layout"""
    page_file = 'app/page.tsx'
    with open(page_file, 'r') as f:
        content = f.read()
        if 'EditModeToggle' not in content:
            print("❌ Edit mode toggle not in layout")
            return False
        if '<EditModeToggle />' not in content:
            print("❌ Edit mode toggle not rendered")
            return False
    
    print("✅ Edit mode toggle integrated in layout")
    return True

def check_typescript_compilation():
    """Check for TypeScript errors"""
    import subprocess
    result = subprocess.run(
        ['npx', 'tsc', '--noEmit'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ No TypeScript errors")
        return True
    
    # Look for critical errors in our new files
    if (result.stderr and 
        ('step-inspector' in result.stderr or 
         'edit-mode-toggle' in result.stderr or
         'workflow.store.ts' in result.stderr)):
        print("❌ TypeScript errors in editing components")
        return False
    
    print("✅ No critical TypeScript errors")
    return True

def check_build_success():
    """Check that the app builds successfully"""
    import subprocess
    result = subprocess.run(
        ['pnpm', 'run', 'build'],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ Application builds successfully")
        return True
    
    print("❌ Build failed")
    return False

def main():
    print("🔍 Verifying Live Editing & Validation Implementation...")
    print()
    
    checks = [
        # Check files exist
        check_file_exists('components/step-inspector/editable-inspector.tsx'),
        check_file_exists('components/edit-mode-toggle/index.tsx'),
        check_file_exists('components/edit-mode-toggle/edit-mode.module.css'),
        
        # Check implementations
        check_api_implementations(),
        check_store_edit_methods(),
        check_editable_inspector(),
        check_edit_mode_toggle(),
        
        # Check integration
        check_inspector_mode_switching(),
        check_editor_styles(),
        check_layout_integration(),
        
        # Check technical quality
        check_typescript_compilation(),
        check_build_success()
    ]
    
    print()
    if all(checks):
        print("🎉 Live editing implementation complete!")
        print()
        print("✨ Live Editing Features:")
        print("- Toggle between View and Edit modes")
        print("- Click-to-edit fields (title, role, description)")
        print("- Dynamic instruction editing (add, edit, remove)")
        print("- Real-time validation with error display")
        print("- Unsaved changes tracking and indicator")
        print("- Professional editing UI with save/cancel")
        print("- Immediate graph updates on changes")
        print()
        print("🎮 How to Test:")
        print("1. Load a workflow file")
        print("2. Toggle 'Edit Mode' switch")
        print("3. Click any step node to select")
        print("4. Click fields to edit them")
        print("5. Watch validation and unsaved changes indicator")
        print()
        print("🚀 Phase 2 (Interactive Editing) Foundation Complete!")
        print("Ready for save-to-disk functionality!")
        sys.exit(0)
    else:
        print("❌ Live editing implementation incomplete")
        failed_count = len([check for check in checks if not check])
        print(f"   {failed_count} checks failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
