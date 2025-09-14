import { Err, Ok, Res, type Result } from '@/lib/monads/result';
import type { Problem, ProblemDefinitions, ProblemTransformer } from '@/lib/problem/core';

export interface Template {
  id: string;
  name: string;
  project: string;
  source: string;
  email: string;
  tags: string[];
  description: string;
  readme: string;
  userId: string;
}

export interface TemplateSearchResponse {
  templates: Template[];
  total: number;
  query: string;
  timestamp: string;
}

const TEMPLATE_API_BASE = 'https://api.zinc.sulfone.pichu.cluster.atomi.cloud/api/v1.0';

export function searchTemplates<T extends ProblemDefinitions>(
  transform: ProblemTransformer<T>,
  query: string,
  limit = 20,
): Result<Template[], Problem> {
  return Res.async(async () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('Search', query.trim());
    if (limit) params.set('Limit', limit.toString());
    const url = `${TEMPLATE_API_BASE}/Template${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    return transform.fromHttpResponse(response, query).asResult({
      some: p => Err(p),
      none: () => Ok(response.json<Template[]>()),
    });
  });
}

export function getTemplateUrl(template: Template): string {
  return template.project || template.source || '#';
}

export function getTemplateDisplayTags(template: Template): string[] {
  const tags = [...template.tags];

  // Add derived tags based on content
  if (template.email) {
    tags.push('contact-available');
  }
  if (template.readme) {
    tags.push('documented');
  }
  if (template.project && template.source && template.project !== template.source) {
    tags.push('mirrored');
  }

  return tags.filter(Boolean);
}
