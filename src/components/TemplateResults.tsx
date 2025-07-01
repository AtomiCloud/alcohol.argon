import { Template, getTemplateUrl, getTemplateDisplayTags } from '@/lib/template-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ExternalLink, Mail, GitBranch, Globe } from 'lucide-react';

interface TemplateResultsProps {
  results: Template[];
  isLoading?: boolean;
  query: string;
}

export function TemplateResults({ results, isLoading, query }: TemplateResultsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold mb-2">No templates found</h3>
        <p className="text-muted-foreground">Try adjusting your search terms or browse all templates.</p>
      </div>
    );
  }

  if (results.length === 0 && !query) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-semibold mb-2">No templates available</h3>
        <p className="text-muted-foreground">Templates will appear here when they become available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {query && (
        <div className="text-sm text-muted-foreground">
          Found {results.length} template{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map(template => (
          <TemplateResultCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

function TemplateResultCard({ template }: { template: Template }) {
  const templateUrl = getTemplateUrl(template);
  const displayTags = getTemplateDisplayTags(template);
  const hasValidUrl = templateUrl !== '#';

  const content = (
    <Card
      className={`h-full transition-all duration-200 ${hasValidUrl ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : ''}`}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                {template.name}
                {hasValidUrl && <ExternalLink className="h-3 w-3" />}
              </CardTitle>
            </div>
            <CardDescription className="text-sm">Template</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {template.description || 'No description available'}
        </p>

        {/* URLs */}
        <div className="space-y-2 mb-4">
          {template.project && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span className="truncate">{template.project}</span>
            </div>
          )}
          {template.source && template.source !== template.project && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <GitBranch className="h-3 w-3" />
              <span className="truncate">{template.source}</span>
            </div>
          )}
          {template.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{template.email}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {displayTags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {displayTags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{displayTags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (hasValidUrl) {
    return (
      <Link href={templateUrl} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    );
  }

  return content;
}
