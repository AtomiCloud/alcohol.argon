import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowRight, Rocket } from 'lucide-react';
import type { ComponentProps } from 'react';

interface SignInCTAProps extends Omit<ComponentProps<typeof Button>, 'onClick' | 'disabled' | 'children'> {
  children: string;
  showIcon?: boolean;
  icon?: 'rocket' | 'arrow' | 'none';
  href?: string;
  onClick?: () => void;
}

/**
 * Reusable sign-in/CTA button with consistent loading state and ray spinner.
 * By default redirects to /api/logto/sign-in, but can be customized with href or onClick.
 */
export function SignInCTA({
  children,
  showIcon = true,
  icon = 'rocket',
  href = '/api/logto/sign-in',
  onClick,
  className = '',
  ...props
}: SignInCTAProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    if (onClick) {
      onClick();
    } else {
      window.location.assign(href);
    }
  };

  const IconComponent = icon === 'rocket' ? Rocket : icon === 'arrow' ? ArrowRight : null;

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center px-6 ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner size="md" variant="rays" className="flex-shrink-0" />
      ) : showIcon && IconComponent ? (
        <IconComponent className="flex-shrink-0" />
      ) : null}
      <span className="flex-1">{children}</span>
      {!loading && showIcon && icon !== 'none' && <ArrowRight className="flex-shrink-0" />}
    </Button>
  );
}
