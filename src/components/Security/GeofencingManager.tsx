import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  MapPin,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Shield,
  Clock,
  Car,
  Settings,
  Bell,
  Navigation,
  Zap
} from 'lucide-react';

interface GeofenceZone {
  id: string;
  name: string;
  type: 'circular' | 'polygon';
  center: { lat: number; lng: number };
  radius?: number; // for circular zones
  coordinates?: { lat: number; lng: number }[]; // for polygon zones
  vehicleIds: string[];
  active: boolean;
  alertTypes: ('entry' | 'exit' | 'speed' | 'time')[];
  timeRestrictions?: {
    allowedHours: { start: string; end: string };
    allowedDays: number[]; // 0-6, Sunday-Saturday
  };
  speedLimit?: number;
  createdAt: string;
}

interface GeofenceAlert {
  id: string;
  zoneId: string;
  vehicleId: string;
  type: 'entry' | 'exit' | 'speed' | 'time' | 'theft';
  timestamp: string;
  location: { lat: number; lng: number };
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  description: string;
}

const GeofencingManager = () => {
  const [activeTab, setActiveTab] = useState('zones');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const vehicles = [
    { id: '1', make: 'Toyota Corolla Quest', plate: 'CA 123-456', driver: 'Sipho Mthembu' },
    { id: '2', make: 'Hyundai Grand i10', plate: 'GP 789-012', driver: 'Nomsa Dlamini' },
    { id: '3', make: 'Suzuki Swift', plate: 'WC 345-678', driver: null }
  ];

  const geofenceZones: GeofenceZone[] = [
    {
      id: '1',
      name: 'Johannesburg CBD',
      type: 'circular',
      center: { lat: -26.2041, lng: 28.0473 },
      radius: 5000,
      vehicleIds: ['1', '2'],
      active: true,
      alertTypes: ['entry', 'exit'],
      timeRestrictions: {
        allowedHours: { start: '06:00', end: '22:00' },
        allowedDays: [1, 2, 3, 4, 5, 6] // Monday to Saturday
      },
      createdAt: '2025-01-10'
    },
    {
      id: '2',
      name: 'OR Tambo Airport',
      type: 'circular',
      center: { lat: -26.1367, lng: 28.2411 },
      radius: 2000,
      vehicleIds: ['1'],
      active: true,
      alertTypes: ['entry', 'exit', 'time'],
      speedLimit: 60,
      createdAt: '2025-01-12'
    },
    {
      id: '3',
      name: 'Restricted Area - Hillbrow',
      type: 'polygon',
      center: { lat: -26.1875, lng: 28.0496 },
      coordinates: [
        { lat: -26.1850, lng: 28.0450 },
        { lat: -26.1850, lng: 28.0550 },
        { lat: -26.1900, lng: 28.0550 },
        { lat: -26.1900, lng: 28.0450 }
      ],
      vehicleIds: ['1', '2', '3'],
      active: true,
      alertTypes: ['entry'],
      createdAt: '2025-01-08'
    }
  ];

  const recentAlerts: GeofenceAlert[] = [
    {
      id: '1',
      zoneId: '1',
      vehicleId: '1',
      type: 'exit',
      timestamp: '2025-01-15T14:30:00Z',
      location: { lat: -26.2041, lng: 28.0473 },
      severity: 'medium',
      acknowledged: false,
      description: 'Vehicle CA 123-456 exited Johannesburg CBD zone'
    },
    {
      id: '2',
      zoneId: '3',
      vehicleId: '2',
      type: 'entry',
      timestamp: '2025-01-15T12:15:00Z',
      location: { lat: -26.1875, lng: 28.0496 },
      severity: 'high',
      acknowledged: true,
      description: 'Vehicle GP 789-012 entered restricted area - Hillbrow'
    },
    {
      id: '3',
      zoneId: '2',
      vehicleId: '1',
      type: 'speed',
      timestamp: '2025-01-15T10:45:00Z',
      location: { lat: -26.1367, lng: 28.2411 },
      severity: 'low',
      acknowledged: true,
      description: 'Vehicle CA 123-456 exceeded speed limit (75 km/h in 60 km/h zone)'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'entry': return <MapPin className="w-4 h-4" />;
      case 'exit': return <Navigation className="w-4 h-4" />;
      case 'speed': return <Zap className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      case 'theft': return <AlertTriangle className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <h1 className="text-xl font-semibold text-gray-900">Geo-Fencing & Security</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Zone</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-8 mb-8 border-b">
          {[
            { id: 'zones', label: 'Geofence Zones', icon: MapPin },
            { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle },
            { id: 'settings', label: 'Security Settings', icon: Settings }
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

        {/* Geofence Zones Tab */}
        {activeTab === 'zones' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Zone List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Active Zones</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {geofenceZones.map((zone) => (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(zone.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedZone === zone.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{zone.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${zone.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            zone.type === 'circular' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {zone.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {zone.vehicleIds.length} vehicle{zone.vehicleIds.length !== 1 ? 's' : ''} assigned
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {zone.alertTypes.map((type) => (
                          <span key={type} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {getAlertTypeIcon(type)}
                            <span className="ml-1 capitalize">{type}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Map and Zone Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Map Container */}
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Geofence Map</h3>
                </div>
                <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-b-xl relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Geofence Map</h3>
                      <p className="text-gray-600 max-w-md">
                        Visual representation of geofence zones with real-time vehicle positions.
                        Click and drag to create new zones or modify existing ones.
                      </p>
                    </div>
                  </div>
                  
                  {/* Mock Geofence Zones */}
                  <div className="absolute top-20 left-32 w-24 h-24 border-4 border-blue-500 border-dashed rounded-full opacity-60"></div>
                  <div className="absolute top-40 right-40 w-32 h-20 border-4 border-red-500 border-dashed opacity-60"></div>
                  <div className="absolute bottom-32 left-20 w-20 h-20 border-4 border-green-500 border-dashed opacity-60"></div>
                  
                  {/* Mock Vehicle Markers */}
                  <div className="absolute top-28 left-40 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute top-48 right-48 w-3 h-3 bg-green-600 rounded-full border-2 border-white shadow-lg"></div>
                </div>
              </div>

              {/* Zone Details */}
              {selectedZone && (() => {
                const zone = geofenceZones.find(z => z.id === selectedZone);
                if (!zone) return null;

                return (
                  <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-6 border-b flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Active</span>
                          <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            zone.active ? 'bg-blue-600' : 'bg-gray-200'
                          }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              zone.active ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Zone Configuration</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium capitalize">{zone.type}</span>
                            </div>
                            {zone.radius && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Radius:</span>
                                <span className="font-medium">{(zone.radius / 1000).toFixed(1)} km</span>
                              </div>
                            )}
                            {zone.speedLimit && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Speed Limit:</span>
                                <span className="font-medium">{zone.speedLimit} km/h</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Created:</span>
                              <span className="font-medium">{zone.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Alert Types</h4>
                          <div className="space-y-2">
                            {zone.alertTypes.map((type) => (
                              <div key={type} className="flex items-center space-x-2">
                                {getAlertTypeIcon(type)}
                                <span className="text-sm capitalize">{type} alerts</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Assigned Vehicles</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {zone.vehicleIds.map((vehicleId) => {
                            const vehicle = vehicles.find(v => v.id === vehicleId);
                            if (!vehicle) return null;
                            
                            return (
                              <div key={vehicleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <Car className="w-4 h-4 text-gray-600" />
                                  <div>
                                    <span className="font-medium text-gray-900">{vehicle.make}</span>
                                    <span className="text-gray-500 ml-2">({vehicle.plate})</span>
                                  </div>
                                </div>
                                <span className="text-sm text-gray-600">{vehicle.driver || 'No driver'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {zone.timeRestrictions && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Time Restrictions</h4>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Allowed Hours:</span>
                              <span className="font-medium">
                                {zone.timeRestrictions.allowedHours.start} - {zone.timeRestrictions.allowedHours.end}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Allowed Days:</span>
                              <span className="font-medium">
                                {zone.timeRestrictions.allowedDays.length === 7 ? 'All days' : 
                                 zone.timeRestrictions.allowedDays.length === 5 ? 'Weekdays' : 
                                 `${zone.timeRestrictions.allowedDays.length} days`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Security Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Alert Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                    <p className="text-3xl font-bold text-red-600">3</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Unacknowledged</p>
                    <p className="text-3xl font-bold text-orange-600">7</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Response Rate</p>
                    <p className="text-3xl font-bold text-green-600">94%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Security Alerts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alert</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentAlerts.map((alert) => {
                      const vehicle = vehicles.find(v => v.id === alert.vehicleId);
                      const zone = geofenceZones.find(z => z.id === alert.zoneId);
                      
                      return (
                        <tr key={alert.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getSeverityColor(alert.severity)}`}>
                                {getAlertTypeIcon(alert.type)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 capitalize">{alert.type} Alert</div>
                                <div className="text-sm text-gray-500">{alert.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{vehicle?.make}</div>
                            <div className="text-sm text-gray-500">{vehicle?.plate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {zone?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTime(alert.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              alert.acknowledged ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {alert.acknowledged ? 'Acknowledged' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {!alert.acknowledged && (
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                Acknowledge
                              </button>
                            )}
                            <button className="text-gray-600 hover:text-gray-900">
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Theft Prevention Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-Immobilization</h4>
                    <p className="text-sm text-gray-600">Automatically disable vehicle when it exits authorized zones</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Real-time Notifications</h4>
                    <p className="text-sm text-gray-600">Send instant alerts for security breaches</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Emergency Contact Integration</h4>
                    <p className="text-sm text-gray-600">Automatically contact authorities for critical alerts</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-900">Email notifications for critical alerts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked className="h-4 w-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-900">SMS notifications for theft alerts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-900">Push notifications for zone violations</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeofencingManager;