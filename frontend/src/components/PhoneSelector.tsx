import React, { useState, useMemo } from 'react';
import { PhoneModel } from '../types';
import { Search, Check, Smartphone } from 'lucide-react';

interface PhoneSelectorProps {
  phones: PhoneModel[];
  value?: string;
  onChange: (phoneId: string) => void;
}

const PhoneSelector: React.FC<PhoneSelectorProps> = ({ phones, value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const groupedPhones = useMemo(() => {
    const filtered = phones.filter(phone => 
      phone.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.reduce((acc, phone) => {
      if (!acc[phone.brand]) {
        acc[phone.brand] = [];
      }
      acc[phone.brand].push(phone);
      return acc;
    }, {} as Record<string, PhoneModel[]>);
  }, [phones, searchQuery]);

  return (
    <div className="w-full bg-slate-900 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="p-3 border-b border-white/10 bg-slate-800/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your phone model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 placeholder-gray-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {Object.keys(groupedPhones).length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-400">
            No phones found matching "{searchQuery}"
          </div>
        ) : (
          Object.entries(groupedPhones).map(([brand, brandPhones]) => (
            <div key={brand} className="mb-4 last:mb-0">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2 sticky top-0 bg-slate-900/95 backdrop-blur py-1 z-10">
                {brand}
              </h4>
              <div className="space-y-1">
                {brandPhones.map(phone => (
                  <button
                    key={phone.id}
                    onClick={() => onChange(phone.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                      value === phone.id 
                        ? 'bg-accent-500/20 border border-accent-500/30' 
                        : 'hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${value === phone.id ? 'bg-accent-500/20 text-accent-400' : 'bg-slate-800 text-gray-400'}`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${value === phone.id ? 'text-accent-300' : 'text-gray-200'}`}>
                          {phone.model}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-[300px]">
                          {`${phone.main_camera}${phone.telephoto_camera ? ' + ' + phone.telephoto_camera + ' telephoto' : ''}`}
                        </div>
                      </div>
                    </div>
                    {value === phone.id && (
                      <Check className="w-4 h-4 text-accent-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-white/10 bg-slate-800/30 text-xs text-center text-gray-400">
        Your phone not listed? We'll use general smartphone recommendations.
      </div>
    </div>
  );
};

export default PhoneSelector;
