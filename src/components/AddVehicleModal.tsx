import React, { useState, useEffect } from 'react';
import { X, Car, CheckCircle } from 'lucide-react';
import { vehicleService, NewVehicleData } from '../services/vehicleService';
import { useAuth } from '../contexts/AuthContext';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<NewVehicleData>({
    make: '',
    year: new Date().getFullYear(),
    plate: '',
    weeklyRate: 0,
    location: '',
    features: [],
    image: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Test Firestore connection when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      console.log('🔍 Testing Firestore connection...');
      vehicleService.testConnection().then(result => {
        console.log('Connection test result:', result);
        if (result && user?.id) {
          vehicleService.testWrite(user.id).then(writeResult => {
            console.log('Write test result:', writeResult);
          });
        }
      });
    }
  }, [isOpen, user?.id]);

  const availableFeatures = [
    'GPS', 'Air Con', 'Bluetooth', 'USB Charging', 'Manual', 'Automatic', 
    'Fuel Efficient', 'Leather Seats', 'Sunroof', 'Parking Sensors', 
    'Reverse Camera', 'Heated Seats'
  ];

  const sampleImages = [
    'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    'https://images.pexels.com/photos/2127733/pexels-photo-2127733.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weeklyRate' || name === 'year' ? Number(value) : value
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted!', { user: user?.id, formData });
    
    if (!user?.id) {
      console.error('❌ No user ID found');
      setError('You must be logged in to add a vehicle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.make || !formData.plate || !formData.location || formData.weeklyRate <= 0) {
        throw new Error('Please fill in all required fields');
      }

      // Add default image if none provided
      const vehicleData = {
        ...formData,
        image: formData.image || sampleImages[Math.floor(Math.random() * sampleImages.length)]
      };

      console.log('📝 Submitting vehicle data:', vehicleData);
      console.log('👤 User ID:', user.id);

      const vehicleId = await vehicleService.addVehicle(vehicleData, user.id);
      console.log('✅ Vehicle added successfully with ID:', vehicleId);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        onSuccess?.();
        // Reset form
        setFormData({
          make: '',
          year: new Date().getFullYear(),
          plate: '',
          weeklyRate: 0,
          location: '',
          features: [],
          image: '',
          description: ''
        });
      }, 2000);
    } catch (error: unknown) {
      console.error('❌ Vehicle submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add vehicle';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Vehicle Added Successfully!</h3>
          <p className="text-gray-600 mb-4">
            Your vehicle has been posted and all users have been notified.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Closing in a moment...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Car className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Add New Vehicle</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Make & Model *
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                placeholder="e.g., Toyota Corolla Quest"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="2000"
                max={new Date().getFullYear() + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Plate *
              </label>
              <input
                type="text"
                name="plate"
                value={formData.plate}
                onChange={handleInputChange}
                placeholder="e.g., CA 123-456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekly Rate (R) *
              </label>
              <input
                type="number"
                name="weeklyRate"
                value={formData.weeklyRate}
                onChange={handleInputChange}
                min="0"
                step="10"
                placeholder="e.g., 1200"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Sandton, Johannesburg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFeatures.map((feature) => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (optional)
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleInputChange}
              placeholder="https://example.com/car-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use a random sample image
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional details about the vehicle..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Adding Vehicle...' : 'Add Vehicle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal; 