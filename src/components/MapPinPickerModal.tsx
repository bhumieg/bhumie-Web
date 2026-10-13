'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, X, Check, Navigation, Loader2 } from 'lucide-react';

interface MapPinPickerModalProps {
  initialLat: number;
  initialLng: number;
  onSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapPinPickerModal({
  initialLat,
  initialLng,
  onSelect,
  onClose,
}: MapPinPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentLat, setCurrentLat] = useState(initialLat || 28.628);
  const [currentLng, setCurrentLng] = useState(initialLng || 77.3649);
  const [loadingMap, setLoadingMap] = useState(true);
  const [detectingLoc, setDetectingLoc] = useState(false);

  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        // Dynamically import Leaflet to avoid Next.js SSR issues
        const L = (await import('leaflet')).default;

        // Ensure Leaflet default marker icons work properly
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!mapInstanceRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current).setView([currentLat, currentLng], 14);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);

          marker.on('dragend', (e: any) => {
            const pos = e.target.getLatLng();
            if (isMounted) {
              setCurrentLat(pos.lat);
              setCurrentLng(pos.lng);
            }
          });

          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            if (isMounted) {
              setCurrentLat(lat);
              setCurrentLng(lng);
            }
          });

          mapInstanceRef.current = map;
          markerInstanceRef.current = marker;

          // Invalidate size to ensure tiles render properly inside modal
          setTimeout(() => {
            map.invalidateSize();
          }, 200);
        }
      } catch (err) {
        console.error('Failed to initialize Leaflet:', err);
      } finally {
        if (isMounted) setLoadingMap(false);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        setDetectingLoc(false);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          markerInstanceRef.current.setLatLng([latitude, longitude]);
        }
      },
      (err) => {
        alert('Could not retrieve your location. Check browser permissions.');
        setDetectingLoc(false);
      },
      { timeout: 7000 }
    );
  };

  const handleConfirm = () => {
    onSelect(currentLat, currentLng);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-black text-gray-900 text-sm sm:text-base">
                Pin Exact Property Location on Map
              </h3>
              <p className="text-xs text-gray-500">
                Click anywhere on the map or drag the pin to set the property's exact coordinates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Canvas */}
        <div className="relative flex-1 bg-gray-100">
          {loadingMap && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-xs text-gray-500 font-semibold">Loading interactive map...</p>
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Footer with Coordinates & Confirmation */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={detectingLoc}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer border border-blue-200"
            >
              <Navigation className={`w-3.5 h-3.5 ${detectingLoc ? 'animate-spin' : ''}`} />
              <span>Use My Location</span>
            </button>
            <div className="text-xs font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              Lat: <strong>{currentLat.toFixed(5)}</strong>, Lng:{' '}
              <strong>{currentLng.toFixed(5)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Location Pin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

