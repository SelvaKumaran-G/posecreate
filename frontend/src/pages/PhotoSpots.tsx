import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Navigation, Camera, X, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';

interface PhotoSpot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  visitedAt?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

const SPOTS_KEY = 'poseai_photo_spots';

function getSavedSpots(): PhotoSpot[] {
  try {
    const data = localStorage.getItem(SPOTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSpots(spots: PhotoSpot[]) {
  localStorage.setItem(SPOTS_KEY, JSON.stringify(spots));
}

export default function PhotoSpots() {
  const { latitude, longitude, address, loading: locLoading, error: locError, permissionState, requestLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [savedSpots, setSavedSpots] = useState<PhotoSpot[]>(getSavedSpots());
  const [selectedSpot, setSelectedSpot] = useState<PhotoSpot | null>(null);
  const [nearbySpots, setNearbySpots] = useState<SearchResult[]>([]);
  const [searchingNearby, setSearchingNearby] = useState(false);

  // Search for places
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: SearchResult[] = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  // Search nearby photo spots when location is available
  useEffect(() => {
    if (latitude && longitude && !searchingNearby && nearbySpots.length === 0) {
      setSearchingNearby(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=photo+spot+park+monument+viewpoint&limit=8&bounded=1&viewbox=${longitude - 0.05},${latitude + 0.05},${longitude + 0.05},${latitude - 0.05}`,
        { headers: { 'Accept-Language': 'en' } }
      )
        .then(res => res.json())
        .then((data: SearchResult[]) => {
          setNearbySpots(data);
        })
        .catch(() => setNearbySpots([]))
        .finally(() => setSearchingNearby(false));
    }
  }, [latitude, longitude]);

  const addSpotToSaved = (name: string, addr: string, lat: number, lng: number) => {
    const newSpot: PhotoSpot = {
      id: Date.now().toString(),
      name: name.split(',')[0],
      address: addr,
      lat,
      lng,
      visitedAt: new Date().toISOString(),
    };
    const updated = [newSpot, ...savedSpots.filter(s => !(Math.abs(s.lat - lat) < 0.001 && Math.abs(s.lng - lng) < 0.001))];
    setSavedSpots(updated);
    saveSpots(updated);
  };

  const removeSpot = (id: string) => {
    const updated = savedSpots.filter(s => s.id !== id);
    setSavedSpots(updated);
    saveSpots(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <MapPin className="w-8 h-8 text-accent-500" /> Photo Spots
        </h1>
        <p className="text-gray-400">Discover and save your favorite photography locations.</p>
      </div>

      {/* Search Section */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-accent-500" /> Search Places
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search for a place (e.g., Marina Beach, Eiffel Tower)..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-6 py-3 bg-accent-600 hover:bg-accent-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Search
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
            {searchResults.map((result) => (
              <div
                key={result.place_id}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5 hover:border-accent-500/30 transition-colors cursor-pointer group"
                onClick={() => addSpotToSaved(result.display_name, result.display_name, parseFloat(result.lat), parseFloat(result.lon))}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <MapPin className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{result.display_name.split(',')[0]}</p>
                    <p className="text-gray-500 text-sm truncate">{result.display_name}</p>
                  </div>
                </div>
                <span className="text-accent-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">+ Save</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Near Me Section */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-500" /> Near Me Spots
          </h2>
          {permissionState !== 'granted' && (
            <button
              onClick={requestLocation}
              disabled={locLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {locLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              Enable Location
            </button>
          )}
        </div>

        {locError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">{locError}</div>
        )}

        {latitude && longitude && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Your location: {address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
            </p>
          </div>
        )}

        {/* Map Embed */}
        {latitude && longitude && (
          <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
            <iframe
              title="Your Location"
              width="100%"
              height="250"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02},${latitude - 0.02},${longitude + 0.02},${latitude + 0.02}&layer=mapnik&marker=${latitude},${longitude}`}
            />
          </div>
        )}

        {searchingNearby && (
          <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Finding nearby spots...</div>
        )}

        {nearbySpots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nearbySpots.map((spot) => (
              <div
                key={spot.place_id}
                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer"
                onClick={() => addSpotToSaved(spot.display_name, spot.display_name, parseFloat(spot.lat), parseFloat(spot.lon))}
              >
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{spot.display_name.split(',')[0]}</p>
                  <p className="text-gray-500 text-xs truncate">{spot.display_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!latitude && !locLoading && permissionState !== 'denied' && (
          <p className="text-gray-500 text-sm">Enable location to discover photo spots near you.</p>
        )}
      </div>

      {/* Saved Spots */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-500" /> Saved Photo Spots ({savedSpots.length})
        </h2>

        {savedSpots.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 mb-1">No saved spots yet</p>
            <p className="text-gray-600 text-sm">Search for places or discover spots near you to save them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savedSpots.map((spot) => (
              <div
                key={spot.id}
                className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:border-accent-500/30 transition-colors cursor-pointer group"
                onClick={() => setSelectedSpot(selectedSpot?.id === spot.id ? null : spot)}
              >
                <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center shrink-0">
                  {spot.imageUrl ? (
                    <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <MapPin className="w-6 h-6 text-accent-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{spot.name}</p>
                  <p className="text-gray-500 text-sm truncate">{spot.address}</p>
                  {spot.visitedAt && (
                    <p className="text-gray-600 text-xs mt-1">
                      Saved {new Date(spot.visitedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeSpot(spot.id); }}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${selectedSpot?.id === spot.id ? 'rotate-90' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Spot Detail Modal */}
      {selectedSpot && (
        <div className="bg-slate-800/50 border border-accent-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-accent-500" /> {selectedSpot.name}
            </h2>
            <button onClick={() => setSelectedSpot(null)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-4">{selectedSpot.address}</p>

          {/* Map for this spot */}
          <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
            <iframe
              title={selectedSpot.name}
              width="100%"
              height="250"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedSpot.lng - 0.005},${selectedSpot.lat - 0.005},${selectedSpot.lng + 0.005},${selectedSpot.lat + 0.005}&layer=mapnik&marker=${selectedSpot.lat},${selectedSpot.lng}`}
            />
          </div>

          {selectedSpot.imageUrl ? (
            <div>
              <p className="text-sm text-gray-400 mb-2">Previously taken photo at this spot:</p>
              <img src={selectedSpot.imageUrl} alt="Previous photo" className="rounded-xl w-full max-h-64 object-cover border border-white/10" />
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-900/50 rounded-xl border border-white/5">
              <Camera className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No photos taken at this spot yet.</p>
              <p className="text-gray-600 text-xs">Photos from your analyses at this location will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
