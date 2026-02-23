import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { useAuth } from '../lib/AuthContext';
// import { useToast } from './ui/use-toast';

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const AutoLogout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth(); // Replaced with useAuth
    // const { toast } = useToast();

    const handleIdle = async () => { // Made handleIdle async
        // Check if user is on a protected route (e.g., admin) or logged in
        // const userJson = localStorage.getItem('user'); // Removed
        // const riderJson = localStorage.getItem('rider'); // Removed

        if (user) { // Changed condition to use 'user' from useAuth
            // Clear session
            // localStorage.removeItem('user'); // Removed
            // localStorage.removeItem('rider'); // Removed
            await logout(); // Called logout from useAuth

            // Redirect to login
            navigate('/login');

            // Notify user
            alert('You have been logged out due to inactivity.');
            /*
            toast({
              title: "Session Expired",
              description: "You have been logged out due to inactivity.",
              variant: "destructive",
            });
            */
        }
    };

    useIdleTimer({
        timeout: IDLE_TIMEOUT,
        onIdle: handleIdle,
    });

    return null; // This component doesn't render anything
};
