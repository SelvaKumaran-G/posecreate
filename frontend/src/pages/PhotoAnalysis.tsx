import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, User, Smartphone, Sparkles, Loader2, ChevronDown, Check, Search, ArrowLeft, Download, Eye, X } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import PhoneSelector from '../components/PhoneSelector';
import { PhoneModel } from '../types';
import { api } from '../services/api';
import { uploadService } from '../services/upload';
import { useNavigate } from 'react-router-dom';

interface GeneratedPoseImage {
  id: string;
  url: string;
  name: string;
  description: string;
  difficulty: string;
  style: string;
  score: number;
}

const PhotoAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [phones, setPhones] = useState<PhoneModel[]>([]);
  const [locationImage, setLocationImage] = useState<File | null>(null);
  const [locationPreview, setLocationPreview] = useState<string | null>(null);
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [phoneModel, setPhoneModel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedPoseImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GeneratedPoseImage | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    api.get('/api/phones').then(res => setPhones(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    return () => {
      if (locationPreview) URL.revokeObjectURL(locationPreview);
      if (personPreview) URL.revokeObjectURL(personPreview);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const handleLocationChange = (file: File | null) => {
    if (locationPreview) URL.revokeObjectURL(locationPreview);
    setLocationImage(file);
    setLocationPreview(file ? URL.createObjectURL(file) : null);
    setError(null);
  };

  const handlePersonChange = (file: File | null) => {
    if (personPreview) URL.revokeObjectURL(personPreview);
    setPersonImage(file);
    setPersonPreview(file ? URL.createObjectURL(file) : null);
    setError(null);
  };

  const canSubmit = locationImage && personImage && phoneModel;

  const handleDone = async () => {
    if (!locationImage) { setError('Please upload a location/place photo'); return; }
    if (!personImage) { setError('Please upload a person photo'); return; }
    if (!phoneModel) { setError('Please select your mobile model'); return; }

    try {
      setIsGenerating(true);
      setError(null);
      setGenerationProgress(0);
      setGeneratedImages([]);

      // Simulate progress animation
      let progress = 0;
      progressInterval.current = setInterval(() => {
        progress += Math.random() * 8 + 2;
        if (progress > 90) progress = 90;
        setGenerationProgress(Math.round(progress));
      }, 400);

      // Upload images
      const ts = Date.now().toString();
      const locationUrl = await uploadService.uploadImage(
        locationImage, 'location-images', `${ts}/${locationImage.name}`
      );
      const personUrl = await uploadService.uploadImage(
        personImage, 'person-images', `${ts}/${personImage.name}`
      );

      // Call the generate poses endpoint
      const response = await api.post('/api/analysis/generate-poses', {
        location_image_url: locationUrl,
        person_image_url: personUrl,
        phone_model: phoneModel,
      });

      if (progressInterval.current) clearInterval(progressInterval.current);
      setGenerationProgress(100);

      // Small delay to show 100%
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGeneratedImages(response.data.images);
      
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

    } catch (err: any) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setError(err?.response?.data?.detail || err?.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedPhone = phones.find(p => p.id === phoneModel);
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-900/30 via-slate-950 to-fuchsia-900/20 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-accent-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" /> AI-Powered Pose Generation
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Photo <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-fuchsia-400">Analysis</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Upload your place and person photo, select your mobile model, and get 10 unique high-quality pose variations instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Location Upload */}
          <div className="group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Place / Location</h3>
                <p className="text-sm text-gray-500">Where you want to shoot</p>
              </div>
              <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">Required</span>
            </div>
            <ImageUpload
              file={locationImage}
              preview={locationPreview}
              onChange={handleLocationChange}
              label="Drop your place photo here"
              description="Indoor, outdoor, street, park, etc."
            />
          </div>

          {/* Person Upload */}
          <div className="group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-purple-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Person Photo</h3>
                <p className="text-sm text-gray-500">Full body or upper body</p>
              </div>
              <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">Required</span>
            </div>
            <ImageUpload
              file={personImage}
              preview={personPreview}
              onChange={handlePersonChange}
              label="Drop your person photo here"
              description="Clear full-body shot preferred"
            />
          </div>
        </div>

        {/* Phone Selection */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Mobile Model</h3>
              <p className="text-sm text-gray-500">Select your smartphone for optimized results</p>
            </div>
            <span className="ml-auto px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">Required</span>
          </div>
          
          <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
            <PhoneSelector
              phones={phones}
              value={phoneModel}
              onChange={(id) => setPhoneModel(id)}
            />
          </div>
          
          {selectedPhone && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Selected:</span>
              <span className="text-gray-300">{selectedPhone.model}</span>
              <span className="text-gray-500">— {selectedPhone.main_camera}</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">!</div>
            {error}
          </div>
        )}

        {/* Done Button */}
        <div className="flex justify-center mb-16">
          <button
            onClick={handleDone}
            disabled={!canSubmit || isGenerating}
            className={`relative group flex items-center gap-3 px-12 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${
              canSubmit && !isGenerating
                ? 'bg-gradient-to-r from-accent-600 via-accent-500 to-fuchsia-500 text-white shadow-2xl shadow-accent-500/30 hover:shadow-accent-500/50 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-800 text-gray-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {canSubmit && !isGenerating && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-600 via-accent-500 to-fuchsia-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity pointer-events-none" />
            )}
            <span className="relative flex items-center gap-3">
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Poses...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate 10 Pose Variations
                </>
              )}
            </span>
          </button>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="mb-16">
            <div className="max-w-xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-400">Generating pose variations...</span>
                  <span className="text-sm font-bold text-accent-400">{generationProgress}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-500 to-fuchsia-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                    AI compositing your photos
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        i < Math.floor(generationProgress / 10) 
                          ? 'bg-gradient-to-r from-accent-500 to-fuchsia-500'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-600 text-center">
                  {Math.floor(generationProgress / 10)} of 10 poses generated
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generated Results */}
        {generatedImages.length > 0 && (
          <div ref={resultsRef}>
            {/* Results Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
                <Check className="w-4 h-4" /> Generation Complete
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-fuchsia-400">10 Unique Poses</span>
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Each image features a unique composition, style treatment, and pose positioning.
              </p>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedImages.map((img, index) => (
                <div
                  key={img.id}
                  className="group relative bg-slate-800/50 border border-white/5 rounded-2xl overflow-hidden hover:border-accent-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/10 animate-slide-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`}
                      alt={img.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Score badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span className="text-sm font-bold text-white">{img.score}</span>
                    </div>

                    {/* Pose number */}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-accent-500/80 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>

                    {/* Action buttons on hover */}
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setLightboxImage(img)}
                        className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors border border-white/10"
                        title="View full size"
                      >
                        <Eye className="w-4 h-4 text-white" />
                      </button>
                      <a
                        href={img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`}
                        download={`pose_${index + 1}_${img.style}.jpg`}
                        className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors border border-white/10"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-white" />
                      </a>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-white truncate">{img.name}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        img.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        img.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>{img.difficulty}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{img.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Generate Again */}
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleDone}
                disabled={isGenerating}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium text-gray-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-white/10 hover:border-accent-500/30"
              >
                <Sparkles className="w-5 h-5 text-accent-400" />
                Generate Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage.url.startsWith('http') ? lightboxImage.url : `${baseUrl}${lightboxImage.url}`}
              alt={lightboxImage.name}
              className="w-full h-full object-contain rounded-2xl"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-2xl">
              <h3 className="text-xl font-bold text-white mb-1">{lightboxImage.name}</h3>
              <p className="text-gray-300 text-sm">{lightboxImage.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-accent-400 font-medium">Score: {lightboxImage.score}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-400">{lightboxImage.difficulty}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoAnalysis;

