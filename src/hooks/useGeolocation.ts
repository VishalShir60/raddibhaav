'use client';

import { useState } from 'react';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  pincode: string;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<LocationState>({
    latitude: 19.076,
    longitude: 72.8777,
    address: 'Dadar West, Shivaji Park',
    city: 'Mumbai',
    pincode: '400028',
    loading: false,
    error: null,
  });

  const detectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Shivaji Park, Dadar West',
          city: 'Mumbai',
          pincode: '400028',
          loading: false,
          error: null,
        });
      },
      (err) => {
        console.warn('Geolocation fallback', err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Using approximate neighborhood coordinates',
          latitude: 19.0213,
          longitude: 72.8424,
        }));
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return {
    ...state,
    detectLocation,
  };
}
