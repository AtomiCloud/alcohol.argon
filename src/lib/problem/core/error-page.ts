import type { Problem } from '@/lib/problem/core/types';

interface ErrorComponentProps {
  error: Problem;
  onRefresh: () => void;
}

export type { ErrorComponentProps };
