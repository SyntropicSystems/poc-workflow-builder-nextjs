import type { Step, Check, NextStep, Token } from './generated';

// Template for creating new steps - uses Partial<Step> for flexibility
// Note: Token scope fields are flexible in templates and may not match exact schema
export const STEP_TEMPLATES: { [key: string]: Partial<Step> } = {
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
        { description: 'Content has been reviewed completely' } as Check,
        { description: 'Decision has been made and documented' } as Check,
        { description: 'Feedback has been provided if needed' } as Check
      ]
    },
    next: [
      { to: 'next_step', when: 'approved' } as NextStep,
      { to: 'revision_step', when: 'rejected' } as NextStep
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
        { description: 'Analysis is complete and thorough' } as Check,
        { description: 'Insights are documented clearly' } as Check,
        { description: 'Recommendations are actionable' } as Check
      ]
    },
    token: {
      scope: {
        // Example permissions for AI role
        fsRead: ['./input'],
        fsWrite: ['./output'],
        net: 'restricted'
      }
    } as Token,
    next: [
      { to: 'next_step', when: 'analysis_complete' } as NextStep
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
        { description: 'All system checks passed' } as Check,
        { description: 'Prerequisites are met' } as Check,
        { description: 'Dependencies are available' } as Check
      ]
    },
    token: {
      scope: {
        // Example permissions for system role
        exec: ['validate.sh', 'check.sh'],
        fsRead: ['./config'],
        net: 'full'
      }
    } as Token,
    next: [
      { to: 'next_step', when: 'checks_passed' } as NextStep,
      { to: 'error_handler', when: 'checks_failed' } as NextStep
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
        { description: 'Add your acceptance criteria here' } as Check
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
