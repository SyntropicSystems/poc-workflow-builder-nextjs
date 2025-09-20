#!/usr/bin/env python3
"""
Master Report Generation Script
Runs all analysis scripts and generates a comprehensive report suite.
Ensures consistency and deterministic output.
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


class ReportGenerator:
    def __init__(self):
        self.timestamp = datetime.now().isoformat()
        self.reports_generated = []
        self.errors = []
        self.commit_hash = self._get_git_commit()
        
    def _get_git_commit(self) -> str:
        """Get current git commit hash"""
        try:
            result = subprocess.run(
                ['git', 'rev-parse', 'HEAD'],
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()[:8]
        except:
            return 'unknown'
    
    def clean_reports_directory(self):
        """Clean up old and hand-written reports"""
        print("🧹 Cleaning reports directory...")
        
        reports_dir = Path('reports')
        if not reports_dir.exists():
            reports_dir.mkdir(exist_ok=True)
            return
        
        # Files that should be removed (hand-written or outdated)
        files_to_remove = [
            'REFACTORING-IMPROVEMENTS-SUMMARY.md',  # Hand-written
            'typescript-to-rust-guide.md',  # Likely hand-written
            'missing-tests.template.ts'  # Generated template
        ]
        
        for filename in files_to_remove:
            filepath = reports_dir / filename
            if filepath.exists():
                filepath.unlink()
                print(f"  ✓ Removed {filename}")
        
        print("  ✓ Reports directory cleaned")
    
    def run_analysis_script(self, script_name: str, description: str) -> bool:
        """Run a single analysis script"""
        print(f"\n📊 {description}...")
        
        script_path = Path('scripts') / script_name
        if not script_path.exists():
            self.errors.append(f"Script not found: {script_name}")
            print(f"  ❌ Script not found: {script_name}")
            return False
        
        try:
            result = subprocess.run(
                ['python3', script_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                print(f"  ✅ {description} completed")
                self.reports_generated.append(description)
                return True
            else:
                self.errors.append(f"{description} failed: {result.stderr[:100]}")
                print(f"  ⚠️ {description} had issues (non-critical)")
                return True  # Continue even if individual checks fail
        except subprocess.TimeoutExpired:
            self.errors.append(f"{description} timed out")
            print(f"  ⚠️ {description} timed out")
            return False
        except Exception as e:
            self.errors.append(f"{description} error: {str(e)}")
            print(f"  ❌ {description} error: {str(e)}")
            return False
    
    def generate_metadata(self):
        """Generate metadata file for all reports"""
        metadata = {
            'generated_at': self.timestamp,
            'git_commit': self.commit_hash,
            'reports_generated': self.reports_generated,
            'errors': self.errors,
            'analysis_scripts': [
                {
                    'script': 'analyze-api-boundary.py',
                    'description': 'API Boundary Analysis',
                    'outputs': ['api-boundary-analysis.json', 'api-boundary-analysis.md']
                },
                {
                    'script': 'check-architecture.py',
                    'description': 'Architecture Compliance Check',
                    'outputs': ['architecture-compliance.json', 'architecture-compliance.md']
                },
                {
                    'script': 'check-rust-readiness.py',
                    'description': 'Rust Migration Readiness',
                    'outputs': ['rust-readiness.json', 'rust-readiness.md']
                },
                {
                    'script': 'analyze-test-coverage.py',
                    'description': 'Test Coverage Audit',
                    'outputs': ['test-coverage-audit.json', 'test-coverage-audit.md']
                },
                {
                    'script': 'consolidate-analysis.py',
                    'description': 'Consolidated Analysis',
                    'outputs': ['consolidated-analysis.json', 'PHASE-3-FINAL-REPORT.md']
                }
            ]
        }
        
        output_file = Path('reports') / 'metadata.json'
        with open(output_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"\n✅ Metadata saved to {output_file}")
    
    def run_all_analyses(self):
        """Run all analysis scripts in order"""
        analyses = [
            ('analyze-api-boundary.py', 'API Boundary Analysis'),
            ('check-architecture.py', 'Architecture Compliance Check'),
            ('check-rust-readiness.py', 'Rust Migration Readiness'),
            ('analyze-test-coverage.py', 'Test Coverage Audit'),
            ('check-component-deps.py', 'Component Dependencies Check'),
            ('check-test-quality.py', 'Test Quality Analysis'),
            ('generate-rust-mapping.py', 'Rust Mapping Generation')
        ]
        
        success_count = 0
        for script, description in analyses:
            if self.run_analysis_script(script, description):
                success_count += 1
        
        # Always run consolidation last
        print("\n📋 Consolidating all reports...")
        if self.run_analysis_script('consolidate-analysis.py', 'Report Consolidation'):
            success_count += 1
        
        return success_count
    
    def create_summary_report(self):
        """Create a summary of all generated reports"""
        summary_file = Path('reports') / 'REPORTS-SUMMARY.md'
        
        with open(summary_file, 'w') as f:
            f.write("# Analysis Reports Summary\n\n")
            f.write(f"**Generated**: {self.timestamp}\n")
            f.write(f"**Git Commit**: {self.commit_hash}\n\n")
            
            f.write("## 📊 Reports Generated\n\n")
            
            # Check which reports actually exist
            reports_dir = Path('reports')
            report_files = {
                'Phase 3 Final Report': 'PHASE-3-FINAL-REPORT.md',
                'API Boundary Analysis': 'api-boundary-analysis.md',
                'Architecture Compliance': 'architecture-compliance.md',
                'Rust Readiness': 'rust-readiness.md',
                'Test Coverage': 'test-coverage-audit.md'
            }
            
            for name, filename in report_files.items():
                filepath = reports_dir / filename
                if filepath.exists():
                    # Read first few lines to get status
                    with open(filepath, 'r') as rf:
                        lines = rf.readlines()[:20]
                        status = "✅" if any("✅" in line for line in lines) else "⚠️"
                    f.write(f"- {status} [{name}](./{filename})\n")
                else:
                    f.write(f"- ❌ {name} (not generated)\n")
            
            if self.errors:
                f.write("\n## ⚠️ Issues Encountered\n\n")
                for error in self.errors:
                    f.write(f"- {error}\n")
            
            f.write("\n## 📋 Report Descriptions\n\n")
            f.write("### API Boundary Analysis\n")
            f.write("Ensures all workflow operations go through the API layer.\n\n")
            
            f.write("### Architecture Compliance\n")
            f.write("Verifies clean architecture, Result<T> pattern, and no framework dependencies in core.\n\n")
            
            f.write("### Rust Readiness\n")
            f.write("Assesses code compatibility with Rust patterns and migration readiness.\n\n")
            
            f.write("### Test Coverage\n")
            f.write("Analyzes test coverage for all API functions.\n\n")
            
            f.write("### Phase 3 Final Report\n")
            f.write("Consolidated analysis with overall readiness scores and action items.\n\n")
        
        print(f"✅ Summary saved to {summary_file}")

def main():
    generator = ReportGenerator()
    
    print("=" * 60)
    print("🚀 MASTER REPORT GENERATION")
    print("=" * 60)
    print(f"Timestamp: {generator.timestamp}")
    print(f"Git Commit: {generator.commit_hash}")
    
    # Clean up old reports
    generator.clean_reports_directory()
    
    # Run all analyses
    print("\n📊 Running all analysis scripts...")
    success_count = generator.run_all_analyses()
    
    # Generate metadata
    generator.generate_metadata()
    
    # Create summary
    generator.create_summary_report()
    
    # Final status
    print("\n" + "=" * 60)
    print("REPORT GENERATION COMPLETE")
    print("=" * 60)
    
    if generator.errors:
        print(f"\n⚠️ Completed with {len(generator.errors)} issues")
        for error in generator.errors[:3]:
            print(f"  - {error}")
    else:
        print("\n✅ All reports generated successfully!")
    
    print(f"\n📄 View summary: reports/REPORTS-SUMMARY.md")
    print(f"📄 View final report: reports/PHASE-3-FINAL-REPORT.md")
    
    return 0 if not generator.errors else 1

if __name__ == "__main__":
    sys.exit(main())
