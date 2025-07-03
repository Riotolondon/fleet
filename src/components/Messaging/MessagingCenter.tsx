import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { chatService, Conversation } from '../../services/chatService';
import { vehicleService } from '../../services/vehicleService';
import ConversationList from '../Chat/ConversationList';
import ChatWindow from '../Chat/ChatWindow';
import { 
  Car, 
  ArrowLeft, 
  MessageCircle, 
  Users, 
  Search,
  Plus,
  X
} from 'lucide-react';

const MessagingCenter = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Load available users for new conversations
  useEffect(() => {
    if (showNewConversationModal) {
      loadAvailableUsers();
    }
  }, [showNewConversationModal]);

  const loadAvailableUsers = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll use vehicle owners/drivers from the vehicles collection
      // In a real app, you'd have a dedicated users search endpoint
      const unsubscribe = vehicleService.subscribeToVehicles((vehicles) => {
        const uniqueUsers = vehicles
          .filter(vehicle => vehicle.ownerId !== user?.id) // Exclude current user
          .reduce((acc: any[], vehicle) => {
            const existingUser = acc.find(u => u.id === vehicle.ownerId);
            if (!existingUser) {
              acc.push({
                id: vehicle.ownerId,
                name: vehicle.ownerName,
                role: 'owner' as const,
                vehicles: [vehicle]
              });
            } else {
              existingUser.vehicles.push(vehicle);
            }
            return acc;
          }, []);
        
        setAvailableUsers(uniqueUsers);
        setLoading(false);
      });

      // Clean up subscription when modal closes
      return unsubscribe;
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleStartConversation = async (targetUser: any, vehicleContext?: any) => {
    if (!user) return;

    try {
      const conversationId = await chatService.createOrGetConversation(
        user.id,
        user.name,
        user.role,
        targetUser.id,
        targetUser.name,
        targetUser.role,
        vehicleContext
      );

      // Create a conversation object to display
      const conversation: Conversation = {
        id: conversationId,
        participants: {
          [user.id]: {
            name: user.name,
            role: user.role,
            lastSeen: new Date()
          },
          [targetUser.id]: {
            name: targetUser.name,
            role: targetUser.role,
            lastSeen: new Date()
          }
        },
        lastMessage: {
          text: '',
          senderId: '',
          timestamp: new Date(),
          type: 'text'
        },
        unreadCount: {
          [user.id]: 0,
          [targetUser.id]: 0
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        vehicleContext
      };

      setSelectedConversation(conversation);
      setShowNewConversationModal(false);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOtherParticipant = (conversation: Conversation) => {
    const participantIds = Object.keys(conversation.participants);
    const otherParticipantId = participantIds.find(id => id !== user?.id);
    return {
      id: otherParticipantId || '',
      ...conversation.participants[otherParticipantId || '']
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Messaging Center</h1>
                  <p className="text-sm text-gray-500">Chat with {user?.role === 'owner' ? 'drivers' : 'vehicle owners'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <ConversationList
              onSelectConversation={handleSelectConversation}
              onNewConversation={() => setShowNewConversationModal(true)}
              selectedConversationId={selectedConversation?.id}
            />
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation.id}
                recipientId={getOtherParticipant(selectedConversation).id}
                recipientName={getOtherParticipant(selectedConversation).name}
                recipientRole={getOtherParticipant(selectedConversation).role}
                vehicleContext={selectedConversation.vehicleContext}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="h-full bg-white rounded-lg shadow-sm border flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500 mb-4">
                    Choose a conversation from the list to start messaging
                  </p>
                  <button
                    onClick={() => setShowNewConversationModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Start New Conversation</h2>
                <button
                  onClick={() => setShowNewConversationModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search */}
              <div className="mt-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchQuery ? 'No users found matching your search' : 'No users available to message'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((targetUser) => (
                    <div key={targetUser.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {targetUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{targetUser.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {targetUser.role} • {targetUser.vehicles?.length || 0} vehicles
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleStartConversation(targetUser)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Message
                        </button>
                      </div>

                      {/* User's vehicles */}
                      {targetUser.vehicles && targetUser.vehicles.length > 0 && (
                        <div className="ml-13 space-y-2">
                          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            Available Vehicles
                          </p>
                          {targetUser.vehicles.slice(0, 3).map((vehicle: any) => (
                            <button
                              key={vehicle.id}
                              onClick={() => handleStartConversation(targetUser, {
                                vehicleId: vehicle.id,
                                vehicleMake: vehicle.make,
                                vehiclePlate: vehicle.plate
                              })}
                              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <Car className="w-4 h-4 text-gray-600" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {vehicle.make} ({vehicle.plate})
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    R{vehicle.weeklyRate}/week • {vehicle.location}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                          
                          {targetUser.vehicles.length > 3 && (
                            <p className="text-xs text-gray-500 ml-6">
                              +{targetUser.vehicles.length - 3} more vehicles
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingCenter;