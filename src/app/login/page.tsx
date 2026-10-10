'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, KeyRound, ArrowRight, ShieldCheck, Loader2, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { sendOtp, verifyOtp, user } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  if (user) {
    router.push('/');
    return null;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && !name.trim()) {
      setMessage({ text: 'Please enter your full name', type: 'error' });
      return;
    }

    if (!email || !email.includes('@')) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await sendOtp(email);
      if (res.success) {
        setStep('OTP');
        setMessage({ text: res.message, type: 'success' });
        if (res.devOtp) {
          setDevOtp(res.devOtp);
        }
      } else {
        setMessage({ text: res.message || 'Failed to send OTP', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setMessage({ text: 'Please enter the 6-digit verification code', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await verifyOtp(email, otp, name);
      if (res.success) {
        setMessage({
          text: isSignUp ? 'Account created successfully! Redirecting...' : 'Login successful! Redirecting...',
          type: 'success',
        });
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        setMessage({ text: res.message || 'Invalid OTP code', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Failed to verify OTP. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Ghar24</h1>
            <p className="text-xs text-gray-500 font-medium">Verified Real Estate Platform</p>
          </div>
        </div>

        {/* Tab Switcher (Log In / Sign Up) */}
        {step === 'EMAIL' && (
          <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setMessage(null);
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                !isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setMessage(null);
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                isSignUp ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-black text-gray-900">
            {step === 'OTP'
              ? isSignUp
                ? 'Verify & Complete Sign Up'
                : 'Verify Login Code'
              : isSignUp
              ? 'Create your Account'
              : 'Welcome Back'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {step === 'OTP'
              ? `Enter the 6-digit verification code sent to ${email}`
              : isSignUp
              ? 'Join Ghar24 to buy, rent, or list properties with zero hassle.'
              : 'Log in with your email address to receive an instant OTP.'}
          </p>
        </div>

        {message && (
          <div
            className={`mb-5 p-3.5 rounded-xl text-sm font-medium ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {devOtp && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <span className="font-bold">Development Mode OTP:</span>{' '}
            <code className="bg-amber-100 px-2 py-0.5 rounded font-mono font-bold text-sm tracking-widest text-amber-900">
              {devOtp}
            </code>
          </div>
        )}

        {step === 'EMAIL' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@domain.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                A 6-digit OTP will be sent to your email.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  {isSignUp ? 'Send Sign Up OTP' : 'Send Login OTP'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(null);
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {isSignUp ? 'Log In' : 'Sign Up'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 flex items-center justify-between">
              <div>
                Code sent to: <strong className="text-gray-900">{email}</strong>
              </div>
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="text-blue-600 font-bold hover:underline"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Enter 6-Digit OTP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono tracking-widest text-center text-blue-700 font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  {isSignUp ? 'Verify & Create Account' : 'Verify & Log In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
