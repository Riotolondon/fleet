import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Vehicle } from '../services/vehicleService';
import { applicationService, NewApplicationData } from '../services/applicationService';
import { useAuth } from '../contexts/AuthContext';

interface VehicleApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSuccess: () => void;
}

const VehicleApplicationModal: React.FC<VehicleApplicationModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    experience: '',
    platforms: [] as string[],
    documents: [] as string[]
  });

  const platformOptions = ['Uber', 'Bolt', 'InDrive', 'DiDi', 'Other'];
  const documentOptions = ['Driver\'s License', 'PDP (Professional Driving Permit)', 'ID Document', 'Bank Statement', 'Proof of Address', 'Criminal Clearance'];

  const handlePlatformChange = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleDocumentChange = (document: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.includes(document)
        ? prev.documents.filter(d => d !== document)
        : [...prev.documents, document]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !vehicle) {
      alert('Please log in to submit an application');
      return;
    }

    if (!formData.message.trim() || !formData.experience.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.platforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (formData.documents.length === 0) {
      alert('Please select at least one document type');
      return;
    }

    setLoading(true);

    try {
      const applicationData: NewApplicationData = {
        vehicleId: vehicle.id,
        message: formData.message.trim(),
        experience: formData.experience.trim(),
        platforms: formData.platforms,
        documents: formData.documents
      };

      await applicationService.submitApplication(applicationData, user.id);
      
      console.log('✅ Application submitted successfully');
      
      // Reset form
      setFormData({
        message: '',
        experience: '',
        platforms: [],
        documents: []
      });
      
      onSuccess();
      onClose();
      alert('Application submitted successfully! The vehicle owner will be notified.');
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Apply to Rent Vehicle</h2>
              <p className="text-sm text-gray-600 mt-1">
                {vehicle.make} ({vehicle.year}) • R{vehicle.weeklyRate}/week
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Owner *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell the owner why you're interested in this vehicle and any relevant information..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driving Experience *
            </label>
            <input
              type="text"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              placeholder="e.g., 3 years, 6 months, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ride-hailing Platforms * (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {platformOptions.map((platform) => (
                <label key={platform} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes(platform)}
                    onChange={() => handlePlatformChange(platform)}
                    className="text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Documents * (Select all that you have)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {documentOptions.map((document) => (
                <label key={document} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={formData.documents.includes(document)}
                    onChange={() => handleDocumentChange(document)}
                    className="text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{document}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleApplicationModal; 