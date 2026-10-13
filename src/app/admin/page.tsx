'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  ShieldAlert,
  Building,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
  Edit,
  Eye,
  Key,
  Search,
  Loader2,
  TrendingUp,
  ArrowLeft,
  ExternalLink,
  PlusCircle,
  LogOut,
  Upload,
  X,
  Plus,
  ShieldCheck,
  Clock,
  UserCheck,
  UserX,
  Lock,
} from 'lucide-react';

export default function AdminPortalPage() {
  const { user, adminLogin, logout } = useAuth();

  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'STATS' | 'PROPERTIES' | 'USERS' | 'INQUIRIES'>('PROPERTIES');
  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // User management filters
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'USER' | 'OWNER' | 'ADMIN'>('ALL');
  const [userVerificationFilter, setUserVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'UNVERIFIED'>('ALL');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Property CRUD Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [savingProperty, setSavingProperty] = useState(false);
  const [uploadingModalImages, setUploadingModalImages] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const initialPropertyForm = {
    id: '',
    title: '',
    description: '',
    propertyType: 'Flat',
    purpose: 'RENT',
    bhk: '2 BHK',
    carpetArea: '1050',
    furnishing: 'Semi Furnished',
    monthlyRent: '18000',
    securityDeposit: '36000',
    maintenance: '1500',
    priceValue: '18000',
    bedrooms: '2',
    bathrooms: '2',
    floor: '2nd Floor',
    totalFloors: '14',
    balconies: '2',
    hasLift: true,
    roadWidth: '40 ft',
    address: 'Sector 62, Noida, Uttar Pradesh',
    locality: 'Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    images: [] as string[],
    amenities: ['WiFi', 'Parking', 'Lift', 'Power Backup', 'Security'],
    verified: true,
    featured: false,
    status: 'ACTIVE',
    ownerName: 'Admin / Bhumie Team',
    ownerEmail: 'admin@bhumie.com',
    ownerPhone: '+91 98765 43210',
  };

  const [propertyForm, setPropertyForm] = useState(initialPropertyForm);

  const isAdmin = user && user.role === 'ADMIN';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin, activeTab]);

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      if (activeTab === 'STATS' || !stats) {
        const statsRes = await fetch('/api/admin/stats');
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);
      }

      if (activeTab === 'PROPERTIES') {
        const propRes = await fetch(
          `/api/admin/properties?status=${statusFilter}&search=${encodeURIComponent(searchFilter)}`
        );
        const propData = await propRes.json();
        if (propData.success) setProperties(propData.properties || []);
      }

      if (activeTab === 'USERS') {
        const userRes = await fetch('/api/admin/users');
        const userData = await userRes.json();
        if (userData.success) setUsersList(userData.users || []);
      }

      if (activeTab === 'INQUIRIES') {
        const inqRes = await fetch('/api/admin/inquiries');
        const inqData = await inqRes.json();
        if (inqData.success) setInquiriesList(inqData.inquiries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await adminLogin(adminSecretKey, adminEmail);
      if (!res.success) {
        setLoginError(res.message || 'Invalid admin credentials');
      }
    } catch {
      setLoginError('Server error during admin login');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleToggleVerify = async (propId: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/properties/${propId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) =>
          prev.map((p) => (p.id === propId ? { ...p, verified: !currentVal } : p))
        );
      }
    } catch (err) {
      alert('Failed to update verified status');
    }
  };

  const handleToggleFeatured = async (propId: string, currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/properties/${propId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentVal }),
      });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) =>
          prev.map((p) => (p.id === propId ? { ...p, featured: !currentVal } : p))
        );
      }
    } catch (err) {
      alert('Failed to update featured status');
    }
  };

  const handleStatusChange = async (propId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/properties/${propId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) =>
          prev.map((p) => (p.id === propId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteProperty = async (propId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/properties/${propId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) => prev.filter((p) => p.id !== propId));
      } else {
        alert(data.message || 'Failed to delete property');
      }
    } catch {
      alert('Server error deleting property');
    }
  };

  // Seller Verification Handlers (Requirement 5 & 12)
  const handleVerifySeller = async (userId: string, verificationStatus: 'VERIFIED' | 'REJECTED') => {
    try {
      setUpdatingUserId(userId);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          verificationStatus,
          sellerVerified: verificationStatus === 'VERIFIED',
          role: verificationStatus === 'VERIFIED' ? 'OWNER' : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  verificationStatus,
                  sellerVerified: verificationStatus === 'VERIFIED',
                  ...(verificationStatus === 'VERIFIED' ? { role: 'OWNER' } : {}),
                }
              : u
          )
        );
      } else {
        alert(data.message || 'Failed to update seller verification status');
      }
    } catch (err) {
      alert('Error updating verification status');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'OWNER' | 'ADMIN') => {
    try {
      setUpdatingUserId(userId);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.message || 'Failed to update user role');
      }
    } catch {
      alert('Error changing user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const openCreateModal = () => {
    setPropertyForm(initialPropertyForm);
    setModalMode('CREATE');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prop: any) => {
    setPropertyForm({
      id: prop.id,
      title: prop.title || '',
      description: prop.description || '',
      propertyType: prop.propertyType || 'Flat',
      purpose: prop.purpose || 'RENT',
      bhk: prop.bhk || '2 BHK',
      carpetArea: prop.carpetArea ? String(prop.carpetArea) : '',
      furnishing: prop.furnishing || 'Semi Furnished',
      monthlyRent: prop.monthlyRent ? String(prop.monthlyRent) : String(prop.priceValue || 0),
      securityDeposit: prop.securityDeposit ? String(prop.securityDeposit) : '',
      maintenance: prop.maintenance ? String(prop.maintenance) : '',
      priceValue: prop.priceValue ? String(prop.priceValue) : '',
      bedrooms: prop.bedrooms ? String(prop.bedrooms) : '1',
      bathrooms: prop.bathrooms ? String(prop.bathrooms) : '1',
      floor: prop.floor || '',
      totalFloors: prop.totalFloors ? String(prop.totalFloors) : '',
      balconies: prop.balconies !== undefined && prop.balconies !== null ? String(prop.balconies) : '1',
      hasLift: Boolean(prop.hasLift),
      roadWidth: prop.roadWidth || '',
      address: prop.address || '',
      locality: prop.locality || '',
      city: prop.city || '',
      state: prop.state || 'Uttar Pradesh',
      images: Array.isArray(prop.images) ? [...prop.images] : [],
      amenities: Array.isArray(prop.amenities) ? [...prop.amenities] : [],
      verified: Boolean(prop.verified),
      featured: Boolean(prop.featured),
      status: prop.status || 'ACTIVE',
      ownerName: prop.ownerName || '',
      ownerEmail: prop.ownerEmail || '',
      ownerPhone: prop.ownerPhone || '',
    });
    setModalMode('EDIT');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingModalImages(true);
    setModalError(null);

    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append('files', files[i]);
      }
      fd.append('folder', 'bhumie_properties');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const result = await res.json();
      if (result.success && result.urls) {
        setPropertyForm((prev) => ({
          ...prev,
          images: [...prev.images, ...result.urls],
        }));
      } else {
        setModalError(result.message || 'Image upload failed');
      }
    } catch (err: any) {
      setModalError(err.message || 'Error uploading images');
    } finally {
      setUploadingModalImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveModalImage = (index: number) => {
    setPropertyForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyForm.title.trim()) {
      setModalError('Property title is required');
      return;
    }

    setSavingProperty(true);
    setModalError(null);

    try {
      if (modalMode === 'CREATE') {
        const res = await fetch('/api/admin/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(propertyForm),
        });
        const data = await res.json();
        if (data.success && data.property) {
          setProperties((prev) => [data.property, ...prev]);
          setIsModalOpen(false);
        } else {
          setModalError(data.message || 'Failed to create property');
        }
      } else {
        // EDIT MODE
        const res = await fetch(`/api/admin/properties/${propertyForm.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(propertyForm),
        });
        const data = await res.json();
        if (data.success && data.property) {
          setProperties((prev) =>
            prev.map((p) => (p.id === propertyForm.id ? { ...p, ...data.property } : p))
          );
          setIsModalOpen(false);
        } else {
          setModalError(data.message || 'Failed to update property');
        }
      }
    } catch (err: any) {
      setModalError(err.message || 'Server error saving property');
    } finally {
      setSavingProperty(false);
    }
  };

  // If Not Admin, render Secure Admin Portal Login
  if (!isAdmin) {
    return (
      <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center bg-[#F7F8FC]">
        <div className="w-full max-w-md mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Live Website</span>
          </Link>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Admin Gate</span>
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold">
            <Shield className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 text-center tracking-tight">Admin Portal</h2>
          <p className="text-xs text-gray-500 text-center mb-6">
            Authorized admin credentials required to access system controls
          </p>

          {loginError && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Admin Master Secret Key
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  placeholder="Enter Master Secret"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Admin Email (Optional)
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@bhumie.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Key...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Enter Admin Portal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered users for User Management tab
  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    if (userVerificationFilter === 'VERIFIED' && !u.sellerVerified && u.verificationStatus !== 'VERIFIED')
      return false;
    if (userVerificationFilter === 'PENDING' && u.verificationStatus !== 'PENDING') return false;
    if (userVerificationFilter === 'UNVERIFIED' && (u.sellerVerified || u.verificationStatus === 'VERIFIED'))
      return false;
    return true;
  });

  const pendingVerificationCount = usersList.filter((u) => u.verificationStatus === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-xl">
            B.
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black uppercase">
                Root Access
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Manage Delhi-NCR properties, buyer & seller visibility, and verification workflows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            <span>Live Site</span>
          </Link>
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 border border-red-200/60 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-6 overflow-x-auto">
        {[
          { id: 'PROPERTIES', label: 'Properties & CRUD', icon: Building },
          {
            id: 'USERS',
            label: `Users (Buyers & Sellers)${
              pendingVerificationCount > 0 ? ` (${pendingVerificationCount} Pending)` : ''
            }`,
            icon: Users,
          },
          { id: 'INQUIRIES', label: 'Inquiries & Leads', icon: MessageSquare },
          { id: 'STATS', label: 'Platform Stats', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: PROPERTIES ================= */}
      {activeTab === 'PROPERTIES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadAdminData()}
                placeholder="Search title, locality or owner..."
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setTimeout(loadAdminData, 50);
                }}
                className="bg-white border border-gray-200 text-gray-700 text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="RENTED">Rented</option>
                <option value="SOLD">Sold</option>
              </select>

              <button
                onClick={openCreateModal}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Property</span>
              </button>

              <button
                onClick={loadAdminData}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>

          {loadingData ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Property</th>
                      <th className="py-3.5 px-4">Pricing</th>
                      <th className="py-3.5 px-4">Specs & Road</th>
                      <th className="py-3.5 px-4">Owner</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Verified</th>
                      <th className="py-3.5 px-4 text-center">Featured</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                prop.images[0] ||
                                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=100&q=80'
                              }
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <Link
                                href={`/properties/${prop.id}`}
                                className="font-bold text-gray-900 hover:text-blue-600 line-clamp-1"
                              >
                                {prop.title}
                              </Link>
                              <span className="text-[11px] text-gray-400">
                                {prop.bhk} • {prop.locality}, {prop.city}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-blue-600 whitespace-nowrap">
                          {prop.priceDisplay}
                        </td>

                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                          <div>
                            Floor: <strong>{prop.floor || '—'}</strong>
                            {prop.totalFloors ? ` of ${prop.totalFloors}` : ''}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            Balconies: {prop.balconies ?? '—'} • Lift: {prop.hasLift ? 'Yes' : 'No'}
                          </div>
                          {prop.roadWidth && (
                            <div className="text-[10px] text-gray-500 font-mono">
                              Road: {prop.roadWidth}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                          <div className="font-bold text-gray-800">{prop.ownerName || 'Owner'}</div>
                          <div className="text-[11px] text-gray-400">{prop.ownerEmail || '—'}</div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <select
                            value={prop.status}
                            onChange={(e) => handleStatusChange(prop.id, e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-800 text-[11px] font-bold py-1 px-2 rounded-lg cursor-pointer"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="PENDING">PENDING</option>
                            <option value="RENTED">RENTED</option>
                            <option value="SOLD">SOLD</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleVerify(prop.id, prop.verified)}
                            className={`p-1.5 rounded-lg font-bold text-[11px] cursor-pointer ${
                              prop.verified
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {prop.verified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleFeatured(prop.id, prop.featured)}
                            className={`p-1.5 rounded-lg font-bold text-[11px] cursor-pointer ${
                              prop.featured
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {prop.featured ? 'Featured' : 'Standard'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/properties/${prop.id}`}
                              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditModal(prop)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                              title="Edit Property"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(prop.id, prop.title)}
                              className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: REGISTERED USERS (BUYERS & SELLERS) (Requirements 5 & 12) ================= */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Privacy Access Banner */}
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>Admin Privacy Controls:</strong> Personal PAN and Aadhaar identity numbers are
              automatically masked (<code className="font-mono">XXXX-XXXX-1234</code>,{' '}
              <code className="font-mono">ABCDE****F</code>) in adherence to Indian data privacy
              mandates. Review and verify seller requests to assign the trusted badge.
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Account Type:</span>
              {(['ALL', 'USER', 'OWNER', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userRoleFilter === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {r === 'ALL'
                    ? 'All Users'
                    : r === 'USER'
                    ? 'Buyers only'
                    : r === 'OWNER'
                    ? 'Sellers only'
                    : 'Admins'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Verification:</span>
              {(['ALL', 'PENDING', 'VERIFIED', 'UNVERIFIED'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setUserVerificationFilter(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    userVerificationFilter === v
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {v === 'PENDING' ? `Pending (${pendingVerificationCount})` : v}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">User Profile</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">Account Type</th>
                    <th className="py-3.5 px-4">Seller Identity Status</th>
                    <th className="py-3.5 px-4">Listings</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredUsers.map((u) => {
                    const isSeller = u.role === 'OWNER';
                    const isBuyer = u.role === 'USER';
                    const isVerifiedSeller = u.sellerVerified || u.verificationStatus === 'VERIFIED';
                    const isPending = u.verificationStatus === 'PENDING';

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name || 'User'}
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                                {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900">{u.name || 'Bhumie Member'}</div>
                              <div className="text-[11px] text-gray-400 font-mono">ID: {u.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-gray-800 font-medium">{u.email}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{u.phone || 'No phone'}</div>
                        </td>

                        {/* Account Type with switch option */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <select
                            value={u.role}
                            disabled={updatingUserId === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              isSeller
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isBuyer
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}
                          >
                            <option value="USER">Buyer (USER)</option>
                            <option value="OWNER">Seller (OWNER)</option>
                            <option value="ADMIN">Admin (ADMIN)</option>
                          </select>
                        </td>

                        {/* Identity & Verification Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isVerifiedSeller ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                Verified Seller
                              </span>
                              {(u.panMasked || u.aadhaarMasked) && (
                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  {u.panMasked && `PAN: ${u.panMasked}`}
                                  {u.aadhaarMasked && ` • UID: ${u.aadhaarMasked}`}
                                </div>
                              )}
                            </div>
                          ) : isPending ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Pending Review
                              </span>
                              {(u.panMasked || u.aadhaarMasked) && (
                                <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                                  {u.panMasked && `PAN: ${u.panMasked}`}
                                  {u.aadhaarMasked && ` • ${u.aadhaarMasked}`}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-500">
                              Unverified
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-bold text-gray-800 whitespace-nowrap">
                          {u._count?.properties || 0} Listed
                        </td>

                        <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        {/* Verification Action Buttons */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                disabled={updatingUserId === u.id}
                                onClick={() => handleVerifySeller(u.id, 'VERIFIED')}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                disabled={updatingUserId === u.id}
                                onClick={() => handleVerifySeller(u.id, 'REJECTED')}
                                className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : isVerifiedSeller ? (
                            <button
                              type="button"
                              disabled={updatingUserId === u.id}
                              onClick={() => handleVerifySeller(u.id, 'REJECTED')}
                              className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                            >
                              Revoke Badge
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={updatingUserId === u.id}
                              onClick={() => handleVerifySeller(u.id, 'VERIFIED')}
                              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              Verify Seller
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TENANT LEADS & INQUIRIES ================= */}
      {activeTab === 'INQUIRIES' && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Target Property</th>
                  <th className="py-3.5 px-4">Lead Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Message / Request</th>
                  <th className="py-3.5 px-4">Owner Contact</th>
                  <th className="py-3.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {inquiriesList.map((inq) => (
                  <tr key={inq.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-bold text-gray-900 max-w-xs truncate">
                      {inq.property?.title}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-600">{inq.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-800">{inq.phone}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{inq.message || '—'}</td>
                    <td className="py-3 px-4 text-gray-500">{inq.property?.ownerEmail || '—'}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: STATS ================= */}
      {activeTab === 'STATS' && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs">
            <Building className="w-8 h-8 text-blue-600 mb-2" />
            <div className="text-2xl font-black text-gray-900">{stats.totalProperties}</div>
            <div className="text-xs text-gray-500">Total Properties</div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
            <div className="text-2xl font-black text-gray-900">{stats.activeProperties}</div>
            <div className="text-xs text-gray-500">Active Listings</div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <div className="text-2xl font-black text-gray-900">{stats.totalUsers}</div>
            <div className="text-xs text-gray-500">Total Users & Owners</div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs">
            <MessageSquare className="w-8 h-8 text-indigo-600 mb-2" />
            <div className="text-2xl font-black text-gray-900">{stats.totalInquiries}</div>
            <div className="text-xs text-gray-500">Total Inquiries & Leads</div>
          </div>
        </div>
      )}

      {/* ================= CREATE / EDIT PROPERTY MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {modalMode === 'CREATE' ? 'Add New Property' : 'Edit Property Details'}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {modalMode === 'CREATE'
                      ? 'Upload images to Cloudinary and register in database'
                      : `Updating property ID: ${propertyForm.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProperty} className="p-6 overflow-y-auto space-y-6 flex-1">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                  {modalError}
                </div>
              )}

              {/* Title & Basic Specs */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Basic Information
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={propertyForm.title}
                    onChange={(e) => setPropertyForm({ ...propertyForm, title: e.target.value })}
                    placeholder="e.g. Luxury 3 BHK High-rise Apartment with Balcony"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Purpose
                    </label>
                    <select
                      value={propertyForm.purpose}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, purpose: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                    >
                      <option value="RENT">RENT</option>
                      <option value="SALE">SALE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Type</label>
                    <select
                      value={propertyForm.propertyType}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, propertyType: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                    >
                      <option value="Flat">Flat</option>
                      <option value="House">House</option>
                      <option value="Shop">Shop</option>
                      <option value="Office">Office</option>
                      <option value="Room">Room</option>
                      <option value="PG">PG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">BHK</label>
                    <select
                      value={propertyForm.bhk}
                      onChange={(e) => setPropertyForm({ ...propertyForm, bhk: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                    >
                      <option value="1 RK">1 RK</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4+ BHK">4+ BHK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Furnishing
                    </label>
                    <select
                      value={propertyForm.furnishing}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, furnishing: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                    >
                      <option value="Furnished">Furnished</option>
                      <option value="Semi Furnished">Semi Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      {propertyForm.purpose === 'RENT' ? 'Monthly Rent (₹)' : 'Price (₹)'} *
                    </label>
                    <input
                      type="number"
                      required
                      value={propertyForm.priceValue}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          priceValue: e.target.value,
                          monthlyRent: e.target.value,
                        })
                      }
                      placeholder="18000"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Carpet Area (sq.ft)
                    </label>
                    <input
                      type="number"
                      value={propertyForm.carpetArea}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, carpetArea: e.target.value })
                      }
                      placeholder="1050"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      value={propertyForm.bedrooms}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, bedrooms: e.target.value })
                      }
                      placeholder="2"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      value={propertyForm.bathrooms}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, bathrooms: e.target.value })
                      }
                      placeholder="2"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                    />
                  </div>
                </div>

                {/* Additional Specs: Floor, Total Floors, Balconies, Lift, Road Width */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Floor Level
                    </label>
                    <input
                      type="text"
                      value={propertyForm.floor}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, floor: e.target.value })
                      }
                      placeholder="e.g. 2nd Floor"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Total Floors
                    </label>
                    <input
                      type="number"
                      value={propertyForm.totalFloors}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, totalFloors: e.target.value })
                      }
                      placeholder="e.g. 14"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Balconies
                    </label>
                    <input
                      type="number"
                      value={propertyForm.balconies}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, balconies: e.target.value })
                      }
                      placeholder="e.g. 2"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Road Width
                    </label>
                    <input
                      type="text"
                      value={propertyForm.roadWidth}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, roadWidth: e.target.value })
                      }
                      placeholder="e.g. 40 ft"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={propertyForm.hasLift}
                        onChange={(e) =>
                          setPropertyForm({ ...propertyForm, hasLift: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Lift Available</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Location & Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Locality / Sector *
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyForm.locality}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, locality: e.target.value })
                      }
                      placeholder="Sector 62, Saket, Indirapuram"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyForm.city}
                      onChange={(e) => setPropertyForm({ ...propertyForm, city: e.target.value })}
                      placeholder="Noida, New Delhi, Gurgaon"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Full Address
                  </label>
                  <input
                    type="text"
                    value={propertyForm.address}
                    onChange={(e) =>
                      setPropertyForm({ ...propertyForm, address: e.target.value })
                    }
                    placeholder="Tower 4, Flat 402, XYZ Society, Sector 62"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Cloudinary Photos Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Property Photos (Cloudinary)
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Auto-Optimized (WebP / AVIF)
                  </span>
                </div>

                {/* Cloudinary Dropzone inside modal */}
                <div className="relative border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30 rounded-2xl p-4 text-center group transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={uploadingModalImages}
                    onChange={handleModalImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  />
                  <div className="flex flex-col items-center justify-center">
                    {uploadingModalImages ? (
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-1" />
                    ) : (
                      <Upload className="w-6 h-6 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs font-bold text-gray-800">
                      {uploadingModalImages
                        ? 'Uploading to Cloudinary...'
                        : 'Click to Upload Photos to Cloudinary'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      Instant CDN hosting & automatic compression
                    </span>
                  </div>
                </div>

                {/* Image thumbnails */}
                {propertyForm.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {propertyForm.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group border border-gray-200"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveModalImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status & Visibility Flags */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Admin Status & Toggles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                      Listing Status
                    </label>
                    <select
                      value={propertyForm.status}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, status: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="RENTED">RENTED</option>
                      <option value="SOLD">SOLD</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="modalVerified"
                      checked={propertyForm.verified}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, verified: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="modalVerified"
                      className="text-xs font-bold text-gray-800 cursor-pointer"
                    >
                      Verified Listing (Badge)
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="modalFeatured"
                      checked={propertyForm.featured}
                      onChange={(e) =>
                        setPropertyForm({ ...propertyForm, featured: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="modalFeatured"
                      className="text-xs font-bold text-gray-800 cursor-pointer"
                    >
                      Featured Property (Highlight)
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProperty || uploadingModalImages}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingProperty ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{modalMode === 'CREATE' ? 'Create Property' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
