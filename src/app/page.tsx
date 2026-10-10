'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties?limit=8');
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
      await fetchProperties();
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

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Verified Homes & Spaces in Delhi-NCR</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal whitespace-normal sm:whitespace-nowrap text-gray-900 tracking-tight leading-[1.1] mb-6">
            Find your next{' '}
            <span className="text-blue-600">perfect place</span>
          </h1>

          {/* Search Bar matching screenshot */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full relative flex items-center bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-2 sm:p-2.5 mb-10 transition-all focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent"
          >
            <div className="pl-3.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location, society or locality (e.g. Sector 62, Saket)"
              className="w-full px-3.5 py-2.5 text-sm sm:text-base text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

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

      {/* Recommended For You Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recommended for you</h2>
            <p className="text-xs text-gray-500">Verified properties hand-picked for quality living</p>
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
              List Your Property on Ghar24 for Free
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
