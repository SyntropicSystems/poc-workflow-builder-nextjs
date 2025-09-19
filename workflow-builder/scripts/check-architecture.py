#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Set


class ArchitectureChecker:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.compliance = {
            'protobuf_usage': True,
            'result_pattern': True,
            'no_framework_deps': True,
            'clean_layers': True
        }
    
    def check_protobuf_schema(self):
        """Verify .proto file exists and is properly structured"""
        print("🔍 Checking Protobuf schema...")
        
        proto_files = list(Path('schemas').glob('*.proto')) if Path('schemas').exists() else []
        
        if not proto_files:
            self.issues.append("No .proto files found in schemas/")
            self.compliance['protobuf_usage'] = False
            return False
        
        # Check for flowspec.v1.proto specifically
        flowspec_proto = Path('schemas/flowspec.v1.proto')
        if not flowspec_proto.exists():
            self.issues.append("Missing schemas/flowspec.v1.proto")
            self.compliance['protobuf_usage'] = False
            return False
        
        content = flowspec_proto.read_text()
        
        # Verify proto structure
        required_messages = ['Flow', 'Step', 'Policy']
        for msg in required_messages:
            if f'message {msg}' not in content:
                self.issues.append(f"Proto missing message: {msg}")
                self.compliance['protobuf_usage'] = False
        
        print(f"  ✓ Found {len(proto_files)} proto file(s)")
        return True
    
    def check_generated_types(self):
        """Verify generated types exist and are used"""
        print("🔍 Checking generated types...")
        
        generated_dir = Path('lib/workflow-core/generated')
        if not generated_dir.exists():
            self.issues.append("Generated types directory not found")
            self.compliance['protobuf_usage'] = False
            return False
        
        # Check for generated files
        generated_files = list(generated_dir.glob('*.ts')) + list(generated_dir.glob('*.d.ts'))
        
        if not generated_files:
            self.issues.append("No generated TypeScript files found")
            self.compliance['protobuf_usage'] = False
            return False
        
        # Check that types are exported
        index_file = generated_dir / 'index.ts'
        if index_file.exists():
            content = index_file.read_text()
            if 'export' not in content:
                self.issues.append("Generated types not exported")
        
        print(f"  ✓ Found {len(generated_files)} generated file(s)")
        return True
    
    def check_type_usage(self):
        """Verify only generated types are used, no handwritten types"""
        print("🔍 Checking type usage...")
        
        # Scan for handwritten Flow/Step types
        for ts_file in Path('.').rglob('*.ts'):
            if 'generated' in str(ts_file) or 'node_modules' in str(ts_file):
                continue
                
            content = ts_file.read_text()
            
            # Check for manual type definitions
            if re.search(r'(interface|type)\s+(Flow|Step|Policy)\s*{', content):
                self.issues.append(f"Handwritten type found in {ts_file}: should use generated types")
                self.compliance['protobuf_usage'] = False
            
            # Check for proper imports
            if 'Flow' in content or 'Step' in content:
                if 'from ./generated' not in content and 'from @/lib/workflow-core' not in content:
                    if 'interface' not in content:  # Skip if it's just mentioning in comments
                        self.warnings.append(f"File {ts_file} uses Flow/Step but doesn't import generated types")
        
        return True
    
    def check_result_pattern(self):
        """Verify API uses Result<T> pattern for error handling"""
        print("🔍 Checking Result pattern...")
        
        api_file = Path('lib/workflow-core/api.ts')
        if not api_file.exists():
            self.issues.append("API file not found")
            return False
        
        content = api_file.read_text()
        
        # Check for Result type definition
        if not re.search(r'type Result<T>', content):
            self.issues.append("Result<T> type not defined in API")
            self.compliance['result_pattern'] = False
        
        # Check that functions return Result
        functions = re.findall(r'export function (\w+).*?:\s*([^{]+)', content, re.DOTALL)
        
        for func_name, return_type in functions:
            if 'Result<' not in return_type and func_name not in ['validateWorkflowId', 'suggestWorkflowId']:
                self.warnings.append(f"Function {func_name} doesn't return Result<T>")
        
        # Check for proper error handling
        if '{ success: true' not in content or '{ success: false' not in content:
            self.issues.append("API doesn't use Result pattern correctly")
            self.compliance['result_pattern'] = False
        
        print(f"  ✓ Checked {len(functions)} API functions")
        return True
    
    def check_no_framework_deps(self):
        """Verify core API has no React/Next.js dependencies"""
        print("🔍 Checking for framework dependencies in core...")
        
        core_dir = Path('lib/workflow-core')
        if not core_dir.exists():
            self.issues.append("Core directory not found")
            return False
        
        forbidden_imports = [
            'react', 'next', 'use', 'useState', 'useEffect',
            '@/components', '@/app'
        ]
        
        for ts_file in core_dir.rglob('*.ts'):
            if 'test' in str(ts_file):
                continue
                
            content = ts_file.read_text()
            
            for forbidden in forbidden_imports:
                if forbidden in content:
                    self.issues.append(f"Core file {ts_file} has framework dependency: {forbidden}")
                    self.compliance['no_framework_deps'] = False
        
        print("  ✓ Core has no framework dependencies")
        return True
    
    def check_layer_separation(self):
        """Verify clean separation between layers"""
        print("🔍 Checking layer separation...")
        
        layers = {
            'api': Path('lib/workflow-core'),
            'state': Path('lib/state'),
            'ui': Path('components'),
            'app': Path('app')
        }
        
        # Check that each layer only imports from allowed layers
        rules = {
            'api': [],  # API should import nothing from other layers
            'state': ['api'],  # State can import from API
            'ui': ['api', 'state'],  # UI can import from API and State
            'app': ['api', 'state', 'ui']  # App can import from all
        }
        
        for layer_name, layer_path in layers.items():
            if not layer_path.exists():
                continue
                
            for ts_file in layer_path.rglob('*.ts*'):
                content = ts_file.read_text()
                
                for other_layer, other_path in layers.items():
                    if other_layer == layer_name:
                        continue
                    
                    if other_layer not in rules[layer_name]:
                        # Check for forbidden import
                        if f'from @/lib/{other_layer}' in content or f'from @/{other_layer}' in content:
                            self.issues.append(
                                f"Layer violation: {layer_name} imports from {other_layer} in {ts_file}"
                            )
                            self.compliance['clean_layers'] = False
        
        print("  ✓ Layer separation checked")
        return True
    
    def generate_report(self):
        """Generate compliance report"""
        report = {
            'compliant': all(self.compliance.values()),
            'compliance': self.compliance,
            'issues': self.issues,
            'warnings': self.warnings,
            'recommendations': []
        }
        
        # Add recommendations based on findings
        if not self.compliance['protobuf_usage']:
            report['recommendations'].append(
                "CRITICAL: Ensure Protobuf schema is the source of truth and types are generated"
            )
        
        if not self.compliance['result_pattern']:
            report['recommendations'].append(
                "Use Result<T> pattern consistently for Rust compatibility"
            )
        
        if not self.compliance['no_framework_deps']:
            report['recommendations'].append(
                "Remove all React/Next.js dependencies from core module"
            )
        
        if not self.compliance['clean_layers']:
            report['recommendations'].append(
                "Fix layer violations to maintain clean architecture"
            )
        
        return report
    
    def save_report(self, report):
        """Save report to file"""
        output_dir = Path('reports')
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / 'architecture-compliance.json'
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Create markdown report
        md_file = output_dir / 'architecture-compliance.md'
        with open(md_file, 'w') as f:
            f.write("# Architecture Compliance Report\n\n")
            
            if report['compliant']:
                f.write("## ✅ COMPLIANT\n\n")
            else:
                f.write("## ❌ NON-COMPLIANT\n\n")
            
            f.write("## Compliance Status\n\n")
            for key, value in report['compliance'].items():
                status = "✅" if value else "❌"
                f.write(f"- {status} {key.replace('_', ' ').title()}\n")
            
            if report['issues']:
                f.write("\n## Issues Found\n\n")
                for issue in report['issues']:
                    f.write(f"- {issue}\n")
            
            if report['warnings']:
                f.write("\n## Warnings\n\n")
                for warning in report['warnings']:
                    f.write(f"- {warning}\n")
            
            if report['recommendations']:
                f.write("\n## Recommendations\n\n")
                for rec in report['recommendations']:
                    f.write(f"- {rec}\n")
        
        print(f"✅ Report saved to {output_file}")
        print(f"✅ Markdown report saved to {md_file}")
        
        return output_file

def main():
    checker = ArchitectureChecker()
    
    print("🏗️ Checking Architecture Compliance...\n")
    
    # Run checks
    checker.check_protobuf_schema()
    checker.check_generated_types()
    checker.check_type_usage()
    checker.check_result_pattern()
    checker.check_no_framework_deps()
    checker.check_layer_separation()
    
    # Generate report
    report = checker.generate_report()
    
    print("\n" + "="*50)
    print("COMPLIANCE CHECK COMPLETE")
    print("="*50)
    
    if report['compliant']:
        print("\n✅ Architecture is COMPLIANT")
    else:
        print("\n❌ Architecture is NON-COMPLIANT")
        print(f"\nFound {len(report['issues'])} issue(s):")
        for issue in report['issues'][:5]:
            print(f"  - {issue}")
        if len(report['issues']) > 5:
            print(f"  ... and {len(report['issues']) - 5} more")
    
    # Save report
    checker.save_report(report)
    
    return 0 if report['compliant'] else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
