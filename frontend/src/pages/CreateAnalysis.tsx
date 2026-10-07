import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Image as ImageIcon, Smartphone, Loader2, Sparkles, 
  User, MapPin, Navigation, CheckCircle2, Sliders, ShieldCheck, 
  Layers, Aperture, SunMedium, ArrowRight, UserPlus
} from 'lucide-react';
import ImageUpload from '../components/ImageUpload';
import PhoneSelector from '../components/PhoneSelector';
import { useLocation } from '../hooks/useLocation';
import { PhoneModel } from '../types';
import { api } from '../services/api';
import { analysisService } from '../services/analysis';
import { uploadService } from '../services/upload';

const CreateAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [phones, setPhones] = useState<PhoneModel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bgImage, setBgImage] = useState<File | null>(null);
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);

  const [phoneModel, setPhoneModel] = useState<string>('');
  const { latitude, longitude, address, loading: locLoading, error: locError, permissionState, requestLocation } = useLocation();

  useEffect(() => {
    api.get('/api/phones').then(res => setPhones(res.data)).catch(console.error);
    return () => {
      if (bgPreview) URL.revokeObjectURL(bgPreview);
      if (personPreview) URL.revokeObjectURL(personPreview);
    };
  }, []);

  const selectedPhone = phones.find(p => p.id === phoneModel);

  const handleImageChange = (field: 'bg' | 'person', file: File | null) => {
    if (field === 'bg') {
      if (bgPreview) URL.revokeObjectURL(bgPreview);
      setBgImage(file);
      setBgPreview(file ? URL.createObjectURL(file) : null);
    } else {
      if (personPreview) URL.revokeObjectURL(personPreview);
      setPersonImage(file);
      setPersonPreview(file ? URL.createObjectURL(file) : null);
    }
    setError(null);
  };

  const handleSubmit = async () => {
    if (!bgImage) { 
      setError('Background image is required. Please upload your location or scene photo.'); 
      return; 
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const ts = Date.now().toString();
      const bgUrl = await uploadService.uploadImage(bgImage, 'location-images', `${ts}/${bgImage.name}`);
      let personUrl: string | undefined;
      
      if (personImage) {
        personUrl = await uploadService.uploadImage(personImage, 'person-images', `${ts}/${personImage.name}`);
      }

      const result = await analysisService.createAnalysis({
        location_image_url: bgUrl,
        person_image_url: personUrl || null,
        vehicle_image_url: null,
        phone_model: phoneModel || 'default',
        photography_style: 'auto',
        take_my_photo: false,
      });

      navigate(`/analyze/${result.id}`);
    } catch (err: any) {
      setError(err?.message || 'Analysis failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> AI Photography & Pose Assistant
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
          Scene & Pose Analysis
        </h1>
        <p className="text-gray-400 text-base max-w-2xl leading-relaxed">
          Upload your background scene. If you upload a person photo, we customize poses to that person. If no person photo is uploaded, PoseAI automatically activates our AI Virtual Model to craft 10+ professional poses for your background.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-sm flex items-center gap-3 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Upload Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Background Image (Required) */}
        <div className="space-y-3 bg-slate-900/50 p-5 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-accent-400" /> 
              Background Scene
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent-500/20 text-accent-300 border border-accent-500/30">
              Required
            </span>
          </div>
          <p className="text-xs text-gray-400">
            The environment, wall, architecture, street, or landscape where you want to shoot.
          </p>
          <ImageUpload
            file={bgImage}
            preview={bgPreview}
            onChange={(file) => handleImageChange('bg', file)}
            label="Upload background"
            description="The location or scene (JPG, PNG, WebP)"
          />
        </div>

        {/* Person Image (Optional) */}
        <div className="space-y-3 bg-slate-900/50 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" /> 
                Person Photo
              </h2>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-gray-400 border border-white/10">
                Optional
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Upload a person photo to tailor poses to their outfit, or leave blank to use the AI Virtual Model.
            </p>
          </div>

          <ImageUpload
            file={personImage}
            preview={personPreview}
            onChange={(file) => handleImageChange('person', file)}
            label="Upload person photo"
            description="For custom outfit & model tailoring"
            optional
          />

          {/* AI Virtual Model Info Banner */}
          {!personImage ? (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-cyan-200">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-cyan-300">AI Virtual Model is ready:</strong> Leaving this empty will automatically generate 10+ professional poses for the background using our virtual aesthetic model!
              </span>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Subject photo attached:</strong> Poses will be specifically coordinated with your outfit colors, style, and framing!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Model Selection & Specs Preview */}
      <div className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-accent-400" /> 
              Smartphone Model Selection
            </h2>
            <p className="text-sm text-gray-400">
              Select your phone model to receive customized camera tilt angles, lens focal choices, and quality adjustments.
            </p>
          </div>
          {phoneModel && (
            <button 
              onClick={() => setPhoneModel('')}
              className="text-xs text-gray-400 hover:text-white transition-colors underline text-left"
            >
              Reset to Universal Phone
            </button>
          )}
        </div>

        <PhoneSelector
          phones={phones}
          value={phoneModel}
          onChange={(id) => setPhoneModel(id)}
        />

        {/* Live Phone Capabilities & Settings Preview */}
        {selectedPhone ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-accent-950/40 to-slate-900 border border-accent-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-accent-500/20 text-accent-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {selectedPhone.brand} {selectedPhone.model}
                  </h4>
                  <span className="text-xs text-accent-300">Customized Camera Profile Active</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs">
                {selectedPhone.portrait_mode && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Portrait Mode
                  </span>
                )}
                {selectedPhone.optical_zoom && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {selectedPhone.optical_zoom} Optical
                  </span>
                )}
                {selectedPhone.night_mode && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Night Mode
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-gray-400 block mb-1">Camera Sensors</span>
                <span className="font-semibold text-white">
                  Main: {selectedPhone.main_camera}
                  {selectedPhone.telephoto_camera ? ` • Tele: ${selectedPhone.telephoto_camera}` : ''}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-gray-400 block mb-1">Optical Zoom Support</span>
                <span className="font-semibold text-cyan-300">
                  {selectedPhone.optical_zoom || '2x In-Sensor'} optical quality
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="text-gray-400 block mb-1">AI Output Generation</span>
                <span className="font-semibold text-emerald-400">
                  Tailored Angles & Quality Settings
                </span>
              </div>
            </div>

            <p className="text-xs text-accent-200/80">
              ✨ PoseAI will generate specific shooting heights (Knee level, Waist level, Eye level), exact phone tilt angles (15° Upward, 0° Level), and optimal quality adjustments (f-stop, lens selection, exposure compensation) tailored for your {selectedPhone.model}.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent-400" />
              Universal Smartphone Mode active: Includes 1x, 2x, Ultra-wide, and Portrait guidelines.
            </span>
            <span className="text-accent-400 font-medium hidden sm:inline">Select a model above for custom tuning</span>
          </div>
        )}
      </div>

      {/* Optional Location Detection */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent-400" /> Location Context
          </h2>
          <span className="text-xs text-gray-400">Optional for sun position</span>
        </div>

        {permissionState === 'granted' && latitude && longitude ? (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs">
            <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-emerald-300 font-medium">Location detected: {address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
            <span>Location is optional. It helps calculate local solar angles and golden hour lighting.</span>
            <button
              onClick={requestLocation}
              disabled={locLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 w-fit"
            >
              {locLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5 text-accent-400" />}
              Auto-detect Location
            </button>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-400 text-center sm:text-left">
          {bgImage ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5 justify-center sm:justify-start">
              <CheckCircle2 className="w-4 h-4" /> Ready to generate poses
            </span>
          ) : (
            <span>Please upload a background image above to continue.</span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !bgImage}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-accent-600 via-purple-600 to-accent-500 hover:from-accent-500 hover:to-purple-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-accent-600/25 text-base cursor-pointer"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Scene & Crafting Poses...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Poses & Camera Angles <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateAnalysis;
