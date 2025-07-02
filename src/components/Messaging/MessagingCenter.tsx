import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  User,
  Car,
  AlertTriangle,
  Bell
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system' | 'payment' | 'alert';
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  vehicleId?: string;
  type: 'direct' | 'support' | 'group';
}

const MessagingCenter = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data
  const users = {
    '1': { name: 'Thabo Mokoena', role: 'owner', avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop' },
    '2': { name: 'Sipho Mthembu', role: 'driver', avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop' },
    '3': { name: 'Sarah Nkomo', role: 'owner', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop' },
    '4': { name: 'FleetLink Support', role: 'support', avatar: null }
  };

  const conversations: Conversation[] = [
    {
      id: '1',
      participants: ['1', '2'],
      lastMessage: {
        id: '1',
        senderId: '2',
        receiverId: '1',
        content: 'Payment for this week has been processed successfully.',
        timestamp: '2025-01-15T10:30:00Z',
        type: 'payment',
        status: 'read'
      },
      unreadCount: 0,
      vehicleId: 'vehicle-1',
      type: 'direct'
    },
    {
      id: '2',
      participants: ['1', '3'],
      lastMessage: {
        id: '2',
        senderId: '3',
        receiverId: '1',
        content: 'Hi! I saw your vehicle listing. Is it still available?',
        timestamp: '2025-01-15T09:15:00Z',
        type: 'text',
        status: 'delivered'
      },
      unreadCount: 2,
      type: 'direct'
    },
    {
      id: '3',
      participants: [user?.id || '1', '4'],
      lastMessage: {
        id: '3',
        senderId: '4',
        receiverId: user?.id || '1',
        content: 'Your support ticket has been resolved. Is there anything else we can help you with?',
        timestamp: '2025-01-14T16:45:00Z',
        type: 'text',
        status: 'read'
      },
      unreadCount: 0,
      type: 'support'
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      senderId: '1',
      receiverId: '2',
      content: 'Hi Sipho! How is the vehicle performing this week?',
      timestamp: '2025-01-15T08:00:00Z',
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      senderId: '2',
      receiverId: '1',
      content: 'Good morning! The car is running perfectly. No issues at all.',
      timestamp: '2025-01-15T08:15:00Z',
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      senderId: '2',
      receiverId: '1',
      content: 'Payment for this week has been processed successfully.',
      timestamp: '2025-01-15T10:30:00Z',
      type: 'payment',
      status: 'read'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // In a real app, this would send the message to the backend
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== user?.id);
    return otherUserId ? users[otherUserId as keyof typeof users] : null;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read': return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConversation ? messages.filter(m => 
    (m.senderId === user?.id && m.receiverId === getOtherParticipant(selectedConv!)?.name) ||
    (m.receiverId === user?.id && m.senderId === getOtherParticipant(selectedConv!)?.name)
  ) : [];

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
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation);
                  if (!otherUser) return null;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          {otherUser.avatar ? (
                            <img 
                              src={otherUser.avatar} 
                              alt={otherUser.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          {conversation.type === 'support' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {otherUser.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.type === 'payment' && (
                                <span className="inline-flex items-center">
                                  <Car className="w-3 h-3 mr-1" />
                                  Payment processed
                                </span>
                              )}
                              {conversation.lastMessage.type === 'text' && conversation.lastMessage.content}
                              {conversation.lastMessage.type === 'alert' && (
                                <span className="inline-flex items-center text-orange-600">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Alert notification
                                </span>
                              )}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const otherUser = getOtherParticipant(selectedConv!);
                          return (
                            <>
                              {otherUser?.avatar ? (
                                <img 
                                  src={otherUser.avatar} 
                                  alt={otherUser.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                              )}
                              <div>
                                <h3 className="font-medium text-gray-900">{otherUser?.name}</h3>
                                <p className="text-sm text-gray-500 capitalize">{otherUser?.role}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-blue-600 text-white'
                            : message.type === 'payment'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : message.type === 'alert'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.type === 'payment' && (
                            <div className="flex items-center mb-1">
                              <Car className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">Payment Notification</span>
                            </div>
                          )}
                          {message.type === 'alert' && (
                            <div className="flex items-center mb-1">
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              <span className="text-sm font-medium">Alert</span>
                            </div>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-between mt-1 ${
                            message.senderId === user?.id ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{formatTime(message.timestamp)}</span>
                            {message.senderId === user?.id && (
                              <div className="ml-2">
                                {getMessageStatusIcon(message.status)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type a message..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                          <Smile className="w-5 h-5" />
                        </button>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;