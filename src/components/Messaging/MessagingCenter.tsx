import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { chatService, Conversation } from '../../services/chatService';
import { userService, UserProfile, OnlineUser } from '../../services/userService';
import ConversationList from '../Chat/ConversationList';
import ChatWindow from '../Chat/ChatWindow';
import { 
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
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'online' | 'owners' | 'drivers'>('all');

  // Load available users for new conversations and subscribe to online users
  useEffect(() => {
    if (showNewConversationModal) {
      loadAvailableUsers();
    }
  }, [showNewConversationModal]);

  // Subscribe to online users immediately when component mounts
  useEffect(() => {
    if (!user) return;

    console.log('🔄 MessagingCenter: Setting up online users subscription');
    
    // Subscribe to online users for real-time presence (always active)
    const unsubscribeOnline = userService.subscribeToOnlineUsers(user.id, (online) => {
      setOnlineUsers(online);
      console.log('👥 MessagingCenter: Online users updated:', online.length, online);
    });

    return () => {
      console.log('🔄 MessagingCenter: Cleaning up online users subscription');
      unsubscribeOnline();
    };
  }, [user]);

  const loadAvailableUsers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Subscribe to real-time user updates (only for the modal)
      const unsubscribeUsers = userService.subscribeToAllUsers(user.id, (users) => {
        setAvailableUsers(users);
        setLoading(false);
        console.log('✅ Available users updated for modal:', users.length);
      });

      // Return cleanup function (online users subscription is handled separately)
      return unsubscribeUsers;
    } catch (error) {
      console.error('❌ Error loading users:', error);
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

  const filteredUsers = availableUsers.filter(targetUser => {
    // Text search filter
    const matchesSearch = searchQuery === '' || 
      targetUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      targetUser.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (targetUser.location && targetUser.location.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // User filter
    const matchesFilter = (() => {
      switch (userFilter) {
        case 'online':
          return onlineUsers.some(ou => ou.id === targetUser.id);
        case 'owners':
          return targetUser.role === 'owner';
        case 'drivers':
          return targetUser.role === 'driver';
        case 'all':
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesFilter;
  });

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
                <div className={`w-2 h-2 rounded-full ${onlineUsers.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>{onlineUsers.length} users online</span>
                {process.env.NODE_ENV === 'development' && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        console.log('🔍 Current online users state:', onlineUsers);
                        console.log('🔍 Current available users state:', availableUsers);
                        if ((window as any).userService) {
                          (window as any).userService.testOnlineUsers();
                        }
                      }}
                      className="text-xs bg-gray-200 px-2 py-1 rounded"
                    >
                      Users
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔍 Current conversations state:', selectedConversation);
                        if ((window as any).chatService) {
                          (window as any).chatService.debugCollections();
                        }
                      }}
                      className="text-xs bg-blue-200 px-2 py-1 rounded"
                    >
                      Chat
                    </button>
                  </div>
                )}
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

            {/* User Filters */}
            <div className="px-6 py-3 border-b border-gray-200">
              <div className="flex space-x-2">
                {['all', 'online', 'owners', 'drivers'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setUserFilter(filter as typeof userFilter)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      userFilter === filter
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filter === 'online' && ` (${onlineUsers.length})`}
                  </button>
                ))}
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
                  {filteredUsers.map((targetUser) => {
                    const isOnline = onlineUsers.some(ou => ou.id === targetUser.id);
                    const onlineUser = onlineUsers.find(ou => ou.id === targetUser.id);
                    
                    return (
                      <div key={targetUser.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {targetUser.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              {/* Online Status Indicator */}
                              {isOnline && (
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  onlineUser?.status === 'online' ? 'bg-green-500' :
                                  onlineUser?.status === 'away' ? 'bg-yellow-500' :
                                  onlineUser?.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                                }`}></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900">{targetUser.name}</h3>
                                {targetUser.isVerified && (
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span className="capitalize">{targetUser.role}</span>
                                {isOnline && (
                                  <>
                                    <span>•</span>
                                    <span className={`${
                                      onlineUser?.status === 'online' ? 'text-green-600' :
                                      onlineUser?.status === 'away' ? 'text-yellow-600' :
                                      onlineUser?.status === 'busy' ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                      {onlineUser?.status === 'online' ? 'Online' :
                                       onlineUser?.status === 'away' ? 'Away' :
                                       onlineUser?.status === 'busy' ? 'Busy' : 'Offline'}
                                    </span>
                                  </>
                                )}
                                {targetUser.location && (
                                  <>
                                    <span>•</span>
                                    <span>{targetUser.location}</span>
                                  </>
                                )}
                              </div>
                              {onlineUser?.currentActivity && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {onlineUser.currentActivity}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleStartConversation(targetUser)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    );
                  })}
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