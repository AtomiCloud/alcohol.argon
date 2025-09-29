import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Mail, User, Shield } from 'lucide-react';
import type { OnBoardFix } from '@/lib/onboard/checker';

const onboardingMessages = {
  verify_email: {
    title: 'Email Verification Required',
    description: 'Please check your email and click the verification link, then come back here to continue.',
    icon: Mail,
    action: 'Retry',
    actionHint: 'Look for an email from us in your inbox and click the verification link',
  },
  set_username: {
    title: 'Username Required',
    description: 'Please set a username in your profile settings, then come back here to continue.',
    icon: User,
    action: 'Retry',
    actionHint: 'Go to your profile settings and choose a unique username',
  },
  set_email: {
    title: 'Email Address Required',
    description: 'Please add an email address to your profile, then come back here to continue.',
    icon: Shield,
    action: 'Retry',
    actionHint: 'Add an email address you check regularly to your profile',
  },
} as const;

export default function Finish() {
  const router = useRouter();
  const message = router.query.message as OnBoardFix;
  const returnTo = router.query.returnTo as string;

  const config = onboardingMessages[message] || {
    title: 'Setup Required',
    description: 'Please complete your account setup, then come back here to continue.',
    icon: AlertCircle,
    action: 'Continue',
    actionHint: 'Complete the required steps first',
  };

  const IconComponent = config.icon;

  const handleRefresh = () => {
    if (returnTo) {
      try {
        const decodedPath = decodeURIComponent(returnTo);

        // Only allow same-origin relative paths that start with '/' but not '//'
        if (decodedPath.match(/^\/(?!\/)/)) {
          const url = new URL(decodedPath, window.location.origin);
          if (url.origin === window.location.origin) {
            window.location.assign(decodedPath);
            return;
          }
        }
      } catch {
        // ignore parsing issues
      }
    }

    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <IconComponent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {config.title}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {config.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200 text-center">💡 {config.actionHint}</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRefresh}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                >
                  {config.action}
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleGoHome}
                  className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Go to Homepage
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Having trouble? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
