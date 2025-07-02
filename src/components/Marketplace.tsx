import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Car,
  MapPin,
  Star,
  User,
  Search,
  Filter,
  Plus,
  Eye,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { vehicleService, Vehicle } from '../services/vehicleService';
import { useAuth } from '../contexts/AuthContext';
import VehicleApplicationModal from './VehicleApplicationModal';

const Marketplace = () => {
  const { user } = useAuth();
  
  // Restrict access to drivers only
  if (user?.role !== 'driver') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-600 mb-6">
            The vehicle marketplace is only available to drivers. 
            {user?.role === 'owner' ? ' As a fleet owner, you can manage your vehicles through your dashboard.' : ''}
          </p>
          <Link 
            to={user?.role === 'owner' ? '/owner-dashboard' : '/dashboard'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // Get tab from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'listings';
  const [activeTab, setActiveTab] = useState(initialTab);
  // Set view mode to driver since only drivers can access this
  const viewMode = 'driver';
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedVehicleForApplication, setSelectedVehicleForApplication] = useState<Vehicle | null>(null);

  // Subscribe to vehicles data
  useEffect(() => {
    const unsubscribe = vehicleService.subscribeToVehicles((vehicleData) => {
      setVehicles(vehicleData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);



  // Handle vehicle application
  const handleApplyToVehicle = (vehicle: Vehicle) => {
    if (!user?.id) {
      alert('Please log in to apply for vehicles');
      return;
    }
    setSelectedVehicleForApplication(vehicle);
    setShowApplicationModal(true);
  };



  // Format date for display
  const formatDate = (timestamp: unknown) => {
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
      return (timestamp as any).toDate().toLocaleDateString();
    }
    return 'Unknown date';
  };

  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Vehicle['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'rented': return <User className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/driver-dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Vehicle Marketplace</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Drivers cannot add vehicle listings */}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-8 border-b">
          {[
            { id: 'listings', label: 'Available Vehicles', icon: Car },
            { id: 'messages', label: 'Messages', icon: MessageCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Vehicle Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles by make, model, or location..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                  <p className="text-gray-500">Be the first to add a vehicle listing!</p>
                </div>
              ) : vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden">
                  <div className="relative">
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.make}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1 capitalize">{vehicle.status}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{vehicle.make}</h3>
                        <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.plate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">R{vehicle.weeklyRate}</p>
                        <p className="text-xs text-gray-500">per week</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {vehicle.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {vehicle.ownerName}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                        {vehicle.rating} rating
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {vehicle.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                        {vehicle.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                            +{vehicle.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleApplyToVehicle(vehicle)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          vehicle.status === 'available'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={vehicle.status !== 'available'}
                      >
                        {vehicle.status === 'available' ? 'Apply Now' : 'Not Available'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
            <p className="text-gray-600">Direct messaging system between fleet owners and drivers coming soon...</p>
          </div>
        )}
      </div>



      {/* Vehicle Application Modal */}
      <VehicleApplicationModal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedVehicleForApplication(null);
        }}
        vehicle={selectedVehicleForApplication}
        onSuccess={() => {
          // Applications will update automatically via the subscription
        }}
      />
    </div>
  );
};

export default Marketplace;