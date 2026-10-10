'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PropertyCard, { PropertyData } from '@/components/PropertyCard';
import {
  Filter,
  ArrowUpDown,
  MapPin,
  Map as MapIcon,
  X,
  Search,
  SlidersHorizontal,
  Loader2,
} from 'lucide-react';

function PropertyListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || 'ALL');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || 'ALL');
  const [bhk, setBhk] = useState(searchParams.get('bhk') || 'ALL');
  const [furnishing, setFurnishing] = useState(searchParams.get('furnishing') || 'ALL');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [sortBy, setSortBy] = useState('newest');

  const bhkOptions = ['ALL', '1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
  const typeOptions = ['ALL', 'Flat', 'House', 'Shop', 'Office', 'Room', 'PG'];
  const furnishingOptions = ['ALL', 'Furnished', 'Semi Furnished', 'Unfurnished'];

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (locality.trim()) params.set('locality', locality.trim());
      if (purpose !== 'ALL') params.set('purpose', purpose);
      if (propertyType !== 'ALL') params.set('propertyType', propertyType);
      if (bhk !== 'ALL') params.set('bhk', bhk);
      if (furnishing !== 'ALL') params.set('furnishing', furnishing);
      if (sortBy) params.set('sortBy', sortBy);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [purpose, propertyType, bhk, furnishing, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const clearFilters = () => {
    setSearch('');
    setPurpose('ALL');
    setPropertyType('ALL');
    setBhk('ALL');
    setFurnishing('ALL');
    setLocality('');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header matching Screenshot 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {locality ? `Properties in ${locality}` : purpose === 'RENT' ? 'Flats & Properties for Rent' : purpose === 'SALE' ? 'Properties for Sale' : 'All Verified Properties'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            {total} {total === 1 ? 'Result' : 'Results'} found in Delhi-NCR
          </p>
        </div>

        {/* Sort & Filter controls */}
        <div className="flex items-center gap-2.5">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search locality..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Drawer Toggle */}
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-blue-200/60"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Filter Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => setPurpose('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            purpose === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Purpose
        </button>
        <button
          onClick={() => setPurpose('RENT')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            purpose === 'RENT' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          For Rent
        </button>
        <button
          onClick={() => setPurpose('SALE')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            purpose === 'SALE' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          For Sale
        </button>

        <div className="h-5 w-[1px] bg-gray-300 mx-1 shrink-0" />

        {bhkOptions.slice(1).map((b) => (
          <button
            key={b}
            onClick={() => setBhk(bhk === b ? 'ALL' : b)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              bhk === b ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-xs text-gray-500 font-medium">Finding available properties...</p>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No matching properties found</h3>
          <p className="text-xs text-gray-500 mb-4">Try clearing filters or search for another locality like Sector 62 or Saket.</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Floating Map View Button (Matching Screenshot 2) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setMapModalOpen(true)}
          className="px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-600/30 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
        >
          <MapIcon className="w-4 h-4" />
          <span>Map View</span>
        </button>
      </div>

      {/* Filter Drawer / Modal */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-black text-gray-900">Filters</h3>
                </div>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Purpose */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                  Listing Purpose
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['ALL', 'RENT', 'SALE'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPurpose(p)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        purpose === p
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {p === 'ALL' ? 'Any' : p === 'RENT' ? 'For Rent' : 'For Sale'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                  Property Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {typeOptions.map((t) => (
                    <button
                      key={t}
                      onClick={() => setPropertyType(t)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        propertyType === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {t === 'ALL' ? 'All Types' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* BHK */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                  BHK Configuration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {bhkOptions.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBhk(b)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        bhk === b
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {b === 'ALL' ? 'Any BHK' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Furnishing */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                  Furnishing
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {furnishingOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFurnishing(f)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        furnishing === f
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {f === 'ALL' ? 'Any' : f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={clearFilters}
                className="w-1/3 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  setFilterDrawerOpen(false);
                  fetchListings();
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map View Modal */}
      {mapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-gray-900">Map View • Delhi-NCR Properties</h3>
              </div>
              <button
                onClick={() => setMapModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative flex-1 bg-slate-100 overflow-hidden flex items-center justify-center">
              {/* Interactive SVG/Stylized map representation with property pins */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#315bef_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 w-full h-full p-8 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setMapModalOpen(false);
                      router.push(`/properties/${p.id}`);
                    }}
                    className="p-4 bg-white rounded-2xl shadow-md border border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer flex gap-4"
                  >
                    <img
                      src={p.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                      alt={p.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <span className="text-xs font-black text-blue-600">{p.priceDisplay}</span>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{p.title}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {p.locality}, {p.city}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PropertyListingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <PropertyListingContent />
    </Suspense>
  );
}

