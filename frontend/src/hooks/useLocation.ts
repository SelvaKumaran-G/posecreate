import { useState, useEffect, useCallback } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: null,
    loading: false,
    error: null,
    permissionState: 'unknown',
  });

  // Check permission state on mount
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState(prev => ({ ...prev, permissionState: result.state as any }));
        result.onchange = () => {
          setState(prev => ({ ...prev, permissionState: result.state as any }));
        };
      }).catch(() => {
        setState(prev => ({ ...prev, permissionState: 'unknown' }));
      });
    }
  }, []);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation is not supported by your browser' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        setState({
          latitude,
          longitude,
          address,
          loading: false,
          error: null,
          permissionState: 'granted',
        });
      },
      (err) => {
        let errorMsg = 'Failed to get location';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enable location access in your browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'Location request timed out.';
        }
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMsg,
          permissionState: err.code === err.PERMISSION_DENIED ? 'denied' : prev.permissionState,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [reverseGeocode]);

  // Auto-request if already granted
  useEffect(() => {
    if (state.permissionState === 'granted' && !state.latitude && !state.loading) {
      requestLocation();
    }
  }, [state.permissionState, state.latitude, state.loading, requestLocation]);

  return {
    latitude: state.latitude,
    longitude: state.longitude,
    address: state.address,
    loading: state.loading,
    error: state.error,
    permissionState: state.permissionState,
    requestLocation,
  };
}
