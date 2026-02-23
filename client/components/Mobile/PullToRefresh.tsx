import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { triggerSelectionHaptic, triggerHaptic } from '../../lib/mobileUtils';
import { ImpactStyle } from '@capacitor/haptics';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    disabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, disabled = false }) => {
    const [pullProgress, setPullProgress] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();

    const startY = useRef(0);
    const currentY = useRef(0);
    const threshold = 80; // Distance to trigger refresh

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled || isRefreshing || (containerRef.current && containerRef.current.scrollTop > 0)) return;
        startY.current = e.touches[0].pageY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (disabled || isRefreshing || (containerRef.current && containerRef.current.scrollTop > 0)) return;

        currentY.current = e.touches[0].pageY;
        const diff = currentY.current - startY.current;

        if (diff > 0) {
            // Apply resistance
            const progress = Math.min(diff / 2, threshold + 20);

            // Trigger haptic when crossing threshold
            if (progress >= threshold && pullProgress < threshold) {
                triggerSelectionHaptic();
            }

            setPullProgress(progress);
        }
    };

    const handleTouchEnd = async () => {
        if (disabled || isRefreshing || pullProgress === 0) return;

        if (pullProgress >= threshold) {
            setIsRefreshing(true);
            setPullProgress(threshold);
            triggerHaptic(ImpactStyle.Heavy);

            try {
                await onRefresh();
            } catch (err) {
                console.error('Refresh failed:', err);
            } finally {
                setIsRefreshing(false);
                setPullProgress(0);
            }
        } else {
            setPullProgress(0);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative overflow-auto h-full w-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <motion.div
                style={{
                    height: pullProgress,
                    opacity: pullProgress / threshold,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
                animate={{ height: pullProgress }}
                transition={isRefreshing ? { duration: 0.1 } : { type: 'spring', damping: 20 }}
            >
                <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: (pullProgress / threshold) * 180 }}
                    transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
                >
                    <RefreshCw className={`w-6 h-6 ${pullProgress >= threshold ? 'text-blue-500' : 'text-gray-400'}`} />
                </motion.div>
            </motion.div>

            <div
                className="transition-transform duration-200"
                style={{ transform: pullProgress > 0 ? `translateY(4px)` : 'none' }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
