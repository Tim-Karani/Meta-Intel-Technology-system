import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Search, 
  MapPin, 
  Calendar, 
  Filter, 
  ZoomIn, 
  X,
  Compass
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { FieldVisit, VisitEvidence } from '../../types';

export const EvidenceGallery: React.FC = () => {
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<(VisitEvidence & { venueName: string; agentName: string }) | null>(null);

  const loadData = () => {
    setVisits(storageService.getVisits());
  };

  useEffect(() => {
    loadData();
    const unsub = storageService.subscribe(loadData);
    return () => unsub();
  }, []);

  const allPhotos = visits.flatMap(v => 
    v.evidencePhotos.map(p => ({
      ...p,
      venueName: v.locationName,
      agentName: v.agentName
    }))
  );

  const filteredPhotos = allPhotos.filter(p => {
    if (selectedTag !== 'all' && p.tag !== selectedTag) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Image className="w-5 h-5 text-blue-600" />
            <span>Digital Evidence &amp; Photographic Asset Gallery</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Auditable photo archive with embedded EXIF telemetry, hardware camera watermark stamps, and campaign tags.
          </p>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {['all', 'after_merchandising', 'before_merchandising', 'posm_display', 'competitor_activity'].map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                selectedTag === tag
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tag.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src={photo.photoUrl}
                alt={photo.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2">
                <span className="text-[10px] font-bold text-white bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-md uppercase">
                  {photo.tag.replace('_', ' ')}
                </span>
              </div>
              <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ZoomIn className="w-6 h-6" />
              </div>
            </div>

            <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between text-xs">
              <p className="font-bold text-slate-800 line-clamp-2">{photo.caption}</p>
              <div className="space-y-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{photo.venueName}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Agent: {photo.agentName}</span>
                  <span>{photo.capturedAt.slice(11, 19)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Inspector Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-xs">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900">{selectedPhoto.venueName}</h3>
              <button onClick={() => setSelectedPhoto(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <img
                src={selectedPhoto.photoUrl}
                alt="Enlarged"
                className="w-full max-h-[420px] object-cover rounded-xl border border-slate-200"
              />

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Caption</span>
                  <span className="font-bold text-slate-900">{selectedPhoto.caption}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category Tag</span>
                  <span className="font-bold text-blue-600 uppercase">{selectedPhoto.tag.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hardware Coordinates</span>
                  <span className="font-mono text-slate-800">
                    {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Captured Timestamp</span>
                  <span className="font-mono text-slate-800">{selectedPhoto.capturedAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
