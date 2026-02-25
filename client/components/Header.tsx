import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, LogIn, LogOut, UserPlus, User, Menu, X, LayoutDashboard, Sun, Moon, Home, Truck, Wrench, Info, HelpCircle, Shield, Facebook, Twitter, Instagram, Bell, User as UserIcon } from 'lucide-react';
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
    <>
      <header className="bg-[#0a110d]/90 backdrop-blur-md border-b border-[#22c55e]/10 sticky top-0 z-40 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.webp" alt="Rocs Crew Logo" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-bold text-foreground">Rocs Crew</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-foreground/80 hover:text-rocs-green transition-colors">
                Home
              </Link>
              <Link to="/book-delivery">
                <Button variant="outline" className="border-rocs-green text-rocs-green hover:border-rocs-green/70 hover:bg-transparent transition-all font-semibold">
                  Book Now
                </Button>
              </Link>
              <Link to="/tracking" className="text-foreground/80 hover:text-rocs-green transition-colors">
                Track Order
              </Link>
              <Link to="/contact" className="text-foreground/80 hover:text-rocs-green transition-colors">
                Contact
              </Link>
              <Link to="/services" className="text-foreground/80 hover:text-rocs-green transition-colors">
                Our Services
              </Link>
              <Link to="/about" className="text-foreground/80 hover:text-rocs-green transition-colors">
                About Us
              </Link>
              <Link to="/admin" className="text-foreground/80 hover:text-rocs-green transition-colors">
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

            {/* Mobile Actions: Notifications & Profile */}
            <div className="flex md:hidden items-center space-x-3 pr-2">
              <button className="w-10 h-10 rounded-full bg-[#112417] flex items-center justify-center border border-white/5 text-[#8b9d93] hover:text-[#eab308] transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <Link to={user ? "/dashboard" : "/login"}>
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-[#eab308] to-[#ca8a04] flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                  <UserIcon className="w-5 h-5 text-black" />
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -mr-2 text-white hover:text-[#eab308] transition-colors relative z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )
      }

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={`fixed inset-y-0 left-0 w-[280px] bg-[#0a110d] border-r border-[#eab308]/20 shadow-[5px_0_25px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 ease-in-out flex flex-col md:hidden ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
              <img src="/logo.webp" alt="Rocs Crew Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-white">Rocs Crew</span>
          </div>
          <button
            className="text-white drop-shadow-md p-1 hover:text-[#eab308]"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-6 space-y-6">
          <Link
            to="/"
            className="flex items-center space-x-4 text-white hover:text-[#eab308] transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Home className="w-5 h-5 text-[#eab308]" />
            <span>Home</span>
          </Link>

          <Link
            to="/tracking"
            className="flex items-center space-x-4 text-white hover:text-[#eab308] transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Truck className="w-5 h-5 text-[#eab308]" />
            <span>Track Order</span>
          </Link>

          <Link
            to="/services"
            className="flex items-center space-x-4 text-white hover:text-[#eab308] transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Wrench className="w-5 h-5 text-[#eab308]" />
            <span>Our Services</span>
          </Link>

          <Link
            to="/about"
            className="flex items-center space-x-4 text-white hover:text-[#eab308] transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Info className="w-5 h-5 text-[#eab308]" />
            <span>About Us</span>
          </Link>

          <Link
            to="/contact"
            className="flex items-center space-x-4 text-white hover:text-[#eab308] transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <HelpCircle className="w-5 h-5 text-[#eab308]" />
            <span>Contact</span>
          </Link>

          <Link
            to="/admin"
            className="flex items-center space-x-4 text-white hover:text-[#eab308] transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Shield className="w-5 h-5 text-[#eab308]" />
            <span>Admin Panel</span>
          </Link>

          {/* User Account / Authentication Area */}
          <div className="pt-4 space-y-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3 text-white px-2 mb-2">
                  <User className="w-5 h-5 text-[#eab308]" />
                  <span className="font-semibold">{user.name}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  className="w-full justify-center bg-transparent border border-[#eab308]/50 text-white hover:bg-[#eab308]/10 h-12 rounded-xl"
                >
                  <LogOut className="w-5 h-5 mr-3 text-[#eab308]" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center bg-gradient-to-r from-[#eab308] to-[#ca8a04] hover:from-[#ca8a04] hover:to-[#a16207] text-black font-bold h-12 rounded-xl mb-4 shadow-md border-0">
                    <UserPlus className="w-5 h-5 mr-3" />
                    Sign Up Now
                  </Button>
                </Link>

                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center bg-transparent border border-[#eab308]/50 text-white hover:bg-[#eab308]/10 h-12 rounded-xl"
                  >
                    <LogIn className="w-5 h-5 mr-3 text-[#eab308]" />
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-6 space-y-6">
          <a
            href="tel:+254700898950"
            className="flex items-center space-x-3 text-white hover:text-[#eab308] transition-colors font-medium"
          >
            <Phone className="w-5 h-5 text-[#eab308]" />
            <span>+254 700 898 950</span>
          </a>

          <div className="flex space-x-5 text-[#8b9d93]">
            <a href="#" className="hover:text-white transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
