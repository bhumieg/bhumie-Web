'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle2,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Layers,
  Sofa,
  Phone,
  MessageCircle,
  Shield,
  Wifi,
  Car,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { user, openAuthModal } = useAuth();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleStartChat = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    if (property?.ownerId === user.id) {
      alert('This is your own property listing! Opening your Messages inbox...');
      router.push('/chat');
      return;
    }

    try {
      setStartingChat(true);
      const res = await fetch('/api/chat/get-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id }),
      });
      const data = await res.json();
      if (data.success && data.conversationId) {
        router.push(`/chat?id=${data.conversationId}`);
      } else {
        alert(data.message || 'Unable to open chat');
      }
    } catch {
      alert('Network error connecting to chat');
    } finally {
      setStartingChat(false);
    }
  };

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/properties/${id}`);
      const data = await res.json();
      if (data.success && data.property) {
        setProperty(data.property);
        if (user) {
          setInquiryName(user.name || '');
          setInquiryEmail(user.email || '');
          setInquiryPhone(user.phone || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const res = await fetch(`/api/properties/${id}/favorite`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.isFavorite);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property on Bhumie: ${property.title} for ${property.priceDisplay}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInquiry(true);
    try {
      const res = await fetch(`/api/properties/${id}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName,
          phone: inquiryPhone,
          email: inquiryEmail,
          message: inquiryMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInquirySuccess(true);
      } else {
        alert(data.message || 'Failed to submit inquiry');
      }
    } catch (err) {
      alert('Network error submitting inquiry');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen py-20 text-center max-w-md mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Property Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">This property might have been removed or rented out.</p>
        <Link href="/properties" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Explore Other Properties
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="min-h-screen pb-28 pt-4 sm:pt-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Bar with Back, Share, Favorite */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3 py-2 rounded-xl border border-gray-200 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 cursor-pointer shadow-xs"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFavorite}
            className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:text-red-500 cursor-pointer shadow-xs"
            title="Save"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Image Gallery / Carousel (Matching Screenshot 3) */}
      <div className="relative rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] bg-gray-900 shadow-md mb-8">
        <img
          src={images[activeImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {/* Counter Badge (e.g. 1/12) */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold">
          {activeImageIndex + 1}/{images.length}
        </div>

        {/* Arrows if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800 backdrop-blur-sm cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800 backdrop-blur-sm cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Title & Verified Badge */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider">
                {property.purpose === 'RENT' ? 'For Rent' : 'For Sale'}
              </span>
              {property.verified && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {property.title}
            </h1>

            <p className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mt-1.5">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{property.locality}, {property.city}, {property.state || 'Delhi-NCR'}</span>
            </p>
          </div>

          {/* Pricing Box */}
          <div className="md:text-right">
            <div className="text-3xl font-black text-blue-600 tracking-tight">
              {property.priceDisplay}
            </div>
            {property.securityDeposit && (
              <p className="text-xs text-gray-500 font-semibold mt-0.5">
                Security Deposit ₹{property.securityDeposit.toLocaleString('en-IN')}
              </p>
            )}
            {property.maintenance && (
              <p className="text-xs text-gray-400">
                Maintenance: ₹{property.maintenance.toLocaleString('en-IN')}/mo
              </p>
            )}
          </div>
        </div>

        {/* 5 Quick Specs Pills (Bedrooms, Bathrooms, Sqft, Floor, Furnishing) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-3.5 text-center border border-gray-100">
            <Bed className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-400 font-medium">Bedrooms</div>
            <div className="text-sm font-black text-gray-900">{property.bedrooms} Beds</div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5 text-center border border-gray-100">
            <Bath className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-400 font-medium">Bathrooms</div>
            <div className="text-sm font-black text-gray-900">{property.bathrooms} Baths</div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5 text-center border border-gray-100">
            <Maximize2 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-400 font-medium">Carpet Area</div>
            <div className="text-sm font-black text-gray-900">{property.carpetArea || '1050'} Sq.ft</div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5 text-center border border-gray-100">
            <Layers className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-400 font-medium">Floor</div>
            <div className="text-sm font-black text-gray-900">{property.floor || '2nd Floor'}</div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3.5 text-center border border-gray-100 col-span-2 sm:col-span-1">
            <Sofa className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-xs text-gray-400 font-medium">Furnishing</div>
            <div className="text-sm font-black text-gray-900">{property.furnishing}</div>
          </div>
        </div>
      </div>

      {/* Property Details Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-6">
        <h3 className="text-lg font-black text-gray-900 mb-4">Property Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block font-medium">Property Type</span>
            <span className="text-sm font-bold text-gray-900">{property.propertyType}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Available From</span>
            <span className="text-sm font-bold text-gray-900">{property.availableFrom || 'Immediate'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Age of Property</span>
            <span className="text-sm font-bold text-gray-900">{property.ageOfProperty || '2-5 Years'}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">BHK Type</span>
            <span className="text-sm font-bold text-gray-900">{property.bhk}</span>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <h4 className="text-sm font-black text-gray-900 mb-2">Description</h4>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
        </div>
      </div>

      {/* Amenities Section */}
      {property.amenities && property.amenities.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-6">
          <h3 className="text-lg font-black text-gray-900 mb-4">Amenities Available</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {property.amenities.map((amenity: string) => (
              <div
                key={amenity}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs font-bold text-gray-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owner Contact Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {property.ownerName ? property.ownerName[0] : 'O'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-gray-900 text-base">{property.ownerName || 'Verified Owner'}</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Verified Owner</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Direct Owner Listing • No Middleman Commission</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleStartChat}
            disabled={startingChat}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {startingChat ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            <span>Chat with Owner (2-Way)</span>
          </button>
          <a
            href={`tel:${property.ownerPhone || '+919876543210'}`}
            className="flex-1 sm:flex-none px-5 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Call Owner</span>
          </a>
        </div>
      </div>

      {/* Floating Bottom Action Bar (Matching Screenshot 3 Bottom [Chat] [Call Owner]) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 sm:hidden">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button
            onClick={handleStartChat}
            disabled={startingChat}
            className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer disabled:opacity-50"
          >
            {startingChat ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            <span>Chat with Owner</span>
          </button>
          <a
            href={`tel:${property.ownerPhone || '+919876543210'}`}
            className="flex-1 py-3.5 rounded-2xl border-2 border-blue-600 text-blue-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Call Owner</span>
          </a>
        </div>
      </div>

      {/* Inquiry / Chat Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Contact Owner</h3>
                <p className="text-xs text-gray-500 truncate">{property.title}</p>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {inquirySuccess ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-gray-500 mb-6">
                  The property owner has received your request and will contact you directly on {inquiryPhone}.
                </p>
                <button
                  onClick={() => {
                    setInquirySuccess(false);
                    setContactModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Hi, I am interested in this property. When can I visit?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingInquiry}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingInquiry ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

