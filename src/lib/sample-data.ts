export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  logo?: string;
  url?: string;
  tags: string[];
  featured?: boolean;
}

export const searchData: SearchItem[] = [
  {
    id: '1',
    title: 'Next.js Framework',
    description:
      'The React framework for production. Build fast, scalable web applications with server-side rendering.',
    category: 'Framework',
    logo: '/logos/nextjs.jpg',
    image: '/images/nextjs-preview.jpg',
    url: 'https://nextjs.org',
    tags: ['react', 'javascript', 'typescript', 'ssr', 'framework'],
    featured: true,
  },
  {
    id: '2',
    title: 'React Library',
    description:
      'A JavaScript library for building user interfaces. Create interactive UIs with component-based architecture.',
    category: 'Library',
    logo: '/logos/react.jpg',
    image: '/images/react-preview.jpg',
    url: 'https://reactjs.org',
    tags: ['javascript', 'library', 'components', 'ui', 'frontend'],
    featured: true,
  },
  {
    id: '3',
    title: 'TypeScript Language',
    description: 'TypeScript is JavaScript with syntax for types. Add type safety to your JavaScript applications.',
    category: 'Language',
    logo: '/logos/typescript.jpg',
    image: '/images/typescript-preview.jpg',
    url: 'https://typescriptlang.org',
    tags: ['typescript', 'javascript', 'types', 'safety', 'development'],
  },
  {
    id: '4',
    title: 'Tailwind CSS',
    description: 'A utility-first CSS framework packed with classes to build any design, directly in your markup.',
    category: 'Framework',
    logo: '/logos/tailwind.jpg',
    image: '/images/tailwind-preview.jpg',
    url: 'https://tailwindcss.com',
    tags: ['css', 'framework', 'utility', 'design', 'styling'],
  },
  {
    id: '5',
    title: 'Cloudflare Workers',
    description: 'Run serverless code at the edge with Cloudflare Workers. Deploy instantly across the globe.',
    category: 'Platform',
    logo: '/logos/cloudflare.jpg',
    url: 'https://workers.cloudflare.com',
    tags: ['serverless', 'edge', 'deployment', 'performance', 'cdn'],
  },

  {
    id: '6',
    title: 'Vercel Platform',
    description: 'Deploy web projects with zero configuration. The platform for frontend frameworks and static sites.',
    category: 'Platform',
    logo: '/logos/vercel.jpg',
    url: 'https://vercel.com',
    tags: ['deployment', 'hosting', 'serverless', 'jamstack', 'frontend'],
  },

  {
    id: '7',
    title: 'shadcn/ui Components',
    description: 'Beautifully designed components built with Radix UI and Tailwind CSS. Copy, paste, and customize.',
    category: 'Library',
    logo: '/logos/shadcn.jpg',
    url: 'https://ui.shadcn.com',
    tags: ['components', 'ui', 'tailwind', 'radix', 'design-system'],
    featured: true,
  },
];

export function searchItems(query: string, limit = 10): SearchItem[] {
  if (!query.trim()) {
    return searchData.slice(0, limit);
  }

  const lowercaseQuery = query.toLowerCase();

  return searchData
    .filter(item => {
      const titleMatch = item.title.toLowerCase().includes(lowercaseQuery);
      const descriptionMatch = item.description.toLowerCase().includes(lowercaseQuery);
      const categoryMatch = item.category.toLowerCase().includes(lowercaseQuery);
      const tagsMatch = item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));

      return titleMatch || descriptionMatch || categoryMatch || tagsMatch;
    })
    .sort((a, b) => {
      // Prioritize featured items
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;

      // Then sort by title match relevance
      const aScore = a.title.toLowerCase().includes(lowercaseQuery) ? 1 : 0;
      const bScore = b.title.toLowerCase().includes(lowercaseQuery) ? 1 : 0;

      return bScore - aScore;
    })
    .slice(0, limit);
}
