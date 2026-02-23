import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { triggerSelectionHaptic } from '../../lib/mobileUtils';

const FloatingLogo: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const y = useMotionValue(0);
    const opacity = useTransform(y, [0, 100], [1, 0]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.y > 50) {
            setIsVisible(false);
            triggerSelectionHaptic();
        }
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 200 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ y, opacity }}
                className="fixed bottom-24 right-6 z-[60] cursor-grab active:cursor-grabbing"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-rocs-green to-rocs-yellow rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                    <div className="relative w-14 h-14 bg-rocs-green rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 transition-transform active:scale-95">
                        <span className="text-white font-bold text-xl select-none">RC</span>
                    </div>

                    {/* Tooltip hint */}
                    <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Swipe down to hide
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FloatingLogo;
