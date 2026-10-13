'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MapPinPickerModal from '@/components/MapPinPickerModal';
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
  MoveLeft,
  MoveRight,
  Star,
  Compass,
} from 'lucide-react';

export default function PostPropertyPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [submitting, setSubmitting] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

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
    latitude: 28.628,
    longitude: 77.3649,

    // Step 4: Rent & Price & Building Specs
    monthlyRent: '18000',
    securityDeposit: '36000',
    maintenance: '1500',
    otherCharges: 'Electricity & Water as per meter',
    bedrooms: '2',
    bathrooms: '2',
    floor: '2nd Floor',
    totalFloors: '14',
    balconies: '2',
    hasLift: true,
    roadWidth: '40 ft',
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

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setUploadError(null);

    try {
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append('files', files[i]);
      }
      data.append('folder', 'bhumie_properties');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (result.success && result.urls) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...result.urls],
        }));
      } else {
        setUploadError(result.message || 'Image upload failed');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading images');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
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

  // Image Reordering & Management (Requirement 13)
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newImages.length) return prev;
      const temp = newImages[index];
      newImages[index] = newImages[targetIndex];
      newImages[targetIndex] = temp;
      return { ...prev, images: newImages };
    });
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    setFormData((prev) => {
      const newImages = [...prev.images];
      const [selected] = newImages.splice(index, 1);
      newImages.unshift(selected);
      return { ...prev, images: newImages };
    });
  };

  // Location GPS Detection (Requirement 3)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleInputChange('latitude', pos.coords.latitude);
        handleInputChange('longitude', pos.coords.longitude);
        alert('Coordinates updated to your current location!');
      },
      (err) => {
        alert('Could not fetch GPS coordinates. Please ensure location permissions are granted.');
      },
      { timeout: 7000 }
    );
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.title.trim()) {
      const autoTitle = `${formData.bhk} ${formData.propertyType} for ${
        formData.purpose === 'RENT' ? 'Rent' : 'Sale'
      } in ${formData.locality}`;
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
    '2. Photos & Media',
    '3. Location & Map Pin',
    '4. Price & Specs',
    '5. Amenities',
    '6. Review & Submit',
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add Property Listing</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
          Complete the 6 simple steps to post your listing on Bhumie
        </p>
      </div>

      {/* 6-Step Visual Indicator */}
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
              <p className="text-xs text-gray-500">Let's start with basic configuration</p>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Property Type
              </label>
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
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Property Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. 2 BHK Luxury Flat for Rent in Sector 62"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* BHK Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                BHK Configuration
              </label>
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
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Carpet Area (sq.ft)
              </label>
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
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Furnishing
              </label>
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

        {/* ================= STEP 2: PHOTOS & MEDIA (Requirement 13) ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Add Photos & Media</h2>
              <p className="text-xs text-gray-500">
                Uploaded images are automatically compressed, optimized and served via high-speed CDN.
                You can reorder, set primary cover, or remove images before publishing.
              </p>
            </div>

            {/* Cloudinary File Upload Dropzone */}
            <div className="relative border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 hover:bg-blue-50/70 rounded-3xl p-6 transition-all text-center group">
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={uploadingImages}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {uploadingImages ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">
                  {uploadingImages
                    ? 'Uploading & Optimizing with Cloudinary...'
                    : 'Upload Photos from Device'}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  Drag and drop or click to browse (Auto WebP / AVIF compression)
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Cloudinary CDN Optimized (Auto WebP / AVIF)</span>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {uploadError}
              </div>
            )}

            {/* Image Preview & Reorder Grid (Requirement 13) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase">
                  Uploaded Photos ({formData.images.length})
                </label>
                <span className="text-[11px] text-gray-400">
                  First photo is the Main Cover Listing Photo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl overflow-hidden bg-gray-100 group border border-gray-200 shadow-xs flex flex-col"
                  >
                    <div className="relative aspect-video">
                      <img
                        src={img}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-white" />
                          Cover Photo
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Image Action Toolbar: Reorder & Set as Cover */}
                    <div className="p-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'left')}
                          className="p-1 rounded-lg hover:bg-gray-200 text-gray-600 disabled:opacity-30 cursor-pointer"
                          title="Move left"
                        >
                          <MoveLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === formData.images.length - 1}
                          onClick={() => moveImage(idx, 'right')}
                          className="p-1 rounded-lg hover:bg-gray-200 text-gray-600 disabled:opacity-30 cursor-pointer"
                          title="Move right"
                        >
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsCover(idx)}
                          className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Set as Cover
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternative: Add Image URL manually */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Or Paste Image Web URL
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
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add URL
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Video Link (Optional)
              </label>
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

        {/* ================= STEP 3: LOCATION & MAP PIN (Requirements 3 & 4) ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Property Location & Map Pin</h2>
              <p className="text-xs text-gray-500">
                Provide the address and pinpoint the exact coordinates on the interactive map.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Full Address
              </label>
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
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Locality / Sector
                </label>
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

            {/* GPS Coordinates & Interactive Map Pin Picker */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-gray-900 block text-sm">
                    Exact Map Pin Coordinates
                  </span>
                  <span className="text-gray-500 font-mono">
                    Lat: {formData.latitude.toFixed(5)}, Lng: {formData.longitude.toFixed(5)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Use My Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMapPickerOpen(true)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Pin on Map</span>
                </button>
              </div>
            </div>

            {/* Map Pin Picker Modal */}
            {mapPickerOpen && (
              <MapPinPickerModal
                initialLat={formData.latitude}
                initialLng={formData.longitude}
                onSelect={(lat, lng) => {
                  handleInputChange('latitude', lat);
                  handleInputChange('longitude', lng);
                }}
                onClose={() => setMapPickerOpen(false)}
              />
            )}
          </div>
        )}

        {/* ================= STEP 4: PRICE & SPECS (Requirements 7, 8, 9, 11) ================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">
                Price & Architectural Specifications
              </h2>
              <p className="text-xs text-gray-500">
                Enter pricing, floor details, balconies, elevator, and road width
              </p>
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
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => handleInputChange('securityDeposit', e.target.value)}
                  placeholder="36000"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Maintenance (Monthly) (Optional)
                </label>
                <input
                  type="number"
                  value={formData.maintenance}
                  onChange={(e) => handleInputChange('maintenance', e.target.value)}
                  placeholder="1500"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Other Charges (Optional)
                </label>
                <input
                  type="text"
                  value={formData.otherCharges}
                  onChange={(e) => handleInputChange('otherCharges', e.target.value)}
                  placeholder="Electricity, Water etc."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Floor Details & Total Building Floors (Requirement 7) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Property Floor Level
                </label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  placeholder="e.g. Ground, 2nd Floor, 5th Floor"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Total Floors in Building
                </label>
                <input
                  type="number"
                  value={formData.totalFloors}
                  onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                  placeholder="e.g. 4, 14, 25"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Balcony Count (Requirement 8) & Road Width (Requirement 11) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Balconies Count
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {['0', '1', '2', '3', '4+'].map((bCount) => (
                    <button
                      key={bCount}
                      type="button"
                      onClick={() => handleInputChange('balconies', bCount.replace('+', ''))}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.balconies === bCount.replace('+', '')
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {bCount}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                  Road Width (Facing Road)
                </label>
                <input
                  type="text"
                  value={formData.roadWidth}
                  onChange={(e) => handleInputChange('roadWidth', e.target.value)}
                  placeholder="e.g. 30 ft, 40 ft, 12 metres"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Lift Availability (Requirement 9) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
                Lift / Elevator Availability in Building
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <button
                  type="button"
                  onClick={() => handleInputChange('hasLift', true)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    formData.hasLift
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  ✓ Lift Available
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('hasLift', false)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    !formData.hasLift
                      ? 'bg-gray-700 text-white border-gray-700 shadow-xs'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  No Lift
                </button>
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
                      className={`w-4 h-4 shrink-0 ${selected ? 'text-white' : 'text-gray-400'}`}
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
                placeholder="Highlight any additional details, neighborhood advantages, metro proximity, road width, power backup..."
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
              <p className="text-xs text-gray-500">
                Please review your property details before submitting
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-gray-50 rounded-3xl p-5 sm:p-6 border border-gray-200 flex flex-col sm:flex-row gap-5">
              <img
                src={
                  formData.images[0] ||
                  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=80'
                }
                alt="Preview"
                className="w-full sm:w-44 h-36 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                    {formData.purpose}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 text-[10px] font-bold uppercase">
                    {formData.propertyType}
                  </span>
                  {formData.hasLift && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      Lift Available
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-gray-900">{formData.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {formData.locality}, {formData.city} (Lat: {formData.latitude.toFixed(4)}, Lng:{' '}
                  {formData.longitude.toFixed(4)})
                </p>
                <div className="text-lg font-black text-blue-600">
                  ₹{Number(formData.monthlyRent).toLocaleString('en-IN')}{' '}
                  {formData.purpose === 'RENT' ? '/month' : ''}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-600 pt-1">
                  <span>Floor: {formData.floor} {formData.totalFloors ? `(${formData.totalFloors} total)` : ''}</span>
                  <span>Balconies: {formData.balconies}</span>
                  <span>Road: {formData.roadWidth}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Listing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Property Listing</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
