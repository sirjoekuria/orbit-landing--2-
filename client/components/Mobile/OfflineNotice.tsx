import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, X } from 'lucide-react';
import { onNetworkStatusChange, getNetworkStatus, isNative } from '../../lib/mobileUtils';

const OfflineNotice: React.FC = () => {
    const [isOffline, setIsOffline] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Initial check
        const checkInitialStatus = async () => {
            const status = await getNetworkStatus();
            setIsOffline(!status.connected);
            setIsVisible(!status.connected);
        };

        checkInitialStatus();

        // Listen for changes
        const handler = onNetworkStatusChange((status) => {
            setIsOffline(!status.connected);
            if (!status.connected) {
                setIsVisible(true);
            }
        });

        return () => {
            handler.then(h => h.remove());
        };
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-20 left-4 right-4 z-[9999] flex items-center justify-between bg-red-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-red-500"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-card/20 p-2 rounded-full">
                            <WifiOff className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Offline Mode</p>
                            <p className="text-xs opacity-90">Please check your internet connection.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1 hover:bg-card/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OfflineNotice;
