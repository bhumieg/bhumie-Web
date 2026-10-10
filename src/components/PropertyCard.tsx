'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, CheckCircle2, Bed, Bath, Maximize2, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface PropertyData {
  id: string;
  title: string;
  propertyType: string;
  purpose: 'RENT' | 'SALE';
  bhk: string;
  carpetArea?: number | null;
  furnishing: string;
  priceValue: number;
  priceDisplay: string;
  bedrooms: number;
  bathrooms: number;
  locality: string;
  city: string;
  state?: string | null;
  images: string[];
  verified: boolean;
  featured: boolean;
  status: string;
}

export default function PropertyCard({ property }: { property: PropertyData }) {
  const { user, openAuthModal } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openAuthModal();
      return;
    }

    setFavLoading(true);
    try {
      const res = await fetch(`/api/properties/${property.id}/favorite`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.isFavorite);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
    }
  };

  const mainImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Property Image & Overlays */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Purpose Badge (RENT / SALE) */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide uppercase shadow-sm ${
              property.purpose === 'SALE'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-emerald-700 border border-emerald-100'
            }`}
          >
            {property.purpose === 'SALE' ? 'For Sale' : 'For Rent'}
          </span>

          {property.featured && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={toggleFavorite}
          disabled={favLoading}
          aria-label="Save Property"
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors shadow-sm cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Verified Badge */}
        {property.verified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </div>
        )}
      </div>

      {/* Property Details Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-black text-gray-900 tracking-tight">
              {property.priceDisplay}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
              {property.propertyType}
            </span>
          </div>

          {/* Title */}
          <Link href={`/properties/${property.id}`} className="block">
            <h3 className="font-bold text-gray-900 text-base line-clamp-1 hover:text-blue-600 transition-colors">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <p className="flex items-center gap-1 text-xs text-gray-500 mt-1 mb-3.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>
              {property.locality}, {property.city}
            </span>
          </p>

          {/* Specs Bar (BHK, Area, Furnishing) */}
          <div className="flex items-center gap-3 py-2.5 px-3 rounded-2xl bg-gray-50 text-xs text-gray-700 font-semibold mb-4 border border-gray-100">
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-blue-600" />
              <span>{property.bhk}</span>
            </div>
            <span className="text-gray-300">•</span>
            {property.carpetArea && (
              <>
                <div className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{property.carpetArea} sq.ft</span>
                </div>
                <span className="text-gray-300">•</span>
              </>
            )}
            <span className="truncate">{property.furnishing}</span>
          </div>
        </div>

        {/* Action Link */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Ready to move</span>
          <Link
            href={`/properties/${property.id}`}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

