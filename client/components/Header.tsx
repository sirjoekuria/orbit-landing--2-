import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, Mail, UserPlus, LogIn, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for logged in user
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-rocs-green rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">RC</span>
            </div>
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
            <Link to="/signup" className="text-gray-700 hover:text-rocs-green transition-colors">
              Join as Rider
            </Link>
            <Link to="/rider-login" className="text-gray-700 hover:text-rocs-green transition-colors">
              Rider Sign In
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
            
            {user ? (
              <div className="flex items-center space-x-3">
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
                    Login
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
                to="/signup"
                className="text-gray-700 hover:text-rocs-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Join as Rider
              </Link>
              <Link
                to="/rider-login"
                className="text-gray-700 hover:text-rocs-green transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Rider Sign In
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
                        Login
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
    </header>
  );
}
