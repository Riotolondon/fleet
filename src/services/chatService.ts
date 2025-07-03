import { 
  collection, 
  addDoc, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp,
  where,
  and,
  or,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  limit,
  startAfter,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from './notificationService';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'owner' | 'driver';
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: any;
  read: boolean;
  type: 'text' | 'image' | 'file' | 'vehicle_inquiry';
  messageData?: {
    vehicleId?: string;
    vehicleMake?: string;
    fileUrl?: string;
    fileName?: string;
    imageUrl?: string;
  };
  edited?: boolean;
  editedAt?: any;
}

export interface Conversation {
  id: string;
  participants: {
    [userId: string]: {
      name: string;
      role: 'owner' | 'driver';
      lastSeen: any;
    };
  };
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: any;
    type: string;
  };
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: any;
  updatedAt: any;
  vehicleContext?: {
    vehicleId: string;
    vehicleMake: string;
    vehiclePlate: string;
  };
}

export interface TypingStatus {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: any;
}

class ChatService {
  private readonly MESSAGES_COLLECTION = 'chatMessages';
  private readonly CONVERSATIONS_COLLECTION = 'conversations';
  private readonly TYPING_COLLECTION = 'typingStatus';
  private readonly USERS_COLLECTION = 'users';

  /**
   * Create or get existing conversation between two users
   */
  async createOrGetConversation(
    user1Id: string,
    user1Name: string,
    user1Role: 'owner' | 'driver',
    user2Id: string,
    user2Name: string,
    user2Role: 'owner' | 'driver',
    vehicleContext?: {
      vehicleId: string;
      vehicleMake: string;
      vehiclePlate: string;
    }
  ): Promise<string> {
    try {
      // Generate consistent conversation ID
      const conversationId = this.generateConversationId(user1Id, user2Id);
      
      const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        // Create new conversation
        const conversationData: Omit<Conversation, 'id'> = {
          participants: {
            [user1Id]: {
              name: user1Name,
              role: user1Role,
              lastSeen: serverTimestamp()
            },
            [user2Id]: {
              name: user2Name,
              role: user2Role,
              lastSeen: serverTimestamp()
            }
          },
          lastMessage: {
            text: '',
            senderId: '',
            timestamp: serverTimestamp(),
            type: 'text'
          },
          unreadCount: {
            [user1Id]: 0,
            [user2Id]: 0
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Only include vehicleContext if it's defined
          ...(vehicleContext && { vehicleContext })
        };
        
        await setDoc(conversationRef, conversationData);
        console.log('✅ New conversation created:', conversationId);
      }
      
      return conversationId;
    } catch (error) {
      console.error('❌ Error creating/getting conversation:', error);
      throw error;
    }
  }

  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: 'owner' | 'driver',
    receiverId: string,
    receiverName: string,
    message: string,
    messageType: 'text' | 'image' | 'file' | 'vehicle_inquiry' = 'text',
    messageData?: ChatMessage['messageData']
  ): Promise<string> {
    try {
      console.log('📨 Sending message...', { conversationId, senderId, receiverId, message });
      
      const messageDoc: Omit<ChatMessage, 'id'> = {
        conversationId,
        senderId,
        senderName,
        senderRole,
        receiverId,
        receiverName,
        message,
        timestamp: serverTimestamp(),
        read: false,
        type: messageType,
        edited: false,
        // Only include messageData if it's defined
        ...(messageData && { messageData })
      };

      // Add message to messages collection
      const messageRef = await addDoc(collection(db, this.MESSAGES_COLLECTION), messageDoc);
      
      // Update conversation with last message and increment unread count
      const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, conversationId);
      
      // Get current unread count and increment it
      const conversationDoc = await getDoc(conversationRef);
      const currentUnreadCount = conversationDoc.exists() 
        ? (conversationDoc.data().unreadCount?.[receiverId] || 0) 
        : 0;
      
      await updateDoc(conversationRef, {
        lastMessage: {
          text: message,
          senderId,
          timestamp: serverTimestamp(),
          type: messageType
        },
        updatedAt: serverTimestamp(),
        [`unreadCount.${receiverId}`]: currentUnreadCount + 1
      });

      // Clear typing status for sender
      await this.setTypingStatus(conversationId, senderId, false);

      // Send push notification to receiver
      try {
        await notificationService.createNotification({
          type: 'message',
          title: `New message from ${senderName}`,
          message: messageType === 'text' ? message : `Sent a ${messageType}`,
          read: false,
          priority: 'medium',
          userId: receiverId,
          timestamp: serverTimestamp(),
          actionUrl: `/messages?conversation=${conversationId}`,
          metadata: {
            ownerId: senderId, // Using existing field for sender ID
            ownerName: senderName, // Using existing field for sender name
            vehicleId: conversationId // Using existing field for conversation ID
          }
        });
        console.log('✅ Notification sent to receiver');
      } catch (notificationError) {
        console.warn('⚠️ Failed to send notification:', notificationError);
      }

      console.log('✅ Message sent successfully:', messageRef.id);
      return messageRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to messages in a conversation
   */
  subscribeToConversationMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    try {
      console.log('🔄 Setting up messages subscription for conversation:', conversationId);
      
      // Simplified query without orderBy to avoid index issues
      const messagesQuery = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        limit(100) // Load last 100 messages initially
      );

      return onSnapshot(messagesQuery, (snapshot) => {
        console.log('📡 Messages snapshot received for conversation:', conversationId, {
          size: snapshot.size,
          docs: snapshot.docs.length,
          empty: snapshot.empty
        });

        const messages: ChatMessage[] = snapshot.docs
          .map(doc => {
            const data = doc.data();
            console.log('💌 Processing message:', doc.id, {
              senderId: data.senderId,
              message: data.message,
              timestamp: data.timestamp
            });
            return {
              id: doc.id,
              ...data
            } as ChatMessage;
          })
          .sort((a, b) => {
            // Sort by timestamp client-side
            if (a.timestamp && b.timestamp) {
              return a.timestamp.toDate() - b.timestamp.toDate();
            }
            return 0;
          });
        
        console.log('💬 Final messages for conversation:', conversationId, {
          total: messages.length,
          messageIds: messages.map(m => m.id)
        });
        callback(messages);
      }, (error) => {
        console.error('❌ Error in messages subscription:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          conversationId: conversationId,
          collection: this.MESSAGES_COLLECTION
        });
        callback([]);
      });
    } catch (error) {
      console.error('❌ Error subscribing to messages:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user's conversations
   */
  subscribeToUserConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    try {
      console.log('🔄 Setting up conversations subscription for user:', userId);
      
      // Simplified query - get all conversations and filter client-side for now
      const conversationsQuery = query(
        collection(db, this.CONVERSATIONS_COLLECTION)
      );

      return onSnapshot(conversationsQuery, (snapshot) => {
        console.log('📡 Conversations snapshot received:', {
          size: snapshot.size,
          docs: snapshot.docs.length,
          empty: snapshot.empty
        });

        // Filter conversations where user is a participant and sort client-side
        const conversations: Conversation[] = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Conversation))
          .filter(conv => {
            // Check if user is in participants
            const isParticipant = conv.participants && conv.participants[userId];
            console.log('🔍 Checking conversation:', conv.id, 'User is participant:', !!isParticipant);
            return isParticipant;
          })
          .sort((a, b) => {
            // Sort by updatedAt client-side
            if (a.updatedAt && b.updatedAt) {
              return b.updatedAt.toDate() - a.updatedAt.toDate();
            }
            return 0;
          });
        
        console.log('📋 Final conversations for user:', userId, {
          total: conversations.length,
          conversationIds: conversations.map(c => c.id)
        });
        callback(conversations);
      }, (error) => {
        console.error('❌ Error in conversations subscription:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          userId: userId
        });
        if (error.code === 'permission-denied') {
          console.warn('⚠️ Permission denied for conversations - user may not be authenticated');
        }
        callback([]);
      });
    } catch (error) {
      console.error('❌ Error subscribing to conversations:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Get unread messages for this user in this conversation
      const unreadQuery = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId),
        where('read', '==', false)
      );

      const unreadSnapshot = await getDocs(unreadQuery);
      
      // Mark each message as read
      const updatePromises = unreadSnapshot.docs.map(messageDoc => 
        updateDoc(messageDoc.ref, { read: true })
      );
      
      await Promise.all(updatePromises);

      // Reset unread count in conversation
      const conversationRef = doc(db, this.CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0,
        [`participants.${userId}.lastSeen`]: serverTimestamp()
      });

      console.log('✅ Messages marked as read for conversation:', conversationId);
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Set typing status
   */
  async setTypingStatus(
    conversationId: string,
    userId: string,
    isTyping: boolean,
    userName?: string
  ): Promise<void> {
    try {
      const typingRef = doc(db, this.TYPING_COLLECTION, `${conversationId}_${userId}`);
      
      if (isTyping) {
        await setDoc(typingRef, {
          conversationId,
          userId,
          userName: userName || 'Unknown User',
          isTyping: true,
          timestamp: serverTimestamp()
        });
      } else {
        await deleteDoc(typingRef);
      }
    } catch (error) {
      console.error('❌ Error setting typing status:', error);
    }
  }

  /**
   * Subscribe to typing status in a conversation
   */
  subscribeToTypingStatus(
    conversationId: string,
    currentUserId: string,
    callback: (typingUsers: TypingStatus[]) => void
  ): () => void {
    try {
      const typingQuery = query(
        collection(db, this.TYPING_COLLECTION),
        where('conversationId', '==', conversationId),
        where('isTyping', '==', true)
      );

      return onSnapshot(typingQuery, (snapshot) => {
        const typingUsers: TypingStatus[] = snapshot.docs
          .map(doc => doc.data() as TypingStatus)
          .filter(status => status.userId !== currentUserId); // Exclude current user
        
        callback(typingUsers);
      });
    } catch (error) {
      console.error('❌ Error subscribing to typing status:', error);
      throw error;
    }
  }

  /**
   * Start a conversation about a specific vehicle
   */
  async startVehicleConversation(
    driverId: string,
    driverName: string,
    ownerId: string,
    ownerName: string,
    vehicleId: string,
    vehicleMake: string,
    vehiclePlate: string,
    inquiryMessage?: string
  ): Promise<string> {
    try {
      const conversationId = await this.createOrGetConversation(
        driverId,
        driverName,
        'driver',
        ownerId,
        ownerName,
        'owner',
        {
          vehicleId,
          vehicleMake,
          vehiclePlate
        }
      );

      // Send initial inquiry message if provided
      if (inquiryMessage) {
        await this.sendMessage(
          conversationId,
          driverId,
          driverName,
          'driver',
          ownerId,
          ownerName,
          inquiryMessage,
          'vehicle_inquiry',
          {
            vehicleId,
            vehicleMake
          }
        );
      }

      return conversationId;
    } catch (error) {
      console.error('❌ Error starting vehicle conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation statistics for a user
   */
  async getConversationStats(userId: string): Promise<{
    totalConversations: number;
    unreadConversations: number;
    totalUnreadMessages: number;
  }> {
    try {
      const conversationsQuery = query(
        collection(db, this.CONVERSATIONS_COLLECTION),
        where(`participants.${userId}`, '!=', null)
      );

      const snapshot = await getDocs(conversationsQuery);
      const conversations = snapshot.docs.map(doc => doc.data() as Conversation);

      const totalConversations = conversations.length;
      const unreadConversations = conversations.filter(
        conv => (conv.unreadCount[userId] || 0) > 0
      ).length;
      const totalUnreadMessages = conversations.reduce(
        (total, conv) => total + (conv.unreadCount[userId] || 0), 
        0
      );

      return {
        totalConversations,
        unreadConversations,
        totalUnreadMessages
      };
    } catch (error) {
      console.error('❌ Error getting conversation stats:', error);
      return {
        totalConversations: 0,
        unreadConversations: 0,
        totalUnreadMessages: 0
      };
    }
  }

  /**
   * Generate consistent conversation ID for two users
   */
  private generateConversationId(user1Id: string, user2Id: string): string {
    // Sort user IDs to ensure consistent conversation ID regardless of who initiates
    const sortedIds = [user1Id, user2Id].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Delete a conversation (admin function)
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    try {
      // First, delete all messages in the conversation
      const messagesQuery = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId)
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const deleteMessagePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteMessagePromises);

      // Delete the conversation
      await deleteDoc(doc(db, this.CONVERSATIONS_COLLECTION, conversationId));

      console.log('✅ Conversation deleted:', conversationId);
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Debug function to check database collections
   * Call from browser console: window.chatService.debugCollections()
   */
  async debugCollections(): Promise<void> {
    try {
      console.log('🧪 Debugging chat collections...');
      
      // Check conversations collection
      const conversationsSnapshot = await getDocs(collection(db, this.CONVERSATIONS_COLLECTION));
      console.log('📊 Conversations Collection:', {
        totalDocs: conversationsSnapshot.size,
        docs: conversationsSnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      });
      
      // Check messages collection
      const messagesSnapshot = await getDocs(collection(db, this.MESSAGES_COLLECTION));
      console.log('📊 Messages Collection:', {
        totalDocs: messagesSnapshot.size,
        docs: messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      });
      
      // Check typing status collection
      const typingSnapshot = await getDocs(collection(db, this.TYPING_COLLECTION));
      console.log('📊 Typing Status Collection:', {
        totalDocs: typingSnapshot.size,
        docs: typingSnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }))
      });
      
    } catch (error) {
      console.error('❌ Error debugging collections:', error);
    }
  }

  /**
   * Search messages in conversations
   */
  async searchMessages(
    userId: string,
    searchTerm: string,
    maxResults: number = 20
  ): Promise<ChatMessage[]> {
    try {
      // Simplified query - get all conversations and filter client-side
      const conversationsSnapshot = await getDocs(collection(db, this.CONVERSATIONS_COLLECTION));
      const conversationIds = conversationsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Conversation))
        .filter(conv => conv.participants && conv.participants[userId])
        .map(conv => conv.id);

      if (conversationIds.length === 0) {
        return [];
      }

      // Search messages in user's conversations
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia or Elasticsearch for advanced search
      const messagesQuery = query(
        collection(db, this.MESSAGES_COLLECTION),
        where('conversationId', 'in', conversationIds.slice(0, 10)), // Firestore 'in' limit is 10
        orderBy('timestamp', 'desc'),
        limit(maxResults)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));

      // Filter messages that contain the search term (case-insensitive)
      return messages.filter(message => 
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('❌ Error searching messages:', error);
      return [];
    }
  }
}

export const chatService = new ChatService();

// Expose chatService globally for debugging
if (typeof window !== 'undefined') {
  (window as any).chatService = chatService;
}

export default chatService; 