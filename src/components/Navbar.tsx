'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Bell,
  BellRing,
  BellOff,
  Check,
  ChevronRight,
  Camera,
} from 'lucide-react';
import { notificationManager } from '@/lib/browserNotifications';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openAuthModal, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('New Delhi');

  // Notification states
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadList, setUnreadList] = useState<any[]>([]);
  const [notifPermission, setNotifPermission] = useState<string>('default');

  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const lastUnreadCountRef = useRef<number | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Hide User Portal Navbar completely on Admin Portal
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Poll for unread chats (skip if currently on /chat)
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setUnreadList([]);
      lastUnreadCountRef.current = null;
      return;
    }

    const fetchUnread = async () => {
      // If user is already on /chat, skip polling to reduce database load
      if (pathname?.startsWith('/chat')) {
        return;
      }

      try {
        const res = await fetch('/api/chat/unread-count');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const count = data.unreadCount || 0;
            const recent = data.recentUnread || [];

            // Detect new incoming message: fire system notification and sound chime!
            if (lastUnreadCountRef.current !== null && count > lastUnreadCountRef.current && recent.length > 0) {
              const latest = recent[0];
              notificationManager.sendNotification({
                title: `Bhumie: New message from ${latest.otherUserName || 'User'}`,
                body: latest.lastMessage || 'You received a new message',
                icon: latest.propertyImage || '/favicon.ico',
                tag: `chat-${latest.id}`,
                onClick: () => router.push(`/chat?id=${latest.id}`),
              });
            }

            lastUnreadCountRef.current = count;
            setUnreadCount(count);
            setUnreadList(recent);
          }
        }
      } catch {
        // silent fail on network blip
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchUnread();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user, pathname]);

  // Close notification popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node) &&
        mobileNotifRef.current &&
        !mobileNotifRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cities = ['New Delhi', 'Noida', 'Gurgaon', 'Greater Noida', 'Faridabad', 'Ghaziabad'];

  const handleOpenConversation = (conversationId: string) => {
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
    router.push(`/chat?id=${conversationId}`);
  };

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
                  Bhumie<span className="text-blue-600">.</span>
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
                        selectedCity === c
                          ? 'bg-blue-50 text-blue-600 font-bold'
                          : 'text-gray-700 hover:bg-gray-50'
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
              className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 relative"
            >
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black leading-none animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
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

            {/* Notification Bell Button (Desktop) */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center text-blue-600 shadow-xs transition-all cursor-pointer hover:scale-105"
                title="Notifications & Unread Chats"
              >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-500'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 min-w-[19px] h-[19px] rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 p-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <h4 className="font-black text-gray-900 text-xs sm:text-sm">
                        Chat Notifications
                      </h4>
                    </div>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black">
                        {unreadCount} Unread
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> All Caught Up
                      </span>
                    )}
                  </div>

                  {/* Enable System Push / Alerts Button */}
                  {notifPermission === 'default' && (
                    <div className="p-2.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-blue-800 font-semibold text-[11px]">
                        <BellRing className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Enable instant sound & push alerts</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const granted = await notificationManager.requestPermission();
                          setNotifPermission(granted ? 'granted' : 'denied');
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                      >
                        Enable
                      </button>
                    </div>
                  )}

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {unreadList.length > 0 ? (
                      unreadList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleOpenConversation(item.id)}
                          className="p-3.5 hover:bg-blue-50/60 transition-colors cursor-pointer flex items-start gap-3"
                        >
                          <div className="relative shrink-0">
                            {item.propertyImage ? (
                              <img
                                src={item.propertyImage}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                                {item.otherUserName ? item.otherUserName[0] : 'U'}
                              </div>
                            )}
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                              {item.unreadCount}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-black text-gray-900 truncate">
                                {item.otherUserName}
                              </p>
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {new Date(item.lastMessageAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 truncate font-medium">
                              {item.propertyTitle}
                            </p>
                            <p className="text-xs text-blue-700 font-semibold truncate mt-0.5">
                              "{item.lastMessage}"
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <BellOff className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-800">No unread chat messages</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          When a buyer or property owner messages you, notifications will show here.
                        </p>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/chat"
                    onClick={() => setNotificationsOpen(false)}
                    className="block p-3 bg-gray-50 hover:bg-blue-50 text-center text-xs font-bold text-blue-600 border-t border-gray-100 transition-colors"
                  >
                    Open Messages & All Chats →
                  </Link>
                </div>
              )}
            </div>

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
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-7 h-7 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                  )}
                  <div className="text-left text-xs font-bold text-gray-800 max-w-[100px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {user.name || 'Bhumie User'}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 uppercase">
                          {user.role === 'OWNER' ? 'Seller' : user.role === 'USER' ? 'Buyer' : 'Admin'}
                        </span>
                        {user.sellerVerified && (
                          <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      My Profile & Verification
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      Upload / Change Profile Photo
                    </Link>

                    <Link
                      href="/chat"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      <span className="flex items-center gap-2.5">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        Messages & Chats
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold">
                          {unreadCount}
                        </span>
                      )}
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

          {/* Mobile Action Buttons (Profile Avatar, Bell Notification, Post Property, Hamburger Menu) */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile User Profile Avatar / Initial */}
            {user && (
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-blue-600 text-white font-black text-xs shrink-0 shadow-xs cursor-pointer hover:scale-105 transition-transform"
                title="My Profile"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name ? user.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}</span>
                )}
              </Link>
            )}

            {/* Notification Bell (Mobile Header) */}
            <div ref={mobileNotifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-9 h-9 rounded-full bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center text-blue-600 shadow-xs transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-500'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 min-w-[17px] h-[17px] rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Mobile Notification Popover */}
              {notificationsOpen && (
                <div className="fixed inset-x-4 top-20 bg-white rounded-3xl shadow-2xl border border-gray-100 p-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <h4 className="font-black text-gray-900 text-xs">Chat Notifications</h4>
                    </div>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black">
                        {unreadCount} Unread
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600">All caught up</span>
                    )}
                  </div>

                  {/* Enable System Push / Alerts Button */}
                  {notifPermission === 'default' && (
                    <div className="p-2.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-blue-800 font-semibold text-[11px]">
                        <BellRing className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Enable instant sound & push alerts</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const granted = await notificationManager.requestPermission();
                          setNotifPermission(granted ? 'granted' : 'denied');
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow-xs cursor-pointer"
                      >
                        Enable
                      </button>
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {unreadList.length > 0 ? (
                      unreadList.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleOpenConversation(item.id)}
                          className="p-3 hover:bg-blue-50/60 transition-colors cursor-pointer flex items-start gap-3"
                        >
                          <div className="relative shrink-0">
                            {item.propertyImage ? (
                              <img
                                src={item.propertyImage}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xs">
                                {item.otherUserName ? item.otherUserName[0] : 'U'}
                              </div>
                            )}
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center">
                              {item.unreadCount}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-black text-gray-900 truncate">
                                {item.otherUserName}
                              </p>
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {new Date(item.lastMessageAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 truncate">{item.propertyTitle}</p>
                            <p className="text-xs text-blue-700 font-semibold truncate mt-0.5">
                              "{item.lastMessage}"
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <BellOff className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-gray-800">No unread chat messages</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">You are all caught up!</p>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/chat"
                    onClick={() => setNotificationsOpen(false)}
                    className="block p-3 bg-gray-50 hover:bg-blue-50 text-center text-xs font-bold text-blue-600 border-t border-gray-100 transition-colors"
                  >
                    Open Messages & All Chats →
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/post-property"
              className="p-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20"
              title="Post Property"
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
                className="px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  Messages & Chats
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-xs font-black">
                    {unreadCount} new
                  </span>
                )}
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
                <div className="space-y-3">
                  {/* User Profile Card with Avatar or Capital Initial Letter */}
                  <div className="p-3 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-200/80">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-600 text-white font-black text-base flex items-center justify-center shrink-0 border-2 border-white shadow-xs">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.name ? user.name[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : 'U'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-gray-900 truncate">
                        {user.name || user.email.split('@')[0]}
                      </h4>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline mt-0.5"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Upload Profile Photo</span>
                      </Link>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
                  >
                    My Profile & Verification
                  </Link>
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
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 cursor-pointer"
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
