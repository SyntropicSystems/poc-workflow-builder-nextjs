#!/usr/bin/env python3
import json
import re
from pathlib import Path


def analyze_test_quality(test_file):
    """Analyze quality of individual test file"""
    content = test_file.read_text()
    
    quality_metrics = {
        'has_describes': 'describe(' in content,
        'has_assertions': 'expect(' in content,
        'tests_success_cases': 'success: true' in content or 'toBe(true)' in content,
        'tests_error_cases': 'success: false' in content or 'toThrow' in content,
        'has_setup_teardown': 'beforeEach' in content or 'afterEach' in content,
        'uses_mocks': 'mock' in content.lower() or 'spy' in content.lower(),
        'good_test_names': bool(re.findall(r'it\([\'"]should\s+\w+', content)),
        'tests_edge_cases': 'null' in content or 'undefined' in content or 'empty' in content
    }
    
    score = sum(1 for v in quality_metrics.values() if v)
    max_score = len(quality_metrics)
    
    return {
        'file': str(test_file),
        'metrics': quality_metrics,
        'score': score,
        'max_score': max_score,
        'percentage': (score / max_score) * 100
    }


def main():
    test_files = list(Path('.').rglob('*.test.ts')) + list(Path('.').rglob('*.spec.ts'))
    test_files = [f for f in test_files if 'node_modules' not in str(f)]
    
    results = []
    for test_file in test_files:
        quality = analyze_test_quality(test_file)
        results.append(quality)
    
    # Calculate average quality
    if results:
        avg_quality = sum(r['percentage'] for r in results) / len(results)
        
        print(f"\n📊 Test Quality Analysis")
        print(f"{'='*40}")
        print(f"Average Quality Score: {avg_quality:.1f}%")
        print(f"Files Analyzed: {len(results)}")
        
        # Show best and worst
        sorted_results = sorted(results, key=lambda x: x['percentage'], reverse=True)
        
        print(f"\n✅ Best Quality:")
        for result in sorted_results[:3]:
            print(f"  - {Path(result['file']).name}: {result['percentage']:.1f}%")
        
        if len(sorted_results) > 3:
            print(f"\n⚠️ Needs Improvement:")
            for result in sorted_results[-3:]:
                print(f"  - {Path(result['file']).name}: {result['percentage']:.1f}%")
        
        # Save detailed report
        output_dir = Path('reports')
        output_dir.mkdir(exist_ok=True)
        
        with open(output_dir / 'test-quality-details.json', 'w') as f:
            json.dump({
                'average_quality': avg_quality,
                'files': results
            }, f, indent=2)
        
        print(f"\n✅ Detailed report saved to reports/test-quality-details.json")
    else:
        print("No test files found")


if __name__ == "__main__":
    main()
