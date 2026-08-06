'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  PlusCircle,
  CheckCircle2,
  FileText,
  Tag,
  ArrowRight,
  AlertCircle,
  Image as ImageIcon,
  X,
  UploadCloud,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Camera,
  ShieldCheck,
  Globe,
  Users,
  Check,
  RefreshCw
} from 'lucide-react';

type ItemCategory = 'TOOLS' | 'ELECTRONICS' | 'SPORTS' | 'COOKWARE' | 'BOOKS' | 'OUTDOORS' | 'FURNITURE' | 'TRAVEL' | 'PARTY' | 'FITNESS' | 'VEHICLES' | 'APPLIANCES' | 'OTHER';

interface Props {
  userName: string;
}

export default function ListItemClient({ userName }: Props) {
  const router = useRouter();
  const { addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('TOOLS');
  const [marketPrice, setMarketPrice] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [penaltyPerHour, setPenaltyPerHour] = useState('');
  const [penaltyPerDay, setPenaltyPerDay] = useState('');
  const [description, setDescription] = useState('');
  
  // AI Snap & List State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiQualityWarning, setAiQualityWarning] = useState('');
  const [aiFallbackMessage, setAiFallbackMessage] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [aiDetectedDetails, setAiDetectedDetails] = useState<{ brand?: string; model?: string; condition?: string; itemType?: string } | null>(null);

  // Auto Security Settings State
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [damageCompensation, setDamageCompensation] = useState('');

  // Publish Section Selector
  const [publishTarget, setPublishTarget] = useState<'NEIGHBOUR' | 'ONLINE'>('NEIGHBOUR');

  // Review Page State
  const [showReview, setShowReview] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdItemName, setCreatedItemName] = useState('');

  const categories: { value: ItemCategory; label: string }[] = [
    { value: 'TOOLS', label: 'Tools & DIY' },
    { value: 'ELECTRONICS', label: 'Electronics & Tech' },
    { value: 'SPORTS', label: 'Sports & Gear' },
    { value: 'COOKWARE', label: 'Cookware' },
    { value: 'OUTDOORS', label: 'Outdoors' },
    { value: 'FURNITURE', label: 'Furniture' },
    { value: 'TRAVEL', label: 'Travel & Luggage' },
    { value: 'PARTY', label: 'Party & Events' },
    { value: 'FITNESS', label: 'Fitness & Gym' },
    { value: 'VEHICLES', label: 'Vehicles & Mobility' },
    { value: 'APPLIANCES', label: 'Appliances' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleMarketPriceChange = (val: string) => {
    setMarketPrice(val);
    const mp = parseFloat(val);
    if (!isNaN(mp) && mp > 0) {
      // Required formula: Price Per Day = Market Price / 8, Price Per Hour = Price Per Day / 8
      const calculatedPricePerDay = Math.round(mp / 8);
      const calculatedPricePerHour = Math.max(1, Math.round(calculatedPricePerDay / 8));
      
      setPricePerDay(calculatedPricePerDay.toString());
      setPricePerHour(calculatedPricePerHour.toString());

      // Auto security suggestions
      setSecurityDeposit(Math.round(mp * 0.25).toString());
      setPenaltyPerDay(Math.round(calculatedPricePerDay * 0.5).toString());
      setPenaltyPerHour(Math.round(calculatedPricePerHour * 0.5).toString());
      setDamageCompensation(Math.round(mp * 0.9).toString());
    }
  };

  const triggerAiAnalysis = async (filesToAnalyze: File[]) => {
    if (filesToAnalyze.length === 0) return;

    // Reset previous AI state so previous detection results are never cached or mixed
    setAiAnalyzing(true);
    setAiQualityWarning('');
    setAiFallbackMessage('');
    setAiConfidence(null);
    setAiTags([]);
    setAiDetectedDetails(null);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      const filenames = filesToAnalyze.map((f) => f.name);

      // Convert selected files to base64 DataURLs to send actual image data to AI Vision Service
      const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const imagesBase64 = await Promise.all(filesToAnalyze.map((f) => fileToDataUrl(f)));

      const res = await fetch('/api/ai/analyze-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames, images: imagesBase64 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.qualityCheck && !data.qualityCheck.passed) {
          setAiQualityWarning(data.qualityCheck.message || 'Please capture a clearer image for better AI detection.');
        }
        if (data.fallbackMessage) {
          setAiFallbackMessage(data.fallbackMessage);
        } else {
          setAiFallbackMessage("We couldn't identify this item automatically. Please complete the details manually.");
        }
        setAiAnalyzing(false);
        return;
      }

      // Populate detected fields from fresh image vision analysis ONLY
      if (data.detection) {
        if (data.detection.name || data.detection.title) {
          setName(data.detection.name || data.detection.title);
        }
        if (data.detection.category) {
          setCategory(data.detection.category as ItemCategory);
        }
        if (data.detection.description) {
          setDescription(data.detection.description);
        }
        if (data.detection.tags) {
          setAiTags(data.detection.tags);
        }
        if (data.detection.marketPrice) {
          setMarketPrice(data.detection.marketPrice.toString());
        }
        setAiDetectedDetails({
          brand: data.detection.brand,
          model: data.detection.model,
          condition: data.detection.condition,
          itemType: data.detection.itemType,
        });
      }

      if (data.pricing) {
        if (data.pricing.pricePerDay) setPricePerDay(data.pricing.pricePerDay.toString());
        if (data.pricing.pricePerHour) setPricePerHour(data.pricing.pricePerHour.toString());
      }

      if (data.security) {
        if (data.security.securityDeposit) setSecurityDeposit(data.security.securityDeposit.toString());
        if (data.security.lateReturnPenaltyDay) setPenaltyPerDay(data.security.lateReturnPenaltyDay.toString());
        if (data.security.lateReturnPenaltyHour) setPenaltyPerHour(data.security.lateReturnPenaltyHour.toString());
        if (data.security.damageCompensationLimit) setDamageCompensation(data.security.damageCompensationLimit.toString());
      }

      if (data.confidence) {
        setAiConfidence(data.confidence);
      }

      addToast('AI Snap & List Complete!', `Detected "${data.detection?.name || 'Item'}" with ${data.confidence}% accuracy.`);
    } catch (err) {
      console.error('AI vision processing error:', err);
      setAiFallbackMessage("We couldn't identify this item automatically. Please complete the details manually.");
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let hasError = false;
    const validFiles: File[] = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'One or more files are too large (max 5MB).' }));
        hasError = true;
      } else if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Invalid file type. Only JPG, PNG, and WEBP allowed.' }));
        hasError = true;
      } else {
        validFiles.push(file);
      }
    });

    if (!hasError) {
      setErrors(prev => ({ ...prev, file: '' }));
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...selectedFiles, ...validFiles].slice(0, 5); // Support up to 5 clear images
      setSelectedFiles(updatedFiles);
      setPreviewUrls(updatedFiles.map(f => URL.createObjectURL(f)));
      
      // Automatically analyze with AI when photos are added
      triggerAiAnalysis(updatedFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setAiConfidence(null);
    setAiTags([]);
    setAiDetectedDetails(null);
    setAiQualityWarning('');
    setAiFallbackMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Item name is required.';
    else if (name.trim().length < 3) newErrors.name = 'Item name must be at least 3 characters long.';

    const mp = parseFloat(marketPrice);
    if (marketPrice && (isNaN(mp) || mp <= 0)) newErrors.marketPrice = 'Must be > 0';

    const pDay = parseFloat(pricePerDay);
    if (!pricePerDay || isNaN(pDay) || pDay <= 0) newErrors.pricePerDay = 'Must be > 0';

    const pHour = parseFloat(pricePerHour);
    if (pricePerHour && (isNaN(pHour) || pHour <= 0)) newErrors.pricePerHour = 'Must be > 0';

    const penDay = parseFloat(penaltyPerDay);
    if (penaltyPerDay && (isNaN(penDay) || penDay < 0)) newErrors.penaltyPerDay = 'Must be >= 0';

    const penHour = parseFloat(penaltyPerHour);
    if (penaltyPerHour && (isNaN(penHour) || penHour < 0)) newErrors.penaltyPerHour = 'Must be >= 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setShowReview(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const uploadedUrls: string[] = [];

      // Convert file to Base64 Data URL as reliable fallback
      const fileToDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      // Upload all files concurrently or convert to data URLs
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
              const data = await res.json();
              if (data.url) return data.url;
            }
          } catch (e) {
            console.warn('Upload API failed, falling back to Data URL', e);
          }
          return fileToDataUrl(file);
        });

        try {
          const results = await Promise.all(uploadPromises);
          results.forEach(url => {
            if (url) uploadedUrls.push(url);
          });
        } catch (err) {
          console.error('File processing error:', err);
        }
      }

      let finalDescription = description.trim();
      
      // Append AI detected metadata & security settings to description cleanly if present
      const metadataLines: string[] = [];
      if (aiDetectedDetails?.brand) metadataLines.push(`Brand: ${aiDetectedDetails.brand}`);
      if (aiDetectedDetails?.model) metadataLines.push(`Model: ${aiDetectedDetails.model}`);
      if (aiDetectedDetails?.condition) metadataLines.push(`Condition: ${aiDetectedDetails.condition}`);
      if (aiTags.length > 0) metadataLines.push(`Tags: ${aiTags.join(', ')}`);
      if (securityDeposit && parseFloat(securityDeposit) > 0) metadataLines.push(`Security Deposit: ₹${securityDeposit}`);
      if (damageCompensation && parseFloat(damageCompensation) > 0) metadataLines.push(`Damage Compensation Limit: ₹${damageCompensation}`);
      
      if (metadataLines.length > 0) {
        finalDescription = (finalDescription ? finalDescription + '\n\n' : '') + '--- Item Details & Security Terms ---\n' + metadataLines.join('\n');
      }

      // Add item to central AppContext state & localStorage
      const coverImage = uploadedUrls[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800';
      const allImages = uploadedUrls.length > 0 ? uploadedUrls : [coverImage];

      try {
        await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            category,
            marketPrice: marketPrice ? parseFloat(marketPrice) : undefined,
            pricePerDay: parseFloat(pricePerDay),
            pricePerHour: pricePerHour ? parseFloat(pricePerHour) : undefined,
            penaltyPerDay: penaltyPerDay ? parseFloat(penaltyPerDay) : undefined,
            penaltyPerHour: penaltyPerHour ? parseFloat(penaltyPerHour) : undefined,
            description: finalDescription || undefined,
            source: publishTarget,
            distanceKm: 0.1,
            imageUrl: coverImage,
            imageUrls: JSON.stringify(allImages),
          }),
        });
      } catch (apiErr) {
        console.warn('API sync warning (continuing with client state):', apiErr);
      }

      setCreatedItemName(name.trim());
      setIsSuccess(true);
      setShowReview(false);
    } catch {
      setErrors({ general: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Badge variant="moss" className="mb-2 flex items-center gap-1.5 w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Snap & List</span>
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-ink">
          Share an Item with your Neighbourhood
        </h1>
        <p className="text-slate mt-1">
          Turn your idle tools, equipment, or cookware into extra income while helping your community. List in under 30 seconds with AI assistance!
        </p>
      </div>

      {isSuccess && (
        <div className="bg-moss/15 border-2 border-moss rounded-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-moss shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold text-lg text-ink">Item listed successfully!</h3>
              <p className="text-slate text-sm mt-1">
                Your item <strong>&quot;{createdItemName}&quot;</strong> is now live on the {publishTarget === 'NEIGHBOUR' ? 'neighbourhood browse feed' : 'online marketplace'}.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="primary" onClick={() => router.push('/browse')}>
              <span>View in Browse Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setName('');
                setMarketPrice('');
                setPricePerDay('');
                setPricePerHour('');
                setPenaltyPerDay('');
                setPenaltyPerHour('');
                setSecurityDeposit('');
                setDamageCompensation('');
                setDescription('');
                clearFiles();
                setIsSuccess(false);
                setShowReview(false);
              }}
            >
              List Another Item
            </Button>
          </div>
        </div>
      )}

      {/* AI SNAP & LIST BANNER */}
      {!isSuccess && !showReview && (
        <Card variant="interactive" className="p-6 sm:p-7 border-2 border-moss/40 bg-gradient-to-br from-moss/10 via-white to-amber-50/40 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-moss/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-moss animate-pulse" />
                <h2 className="font-display font-bold text-lg text-ink flex items-center gap-1.5">
                  ✨ AI Snap & List
                </h2>
                <span className="text-[10px] bg-moss text-white px-2 py-0.5 rounded-full font-data uppercase tracking-wider font-semibold">
                  Instant
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate">
                Snap a photo or upload up to 5 pictures. Our AI will auto-fill titles, categories, fair market pricing, and security terms!
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="shadow-sm bg-moss hover:bg-moss/90 text-white font-medium flex items-center gap-1.5"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
                <span>Snap with Camera</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-white hover:bg-slate-50 font-medium flex items-center gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-4 h-4 text-moss" />
                <span>Upload Images</span>
              </Button>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* AI Analyzing Spinner & Progress Badges */}
          {aiAnalyzing && (
            <div className="mt-5 pt-5 border-t border-moss/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-moss animate-spin" />
                <div>
                  <h4 className="text-sm font-display font-bold text-ink">AI Analyzing Images...</h4>
                  <p className="text-xs text-slate">Identifying item, checking lighting quality, and computing market rental rates.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-white text-moss border-moss/30 animate-pulse">
                  Scanning clarity...
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-white text-moss border-moss/30 animate-pulse">
                  Pricing estimation...
                </Badge>
              </div>
            </div>
          )}

          {/* AI Quality Check Warning */}
          {aiQualityWarning && (
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold block">Image Quality Notice</span>
                <span>{aiQualityWarning}</span>
              </div>
            </div>
          )}

          {/* AI Fallback Message */}
          {aiFallbackMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <span className="font-bold block">Manual Entry Required</span>
                <span>{aiFallbackMessage} Your uploaded images have been preserved below.</span>
              </div>
            </div>
          )}

          {/* AI Confidence Score Badge & Detected Metadata */}
          {aiConfidence !== null && !aiAnalyzing && (
            <div className="mt-5 pt-4 border-t border-moss/20 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Badge variant="moss" className="bg-moss text-white font-bold px-2.5 py-1 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Detection Accuracy: {aiConfidence}%</span>
                </Badge>
                {aiDetectedDetails?.brand && (
                  <span className="text-xs font-semibold text-ink bg-white px-2.5 py-1 rounded-lg border border-ink/10">
                    Brand: {aiDetectedDetails.brand}
                  </span>
                )}
                {aiDetectedDetails?.condition && (
                  <span className="text-xs font-semibold text-ink bg-white px-2.5 py-1 rounded-lg border border-ink/10">
                    Condition: {aiDetectedDetails.condition}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => triggerAiAnalysis(selectedFiles)}
                className="text-xs font-medium text-moss hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-analyze with AI</span>
              </button>
            </div>
          )}
        </Card>
      )}

      {/* FINAL REVIEW PAGE / MODAL */}
      {showReview && !isSuccess ? (
        <Card variant="default" className="p-6 sm:p-8 space-y-8 border-2 border-moss shadow-md animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-ink/10">
            <div>
              <Badge variant="moss" className="mb-1">Step 2 of 2</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-ink flex items-center gap-2">
                ✨ Final Listing Review
              </h2>
              <p className="text-slate text-sm mt-1">
                Verify and fine-tune any AI-generated details before publishing your item live.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowReview(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {errors.general && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Review Form Grid */}
          <div className="space-y-6">
            {/* Image Preview inside Review */}
            <div className="space-y-2">
              <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-moss" />
                <span>Item Photos ({previewUrls.length})</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-moss group bg-ink/5 flex-shrink-0">
                    <img src={url} alt={`Review ${i}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-moss text-white text-[8px] text-center py-0.5 font-data font-bold">
                        COVER
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Title & Category in Review */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Item Title & Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              <div className="space-y-1.5">
                <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-moss" />
                  <span>Category *</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Publish Section Selector */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="font-display font-bold text-sm text-ink flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-moss" />
                <span>Publish Target Section</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPublishTarget('NEIGHBOUR')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                    publishTarget === 'NEIGHBOUR'
                      ? 'border-moss bg-moss/10 text-ink shadow-sm'
                      : 'border-ink/10 bg-white text-slate hover:border-ink/30'
                  }`}
                >
                  <Users className={`w-5 h-5 shrink-0 mt-0.5 ${publishTarget === 'NEIGHBOUR' ? 'text-moss' : 'text-slate'}`} />
                  <div>
                    <span className="font-display font-bold text-sm block">Neighbourhood Feed</span>
                    <span className="text-xs text-slate block mt-0.5">Local community borrowing within your immediate vicinity.</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPublishTarget('ONLINE')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                    publishTarget === 'ONLINE'
                      ? 'border-moss bg-moss/10 text-ink shadow-sm'
                      : 'border-ink/10 bg-white text-slate hover:border-ink/30'
                  }`}
                >
                  <Globe className={`w-5 h-5 shrink-0 mt-0.5 ${publishTarget === 'ONLINE' ? 'text-moss' : 'text-slate'}`} />
                  <div>
                    <span className="font-display font-bold text-sm block">Online Marketplace</span>
                    <span className="text-xs text-slate block mt-0.5">Wide reach across the city with doorstep delivery options.</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Pricing Summary in Review */}
            <div className="bg-moss/5 p-4 rounded-xl border border-moss/20 space-y-4">
              <h3 className="text-sm font-display font-bold text-moss flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Market Value & Rental Pricing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Market Price (₹)"
                  type="number"
                  step="0.01"
                  min="1"
                  value={marketPrice}
                  onChange={(e) => handleMarketPriceChange(e.target.value)}
                  error={errors.marketPrice}
                />
                <Input
                  label="Price Per Day (₹) *"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  error={errors.pricePerDay}
                />
                <Input
                  label="Price Per Hour (₹)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  error={errors.pricePerHour}
                />
              </div>
            </div>

            {/* Security & Penalties in Review */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-4">
              <h3 className="text-sm font-display font-bold text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" /> Security Deposit & Late Penalties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Security Deposit (₹)"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="2000"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                />
                <Input
                  label="Late Penalty / Day (₹)"
                  type="number"
                  step="1"
                  min="0"
                  value={penaltyPerDay}
                  onChange={(e) => setPenaltyPerDay(e.target.value)}
                  error={errors.penaltyPerDay}
                />
                <Input
                  label="Damage Limit (₹)"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="8000"
                  value={damageCompensation}
                  onChange={(e) => setDamageCompensation(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-amber-800">These protective terms will be displayed to borrowers before they confirm their request.</p>
            </div>

            {/* Description & Tags in Review */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-moss" />
                  <span>Description</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe condition, included accessories, and pickup instructions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss"
                />
              </div>

              {aiTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-xs text-slate font-medium">Suggested Tags:</span>
                  {aiTags.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-white text-ink border-ink/20">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Review Actions */}
          <div className="pt-6 border-t border-ink/10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Button type="button" variant="ghost" onClick={() => setShowReview(false)}>
              ← Back to Edit Details
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-md bg-moss hover:bg-moss/90 text-white font-bold px-8"
              isLoading={isSubmitting}
              onClick={handleSubmit}
            >
              <PlusCircle className="w-5 h-5 mr-1.5" />
              <span>Confirm & Publish Now</span>
            </Button>
          </div>
        </Card>
      ) : !isSuccess ? (
        /* MAIN LISTING FORM */
        <Card variant="default" className="p-6 sm:p-8 space-y-6">
          {errors.general && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleProceedToReview} className="space-y-6">
            
            {/* Image Upload Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-moss" />
                  <span>Item Photos (Up to 5)</span>
                </label>
                {selectedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={clearFiles}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Clear Photos
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-ink/10 group bg-ink/5 flex-shrink-0">
                    <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-moss text-white text-[9px] text-center py-0.5 font-data font-bold">
                        COVER
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 bg-ink/80 hover:bg-ink text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {previewUrls.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-ink/20 bg-ink/5 flex flex-col items-center justify-center cursor-pointer hover:bg-ink/10 transition-colors group flex-shrink-0"
                  >
                    <UploadCloud className="w-5 h-5 text-slate mb-1 group-hover:text-moss transition-colors" />
                    <span className="text-[10px] text-slate font-medium">Add Photo</span>
                  </div>
                )}
              </div>
              
              {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file}</p>}
            </div>

            {/* Item Name */}
            <Input
              label="Item Name *"
              placeholder="e.g. Bosch High-Pressure Washer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <div className="space-y-1.5">
              <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-moss" />
                <span>Category *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-ink/10">
              <div className="space-y-4">
                <div className="bg-moss/5 p-4 rounded-xl border border-moss/20">
                  <Input
                    label="Current Market Value (₹)"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="8000"
                    value={marketPrice}
                    onChange={(e) => handleMarketPriceChange(e.target.value)}
                    error={errors.marketPrice}
                    helperText="Enter the approximate current value. Rental prices will be auto-calculated (Market ÷ 8)."
                  />
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Price Per Day (₹) *"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="1000"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    error={errors.pricePerDay}
                  />
                  <Input
                    label="Price Per Hour (₹)"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="125"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    error={errors.pricePerHour}
                  />
                </div>
              </div>
            </div>

            {/* Penalty & Security Grid */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-4">
              <h3 className="text-sm font-display font-bold text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" /> Security Deposit & Late Return Penalties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Security Deposit (₹)"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="2000"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                />
                <Input
                  label="Penalty Per Day (₹)"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="700"
                  value={penaltyPerDay}
                  onChange={(e) => setPenaltyPerDay(e.target.value)}
                  error={errors.penaltyPerDay}
                />
                <Input
                  label="Damage Limit (₹)"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="8000"
                  value={damageCompensation}
                  onChange={(e) => setDamageCompensation(e.target.value)}
                />
              </div>
              <p className="text-xs text-amber-700">Optional. Displays to borrowers before confirming request to encourage on-time returns and item protection.</p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-display font-medium text-sm text-ink flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-moss" />
                <span>Description</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe condition, included accessories, and pickup instructions..."
                className="w-full px-4 py-2.5 rounded-xl border border-ink/20 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-moss placeholder:text-slate/60"
              />
            </div>

            {/* Submit / Review Button */}
            <div className="pt-4 border-t border-ink/10 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push('/browse')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="lg" className="shadow-sm bg-moss hover:bg-moss/90 text-white font-bold px-6">
                <span>Review & Publish Listing</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
