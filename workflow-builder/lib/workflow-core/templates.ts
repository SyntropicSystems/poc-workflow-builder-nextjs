import type { Step } from './generated';

// Note: Using 'any' type here to match the actual YAML structure
// rather than the strict TypeScript schema definitions
export const STEP_TEMPLATES: { [key: string]: any } = {
  human_review: {
    role: 'human',
    title: 'Human Review',
    instructions: [
      'Review the provided content thoroughly',
      'Evaluate against the acceptance criteria',
      'Make a decision based on the review'
    ],
    acceptance: {
      checks: [
        { description: 'Content has been reviewed completely' },
        { description: 'Decision has been made and documented' },
        { description: 'Feedback has been provided if needed' }
      ]
    },
    next: [
      { to: 'next_step', when: 'approved' },
      { to: 'revision_step', when: 'rejected' }
    ]
  },
  
  ai_analysis: {
    role: 'ai',
    title: 'AI Analysis',
    instructions: [
      'Analyze the input data comprehensively',
      'Generate insights and recommendations',
      'Document findings clearly'
    ],
    acceptance: {
      checks: [
        { description: 'Analysis is complete and thorough' },
        { description: 'Insights are documented clearly' },
        { description: 'Recommendations are actionable' }
      ]
    },
    token: {
      scope: {
        repositories: 'write',
        issues: 'write'
      }
    },
    next: [
      { to: 'next_step', when: 'analysis_complete' }
    ]
  },
  
  system_check: {
    role: 'system',
    title: 'System Check',
    instructions: [
      'Validate system state and prerequisites',
      'Run automated checks and tests',
      'Verify all dependencies are available'
    ],
    acceptance: {
      checks: [
        { description: 'All system checks passed' },
        { description: 'Prerequisites are met' },
        { description: 'Dependencies are available' }
      ]
    },
    token: {
      scope: {
        deployments: 'write',
        environments: 'staging'
      }
    },
    next: [
      { to: 'next_step', when: 'checks_passed' },
      { to: 'error_handler', when: 'checks_failed' }
    ]
  },
  
  blank: {
    role: 'human',
    title: 'New Step',
    instructions: [
      'Add your instructions here'
    ],
    acceptance: {
      checks: [
        { description: 'Add your acceptance criteria here' }
      ]
    }
  }
};

/**
 * Generate a unique step ID with the given prefix
 * @param prefix - The prefix for the step ID
 * @param existingIds - Array of existing step IDs to avoid duplicates
 * @returns A unique step ID
 */
export function generateStepId(prefix: string, existingIds: string[]): string {
  let counter = 1;
  let newId = `${prefix}_${counter}`;
  
  while (existingIds.includes(newId)) {
    counter++;
    newId = `${prefix}_${counter}`;
  }
  
  return newId;
}

/**
 * Create a step from a template with the given ID
 * @param templateKey - The template to use
 * @param stepId - The ID for the new step
 * @returns A complete Step object
 */
export function createStepFromTemplate(templateKey: string, stepId: string): Step {
  const template = STEP_TEMPLATES[templateKey] || STEP_TEMPLATES.blank;
  
  return {
    ...template,
    id: stepId,
    title: template.title || 'New Step',
    role: template.role || 'human',
    instructions: template.instructions || ['Add instructions here'],
    acceptance: template.acceptance || {
      checks: [{ description: 'Add acceptance criteria here' }]
    }
  } as Step;
}

/**
 * Get template names for display in UI
 */
export function getTemplateOptions(): { value: string; label: string; description: string }[] {
  return [
    {
      value: 'blank',
      label: 'Blank Step',
      description: 'Start with a minimal step template'
    },
    {
      value: 'human_review',
      label: 'Human Review',
      description: 'Review and decision-making step'
    },
    {
      value: 'ai_analysis',
      label: 'AI Analysis',
      description: 'Automated analysis and insight generation'
    },
    {
      value: 'system_check',
      label: 'System Check',
      description: 'Automated validation and system checks'
    }
  ];
}
