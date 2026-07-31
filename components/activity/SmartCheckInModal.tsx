'use client';

import React, { useState, useRef } from 'react';
import { Camera, Check, CheckCircle2, ChevronRight, Navigation, Upload, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { saveCheckInData, CheckInMedia } from '@/lib/checkinStore';

interface SmartCheckInModalProps {
  borrowId: string;
  stage: 'before' | 'after';
  onComplete: () => void;
  onCancel: () => void;
}

const CONDITIONS = [
  { id: 'Excellent', label: 'Excellent', color: 'bg-moss text-white' },
  { id: 'Good', label: 'Good', color: 'bg-blue-500 text-white' },
  { id: 'Minor Scratches', label: 'Minor Scratches', color: 'bg-amber-500 text-white' },
  { id: 'Damaged', label: 'Damaged', color: 'bg-red-500 text-white' },
];

export function SmartCheckInModal({ borrowId, stage, onComplete, onCancel }: SmartCheckInModalProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1: Capture, 2: Review & Confirm
  const [media, setMedia] = useState<CheckInMedia>({ front: null, side: null, top: null, video: null });
  const [condition, setCondition] = useState<string>('Excellent');
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [borrowerConfirmed, setBorrowerConfirmed] = useState(false);
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);
  
  // File upload handler (Simulating camera capture for web)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, view: keyof CheckInMedia) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setMedia(prev => ({ ...prev, [view]: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    // Require 3 photos OR 1 video
    const hasPhotos = media.front && media.side && media.top;
    if (!hasPhotos && !media.video) {
      alert('Please upload 3 photos (Front, Side, Top) OR 1 short video.');
      return;
    }
    setStep(2);
  };

  const handleFinish = async () => {
    if (!ownerConfirmed || !borrowerConfirmed) {
      alert('Both users must confirm the item condition.');
      return;
    }

    // Mock GPS Location
    let gps = null;
    try {
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        gps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
    } catch(e) {}

    saveCheckInData(borrowId, stage, {
      media,
      condition,
      timestamp: new Date().toISOString(),
      gpsLocation: gps,
      confirmedByOwner: ownerConfirmed,
      confirmedByBorrower: borrowerConfirmed
    });

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-ink/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-xl text-ink">
            {stage === 'before' ? 'Before Pickup Check-in' : 'Return Check-in'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Progress Timeline */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
            <div className={`absolute left-0 top-1/2 h-1 bg-moss -translate-y-1/2 z-0 transition-all duration-500 \${step === 2 ? 'w-full' : 'w-1/2'}`} />
            
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-moss text-white flex items-center justify-center font-bold font-display shadow-lg">1</div>
              <span className="text-xs font-bold text-ink">Capture Media</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-display shadow-lg transition-colors \${step === 2 ? 'bg-moss text-white' : 'bg-white border-2 border-slate-200 text-slate'}`}>2</div>
              <span className={`text-xs font-bold \${step === 2 ? 'text-ink' : 'text-slate'}`}>Review & Confirm</span>
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <p className="text-slate text-sm">
                To build trust and prevent disputes, please capture a 5-10s video <strong className="text-ink">OR</strong> 3 photos of the item from different angles.
              </p>

              {/* Mode Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-full w-full">
                <button 
                  onClick={() => setIsCapturingVideo(false)}
                  className={`flex-1 py-2 text-sm font-bold rounded-full transition-all \${!isCapturingVideo ? 'bg-white shadow-sm text-ink' : 'text-slate'}`}
                >
                  <Camera className="w-4 h-4 inline mr-2" /> Photos
                </button>
                <button 
                  onClick={() => setIsCapturingVideo(true)}
                  className={`flex-1 py-2 text-sm font-bold rounded-full transition-all \${isCapturingVideo ? 'bg-white shadow-sm text-ink' : 'text-slate'}`}
                >
                  <Video className="w-4 h-4 inline mr-2" /> Video
                </button>
              </div>

              {!isCapturingVideo ? (
                <div className="grid grid-cols-3 gap-4">
                  {(['front', 'side', 'top'] as const).map((view) => (
                    <div key={view} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl relative overflow-hidden group hover:border-moss transition-colors">
                      {media[view] ? (
                        <img src={media[view]!} alt={view} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate">
                          <Upload className="w-6 h-6 mb-2 group-hover:text-moss transition-colors" />
                          <span className="text-xs font-bold capitalize">{view} View</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={(e) => handleFileUpload(e, view)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl relative overflow-hidden group hover:border-moss transition-colors flex flex-col items-center justify-center">
                   {media.video ? (
                      <video src={media.video} controls className="w-full h-full object-cover" />
                   ) : (
                     <>
                        <Video className="w-8 h-8 mb-2 text-slate group-hover:text-moss transition-colors" />
                        <span className="text-sm font-bold text-slate">Record 5-10s Video</span>
                     </>
                   )}
                   {!media.video && (
                     <input 
                       type="file" 
                       accept="video/*" 
                       capture="environment"
                       onChange={(e) => handleFileUpload(e, 'video')}
                       className="absolute inset-0 opacity-0 cursor-pointer"
                     />
                   )}
                </div>
              )}

              {/* Condition Selector */}
              <div>
                <h3 className="font-display font-bold text-sm text-ink mb-3">Item Condition</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CONDITIONS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCondition(c.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all \${condition === c.id ? c.color + ' border-transparent scale-105 shadow-md' : 'bg-white border-slate-100 text-slate hover:border-slate-200'}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleNext} variant="primary" className="w-full mt-4 group">
                Review & Confirm <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                  <Navigation className="w-5 h-5 text-moss" />
                  <span className="font-data text-sm font-medium text-ink">Metadata automatically attached (Date, Time, GPS)</span>
                </div>

                <div className="flex gap-4">
                  {media.front && <img src={media.front} className="w-16 h-16 rounded-xl object-cover" />}
                  {media.side && <img src={media.side} className="w-16 h-16 rounded-xl object-cover" />}
                  {media.top && <img src={media.top} className="w-16 h-16 rounded-xl object-cover" />}
                  {media.video && <div className="w-16 h-16 bg-ink text-white rounded-xl flex items-center justify-center text-xs font-bold">VIDEO</div>}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate">Reported Condition</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white \${CONDITIONS.find(c => c.id === condition)?.color}`}>{condition}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-bold text-sm text-ink">Digital Signatures</h3>
                <p className="text-xs text-slate">Both parties must review the item and confirm the condition before handing it over.</p>
                
                <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all \${ownerConfirmed ? 'bg-moss/10 border-moss' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center \${ownerConfirmed ? 'bg-moss text-white' : 'border-2 border-slate-300 text-transparent'}`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-ink">Owner: I confirm the item condition.</span>
                  <input type="checkbox" className="hidden" checked={ownerConfirmed} onChange={(e) => setOwnerConfirmed(e.target.checked)} />
                </label>
                
                <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all \${borrowerConfirmed ? 'bg-moss/10 border-moss' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center \${borrowerConfirmed ? 'bg-moss text-white' : 'border-2 border-slate-300 text-transparent'}`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-ink">Borrower: I confirm the item condition.</span>
                  <input type="checkbox" className="hidden" checked={borrowerConfirmed} onChange={(e) => setBorrowerConfirmed(e.target.checked)} />
                </label>
              </div>

              <Button 
                onClick={handleFinish} 
                variant="primary" 
                className="w-full mt-4 shadow-xl shadow-moss/20"
                disabled={!ownerConfirmed || !borrowerConfirmed}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" /> Complete Handover
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
