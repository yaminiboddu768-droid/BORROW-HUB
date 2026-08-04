'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/lib/AppContext';
import { CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

const STEPS = [
  'Business Info',
  'Address',
  'Identity Verification',
  'Media & Photos',
  'Payment & Policies',
];

export default function PartnerRegistrationPage() {
  const router = useRouter();
  const { addToast } = useApp();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Account & Business Info
    email: '',
    password: '',
    businessName: '',
    ownerName: '',
    phone: '',
    category: 'Tools & Equipment',
    
    // Address
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Identity Verification
    aadhaarUrl: '',
    panUrl: '',
    gstNumber: '',

    // Business Photos
    logoUrl: '',
    shopPhotoUrl: '',
    
    // Payment & Policies
    bankAccount: '',
    ifscCode: '',
    upiId: '',
    rentalPolicy: 'Standard 24-hour rental period with flexible extension.',
    damagePolicy: 'Renter covers repair cost for physical damages.',
    returnPolicy: 'Return by 6 PM on the final rental date.',
    agreedToTerms: false,
  });

  const updateForm = (key: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.businessName || !formData.ownerName) {
      addToast('Error', 'Please fill all required fields.', 'error');
      return;
    }
    if (!formData.agreedToTerms) {
      addToast('Error', 'You must agree to the platform terms.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/partner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        let errorMsg = 'Failed to register';
        try {
          const data = await res.json();
          if (data.error) errorMsg = data.error;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      // Auto login the user
      await signIn('credentials', {
        email: formData.email.toLowerCase(),
        password: formData.password,
        loginType: 'partner',
        redirect: false,
      });

      // Show Submission Status screen
      setIsSubmitted(true);
      setIsLoading(false);

    } catch (error: any) {
      addToast('Registration Failed', error.message || 'Please try again later.', 'error');
      setIsLoading(false);
    }
  };

  const handleProceedToDashboard = () => {
    addToast('Status Approved (Simulated)', 'Welcome to Borrow Hub Business Partner Dashboard!');
    router.push('/partner/dashboard');
    router.refresh();
  };

  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 animate-in fade-in zoom-in-95">
        <Card variant="default" className="p-8 text-center space-y-6 shadow-xl border border-slate-100">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-display text-ink">Application Submitted Successfully</h1>
            <p className="text-slate text-sm">
              Your request has been sent to Borrow Hub Admin.
            </p>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-left">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase tracking-wider">
              <span>Status</span>
              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">Pending Verification</span>
            </div>
            <p className="text-xs text-amber-800">
              Admin is reviewing your details (Aadhaar, PAN, & Business Address).
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 text-left space-y-1">
            <span className="font-bold">🧪 Development Testing Mode:</span>
            <p className="text-blue-800">
              Simulating automatic Admin Approval to let you test the Business Dashboard workflow immediately.
            </p>
          </div>

          <Button
            variant="accent"
            size="lg"
            className="w-full font-bold flex items-center justify-center gap-2"
            onClick={handleProceedToDashboard}
          >
            <span>Proceed to Business Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-ink">Business Partner Registration</h1>
          <p className="text-slate text-sm mt-2">
            Register your business on Borrow Hub to list inventory and manage rentals.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/login')}>
          Back to Login
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto hide-scrollbar py-2">
        {STEPS.map((step, index) => (
          <div key={step} className="flex flex-col items-center flex-1 relative min-w-[100px]">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
                index <= currentStep ? 'bg-marigold text-ink' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
            </div>
            <span
              className={`text-xs mt-2 font-medium text-center ${
                index <= currentStep ? 'text-ink' : 'text-slate-400'
              }`}
            >
              {step}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-1 -z-0 ${
                  index < currentStep ? 'bg-marigold' : 'bg-slate-100'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card variant="default" className="p-6 sm:p-8">
        {/* Step 1: Business Information */}
        {currentStep === 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-ink mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Business Email *"
                type="email"
                placeholder="you@business.com"
                value={formData.email}
                onChange={(e) => updateForm('email', e.target.value)}
              />
              <Input
                label="Password *"
                type="password"
                placeholder="Create password"
                value={formData.password}
                onChange={(e) => updateForm('password', e.target.value)}
              />
              <Input
                label="Business Name *"
                placeholder="e.g. Ace Equipment Rentals"
                value={formData.businessName}
                onChange={(e) => updateForm('businessName', e.target.value)}
              />
              <Input
                label="Owner Name *"
                placeholder="Full name"
                value={formData.ownerName}
                onChange={(e) => updateForm('ownerName', e.target.value)}
              />
              <Input
                label="Phone Number"
                placeholder="Mobile number"
                value={formData.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-ink">Business Category</label>
                <select
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-marigold"
                  value={formData.category}
                  onChange={(e) => updateForm('category', e.target.value)}
                >
                  <option>Tools & Equipment</option>
                  <option>Electronics & Gadgets</option>
                  <option>Party & Event Rentals</option>
                  <option>Sports & Outdoor Gear</option>
                  <option>Heavy Machinery</option>
                  <option>General Inventory</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-ink mb-4">Business Address</h2>
            <Input
              label="Business Address *"
              placeholder="Street address, shop number, building"
              value={formData.address}
              onChange={(e) => updateForm('address', e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={(e) => updateForm('city', e.target.value)}
              />
              <Input
                label="State"
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={(e) => updateForm('state', e.target.value)}
              />
              <Input
                label="PIN Code"
                placeholder="e.g. 400001"
                value={formData.pincode}
                onChange={(e) => updateForm('pincode', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Identity Verification */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-ink mb-4">Identity Verification</h2>
            <p className="text-sm text-slate mb-4">
              Provide government identification for verification.
            </p>
            <div className="space-y-4">
              <Input
                label="Aadhaar Card Number / Document URL"
                placeholder="Enter Aadhaar number or image link"
                value={formData.aadhaarUrl}
                onChange={(e) => updateForm('aadhaarUrl', e.target.value)}
              />
              <Input
                label="PAN Card Number / Document URL"
                placeholder="Enter PAN number or image link"
                value={formData.panUrl}
                onChange={(e) => updateForm('panUrl', e.target.value)}
              />
              <Input
                label="GST Number (Optional)"
                placeholder="e.g. 22AAAAA0000A1Z5"
                value={formData.gstNumber}
                onChange={(e) => updateForm('gstNumber', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Media & Photos */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-ink mb-4">Business Branding & Photos</h2>
            <div className="space-y-4">
              <Input
                label="Business Logo URL"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={(e) => updateForm('logoUrl', e.target.value)}
              />
              <Input
                label="Shop / Premises Photo URL"
                placeholder="https://example.com/shop.jpg"
                value={formData.shopPhotoUrl}
                onChange={(e) => updateForm('shopPhotoUrl', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 5: Payment & Policies */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-ink mb-4">Payment & Rental Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Bank Account Number"
                placeholder="Account number"
                value={formData.bankAccount}
                onChange={(e) => updateForm('bankAccount', e.target.value)}
              />
              <Input
                label="IFSC Code"
                placeholder="e.g. SBIN0001234"
                value={formData.ifscCode}
                onChange={(e) => updateForm('ifscCode', e.target.value)}
              />
              <Input
                label="UPI ID"
                placeholder="e.g. business@upi"
                value={formData.upiId}
                onChange={(e) => updateForm('upiId', e.target.value)}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-ink">Rental Policy</label>
              <textarea
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marigold/50 text-sm h-20"
                value={formData.rentalPolicy}
                onChange={(e) => updateForm('rentalPolicy', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-ink">Damage Policy</label>
              <textarea
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-marigold/50 text-sm h-20"
                value={formData.damagePolicy}
                onChange={(e) => updateForm('damagePolicy', e.target.value)}
              />
            </div>

            <label className="flex items-start gap-3 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 text-marigold border-slate-300 rounded focus:ring-marigold"
                checked={formData.agreedToTerms}
                onChange={(e) => updateForm('agreedToTerms', e.target.checked)}
              />
              <span className="text-sm text-slate-700">
                I confirm that all provided business details are accurate and agree to Borrow Hub Terms.
              </span>
            </label>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button variant="accent" onClick={nextStep}>
              Next Step
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="accent"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!formData.agreedToTerms}
            >
              Submit Application
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
