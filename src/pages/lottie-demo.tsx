import InteractiveLottieDemo from '@/components/InteractiveLottieDemo';
import { EmptyStateLottie, ErrorLottie, LoadingLottie, SuccessLottie } from '@/components/lottie/presets';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lottie Animations Demo & Examples',
  description: 'Complete examples and documentation for using Lottie animations in the application',
};

export default function LottieDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Lottie Animations Demo</h1>
        <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-medium text-lg">
          Complete guide and examples for using Lottie animations in your app. Shows both inline (recommended) and
          dynamic loading approaches with real code examples.
        </p>
      </div>

      {/* Inline vs Dynamic Comparison */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/50 dark:to-blue-950/50">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Inline vs Dynamic Loading
          </CardTitle>
          <CardDescription className="text-gray-700 dark:text-gray-300 font-medium">
            Compare the two approaches for loading animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Inline Animations</h3>
                <Badge
                  variant="outline"
                  className="text-green-700 dark:text-green-400 border-2 border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-950/50 font-semibold"
                >
                  Recommended
                </Badge>
              </div>
              <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                <pre className="text-sm overflow-x-auto text-gray-100 dark:text-gray-200 font-medium">
                  {`// Import JSON directly
import loadingData from '/public/animations/loading.json';

// Use immediately - no loading state
<InlineLottie 
  animationData={loadingData}
  width={48} 
  height={48} 
/>`}
                </pre>
              </div>
              <div className="text-sm space-y-2">
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  ✅ <strong className="text-gray-900 dark:text-gray-100">Immediate display</strong> - no loading states
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  ✅ <strong className="text-gray-900 dark:text-gray-100">Perfect for loading animations</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  ✅ <strong className="text-gray-900 dark:text-gray-100">Better performance</strong> - bundled with app
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  ✅ <strong className="text-gray-900 dark:text-gray-100">Reliable</strong> - no network requests
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Dynamic Loading</h3>
                <Badge
                  variant="outline"
                  className="border-2 border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold"
                >
                  Fallback
                </Badge>
              </div>
              <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
                <pre className="text-sm overflow-x-auto text-gray-100 dark:text-gray-200 font-medium">
                  {`// Load from public directory
<LottieAnimation 
  animationName="loading"
  width={48} 
  height={48} 
/>`}
                </pre>
              </div>
              <div className="text-sm space-y-2">
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  ⚠️ <strong className="text-gray-900 dark:text-gray-100">Loading states required</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  ⚠️ <strong className="text-gray-900 dark:text-gray-100">Network dependency</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  ✅ <strong className="text-gray-900 dark:text-gray-100">Smaller initial bundle</strong>
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  ✅ <strong className="text-gray-900 dark:text-gray-100">Easy to swap animations</strong>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo - Client Component */}
      <InteractiveLottieDemo />

      {/* Preset Components */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Preset Components</CardTitle>
          <CardDescription className="text-gray-700 dark:text-gray-300 font-medium">
            Pre-configured for common use cases (work immediately with CSS/SVG fallbacks)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <LoadingLottie className="mx-auto" />
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">LoadingLottie</p>
              <code className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 px-2 py-1 rounded font-medium">
                {'<LoadingLottie />'}
              </code>
            </div>

            <div className="text-center space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <SuccessLottie className="mx-auto" />
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">SuccessLottie</p>
              <code className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 px-2 py-1 rounded font-medium">
                {'<SuccessLottie />'}
              </code>
            </div>

            <div className="text-center space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <ErrorLottie className="mx-auto" />
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">ErrorLottie</p>
              <code className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 px-2 py-1 rounded font-medium">
                {'<ErrorLottie />'}
              </code>
            </div>

            <div className="text-center space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <EmptyStateLottie className="mx-auto" />
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">EmptyStateLottie</p>
              <code className="text-xs bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 px-2 py-1 rounded font-medium">
                {'<EmptyStateLottie />'}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Real-World Usage Examples
          </CardTitle>
          <CardDescription className="text-gray-700 dark:text-gray-300 font-medium">
            How to integrate animations in your components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Inline Loading Button */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">Inline Loading Button (Recommended)</h4>
            <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
              <pre className="text-sm overflow-x-auto text-gray-100 dark:text-gray-200 font-medium">
                {`// Import animation data
import loadingData from '/public/animations/loading.json';
import { InlineLottie } from '@/components/lottie';

const [isLoading, setIsLoading] = useState(false);

return (
  <Button disabled={isLoading}>
    {isLoading ? (
      <InlineLottie animationData={loadingData} width={20} height={20} />
    ) : (
      'Submit'
    )}
  </Button>
);`}
              </pre>
            </div>
          </div>

          {/* Using Presets */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">Using Preset Components</h4>
            <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
              <pre className="text-sm overflow-x-auto text-gray-100 dark:text-gray-200 font-medium">
                {`// Works immediately with CSS/SVG fallbacks
import { LoadingLottie, SuccessLottie } from '@/components/lottie';

// Loading button
<Button disabled={isLoading}>
  {isLoading ? <LoadingLottie size={20} /> : 'Submit'}
</Button>

// Success message
{showSuccess && (
  <div className="flex items-center gap-2">
    <SuccessLottie size={24} />
    <span>Success!</span>
  </div>
)}

// Empty state
{items.length === 0 && (
  <div className="text-center py-8">
    <EmptyStateLottie size={120} />
    <h3>No items found</h3>
  </div>
)}`}
              </pre>
            </div>
          </div>

          {/* Centralized Animations */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">Centralized Animation Management</h4>
            <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
              <pre className="text-sm overflow-x-auto text-gray-100 dark:text-gray-200 font-medium">
                {`// src/components/lottie/animations.ts
import loadingData from '/public/animations/loading.json';
import successData from '/public/animations/success.json';

export const animations = {
  loading: loadingData,
  success: successData,
};

// In your components
import { animations, InlineLottie } from '@/components/lottie';

<InlineLottie animationData={animations.loading} size={32} />
<InlineLottie animationData={animations.success} size={48} />`}
              </pre>
            </div>
          </div>

          {/* Dynamic with Fallback */}
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">Dynamic Loading with Inline Fallback</h4>
            <div className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600">
              <pre className="text-sm overflow-x-auto text-gray-100 dark:text-gray-200 font-medium">
                {`// Best of both worlds
import fallbackData from '/public/animations/loading.json';

<LottieAnimation
  animationData={fallbackData}  // Inline fallback
  animationName="custom-loading" // Try dynamic first
  width={48}
  height={48}
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Setup for Inline Animations
          </CardTitle>
          <CardDescription className="text-gray-700 dark:text-gray-300 font-medium">
            How to set up inline animations in your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">1. Add your animation files</h4>
              <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded text-sm font-mono text-gray-100 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600">
                /public/animations/loading.json
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">2. Import and use directly</h4>
              <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded text-sm font-mono text-gray-100 dark:text-gray-200 border-2 border-gray-300 dark:border-gray-600">
                {`import loadingData from '/public/animations/loading.json';`}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-3">
                3. Or enable presets for easier usage
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded text-sm text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 font-medium">
                Edit{' '}
                <code className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 px-2 py-1 rounded">
                  /src/components/lottie/presets.tsx
                </code>{' '}
                and uncomment the imports and InlineLottie components
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card className="border-2">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Documentation & Resources
          </CardTitle>
          <CardDescription className="text-gray-700 dark:text-gray-300 font-medium">
            Additional resources and guides
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">Setup Guides</h4>
              <ul className="text-sm space-y-2">
                <li className="text-gray-700 dark:text-gray-300 font-medium">
                  •{' '}
                  <code className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 px-2 py-1 rounded">
                    /public/animations/README.md
                  </code>{' '}
                  - Complete setup guide
                </li>
                <li className="text-gray-700 dark:text-gray-300 font-medium">
                  •{' '}
                  <code className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 px-2 py-1 rounded">
                    /public/animations/sample-animations.md
                  </code>{' '}
                  - Where to find animations
                </li>
                <li className="text-gray-700 dark:text-gray-300 font-medium">
                  •{' '}
                  <code className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 px-2 py-1 rounded">
                    LLM.MD
                  </code>{' '}
                  - Technical documentation
                </li>
              </ul>
            </div>
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">External Resources</h4>
              <ul className="text-sm space-y-2">
                <li className="text-gray-700 dark:text-gray-300 font-medium">
                  •{' '}
                  <a
                    href="https://lottiefiles.com/featured"
                    className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 underline font-semibold"
                  >
                    LottieFiles.com
                  </a>{' '}
                  - Free animations
                </li>
                <li className="text-gray-700 dark:text-gray-300 font-medium">
                  •{' '}
                  <a
                    href="https://airbnb.io/lottie/"
                    className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 underline font-semibold"
                  >
                    Lottie Documentation
                  </a>
                </li>
                <li className="text-gray-700 dark:text-gray-300 font-medium">
                  •{' '}
                  <a
                    href="https://www.npmjs.com/package/lottie-react"
                    className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 underline font-semibold"
                  >
                    lottie-react Package
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
