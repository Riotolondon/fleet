import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Fuel, 
  ArrowLeft,
  Maximize2,
  Search,
  RefreshCw
} from 'lucide-react';

const VehicleTracking = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const vehicles = [
    {
      id: 1,
      make: "Toyota Corolla Quest",
      plate: "CA 123-456",
      driver: "Sipho Mthembu",
      status: "moving",
      location: { lat: -26.2041, lng: 28.0473, address: "Sandton City, Johannesburg" },
      speed: 45,
      fuel: 75,
      lastUpdate: "2 min ago",
      route: "Sandton → OR Tambo Airport",
      eta: "15 min"
    },
    {
      id: 2,
      make: "Hyundai Grand i10",
      plate: "GP 789-012",
      driver: "Nomsa Dlamini",
      status: "idle",
      location: { lat: -26.1367, lng: 28.0835, address: "Rosebank Mall, Johannesburg" },
      speed: 0,
      fuel: 45,
      lastUpdate: "5 min ago",
      route: null,
      eta: null
    },
    {
      id: 3,
      make: "Suzuki Swift",
      plate: "WC 345-678",
      driver: null,
      status: "parked",
      location: { lat: -33.9249, lng: 18.4241, address: "Cape Town CBD" },
      speed: 0,
      fuel: 90,
      lastUpdate: "1 hour ago",
      route: null,
      eta: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'parked': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'moving': return 'Moving';
      case 'idle': return 'Idle';
      case 'parked': return 'Parked';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/owner-dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Vehicle Tracking</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Fleet Status</h2>
                  <span className="text-sm text-gray-500">{vehicles.length} vehicles</span>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900">{vehicle.make}</h3>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(vehicle.status)}`}></div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{vehicle.plate}</p>
                        <p className="text-sm text-gray-600">{vehicle.driver || 'No driver assigned'}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          vehicle.status === 'moving' ? 'bg-green-100 text-green-800' :
                          vehicle.status === 'idle' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(vehicle.status)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{vehicle.lastUpdate}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Navigation className="w-3 h-3" />
                        <span>{vehicle.speed} km/h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Fuel className="w-3 h-3" />
                        <span>{vehicle.fuel}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Container */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Live Map</h2>
              </div>
              <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-b-xl relative overflow-hidden">
                {/* Mock Map Interface */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map</h3>
                    <p className="text-gray-600 max-w-md">
                      Real-time GPS tracking with Google Maps integration. 
                      View vehicle locations, routes, and geofencing alerts.
                    </p>
                  </div>
                </div>
                
                {/* Mock Vehicle Markers */}
                <div className="absolute top-20 left-32 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div className="absolute top-40 right-40 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute bottom-32 left-20 w-4 h-4 bg-gray-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>
            </div>

            {/* Vehicle Details */}
            {selectedVehicle && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedVehicle.make}</h3>
                      <p className="text-gray-500">{selectedVehicle.plate}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedVehicle.status === 'moving' ? 'bg-green-100 text-green-800' :
                      selectedVehicle.status === 'idle' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(selectedVehicle.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Navigation className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedVehicle.speed}</p>
                      <p className="text-sm text-gray-500">km/h</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Fuel className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedVehicle.fuel}%</p>
                      <p className="text-sm text-gray-500">Fuel Level</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedVehicle.eta || '--'}</p>
                      <p className="text-sm text-gray-500">ETA</p>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <MapPin className="w-6 h-6 text-orange-600" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">Current</p>
                      <p className="text-sm text-gray-500">Location</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Driver Information</h4>
                        <p className="text-gray-600">{selectedVehicle.driver || 'No driver assigned'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Current Location</h4>
                        <p className="text-gray-600">{selectedVehicle.location.address}</p>
                      </div>
                      {selectedVehicle.route && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Current Route</h4>
                          <p className="text-gray-600">{selectedVehicle.route}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Last Update</h4>
                        <p className="text-gray-600">{selectedVehicle.lastUpdate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleTracking;