'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Plus,
  CheckCircle2,
} from 'lucide-react';

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { user, openAuthModal } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    propertyType: 'Flat',
    purpose: 'RENT',
    bhk: '2 BHK',
    carpetArea: 1050,
    furnishing: 'Semi Furnished',
    monthlyRent: 18000,
    securityDeposit: 36000,
    maintenance: 1500,
    otherCharges: '',
    locality: '',
    city: '',
    address: '',
    images: [],
    amenities: [],
    status: 'ACTIVE',
  });

  const availableAmenitiesList = [
    'WiFi',
    'Parking',
    'Lift',
    'Power Backup',
    '24/7 Water',
    'Security',
    'CCTV',
    'Modular Kitchen',
    'AC',
    'Geyser',
    'Pet Friendly',
    'Gym',
    'Swimming Pool',
  ];

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/properties/${id}`);
      const data = await res.json();
      if (data.success && data.property) {
        setFormData({
          title: data.property.title || '',
          description: data.property.description || '',
          propertyType: data.property.propertyType || 'Flat',
          purpose: data.property.purpose || 'RENT',
          bhk: data.property.bhk || '2 BHK',
          carpetArea: data.property.carpetArea || 1050,
          furnishing: data.property.furnishing || 'Semi Furnished',
          monthlyRent: data.property.monthlyRent || data.property.priceValue || 18000,
          securityDeposit: data.property.securityDeposit || 0,
          maintenance: data.property.maintenance || 0,
          otherCharges: data.property.otherCharges || '',
          locality: data.property.locality || '',
          city: data.property.city || '',
          address: data.property.address || '',
          images: data.property.images || [],
          amenities: data.property.amenities || [],
          status: data.property.status || 'ACTIVE',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert('Property updated successfully!');
        router.push(`/properties/${id}`);
      } else {
        alert(data.message || 'Failed to update property');
      }
    } catch (err) {
      alert('Network error updating property');
    } finally {
      setSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev: any) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a: string) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3 py-2 rounded-xl border border-gray-200 cursor-pointer shadow-xs mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-blue-900/5">
        <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Edit Property</h1>
            <p className="text-xs text-gray-500">Update property details, price, photos, and amenities</p>
          </div>
          <span className="text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
            {formData.purpose}
          </span>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                {formData.purpose === 'RENT' ? 'Monthly Rent (₹)' : 'Price (₹)'}
              </label>
              <input
                type="number"
                required
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Security Deposit (₹)</label>
              <input
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Carpet Area (sq.ft)</label>
              <input
                type="number"
                value={formData.carpetArea}
                onChange={(e) => setFormData({ ...formData, carpetArea: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Locality</label>
              <input
                type="text"
                required
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Photos</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {formData.images.map((img: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group border">
                  <img src={img} alt="Property" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Paste photo URL"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableAmenitiesList.map((amenity) => {
                const selected = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${selected ? 'text-white' : 'text-gray-400'}`} />
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

