'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  PlusCircle,
  Shield,
  User as UserIcon,
  LogOut,
  Building,
  Menu,
  X,
  MapPin,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';

export default function Navbar() {
  const { user, openAuthModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('New Delhi');

  const cities = ['New Delhi', 'Noida', 'Gurgaon', 'Greater Noida', 'Faridabad', 'Ghaziabad'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Home className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                  Ghar<span className="text-blue-600">24</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Real Estate
                </span>
              </div>
            </Link>

            {/* City Selector Pill */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setCitySelectorOpen(!citySelectorOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors border border-gray-200 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {citySelectorOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[11px] font-bold text-gray-400 px-3 py-1 uppercase">Select City</div>
                  {cities.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCity(c);
                        setCitySelectorOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                        selectedCity === c ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nav Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/properties"
              className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
            >
              Browse Properties
            </Link>
            <Link
              href="/properties?purpose=RENT"
              className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
            >
              For Rent
            </Link>
            <Link
              href="/properties?purpose=SALE"
              className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
            >
              For Sale
            </Link>
            <Link
              href="/chat"
              className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span>Messages</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-all"
              >
                <Shield className="w-4 h-4 text-gray-500" />
                Admin Portal
              </Link>
            )}

            <Link
              href="/post-property"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Post Property
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <div className="text-left text-xs font-bold text-gray-800 max-w-[100px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{user.name || 'Ghar24 User'}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/chat"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      Messages & Chats
                    </Link>

                    <Link
                      href="/my-properties"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      <Building className="w-4 h-4 text-gray-500" />
                      My Listed Properties
                    </Link>

                    <Link
                      href="/post-property"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      <PlusCircle className="w-4 h-4 text-gray-500" />
                      Add New Property
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
                      >
                        <Shield className="w-4 h-4 text-blue-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl mt-1 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-all cursor-pointer"
              >
                Login / Register
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/post-property"
              className="p-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <div className="flex flex-col gap-2">
              <Link
                href="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Browse Properties
              </Link>
              <Link
                href="/properties?purpose=RENT"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Flats for Rent
              </Link>
              <Link
                href="/properties?purpose=SALE"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Properties for Sale
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
                Messages & Chats
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-blue-600" />
                  Admin Portal
                </Link>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 text-xs text-gray-500">
                    Logged in as <strong className="text-gray-900">{user.email}</strong>
                  </div>
                  <Link
                    href="/my-properties"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50"
                  >
                    My Listed Properties
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold text-center"
                >
                  Login with OTP
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

