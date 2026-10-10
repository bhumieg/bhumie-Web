'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Building,
  PlusCircle,
  Edit3,
  Trash2,
  Eye,
  MessageSquare,
  Heart,
  Loader2,
  AlertCircle,
  MapPin,
} from 'lucide-react';

export default function MyPropertiesPage() {
  const { user, openAuthModal } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyProperties();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties/my-properties');
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.message || 'Failed to delete property');
      }
    } catch (err) {
      alert('Network error deleting property');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen py-24 px-4 max-w-md mx-auto text-center">
        <Building className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-gray-900 mb-2">Owner Properties</h2>
        <p className="text-xs text-gray-500 mb-6">
          Please login with your verified email to manage your listed properties.
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer"
        >
          Login with OTP
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Listed Properties</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Manage, update, and track inquiries for your real estate listings
          </p>
        </div>

        <Link
          href="/post-property"
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Property
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-900 mb-1">No Properties Listed Yet</h3>
          <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
            You haven't posted any properties yet. List your flat, house, or commercial space now to connect with tenants.
          </p>
          <Link
            href="/post-property"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Post Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
                <img
                  src={
                    prop.images && prop.images[0]
                      ? prop.images[0]
                      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={prop.title}
                  className="w-full sm:w-36 h-28 rounded-2xl object-cover shrink-0"
                />

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-black">
                      {prop.purpose === 'RENT' ? 'For Rent' : 'For Sale'}
                    </span>
                    <span className="text-xs font-bold text-gray-500">{prop.propertyType}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        prop.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-gray-900">{prop.title}</h3>

                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {prop.locality}, {prop.city}
                  </p>

                  <div className="text-sm font-black text-blue-600">{prop.priceDisplay}</div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                {/* Inquiries & Favorites stats */}
                <div className="flex items-center justify-around sm:justify-start gap-4 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs font-black text-gray-900">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>{prop._count?.inquiries || 0}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Leads</span>
                  </div>

                  <div className="h-6 w-[1px] bg-gray-200" />

                  <div>
                    <div className="flex items-center justify-center gap-1 text-xs font-black text-gray-900">
                      <Heart className="w-3.5 h-3.5 text-red-500" />
                      <span>{prop._count?.favorites || 0}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">Saves</span>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/properties/${prop.id}`}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 cursor-pointer"
                    title="View Property"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/properties/${prop.id}/edit`}
                    className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    title="Edit Property"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(prop.id, prop.title)}
                    disabled={deletingId === prop.id}
                    className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                    title="Delete Property"
                  >
                    {deletingId === prop.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

