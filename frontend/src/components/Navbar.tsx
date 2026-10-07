import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Camera, Menu, X, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'New Analysis', path: '/create' },
    { name: 'Photo Spots', path: '/photospots' },
    { name: 'History', path: '/history' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-accent-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-accent-500 to-amber-500 bg-clip-text text-transparent">
                PoseAI
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {user && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  location.pathname === link.path ? 'text-accent-500' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-white/10 hover:border-accent-500/50 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-300" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 divide-y divide-white/5 border border-white/10">
                    <div className="py-1">
                      <Link
                        to="/settings"
                        className="group flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-white" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="group flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                      >
                        <LogOut className="mr-3 h-4 w-4 text-gray-400 group-hover:text-white" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-500 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-slate-800 hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-white/10">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block rounded-md px-3 py-2 text-base font-medium ${
                      location.pathname === link.path
                        ? 'bg-accent-500/10 text-accent-500'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/settings"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-slate-800 hover:text-white"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
