'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Camera,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  FileText,
  Lock,
  Building,
  Heart,
  Save,
  AlertCircle,
  UploadCloud,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { compressAndResizeImage } from '@/lib/imageCompression';

export default function ProfilePage() {
  const { user, loading: authLoading, openAuthModal, refreshUser } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'USER' | 'OWNER'>('USER');
  const [avatar, setAvatar] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Seller verification states
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setProfile(data.user);
          setName(data.user.name || '');
          setPhone(data.user.phone || '');
          setRole(data.user.role === 'OWNER' ? 'OWNER' : 'USER');
          setAvatar(data.user.avatar || '');
        }
      } else if (res.status === 401) {
        // Not logged in
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  // Handle avatar upload via Cloudinary (/api/upload)
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setMsg(null);

      // Compress avatar image on device (max 800x800)
      const compressedFile = await compressAndResizeImage(file, 800, 800, 0.85);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', 'bhumie_profiles');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const rawText = await uploadRes.text();
      let uploadData: any;
      try {
        uploadData = JSON.parse(rawText);
      } catch {
        throw new Error(`Server error (${uploadRes.status}). Please try again.`);
      }

      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Avatar upload failed');
      }

      setAvatar(uploadData.url);

      // Auto-save avatar to profile
      const saveRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: uploadData.url }),
      });

      if (saveRes.ok) {
        await refreshUser();
        setMsg({ type: 'success', text: 'Profile photo updated successfully!' });
      }
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message || 'Failed to upload image' });
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // Save basic profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          role,
          avatar,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({ type: 'success', text: 'Profile details saved successfully!' });
        await refreshUser();
        fetchProfile();
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message || 'Error updating profile' });
    } finally {
      setSaving(false);
    }
  };

  // Submit Seller Verification
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAgreed) {
      setMsg({ type: 'error', text: 'Please agree to the verification consent declaration.' });
      return;
    }

    const cleanPan = panNumber.trim().toUpperCase();
    const cleanAadhaar = aadhaarNumber.replace(/\s+/g, '').trim();

    if (cleanPan.length !== 10) {
      setMsg({ type: 'error', text: 'PAN number must be exactly 10 alphanumeric characters.' });
      return;
    }

    if (cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
      setMsg({ type: 'error', text: 'Aadhaar number must be exactly 12 digits.' });
      return;
    }

    try {
      setSubmittingVerification(true);
      setMsg(null);

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panNumber: cleanPan,
          aadhaarNumber: cleanAadhaar,
          submitForVerification: true,
          role: 'OWNER', // Automatically enable seller capabilities
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMsg({
          type: 'success',
          text: 'Verification documents submitted! Admin review will complete shortly.',
        });
        setPanNumber('');
        setAadhaarNumber('');
        await refreshUser();
        fetchProfile();
      } else {
        throw new Error(data.message || 'Failed to submit verification');
      }
    } catch (error: any) {
      setMsg({ type: 'error', text: error.message || 'Error submitting verification' });
    } finally {
      setSubmittingVerification(false);
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Login Required</h2>
        <p className="text-gray-500 max-w-sm mb-6 text-sm">
          Please log in to manage your Bhumie profile, edit contact info, and complete seller verification.
        </p>
        <button
          onClick={openAuthModal}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20"
        >
          Sign In with OTP
        </button>
      </div>
    );
  }

  const isVerified = profile?.sellerVerified || profile?.verificationStatus === 'VERIFIED';
  const isPending = profile?.verificationStatus === 'PENDING';
  const isRejected = profile?.verificationStatus === 'REJECTED';

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              My Profile & Verification
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your personal info, profile photo, and PAN/Aadhaar seller trust badge.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/my-properties"
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-xs"
            >
              <Building className="w-4 h-4 text-blue-600" />
              <span>My Properties ({profile?.propertiesCount || 0})</span>
            </Link>
          </div>
        </div>

        {/* Status Toast */}
        {msg && (
          <div
            className={`p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Profile Card Header with Cloudinary Photo */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Uploader */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-blue-50 flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt={name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl sm:text-4xl font-black text-blue-600">
                    {name ? name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform group-hover:scale-105 cursor-pointer"
                title="Change Photo"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Quick Summary & Upload Button */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                  {name || user.email.split('@')[0]}
                </h2>

                {/* Account Type Badge */}
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {role === 'OWNER' ? 'Property Seller' : 'Buyer'}
                </span>
              </div>

              {/* Direct Profile Photo Action Button */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Optimizing & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>{avatar ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                    </>
                  )}
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={async () => {
                      setAvatar('');
                      await fetch('/api/user/profile', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ avatar: null }),
                      });
                      await refreshUser();
                      fetchProfile();
                    }}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Verification Badge */}
              <div className="mt-3">
                {isVerified ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Seller
                  </span>
                ) : isPending ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Verification Pending
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
                    Unverified
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">{user.email}</p>

              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-6 mt-4 pt-4 border-t border-gray-100 text-xs">
                <div>
                  <span className="font-black text-gray-900 text-base">
                    {profile?.propertiesCount || 0}
                  </span>
                  <p className="text-gray-400 font-semibold">Properties</p>
                </div>
                <div>
                  <span className="font-black text-gray-900 text-base">
                    {profile?.favoritesCount || 0}
                  </span>
                  <p className="text-gray-400 font-semibold">Saved</p>
                </div>
                <div>
                  <span className="font-black text-gray-900 text-base">
                    {profile?.inquiriesCount || 0}
                  </span>
                  <p className="text-gray-400 font-semibold">Inquiries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form 1: Basic Profile Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gray-100">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-black text-gray-900">Basic Profile Details</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Email is linked to your login and verified by OTP.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Primary Role on Bhumie
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      role === 'USER'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Buyer / Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('OWNER')}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      role === 'OWNER'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Seller / Owner
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Profile Details</span>
              </button>
            </div>
          </form>
        </div>

        {/* Form 2: Seller Verification (PAN & Aadhaar) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Seller Identity Verification (PAN & Aadhaar)
                </h3>
                <p className="text-xs text-gray-500">
                  Get the Bhumie Verified Seller Badge to build credibility and attract genuine buyers.
                </p>
              </div>
            </div>

            {isVerified && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>

          {/* Privacy Security Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 mb-6">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>Bank-grade Privacy:</strong> In compliance with Indian data privacy regulations,
              your PAN and Aadhaar details are masked and strictly protected. They are never shown publicly
              to buyers or third parties.
            </div>
          </div>

          {isVerified ? (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-800 font-black text-base">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Your Seller Identity is Fully Verified!
                </div>
                <p className="text-xs text-emerald-700">
                  All your active and future property listings will proudly display the official Bhumie
                  Verified Seller badge.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-emerald-900">
                  <div>
                    Aadhaar Status:{' '}
                    <span className="font-mono font-bold">{profile?.aadhaarMasked || 'XXXX-XXXX-****'}</span>
                  </div>
                  <div>
                    PAN Status:{' '}
                    <span className="font-mono font-bold">{profile?.panMasked || 'ABCDE****F'}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/post-property"
                className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:bg-emerald-700 shrink-0"
              >
                <span>Post Verified Listing</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : isPending ? (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-black text-base">
                <Clock className="w-5 h-5 text-amber-600" />
                Verification In Progress
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your submitted documents are currently under review by the Bhumie Verification Team. You will
                receive notification once approved.
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-amber-900">
                <div>
                  Aadhaar Registered:{' '}
                  <span className="font-mono font-bold">{profile?.aadhaarMasked || 'XXXX-XXXX-****'}</span>
                </div>
                <div>
                  PAN Registered:{' '}
                  <span className="font-mono font-bold">{profile?.panMasked || 'ABCDE****F'}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitVerification} className="space-y-6">
              {isRejected && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>
                    Your previous submission was not approved. Please check your credentials and resubmit.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    PAN Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm uppercase font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    required
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    10-digit Permanent Account Number (5 letters, 4 digits, 1 letter).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123456789012"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    required
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    12-digit Unique Identification Number.
                  </span>
                </div>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  I hereby declare that the PAN and Aadhaar details provided are true and belong to me. I
                  consent to Bhumie securely verifying my credentials for platform safety and assigning me a
                  Verified Seller status.
                </span>
              </label>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submittingVerification || !consentAgreed}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingVerification ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  <span>Submit for Seller Verification</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

