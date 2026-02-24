import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, LogIn, LogOut, UserPlus, User, Menu, X, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from './ThemeContext';
import { useToast } from '../hooks/use-toast';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout: authLogout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const handleLogout = async () => {
    await authLogout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    window.location.href = '/';
  };

  const isDark = theme === 'dark';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Rocs Crew Logo" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold text-rocs-green">Rocs Crew</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-rocs-green transition-colors">
              Home
            </Link>
            <Link to="/book-delivery">
              <Button className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-semibold">
                Book Now
              </Button>
            </Link>
            <Link to="/tracking" className="text-gray-700 hover:text-rocs-green transition-colors">
              Track Order
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-rocs-green transition-colors">
              Contact
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-rocs-green transition-colors">
              Our Services
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-rocs-green transition-colors">
              About Us
            </Link>
            <Link to="/admin" className="text-gray-700 hover:text-rocs-green transition-colors">
              Admin
            </Link>
          </nav>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <a href="tel:+254700898950" className="flex items-center space-x-1 text-sm text-gray-600 hover:text-rocs-green transition-colors">
              <Phone className="w-4 h-4" />
              <span>+254 700 898 950</span>
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-rocs-green"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard" className="flex items-center space-x-1 text-sm text-gray-600 hover:text-rocs-green transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="border-rocs-green text-rocs-green hover:bg-rocs-green hover:text-white">
                    <LogIn className="w-4 h-4 mr-1" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-rocs-green hover:bg-rocs-green-dark text-white">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-rocs-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link to="/book-delivery" onClick={() => setIsMenuOpen(false)}>
                <Button className="bg-rocs-yellow hover:bg-rocs-yellow-dark text-gray-800 font-semibold w-fit">
                  Book Now
                </Button>
              </Link>
              <Link
                to="/tracking"
                className="text-gray-700 hover:text-rocs-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Order
              </Link>
              <Link
                to="/admin"
                className="text-gray-700 hover:text-rocs-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-rocs-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/services"
                className="text-gray-700 hover:text-rocs-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Our Services
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-rocs-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>

              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 w-fit"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <a href="tel:+254700898950" className="flex items-center space-x-1 text-sm text-gray-600 hover:text-rocs-green transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>+254 700 898 950</span>
                  </a>
                  <div className="flex space-x-2">
                    <Link to="/login">
                      <Button variant="outline" size="sm" className="border-rocs-green text-rocs-green hover:bg-rocs-green hover:text-white">
                        <LogIn className="w-4 h-4 mr-1" />
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="sm" className="bg-rocs-green hover:bg-rocs-green-dark text-white">
                        <UserPlus className="w-4 h-4 mr-1" />
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header >
  );
}
