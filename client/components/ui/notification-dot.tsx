import { cn } from '../../lib/utils';

interface NotificationDotProps {
  color: 'green' | 'blue' | 'red' | 'yellow';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const colorClasses = {
  green: 'bg-green-500',
  blue: 'bg-blue-500', 
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
};

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3', 
  lg: 'w-4 h-4',
};

export function NotificationDot({ 
  color, 
  pulse = true, 
  size = 'md', 
  className,
  children 
}: NotificationDotProps) {
  return (
    <div className="relative inline-flex items-center">
      {children}
      <span
        className={cn(
          'absolute rounded-full',
          colorClasses[color],
          sizeClasses[size],
          pulse && 'animate-pulse',
          'shadow-lg',
          '-top-1 -right-1',
          className
        )}
      >
        <span
          className={cn(
            'absolute inset-0 rounded-full opacity-75',
            colorClasses[color],
            pulse && 'animate-ping'
          )}
        />
      </span>
    </div>
  );
}

// Specific notification components for common use cases
export function PendingBookingDot({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <NotificationDot color="green" pulse={true} size="md" className={className}>
      {children}
    </NotificationDot>
  );
}

export function UnreadMessageDot({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <NotificationDot color="blue" pulse={true} size="md" className={className}>
      {children}
    </NotificationDot>
  );
}
