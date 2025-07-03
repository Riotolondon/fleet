import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatService, Conversation } from '../../services/chatService';
import { 
  Search, 
  MessageCircle, 
  Plus, 
  Filter,
  Star,
  Archive,
  MoreHorizontal,
  Check,
  CheckCheck
} from 'lucide-react';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation?: () => void;
  selectedConversationId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  onNewConversation,
  selectedConversationId
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  // Subscribe to user's conversations
  useEffect(() => {
    if (!user?.id) {
      setConversations([]);
      setLoading(false);
      return;
    }

    console.log('📋 ConversationList: Setting up conversations subscription for user:', user.id);
    
    const unsubscribe = chatService.subscribeToUserConversations(
      user.id,
      (newConversations) => {
        console.log('📋 ConversationList: Received conversations:', newConversations.length);
        setConversations(newConversations);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.id]);

  // Filter conversations based on search and filter
  const filteredConversations = conversations.filter(conversation => {
    // Search filter
    if (searchQuery) {
      const otherParticipant = getOtherParticipant(conversation);
      const matchesSearch = 
        otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.vehicleContext?.vehicleMake.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filter === 'unread') {
      return (conversation.unreadCount[user?.id || ''] || 0) > 0;
    }
    
    // TODO: Implement archived filter when we add archive functionality
    if (filter === 'archived') {
      return false; // No archived conversations yet
    }

    return true;
  });

  // Get the other participant in a conversation
  const getOtherParticipant = (conversation: Conversation) => {
    const participantIds = Object.keys(conversation.participants);
    const otherParticipantId = participantIds.find(id => id !== user?.id);
    return conversation.participants[otherParticipantId || ''] || {
      name: 'Unknown User',
      role: 'driver' as const,
      lastSeen: null
    };
  };

  // Format last message time
  const formatLastMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString('en-ZA', { 
      day: 'numeric',
      month: 'short'
    });
  };

  // Get conversation stats
  const getConversationStats = () => {
    const total = conversations.length;
    const unread = conversations.filter(conv => 
      (conv.unreadCount[user?.id || ''] || 0) > 0
    ).length;
    
    return { total, unread };
  };

  const stats = getConversationStats();

  if (loading) {
    return (
      <div className="h-full bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <p className="text-sm text-gray-500">
              {stats.total} conversations
              {stats.unread > 0 && ` • ${stats.unread} unread`}
            </p>
          </div>
          
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Start new conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          {[
            { id: 'all', label: 'All', count: stats.total },
            { id: 'unread', label: 'Unread', count: stats.unread },
            { id: 'archived', label: 'Archived', count: 0 }
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as typeof filter)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === filterOption.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
              {filterOption.count > 0 && (
                <span className="ml-1 bg-gray-400 text-white rounded-full px-1.5 py-0.5 text-xs">
                  {filterOption.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start a conversation with vehicle owners or drivers'
              }
            </p>
            {onNewConversation && !searchQuery && (
              <button
                onClick={onNewConversation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Start Conversation
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const unreadCount = conversation.unreadCount[user?.id || ''] || 0;
              const isSelected = conversation.id === selectedConversationId;
              const isLastMessageFromMe = conversation.lastMessage.senderId === user?.id;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium">
                        {otherParticipant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium truncate ${
                          unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {otherParticipant.name}
                        </h3>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {/* Read status for sent messages */}
                          {isLastMessageFromMe && (
                            <div className="text-gray-400">
                              {conversation.lastMessage.type === 'read' ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                          )}
                          
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Vehicle context */}
                          {conversation.vehicleContext && (
                            <div className="flex items-center space-x-1 mb-1">
                              <span className="text-xs">🚗</span>
                              <span className="text-xs text-blue-600 font-medium truncate">
                                {conversation.vehicleContext.vehicleMake}
                              </span>
                            </div>
                          )}
                          
                          {/* Last message */}
                          <p className={`text-sm truncate ${
                            unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                          }`}>
                            {isLastMessageFromMe && 'You: '}
                            {conversation.lastMessage.text || 
                             (conversation.lastMessage.type === 'image' ? '📷 Image' :
                              conversation.lastMessage.type === 'file' ? '📎 File' :
                              conversation.lastMessage.type === 'vehicle_inquiry' ? '🚗 Vehicle inquiry' :
                              'Message')
                            }
                          </p>
                          
                          {/* Role indicator */}
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              otherParticipant.role === 'owner' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {otherParticipant.role === 'owner' ? '🏢 Owner' : '🚗 Driver'}
                            </span>
                            
                            {/* Online status */}
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-500">Online</span>
                            </div>
                          </div>
                        </div>

                        {/* Unread count */}
                        {unreadCount > 0 && (
                          <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList; 