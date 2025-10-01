import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveGrid({ children, className }: ResponsiveGridProps) {
  return (
    <div 
      className={cn(
        // Mobile: Single column (320px-768px)
        "grid grid-cols-1 gap-4",
        // Tablet: Two columns (769px-1024px) 
        "md:grid-cols-2 md:gap-5",
        // Desktop: Three columns (1025px+)
        "lg:grid-cols-3 lg:gap-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
  return (
    <div 
      className={cn(
        "w-full max-w-full",
        // Mobile: Minimal padding
        "px-3 py-4",
        // Tablet: Moderate padding  
        "md:px-5 md:py-6",
        // Desktop: Full padding
        "lg:px-6 lg:py-8",
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveCardGridProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCardGrid({ children, className }: ResponsiveCardGridProps) {
  return (
    <div 
      className={cn(
        // Mobile: Single column with small gaps
        "grid grid-cols-1 gap-3",
        // Tablet: Two columns with medium gaps
        "md:grid-cols-2 md:gap-4", 
        // Desktop: Three columns with large gaps
        "lg:grid-cols-3 lg:gap-6",
        // Extra large: Four columns
        "xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}