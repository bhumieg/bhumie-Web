'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Plus,
  Trash2,
  MapPin,
  Building,
  Home,
  Store,
  Briefcase,
  BedDouble,
  Users,
  Sparkles,
  Loader2,
  Wifi,
  Car,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function PostPropertyPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [submitting, setSubmitting] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Details
    propertyType: 'Flat',
    purpose: 'RENT', // RENT or SALE
    title: '',
    bhk: '2 BHK',
    carpetArea: '1050',
    furnishing: 'Semi Furnished',

    // Step 2: Photos & Video
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    ],
    videoUrl: '',

    // Step 3: Location
    address: 'Sector 62, Noida, Uttar Pradesh',
    locality: 'Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201309',
    latitude: 28.6280,
    longitude: 77.3649,

    // Step 4: Rent & Price Details
    monthlyRent: '18000',
    securityDeposit: '36000',
    maintenance: '1500',
    otherCharges: 'Electricity & Water as per meter',
    bedrooms: '2',
    bathrooms: '2',
    floor: '2nd Floor',
    ageOfProperty: '2-5 Years',
    availableFrom: 'Immediate',

    // Step 5: Amenities
    amenities: [
      'WiFi',
      'Parking',
      'Lift',
      'Power Backup',
      '24/7 Water',
      'Security',
      'CCTV',
      'Modular Kitchen',
      'AC',
    ],

    description: '',
    ownerPhone: user?.phone || '+91 98765 43210',
  });

  const propertyTypes = ['Flat', 'House', 'Shop', 'Office', 'Room', 'PG'];
  const bhkOptions = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
  const furnishingOptions = ['Furnished', 'Semi Furnished', 'Unfurnished'];

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
    'Balcony',
    'Clubhouse',
    'Gas Pipeline',
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleInputChange('latitude', pos.coords.latitude);
          handleInputChange('longitude', pos.coords.longitude);
          alert('Location updated successfully using GPS coordinates!');
        },
        () => {
          alert('Could not fetch location. Please ensure location permissions are granted.');
        }
      );
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.title.trim()) {
      // Auto-generate title if empty
      const autoTitle = `${formData.bhk} ${formData.propertyType} for ${formData.purpose === 'RENT' ? 'Rent' : 'Sale'} in ${formData.locality}`;
      handleInputChange('title', autoTitle);
    }
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert('Property listing submitted successfully!');
        router.push(`/properties/${data.property.id}`);
      } else {
        alert(data.message || 'Failed to submit property');
      }
    } catch (err) {
      alert('Network error submitting property');
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = [
    '1. Basic Details',
    '2. Photos & Video',
    '3. Location',
    '4. Rent & Price',
    '5. Amenities',
    '6. Review & Submit',
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add Property</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
          Complete the 6 simple steps to post your listing on Bhumie
        </p>
      </div>

      {/* 6-Step Visual Indicator matching Screenshot 4/5 */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />

          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              onClick={() => s < currentStep && setCurrentStep(s)}
              className={`relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all cursor-pointer ${
                s < currentStep
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : s === currentStep
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-500/30'
                  : 'bg-white border-2 border-gray-200 text-gray-400'
              }`}
            >
              {s < currentStep ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>
        <div className="mt-3 text-center text-xs font-black text-blue-600">
          {stepLabels[currentStep - 1]}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl shadow-blue-900/5">
        {/* ================= STEP 1: BASIC DETAILS ================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Basic Details</h2>
              <p className="text-xs text-gray-500">Let's start with some basic information</p>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Property Type</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {propertyTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleInputChange('propertyType', t)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      formData.propertyType === t
                        ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Purpose</label>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                {['RENT', 'SALE'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleInputChange('purpose', p)}
                    className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.purpose === p
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p === 'RENT' ? 'For Rent' : 'For Sale'}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Property Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. 2 BHK Flat for Rent in Sector 62"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* BHK Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">BHK Configuration</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {bhkOptions.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => handleInputChange('bhk', b)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.bhk === b
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Carpet Area */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Carpet Area (sq.ft)</label>
              <input
                type="number"
                value={formData.carpetArea}
                onChange={(e) => handleInputChange('carpetArea', e.target.value)}
                placeholder="e.g. 1050"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Furnishing */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Furnishing</label>
              <div className="grid grid-cols-3 gap-2">
                {furnishingOptions.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => handleInputChange('furnishing', f)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      formData.furnishing === f
                        ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PHOTOS & VIDEO ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Add Photos & Videos</h2>
              <p className="text-xs text-gray-500">Add clear photos to get more enquiries (up to 15)</p>
            </div>

            {/* Image Preview Grid matching screenshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group border border-gray-200">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md font-bold">
                    Photo {idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Image URL / Upload Field */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Add Image (Paste URL or Unsplash link)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Photo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Video Link (Optional)</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                placeholder="YouTube or MP4 tour link"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 3: LOCATION ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Property Location</h2>
              <p className="text-xs text-gray-500">Set the exact location of your property</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Full Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Building name, street, sector..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Locality / Sector</label>
                <input
                  type="text"
                  value={formData.locality}
                  onChange={(e) => handleInputChange('locality', e.target.value)}
                  placeholder="e.g. Sector 62, Saket, Dwarka"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g. Noida, New Delhi, Gurgaon"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* GPS Coordinates & Current Location matching screenshot */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block">Pinpoint Coordinates</span>
                  <span className="text-gray-500 font-mono">
                    Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="px-3.5 py-2 bg-white text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Use My Current Location
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: RENT & PRICE ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Rent & Price Details</h2>
              <p className="text-xs text-gray-500">Set your rent, deposit, and maintenance charges</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                {formData.purpose === 'RENT' ? 'Monthly Rent (₹)' : 'Expected Price (₹)'}
              </label>
              <input
                type="number"
                value={formData.monthlyRent}
                onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                placeholder="18000"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-lg font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {formData.purpose === 'RENT' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
                  placeholder="36000"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Maintenance (Monthly) (Optional)</label>
              <input
                type="number"
                value={formData.maintenance}
                onChange={(e) => handleInputChange('maintenance', e.target.value)}
                placeholder="1500"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Other Charges (Optional)</label>
              <input
                type="text"
                value={formData.otherCharges}
                onChange={(e) => handleInputChange('otherCharges', e.target.value)}
                placeholder="Parking, Electricity, Water etc."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Floor</label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  placeholder="2nd Floor"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Age of Property</label>
                <input
                  type="text"
                  value={formData.ageOfProperty}
                  onChange={(e) => handleInputChange('ageOfProperty', e.target.value)}
                  placeholder="2-5 Years"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: SELECT AMENITIES ================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Select Amenities</h2>
              <p className="text-xs text-gray-500">Choose amenities available in your property</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableAmenitiesList.map((amenity) => {
                const selected = formData.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        selected ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Property Description (Optional)
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Highlight any additional details, neighborhood advantages, metro proximity..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ================= STEP 6: REVIEW & SUBMIT ================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Review & Submit</h2>
              <p className="text-xs text-gray-500">Please review your property details before submitting</p>
            </div>

            {/* Summary Card matching screenshot */}
            <div className="bg-gray-50 rounded-3xl p-5 sm:p-6 border border-gray-200 flex flex-col sm:flex-row gap-5">
              <img
                src={formData.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80'}
                alt="Preview"
                className="w-full sm:w-44 h-36 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-black">
                    {formData.purpose === 'RENT' ? 'For Rent' : 'For Sale'}
                  </span>
                  <span className="text-xs text-gray-500">{formData.propertyType}</span>
                </div>

                <h3 className="text-lg font-black text-gray-900">{formData.title}</h3>
                <p className="text-xs text-gray-500">{formData.locality}, {formData.city}</p>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl font-black text-blue-600">
                    ₹{parseInt(formData.monthlyRent || '0').toLocaleString('en-IN')}
                    {formData.purpose === 'RENT' ? ' /month' : ''}
                  </span>
                  {formData.securityDeposit && (
                    <span className="text-xs text-gray-500 font-semibold">
                      (Deposit: ₹{parseInt(formData.securityDeposit).toLocaleString('en-IN')})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-600 font-bold pt-1">
                  <span>{formData.bhk}</span>
                  <span>•</span>
                  <span>{formData.carpetArea} sq.ft</span>
                  <span>•</span>
                  <span>{formData.furnishing}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Your property will be live instantly in Bhumie search results and owner dashboard.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-102 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting Property...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Submit Property
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

