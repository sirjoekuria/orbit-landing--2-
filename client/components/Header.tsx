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
      <header className="bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-40 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center p-1.5 border border-border group-hover:border-primary/50 transition-all">
                <img src="/logo.webp" alt="Rocs Crew Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black text-foreground tracking-tighter group-hover:text-primary transition-colors">Rocs Crew</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 font-outfit">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium uppercase tracking-wider">
                Home
              </Link>
              <Link to="/tracking" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium uppercase tracking-wider">
                Track order
              </Link>
              <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium uppercase tracking-wider">
                Services
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium uppercase tracking-wider">
                About
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium uppercase tracking-wider">
                Contact
              </Link>
              <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium uppercase tracking-wider">
                Admin
              </Link>

              {/* Theme Toggle Desktop */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border text-muted-foreground hover:text-primary transition-all hover:scale-110 active:scale-95 shadow-sm"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              </button>
            </nav>

            {/* Contact Info & CTA */}
            <div className="hidden lg:flex items-center space-x-6">
              <a href="tel:+254700898950" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-all bg-muted px-4 py-2 rounded-full border border-border">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold tracking-widest">+254 700 898 950</span>
              </a>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-600 hover:bg-muted rounded-xl"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-muted font-bold">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-primary to-rocs-green-dark hover:brightness-110 text-primary-foreground font-bold px-6 rounded-xl shadow-lg">
                      Join Rocs
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions: Notifications & Profile */}
            <div className="flex md:hidden items-center space-x-3 pr-2">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border text-muted-foreground hover:text-primary transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border text-muted-foreground hover:text-primary transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <Link to={user ? "/dashboard" : "/login"}>
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-rocs-green-dark flex items-center justify-center shadow-md">
                  <UserIcon className="w-5 h-5 text-primary-foreground" />
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -mr-2 text-foreground hover:text-primary transition-colors relative z-50"
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
        className={`fixed inset-y-0 left-0 w-[280px] bg-background border-r border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col md:hidden ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center p-2 border border-border">
              <img src="/logo.webp" alt="Rocs Crew Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-black text-foreground tracking-tighter">Rocs Crew</span>
          </div>
          <button
            className="text-foreground drop-shadow-md p-1 hover:text-primary"
            onClick={() => setIsMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-6 space-y-6">
          <Link
            to="/"
            className="flex items-center space-x-4 text-foreground hover:text-primary transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Home className="w-5 h-5 text-primary" />
            <span>Home</span>
          </Link>

          <Link
            to="/tracking"
            className="flex items-center space-x-4 text-foreground hover:text-primary transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Truck className="w-5 h-5 text-primary" />
            <span>Track Order</span>
          </Link>

          <Link
            to="/services"
            className="flex items-center space-x-4 text-foreground hover:text-primary transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Wrench className="w-5 h-5 text-primary" />
            <span>Our Services</span>
          </Link>

          <Link
            to="/about"
            className="flex items-center space-x-4 text-foreground hover:text-primary transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Info className="w-5 h-5 text-primary" />
            <span>About Us</span>
          </Link>

          <Link
            to="/contact"
            className="flex items-center space-x-4 text-foreground hover:text-primary transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <HelpCircle className="w-5 h-5 text-primary" />
            <span>Contact</span>
          </Link>

          <Link
            to="/admin"
            className="flex items-center space-x-4 text-foreground hover:text-primary transition-colors font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            <Shield className="w-5 h-5 text-primary" />
            <span>Admin Panel</span>
          </Link>

          {/* User Account / Authentication Area */}
          <div className="pt-4 space-y-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3 text-foreground px-2 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{user.name}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  className="w-full justify-center bg-transparent border border-primary/50 text-foreground hover:bg-primary/10 h-12 rounded-xl"
                >
                  <LogOut className="w-5 h-5 mr-3 text-primary" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center bg-gradient-to-r from-primary to-rocs-green-dark hover:brightness-110 text-primary-foreground font-bold h-12 rounded-xl mb-4 shadow-md border-0">
                    <UserPlus className="w-5 h-5 mr-3" />
                    Sign Up Now
                  </Button>
                </Link>

                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center bg-transparent border border-primary/50 text-foreground hover:bg-primary/10 h-12 rounded-xl"
                  >
                    <LogIn className="w-5 h-5 mr-3 text-primary" />
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-border p-6 space-y-6">
          <a
            href="tel:+254700898950"
            className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors font-medium"
          >
            <Phone className="w-5 h-5 text-primary" />
            <span>+254 700 898 950</span>
          </a>

          <div className="flex space-x-5 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
