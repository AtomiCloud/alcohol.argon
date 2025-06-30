import { SearchItem } from '@/lib/sample-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResultsProps {
  results: SearchItem[];
  isLoading?: boolean;
  query: string;
}

export function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">Try adjusting your search terms or browse all items.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {query && (
        <div className="text-sm text-muted-foreground">
          Found {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map(item => (
          <SearchResultCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SearchResultCard({ item }: { item: SearchItem }) {
  const content = (
    <Card
      className={`h-full transition-all duration-200 ${item.url ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : ''} ${item.featured ? 'ring-2 ring-blue-500/20' : ''}`}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          {item.logo && (
            <div className="w-10 h-10 flex-shrink-0">
              <Image src={item.logo} alt={`${item.title} logo`} width={40} height={40} className="rounded-lg" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
              {item.featured && (
                <Badge variant="secondary" className="text-xs">
                  Featured
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">{item.category}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{item.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (item.url) {
    return (
      <Link href={item.url} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    );
  }

  return content;
}
