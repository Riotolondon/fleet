import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatService, ChatMessage, TypingStatus } from '../../services/chatService';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Image, 
  File, 
  Phone, 
  Video, 
  MoreHorizontal,
  ArrowLeft,
  Clock
} from 'lucide-react';

interface ChatWindowProps {
  conversationId: string;
  recipientId: string;
  recipientName: string;
  recipientRole: 'owner' | 'driver';
  vehicleContext?: {
    vehicleId: string;
    vehicleMake: string;
    vehiclePlate: string;
  };
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversationId,
  recipientId, 
  recipientName, 
  recipientRole,
  vehicleContext,
  onBack 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Subscribe to messages
  useEffect(() => {
    if (!conversationId) return;

    console.log('💬 ChatWindow: Subscribing to messages for conversation:', conversationId);
    
    const unsubscribe = chatService.subscribeToConversationMessages(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        scrollToBottom();
        
        // Mark messages as read when user views them
        if (user?.id) {
          chatService.markMessagesAsRead(conversationId, user.id);
        }
      }
    );

    return unsubscribe;
  }, [conversationId, user?.id]);

  // Subscribe to typing status
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const unsubscribe = chatService.subscribeToTypingStatus(
      conversationId,
      user.id,
      setTypingUsers
    );

    return unsubscribe;
  }, [conversationId, user?.id]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle typing indicators
  const handleTyping = () => {
    if (!user?.id || !conversationId) return;

    if (!isTyping) {
      setIsTyping(true);
      chatService.setTypingStatus(conversationId, user.id, true, user.name);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatService.setTypingStatus(conversationId, user.id, false);
    }, 3000);
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    
    try {
      await chatService.sendMessage(
        conversationId,
        user.id,
        user.name,
        user.role,
        recipientId,
        recipientName,
        newMessage.trim()
      );
      
      setNewMessage('');
      
      // Clear typing status
      setIsTyping(false);
      chatService.setTypingStatus(conversationId, user.id, false);
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: Show error toast
    } finally {
      setSending(false);
    }
  };

  // Send vehicle inquiry message
  const sendVehicleInquiry = async () => {
    if (!user || !vehicleContext) return;

    const inquiryMessage = `Hi! I'm interested in your ${vehicleContext.vehicleMake} (${vehicleContext.vehiclePlate}). Is it available for rent?`;
    
    try {
      await chatService.sendMessage(
        conversationId,
        user.id,
        user.name,
        user.role,
        recipientId,
        recipientName,
        inquiryMessage,
        'vehicle_inquiry',
        {
          vehicleId: vehicleContext.vehicleId,
          vehicleMake: vehicleContext.vehicleMake
        }
      );
    } catch (error) {
      console.error('Failed to send vehicle inquiry:', error);
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    
    return date.toLocaleDateString('en-ZA', { 
      day: 'numeric',
      month: 'short'
    });
  };

  // Render message content based on type
  const renderMessageContent = (message: ChatMessage) => {
    switch (message.type) {
      case 'vehicle_inquiry':
        return (
          <div className="space-y-2">
            <p className="text-sm">{message.message}</p>
            {message.messageData?.vehicleMake && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    🚗
                  </div>
                  <div>
                    <p className="font-medium text-blue-900 text-sm">{message.messageData.vehicleMake}</p>
                    <p className="text-blue-600 text-xs">Vehicle Inquiry</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            {message.message && <p className="text-sm">{message.message}</p>}
            {message.messageData?.imageUrl && (
              <img 
                src={message.messageData.imageUrl} 
                alt="Shared image" 
                className="max-w-xs rounded-lg shadow-sm"
              />
            )}
          </div>
        );
      case 'file':
        return (
          <div className="space-y-2">
            {message.message && <p className="text-sm">{message.message}</p>}
            {message.messageData?.fileName && (
              <div className="bg-gray-50 border rounded-lg p-3 flex items-center space-x-3">
                <File className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-sm">{message.messageData.fileName}</p>
                  <p className="text-xs text-gray-500">File attachment</p>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <p className="text-sm">{message.message}</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-96 bg-white rounded-lg shadow-sm border">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-sm border">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {recipientName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">{recipientName}</h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 capitalize">
                  {recipientRole} • Online
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Vehicle Context */}
        {vehicleContext && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  🚗
                </div>
                <div>
                  <p className="font-medium text-blue-900 text-sm">
                    {vehicleContext.vehicleMake} ({vehicleContext.vehiclePlate})
                  </p>
                  <p className="text-blue-600 text-xs">Vehicle Discussion</p>
                </div>
              </div>
              
              {messages.length === 0 && (
                <button
                  onClick={sendVehicleInquiry}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Send Inquiry
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              💬
            </div>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                message.senderId === user?.id ? 'order-2' : 'order-1'
              }`}>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.senderId === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {renderMessageContent(message)}
                  <div className={`flex items-center justify-between mt-1 ${
                    message.senderId === user?.id ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    <span className="text-xs">{formatMessageTime(message.timestamp)}</span>
                    {message.senderId === user?.id && (
                      <div className="flex items-center space-x-1 ml-2">
                        {message.read ? (
                          <div className="flex space-x-0.5">
                            <div className="w-3 h-3 text-blue-200">✓</div>
                            <div className="w-3 h-3 text-blue-200 -ml-1">✓</div>
                          </div>
                        ) : (
                          <div className="w-3 h-3 text-blue-200">✓</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-gray-500">
                  {typingUsers[0].userName} is typing...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Send image"
          >
            <Image className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            {sending ? (
              <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 