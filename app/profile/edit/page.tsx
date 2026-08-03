'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { User, Mail, Phone, MapPin, Camera, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, we'd update the session and database here
    
    setIsSaving(false);
    setShowSuccess(true);
    
    // Hide success message and redirect after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      // Optional: redirect back to home or previous page
      // router.push('/');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-ink">Edit Profile</h1>
          <p className="text-slate mt-2">Update your personal information and contact details.</p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-moss/20 border border-moss rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-moss" />
            <p className="text-moss font-medium">Profile updated successfully.</p>
          </div>
        )}

        <div className="bg-white dark:bg-ink/5 rounded-3xl shadow-sm border border-ink/10 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            {/* Profile Photo Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-ink/10">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                <div className="w-24 h-24 rounded-full bg-ink/10 border-4 border-paper flex items-center justify-center overflow-hidden">
                  {photoPreview || session?.user?.image ? (
                    <img src={photoPreview || session?.user?.image!} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate" />
                  )}
                </div>
                <div className="absolute inset-0 bg-ink/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-paper" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-ink text-lg">Profile Photo</h3>
                <p className="text-sm text-slate mb-3">Upload a clear photo so neighbours can recognize you.</p>
                <button type="button" onClick={handlePhotoClick} className="px-4 py-2 text-sm font-medium bg-ink/5 hover:bg-ink/10 text-ink rounded-xl transition-colors">
                  Change Photo
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-ink mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-ink/20 focus:ring-marigold'} rounded-xl bg-transparent text-ink placeholder-slate/50 focus:outline-none focus:ring-2`}
                    placeholder="Jane Doe"
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-ink mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-ink/20 focus:ring-marigold'} rounded-xl bg-transparent text-ink placeholder-slate/50 focus:outline-none focus:ring-2`}
                    placeholder="jane@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-ink mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-ink/20 focus:ring-marigold'} rounded-xl bg-transparent text-ink placeholder-slate/50 focus:outline-none focus:ring-2`}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                {errors.phone && <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-bold text-ink mb-1.5">
                  Address (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-ink/20 rounded-xl bg-transparent text-ink placeholder-slate/50 focus:outline-none focus:ring-2 focus:ring-marigold"
                    placeholder="123 Main St, Anytown"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate">This helps us show you items from nearby neighbours.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-ink/10">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 py-3 border border-ink/20 text-ink font-medium rounded-xl hover:bg-ink/5 transition-colors focus:outline-none focus:ring-2 focus:ring-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-3 bg-marigold text-ink font-bold rounded-xl hover:bg-marigold-hover transition-colors focus:outline-none focus:ring-2 focus:ring-marigold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
