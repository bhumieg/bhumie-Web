'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PropertyCard, { PropertyData } from '@/components/PropertyCard';
import {
  Search,
  Building,
  Home as HomeIcon,
  Store,
  Briefcase,
  BedDouble,
  Users,
  ChevronRight,
  Sparkles,
  MapPin,
  PlusCircle,
  Database,
  Loader2,
  Navigation,
  CheckCircle2,
  XCircle,
  KeyRound,
  Compass,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Automatic Location Detection states
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{
    lat: number;
    lng: number;
    locality?: string;
    city?: string;
  } | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: 'House', icon: HomeIcon, type: 'House' },
    { name: 'Flat', icon: Building, type: 'Flat' },
    { name: 'Shop', icon: Store, type: 'Shop' },
    { name: 'Office', icon: Briefcase, type: 'Office' },
    { name: 'Room', icon: BedDouble, type: 'Room' },
    { name: 'PG', icon: Users, type: 'PG' },
  ];

  const popularLocalities = [
    {
      name: 'Dwarka',
      city: 'Delhi',
      count: '1,250+ Properties',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Noida',
      city: 'Noida',
      count: '1,180+ Properties',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Gurgaon',
      city: 'Gurgaon',
      count: '2,350+ Properties',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80',
    },
    {
      name: 'Saket',
      city: 'Delhi',
      count: '980+ Properties',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=500&q=80',
    },
  ];

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch location suggestions while typing
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locations/suggest?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          }
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial properties and auto location detection
  useEffect(() => {
    const savedLocSetting = localStorage.getItem('bhumie_auto_location');
    const isLocEnabled = savedLocSetting !== 'false';
    setLocationEnabled(isLocEnabled);

    if (isLocEnabled && 'geolocation' in navigator) {
      detectUserLocation();
    } else {
      fetchProperties();
    }
  }, []);

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      fetchProperties();
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let detectedCity = 'Delhi NCR';

        // Approximate metro location for Delhi-NCR if coordinates match
        if (latitude > 28.3 && latitude < 28.9 && longitude > 76.8 && longitude < 77.6) {
          if (longitude > 77.3) detectedCity = 'Noida';
          else if (longitude < 77.1) detectedCity = 'Gurgaon';
          else detectedCity = 'Delhi';
        }

        const locObj = { lat: latitude, lng: longitude, city: detectedCity };
        setDetectedLocation(locObj);
        setDetectingLocation(false);
        fetchProperties(locObj);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setDetectingLocation(false);
        fetchProperties();
      },
      { timeout: 7000 }
    );
  };

  const toggleLocationDetection = () => {
    const nextState = !locationEnabled;
    setLocationEnabled(nextState);
    localStorage.setItem('bhumie_auto_location', String(nextState));

    if (nextState) {
      detectUserLocation();
    } else {
      setDetectedLocation(null);
      fetchProperties(null);
    }
  };

  const fetchProperties = async (loc?: { lat: number; lng: number } | null) => {
    try {
      setLoading(true);
      let url = '/api/properties?limit=8';
      if (loc?.lat && loc?.lng) {
        url += `&lat=${loc.lat}&lng=${loc.lng}&radius=40`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setSeedMessage(data.message || 'Sample properties added!');
      await fetchProperties(detectedLocation);
    } catch {
      setSeedMessage('Failed to seed properties');
    } finally {
      setSeeding(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/properties');
    }
  };

  const selectSuggestion = (sug: any) => {
    setSearchQuery(sug.label);
    setShowSuggestions(false);
    if (sug.lat && sug.lng) {
      router.push(
        `/properties?locality=${encodeURIComponent(sug.locality)}&city=${encodeURIComponent(
          sug.city
        )}&lat=${sug.lat}&lng=${sug.lng}`
      );
    } else {
      router.push(`/properties?locality=${encodeURIComponent(sug.locality)}&city=${encodeURIComponent(sug.city)}`);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative pt-8 pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="w-full">
          {/* Top badges & Location Detection Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discover Verified Homes & Commercial Spaces</span>
            </div>

            {/* Automatic Location Pill / Toggle */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-xs text-xs font-semibold">
              <button
                type="button"
                onClick={toggleLocationDetection}
                className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 cursor-pointer"
                title="Toggle automatic location detection"
              >
                <Navigation
                  className={`w-3.5 h-3.5 ${
                    locationEnabled ? 'text-blue-600 animate-pulse' : 'text-gray-400'
                  }`}
                />
                <span>
                  {detectingLocation
                    ? 'Detecting GPS...'
                    : detectedLocation
                    ? `Nearby: ${detectedLocation.city || 'Your Area'}`
                    : locationEnabled
                    ? 'Auto-location On'
                    : 'Auto-location Off'}
                </span>
              </button>

              <button
                type="button"
                onClick={toggleLocationDetection}
                className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                  locationEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {locationEnabled ? 'Active' : 'Enable'}
              </button>
            </div>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-[clamp(1.1rem,5vw,2.25rem)] sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-6 whitespace-nowrap sm:whitespace-normal overflow-visible">
            <span className="text-gray-950">Find your next</span>{' '}
            <span className="text-blue-600">perfect place</span>
          </h1>

          {/* SEPARATE BUY AND SELL BUTTONS (Requirement 10) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* BUY PROPERTY BUTTON */}
            <Link
              href="/properties?purpose=SALE"
              className="group relative flex items-center justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-600/25 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden border border-blue-400/30"
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-blue-200">
                    Looking to Purchase or Rent?
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    BUY PROPERTY
                  </h3>
                  <p className="text-xs text-blue-100/90 font-medium mt-0.5">
                    Explore verified apartments, villas, plots & shops
                  </p>
                </div>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-all shrink-0">
                <ChevronRight className="w-5 h-5" />
              </div>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            </Link>

            {/* SELL PROPERTY BUTTON */}
            <Link
              href="/post-property"
              className="group relative flex items-center justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden border border-emerald-400/30"
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
                    Property Owner or Agent?
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    SELL PROPERTY
                  </h3>
                  <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                    List for free, reach 10,000+ genuine buyers & tenants
                  </p>
                </div>
              </div>
              <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600 transition-all shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            </Link>
          </div>

          {/* Smart Search Bar with Autocomplete & Current Location button (Requirements 3 & 4) */}
          <div ref={searchContainerRef} className="relative w-full mb-8">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full relative flex items-center bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-2 sm:p-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent"
            >
              <div className="pl-3.5 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search by area, locality, city or project (e.g. Sector 62, Indirapuram, Saket)"
                className="w-full px-3.5 py-2.5 text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
              />

              {/* Use My Current Location inline button */}
              <button
                type="button"
                onClick={detectUserLocation}
                disabled={detectingLocation}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 mr-2 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 text-xs font-bold transition-colors border border-gray-200 cursor-pointer shrink-0"
                title="Search properties near my current location"
              >
                <Compass className={`w-4 h-4 ${detectingLocation ? 'animate-spin text-blue-600' : ''}`} />
                <span>Near Me</span>
              </button>

              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Smart Location Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] uppercase font-bold text-gray-400 px-3 py-1.5">
                  Suggested Localities & Metros
                </div>
                <div className="space-y-1">
                  {suggestions.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => selectSuggestion(sug)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-blue-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 text-gray-500 group-hover:text-blue-600 flex items-center justify-center">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600">
                            {sug.locality || sug.label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {sug.city} {sug.state ? `• ${sug.state}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400 group-hover:text-blue-600">
                        View properties →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Icons Row */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 w-full">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/properties?propertyType=${cat.type}`}
                  className="group flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-700 group-hover:text-blue-600 transition-colors mb-2">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Localities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Popular Localities</h2>
            <p className="text-xs text-gray-500">Explore prime rental and residential hubs</p>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
          >
            <span>See all</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {popularLocalities.map((loc) => (
            <Link
              key={loc.name}
              href={`/properties?locality=${loc.name}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img
                src={loc.image}
                alt={loc.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-1 text-xs text-blue-300 font-semibold mb-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{loc.city}</span>
                </div>
                <h3 className="text-lg font-black tracking-tight leading-tight">{loc.name}</h3>
                <p className="text-xs text-gray-300 mt-0.5">{loc.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended For You / Nearby Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {detectedLocation ? `Properties Near You in ${detectedLocation.city || 'Your Area'}` : 'Recommended for you'}
            </h2>
            <p className="text-xs text-gray-500">
              {detectedLocation
                ? 'Filtered based on your detected location coordinates'
                : 'Verified properties hand-picked for quality living'}
            </p>
          </div>
          <Link
            href="/properties"
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Database Seed Alert / Helper */}
        {properties.length === 0 && !loading && (
          <div className="p-8 bg-blue-50 rounded-3xl border border-blue-200 text-center mb-8">
            <Database className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-black text-gray-900 mb-1">Database Ready</h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto mb-4">
              Your Neon PostgreSQL database is connected. Click below to load sample verified properties matching the Delhi-NCR listings shown in your design.
            </p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Seeding sample properties...
                </>
              ) : (
                'Seed Sample Properties'
              )}
            </button>
            {seedMessage && <p className="text-xs text-emerald-700 font-bold mt-3">{seedMessage}</p>}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : null}
      </section>

      {/* Owner Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 sm:p-12 overflow-hidden shadow-2xl shadow-blue-500/20">
          <div className="relative z-10 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md">
              For Property Owners
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 mb-3">
              List Your Property on Bhumie for Free
            </h2>
            <p className="text-sm text-blue-100 mb-6 leading-relaxed">
              Connect directly with verified tenants and buyers. Manage your listing, view inquiries, update pricing, and close deals without middlemen.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/post-property"
                className="px-6 py-3.5 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-black text-sm shadow-lg shadow-black/10 flex items-center gap-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Post Property Now
              </Link>
              <Link
                href="/my-properties"
                className="px-6 py-3.5 rounded-2xl bg-blue-700/50 hover:bg-blue-700 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Manage My Properties
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden lg:flex items-center justify-center">
            <Building className="w-96 h-96 text-white" />
          </div>
        </div>
      </section>
    </div>
  );
}
