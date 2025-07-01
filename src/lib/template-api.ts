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

export async function searchTemplates(query: string, limit = 20): Promise<TemplateSearchResponse> {
  try {
    const searchParam = query.trim() ? `?Search=${encodeURIComponent(query)}` : '';
    const response = await fetch(`${TEMPLATE_API_BASE}/Template${searchParam}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const templates: Template[] = await response.json();

    // Filter results based on query if needed (for additional client-side filtering)
    const filteredTemplates = query.trim()
      ? templates.filter(template => {
          const searchText = query.toLowerCase();
          return (
            template.name.toLowerCase().includes(searchText) ||
            template.description.toLowerCase().includes(searchText) ||
            template.project.toLowerCase().includes(searchText) ||
            template.source.toLowerCase().includes(searchText) ||
            template.email.toLowerCase().includes(searchText) ||
            template.tags.some(tag => tag.toLowerCase().includes(searchText))
          );
        })
      : templates;

    // Apply limit
    const limitedResults = filteredTemplates.slice(0, limit);

    return {
      templates: limitedResults,
      total: limitedResults.length,
      query,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Template API error:', error);
    // Return empty results on error
    return {
      templates: [],
      total: 0,
      query,
      timestamp: new Date().toISOString(),
    };
  }
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
