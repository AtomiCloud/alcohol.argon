'use client';

import LottieAnimation from '@/components/lottie/LottieAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function InteractiveLottieDemo() {
  const [currentAnimation, setCurrentAnimation] = useState('loading');

  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Interactive Animation Demo</CardTitle>
        <CardDescription className="text-gray-700 dark:text-gray-300 font-medium">
          Click buttons to switch between different animation types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => setCurrentAnimation('loading')}
            variant={currentAnimation === 'loading' ? 'default' : 'outline'}
            className={
              currentAnimation === 'loading'
                ? 'bg-blue-600 hover:bg-blue-700 text-white font-medium'
                : 'border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-medium'
            }
          >
            Loading
          </Button>
          <Button
            onClick={() => setCurrentAnimation('success')}
            variant={currentAnimation === 'success' ? 'default' : 'outline'}
            className={
              currentAnimation === 'success'
                ? 'bg-green-600 hover:bg-green-700 text-white font-medium'
                : 'border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/50 font-medium'
            }
          >
            Success
          </Button>
          <Button
            onClick={() => setCurrentAnimation('error')}
            variant={currentAnimation === 'error' ? 'default' : 'outline'}
            className={
              currentAnimation === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white font-medium'
                : 'border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 font-medium'
            }
          >
            Error
          </Button>
          <Button
            onClick={() => setCurrentAnimation('empty-state')}
            variant={currentAnimation === 'empty-state' ? 'default' : 'outline'}
            className={
              currentAnimation === 'empty-state'
                ? 'bg-purple-600 hover:bg-purple-700 text-white font-medium'
                : 'border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/50 font-medium'
            }
          >
            Empty State
          </Button>
        </div>

        <div className="flex justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700">
          <LottieAnimation
            animationName={currentAnimation}
            width={200}
            height={200}
            className="shadow-lg rounded-lg bg-white dark:bg-gray-800 border"
            showLoader={false} // No loading state for demo
          />
        </div>

        <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
          <p className="text-sm font-mono text-gray-100 dark:text-gray-200 font-medium">
            {`<LottieAnimation animationName="${currentAnimation}" width={200} height={200} showLoader={false} />`}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Currently showing:{' '}
            <span className="font-bold text-gray-900 dark:text-gray-100 capitalize">
              {currentAnimation.replace('-', ' ')}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
