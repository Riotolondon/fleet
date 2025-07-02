import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  updateDoc, 
  doc,
  serverTimestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService, NewVehicleNotificationData } from './notificationService';

export interface Vehicle {
  id: string;
  make: string;
  year: number;
  plate: string;
  weeklyRate: number;
  location: string;
  ownerId: string;
  ownerName: string;
  rating?: number;
  features: string[];
  status: 'available' | 'rented' | 'pending' | 'maintenance';
  applications?: number;
  views?: number;
  image?: string;
  createdAt: unknown; // Firestore timestamp
  updatedAt: unknown; // Firestore timestamp
  description?: string;
}

export interface NewVehicleData {
  make: string;
  year: number;
  plate: string;
  weeklyRate: number;
  location: string;
  features: string[];
  image?: string;
  description?: string;
}

class VehicleService {
  private readonly COLLECTION_NAME = 'vehicles';
  private readonly USERS_COLLECTION = 'users';

  /**
   * Add a new vehicle and notify all users
   */
  async addVehicle(vehicleData: NewVehicleData, ownerId: string): Promise<string> {
    try {
      console.log('🚗 Starting addVehicle process...', { vehicleData, ownerId });
      
      // Check if user is authenticated
      if (!ownerId) {
        throw new Error('User ID is required to add a vehicle');
      }

      // Get owner information
      console.log('👤 Getting owner information for:', ownerId);
      const ownerDoc = await getDoc(doc(db, this.USERS_COLLECTION, ownerId));
      if (!ownerDoc.exists()) {
        console.error('❌ Owner not found in database:', ownerId);
        throw new Error('Owner not found');
      }
      
      const ownerData = ownerDoc.data();
      const ownerName = ownerData?.name || 'Unknown Owner';
      console.log('✅ Owner found:', { ownerId, ownerName });

      // Create vehicle document
      const vehicle: Omit<Vehicle, 'id'> = {
        ...vehicleData,
        ownerId,
        ownerName,
        status: 'available',
        applications: 0,
        views: 0,
        rating: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📝 Attempting to add vehicle to Firestore...', vehicle);
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), vehicle);
      console.log('✅ Vehicle added successfully to Firestore with ID:', docRef.id);

      // Prepare notification data
      const notificationData: NewVehicleNotificationData = {
        vehicleId: docRef.id,
        vehicleMake: vehicleData.make,
        vehicleLocation: vehicleData.location,
        weeklyRate: vehicleData.weeklyRate,
        ownerId,
        ownerName
      };

      // Send notifications to all users
      console.log('📨 Sending notifications to all users...');
      try {
        await notificationService.notifyAllUsersOfNewVehicle(notificationData);
        console.log('✅ Notifications sent successfully');
      } catch (notificationError) {
        console.warn('⚠️ Notifications failed, but vehicle was saved:', notificationError);
        // Don't throw here - vehicle was saved successfully
      }

      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding vehicle:', error);
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      throw error;
    }
  }

  /**
   * Get all vehicles with real-time updates
   */
  subscribeToVehicles(callback: (vehicles: Vehicle[]) => void): () => void {
    try {
      const vehiclesQuery = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        vehiclesQuery, 
        (snapshot) => {
          const vehicles: Vehicle[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Vehicle));
          
          console.log('🚗 Vehicles subscription updated:', vehicles.length, 'vehicles');
          callback(vehicles);
        },
        (error) => {
          console.error('❌ Error in vehicles subscription:', error);
          if (error.code === 'permission-denied') {
            console.warn('⚠️ Permission denied - user may not be authenticated yet');
            // Return empty array on permission error
            callback([]);
          } else {
            console.error('❌ Unexpected error in vehicles subscription:', error);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to vehicles:', error);
      throw error;
    }
  }

  /**
   * Get vehicles owned by a specific user
   */
  subscribeToOwnerVehicles(
    ownerId: string, 
    callback: (vehicles: Vehicle[]) => void
  ): () => void {
    try {
      if (!ownerId) {
        console.warn('⚠️ No ownerId provided to subscribeToOwnerVehicles');
        callback([]);
        return () => {}; // Return empty unsubscribe function
      }

      // TODO: Re-enable orderBy once Firestore index is built
      // See: https://console.firebase.google.com/project/fleet-4f7c0/firestore/indexes
      const vehiclesQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('ownerId', '==', ownerId)
        // orderBy('createdAt', 'desc') // Temporarily disabled - requires index
      );

      const unsubscribe = onSnapshot(
        vehiclesQuery, 
        (snapshot) => {
          const vehicles: Vehicle[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Vehicle));
          
          console.log('🏠 Owner vehicles subscription updated:', vehicles.length, 'vehicles for owner', ownerId);
          callback(vehicles);
        },
        (error) => {
          console.error('❌ Error in owner vehicles subscription:', error);
          if (error.code === 'permission-denied') {
            console.warn('⚠️ Permission denied for owner vehicles - user may not be authenticated yet');
            callback([]);
          } else {
            console.error('❌ Unexpected error in owner vehicles subscription:', error);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to owner vehicles:', error);
      throw error;
    }
  }

  /**
   * Get available vehicles (not rented)
   */
  subscribeToAvailableVehicles(callback: (vehicles: Vehicle[]) => void): () => void {
    try {
      // TODO: Re-enable orderBy once Firestore index is built
      // See: https://console.firebase.google.com/project/fleet-4f7c0/firestore/indexes
      const vehiclesQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', 'available')
        // orderBy('createdAt', 'desc') // Temporarily disabled - requires index
      );

      const unsubscribe = onSnapshot(
        vehiclesQuery, 
        (snapshot) => {
          const vehicles: Vehicle[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Vehicle));
          
          console.log('🚙 Available vehicles subscription updated:', vehicles.length, 'available vehicles');
          callback(vehicles);
        },
        (error) => {
          console.error('❌ Error in available vehicles subscription:', error);
          if (error.code === 'permission-denied') {
            console.warn('⚠️ Permission denied for available vehicles - user may not be authenticated yet');
            callback([]);
          } else {
            console.error('❌ Unexpected error in available vehicles subscription:', error);
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to available vehicles:', error);
      throw error;
    }
  }

  /**
   * Update vehicle status
   */
  async updateVehicleStatus(vehicleId: string, status: Vehicle['status']): Promise<void> {
    try {
      const vehicleRef = doc(db, this.COLLECTION_NAME, vehicleId);
      await updateDoc(vehicleRef, {
        status,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Vehicle status updated:', vehicleId, 'to', status);
    } catch (error) {
      console.error('❌ Error updating vehicle status:', error);
      throw error;
    }
  }

  /**
   * Update vehicle details
   */
  async updateVehicle(vehicleId: string, updates: Partial<NewVehicleData>): Promise<void> {
    try {
      const vehicleRef = doc(db, this.COLLECTION_NAME, vehicleId);
      await updateDoc(vehicleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Vehicle updated:', vehicleId);
    } catch (error) {
      console.error('❌ Error updating vehicle:', error);
      throw error;
    }
  }

  /**
   * Increment vehicle views
   */
  async incrementViews(vehicleId: string): Promise<void> {
    try {
      const vehicleRef = doc(db, this.COLLECTION_NAME, vehicleId);
      const vehicleDoc = await getDoc(vehicleRef);
      
      if (vehicleDoc.exists()) {
        const currentViews = vehicleDoc.data().views || 0;
        await updateDoc(vehicleRef, {
          views: currentViews + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Error incrementing vehicle views:', error);
      throw error;
    }
  }

  /**
   * Increment vehicle applications
   */
  async incrementApplications(vehicleId: string): Promise<void> {
    try {
      const vehicleRef = doc(db, this.COLLECTION_NAME, vehicleId);
      const vehicleDoc = await getDoc(vehicleRef);
      
      if (vehicleDoc.exists()) {
        const currentApplications = vehicleDoc.data().applications || 0;
        await updateDoc(vehicleRef, {
          applications: currentApplications + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('❌ Error incrementing vehicle applications:', error);
      throw error;
    }
  }

  /**
   * Get a single vehicle by ID
   */
  async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
    try {
      const vehicleDoc = await getDoc(doc(db, this.COLLECTION_NAME, vehicleId));
      
      if (vehicleDoc.exists()) {
        return {
          id: vehicleDoc.id,
          ...vehicleDoc.data()
        } as Vehicle;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting vehicle by ID:', error);
      throw error;
    }
  }

  /**
   * Test Firestore connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Firestore connection...');
      
      // Try to read from a simple collection
      const testQuery = query(
        collection(db, this.COLLECTION_NAME)
      );
      
      const snapshot = await getDocs(testQuery);
      console.log('✅ Firestore connection test successful. Found', snapshot.size, 'vehicles');
      return true;
    } catch (error) {
      console.error('❌ Firestore connection test failed:', error);
      return false;
    }
  }

  /**
   * Test adding a simple document to verify write permissions
   */
  async testWrite(userId: string): Promise<boolean> {
    try {
      console.log('🧪 Testing Firestore write permissions...');
      
      const testVehicle = {
        make: 'Test Vehicle',
        year: 2023,
        plate: 'TEST-001',
        weeklyRate: 1000,
        location: 'Test Location',
        ownerId: userId,
        ownerName: 'Test Owner',
        status: 'available' as const,
        applications: 0,
        views: 0,
        rating: 0,
        features: ['Test Feature'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), testVehicle);
      console.log('✅ Firestore write test successful. Test vehicle ID:', docRef.id);
      
      // Clean up test document
      await updateDoc(doc(db, this.COLLECTION_NAME, docRef.id), {
        make: 'TEST DOCUMENT - SAFE TO DELETE'
      });
      
      return true;
    } catch (error) {
      console.error('❌ Firestore write test failed:', error);
      return false;
    }
  }
}

export const vehicleService = new VehicleService();
export default vehicleService; 