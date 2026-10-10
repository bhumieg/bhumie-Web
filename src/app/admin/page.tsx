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
} from 'lucide-react';

export default function AdminPortalPage() {
  const { user, adminLogin } = useAuth();

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
        const propRes = await fetch(`/api/admin/properties?status=${statusFilter}&search=${encodeURIComponent(searchFilter)}`);
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
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/properties/${propId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProperties((prev) => prev.filter((p) => p.id !== propId));
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Error deleting property');
    }
  };

  // If Not Admin, render Secure Admin Portal Login
  if (!isAdmin) {
    return (
      <div className="min-h-screen py-20 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold">
            <Shield className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 text-center tracking-tight">Admin Portal</h2>
          <p className="text-xs text-gray-500 text-center mb-6">
            Authorized admin credentials required to access system controls
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Admin Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@bhumie.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Admin Secret Key</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={adminSecretKey}
                  onChange={(e) => setAdminSecretKey(e.target.value)}
                  placeholder="Enter admin secret key"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Access Admin Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard View
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
            <p className="text-xs text-gray-500 font-semibold">
              Bhumie Master Control • Connected to Neon PostgreSQL Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/properties"
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 rounded-xl"
          >
            Live Site
          </Link>
          <Link
            href="/post-property"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            + Add Property
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-4 mb-8 overflow-x-auto">
        {[
          { key: 'PROPERTIES', label: 'All Properties', icon: Building },
          { key: 'USERS', label: 'Registered Users', icon: Users },
          { key: 'INQUIRIES', label: 'Tenant Leads', icon: MessageSquare },
          { key: 'STATS', label: 'Overview Analytics', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
                              src={prop.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=100&q=80'}
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
                              prop.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {prop.verified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleFeatured(prop.id, prop.featured)}
                            className={`p-1.5 rounded-lg font-bold text-[11px] cursor-pointer ${
                              prop.featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'
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
                            <Link
                              href={`/properties/${prop.id}/edit`}
                              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
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

      {/* ================= TAB 2: REGISTERED USERS ================= */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Properties</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-4 font-bold text-gray-900">{u.name || 'Bhumie User'}</td>
                    <td className="py-3 px-4 text-gray-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-50 text-blue-700 uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700">
                        OTP Verified
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-800">{u._count?.properties || 0} Listed</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
}

