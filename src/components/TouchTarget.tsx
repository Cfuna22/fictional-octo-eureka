import { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TouchTargetProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TouchTarget({ children, className, size = 'md' }: TouchTargetProps) {
  const sizeClasses = {
    sm: 'min-h-[36px] min-w-[36px]',
    md: 'min-h-[44px] min-w-[44px]', 
    lg: 'min-h-[52px] min-w-[52px]'
  };

  return (
    <div 
      className={cn(
        'touch-manipulation',
        sizeClasses[size],
        'flex items-center justify-center',
        className
      )}
    >
      {children}
    </div>
  );
}

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function TouchButton({ children, className, size = 'md', ...props }: TouchButtonProps) {
  const sizeClasses = {
    sm: 'min-h-[36px] px-3 text-sm',
    md: 'min-h-[44px] px-4 text-base',
    lg: 'min-h-[52px] px-6 text-lg'
  };

  return (
    <button
      className={cn(
        'touch-manipulation',
        sizeClasses[size],
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}