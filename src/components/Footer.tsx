'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Mail, Phone, MapPin, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Ghar<span className="text-blue-500">24</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Find your next perfect place. Buy, rent, and list verified properties across Delhi, Noida, Gurgaon, and NCR with ease.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl w-fit">
              <Shield className="w-4 h-4" />
              100% Verified Owner Listings
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  All Properties
                </Link>
              </li>
              <li>
                <Link href="/properties?purpose=RENT" className="hover:text-white transition-colors">
                  Flats for Rent
                </Link>
              </li>
              <li>
                <Link href="/properties?purpose=SALE" className="hover:text-white transition-colors">
                  Flats & Villas for Sale
                </Link>
              </li>
              <li>
                <Link href="/post-property" className="hover:text-white transition-colors">
                  Post Property (Free)
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Localities */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Popular Cities</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/properties?city=Noida" className="hover:text-white transition-colors">
                  Noida (Sector 62, 137, 50)
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Delhi" className="hover:text-white transition-colors">
                  New Delhi (Saket, Dwarka)
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Gurgaon" className="hover:text-white transition-colors">
                  Gurgaon (Cyber City, Golf Course)
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Greater+Noida" className="hover:text-white transition-colors">
                  Greater Noida & Knowledge Park
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Contact & Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5 text-gray-400">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Delhi-NCR, India</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>support@ghar24.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>&copy; {new Date().getFullYear()} Ghar24. All rights reserved. Powered by Next.js & Neon PostgreSQL.</div>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Owner Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
