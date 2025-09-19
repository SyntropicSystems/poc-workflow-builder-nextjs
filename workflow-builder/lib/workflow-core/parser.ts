import * as yaml from 'js-yaml';
import type { Flow } from './generated';

export function parseYAML(yamlString: string): unknown {
  try {
    const parsed = yaml.load(yamlString);
    return parsed;
  } catch (error) {
    if (error instanceof yaml.YAMLException) {
      throw new Error(`YAML parsing error: ${error.message}`);
    }
    throw error;
  }
}

export function isValidFlowObject(obj: unknown): obj is Record<string, unknown> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'schema' in obj &&
    'id' in obj &&
    'title' in obj &&
    'steps' in obj
  );
}
