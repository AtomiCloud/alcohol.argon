import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getAnimationForStatus, ProblemErrorAnimation } from '@/components/lottie/ErrorAnimations';
import { ChevronDown, ChevronUp, Copy, RefreshCw } from 'lucide-react';
import type { ErrorComponentProps } from '@/lib/problem/core/error-page';

export function ErrorPage({ error, onRefresh }: ErrorComponentProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const animationInfo = getAnimationForStatus(error.status);

  const handleCopyJson = async () => {
    try {
      const jsonString = JSON.stringify(error, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="flex flex-col items-center text-center space-y-8 p-8 max-w-4xl mx-auto">
        {/* Cheeky Animation Name */}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{animationInfo.cheekyName}</h1>

        {/* Much Larger Animation */}
        <div className="flex justify-center w-11/12 max-w-96">
          <ProblemErrorAnimation problem={error} />
        </div>

        {/* Error Name - larger and darker */}
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{error.title}</h2>

        {/* Error Detail - smaller font and lighter */}
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">{error.detail}</p>

        {/* Refresh Button */}
        <Button onClick={handleRefresh} variant="default" size="lg" className="min-w-[140px]">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Page
        </Button>

        {/* Accordion Error Details */}
        <div className="w-full max-w-3xl">
          <div className="border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/50">
            <button
              type="button"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <span className="font-medium text-red-900 dark:text-red-100">Error Details (for Customer Support)</span>
              {isDetailsExpanded ? (
                <ChevronUp className="w-4 h-4 text-red-700 dark:text-red-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-red-700 dark:text-red-300" />
              )}
            </button>

            {isDetailsExpanded && (
              <div className="px-4 pb-4 space-y-3">
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyJson}
                    className="text-xs text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {isCopied ? 'Copied!' : 'Copy JSON'}
                  </Button>
                </div>

                <div className="bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-lg p-4 text-left overflow-auto max-h-80">
                  <pre className="text-xs text-red-900 dark:text-red-100 whitespace-pre-wrap font-mono">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </div>

                <p className="text-xs text-red-700 dark:text-red-300 text-center">
                  Copy this information and provide it to customer support for faster assistance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
