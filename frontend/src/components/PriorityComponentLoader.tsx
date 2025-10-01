import React, { useState, useEffect, ReactNode, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ComponentConfig {
  id: string;
  component: React.ComponentType<any>;
  priority: number;
  bandwidth_requirement: 'low' | 'medium' | 'high';
  fallback?: ReactNode;
  props?: any;
}

interface PriorityComponentLoaderProps {
  components: ComponentConfig[];
  connectionQuality: 'fast' | 'slow' | 'offline';
  batteryLevel?: number;
}

const ComponentSkeleton = ({ height = "h-32" }: { height?: string }) => (
  <Card>
    <CardContent className="p-4">
      <div className="space-y-3">
        <Skeleton className={`w-full ${height}`} />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const PriorityComponentLoader: React.FC<PriorityComponentLoaderProps> = ({
  components,
  connectionQuality,
  batteryLevel = 100
}) => {
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set());
  const [loadingOrder, setLoadingOrder] = useState<ComponentConfig[]>([]);

  useEffect(() => {
    // Determine loading strategy based on connection and battery
    const shouldLoadComponent = (component: ComponentConfig) => {
      // Battery saving mode
      if (batteryLevel < 20 && component.priority < 3) {
        return false;
      }

      // Connection-based filtering
      switch (connectionQuality) {
        case 'offline':
          return component.priority >= 5; // Only critical components
        case 'slow':
          return component.bandwidth_requirement === 'low' || component.priority >= 4;
        case 'fast':
        default:
          return true;
      }
    };

    // Filter and sort components by priority
    const filteredComponents = components
      .filter(shouldLoadComponent)
      .sort((a, b) => b.priority - a.priority);

    setLoadingOrder(filteredComponents);

    // Progressive loading with delays
    const loadComponents = async () => {
      const delays = {
        fast: [0, 100, 300, 500, 1000],
        slow: [0, 500, 1500, 3000, 5000],
        offline: [0, 1000, 3000, 5000, 10000]
      };

      const delayArray = delays[connectionQuality];

      for (let i = 0; i < filteredComponents.length; i++) {
        const component = filteredComponents[i];
        const delay = delayArray[i] || delayArray[delayArray.length - 1];

        setTimeout(() => {
          setLoadedComponents(prev => new Set([...prev, component.id]));
        }, delay);
      }
    };

    // Reset and start loading
    setLoadedComponents(new Set());
    loadComponents();
  }, [components, connectionQuality, batteryLevel]);

  return (
    <div className="space-y-4">
      {loadingOrder.map((config) => {
        const isLoaded = loadedComponents.has(config.id);
        const Component = config.component;

        return (
          <div key={config.id} className="component-container">
            {isLoaded ? (
              <Suspense 
                fallback={config.fallback || <ComponentSkeleton />}
              >
                <Component {...(config.props || {})} />
              </Suspense>
            ) : (
              <div className="opacity-50">
                {config.fallback || <ComponentSkeleton />}
              </div>
            )}
          </div>
        );
      })}

      {/* Connection Status Indicator */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionQuality === 'fast' ? 'bg-green-500' :
                connectionQuality === 'slow' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="capitalize">{connectionQuality} Connection</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Battery: {batteryLevel}%</span>
              <span>Loaded: {loadedComponents.size}/{loadingOrder.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};