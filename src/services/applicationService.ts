import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc,
  getDocs,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from './notificationService';

export interface VehicleApplication {
  id: string;
  vehicleId: string;
  vehicleMake: string;
  driverId: string;
  driverName: string;
  driverEmail: string;
  ownerId: string;
  ownerName: string;
  message: string;
  experience: string;
  platforms: string[];
  documents: string[];
  rating?: number;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: unknown; // Firestore timestamp
  reviewedAt?: unknown; // Firestore timestamp
  reviewedBy?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface NewApplicationData {
  vehicleId: string;
  message: string;
  experience: string;
  platforms: string[];
  documents: string[];
}

class ApplicationService {
  private readonly COLLECTION_NAME = 'applications';
  private readonly VEHICLES_COLLECTION = 'vehicles';
  private readonly USERS_COLLECTION = 'users';

  /**
   * Submit a new application for a vehicle
   */
  async submitApplication(
    applicationData: NewApplicationData, 
    driverId: string
  ): Promise<string> {
    try {
      console.log('📝 Starting application submission...', {
        vehicleId: applicationData.vehicleId,
        driverId
      });

      // Get driver information
      const driverDoc = await getDoc(doc(db, this.USERS_COLLECTION, driverId));
      if (!driverDoc.exists()) {
        throw new Error('Driver not found');
      }
      const driverData = driverDoc.data();

      // Get vehicle information
      const vehicleDoc = await getDoc(doc(db, this.VEHICLES_COLLECTION, applicationData.vehicleId));
      if (!vehicleDoc.exists()) {
        throw new Error('Vehicle not found');
      }
      const vehicleData = vehicleDoc.data();

      // Check if application already exists
      const existingApplicationQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('vehicleId', '==', applicationData.vehicleId),
        where('driverId', '==', driverId)
      );
      const existingApplications = await getDocs(existingApplicationQuery);
      
      if (!existingApplications.empty) {
        throw new Error('You have already applied for this vehicle');
      }

      const application: Omit<VehicleApplication, 'id'> = {
        vehicleId: applicationData.vehicleId,
        vehicleMake: vehicleData.make,
        driverId,
        driverName: driverData.name || driverData.displayName || 'Unknown Driver',
        driverEmail: driverData.email,
        ownerId: vehicleData.ownerId,
        ownerName: vehicleData.ownerName,
        message: applicationData.message,
        experience: applicationData.experience,
        platforms: applicationData.platforms,
        documents: applicationData.documents,
        rating: driverData.rating || 0,
        status: 'pending',
        appliedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add application to Firestore
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), application);
      console.log('✅ Application submitted:', docRef.id);

      // Increment application count on vehicle
      await this.incrementVehicleApplications(applicationData.vehicleId);

      // Send notification to vehicle owner
      await this.notifyOwnerOfNewApplication(application, docRef.id);

      return docRef.id;
    } catch (error) {
      console.error('❌ Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Update application status (approve/reject)
   */
  async updateApplicationStatus(
    applicationId: string,
    status: 'approved' | 'rejected',
    reviewerId: string
  ): Promise<void> {
    try {
      const applicationRef = doc(db, this.COLLECTION_NAME, applicationId);
      const applicationDoc = await getDoc(applicationRef);
      
      if (!applicationDoc.exists()) {
        throw new Error('Application not found');
      }

      const applicationData = applicationDoc.data() as VehicleApplication;

      await updateDoc(applicationRef, {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: reviewerId,
        updatedAt: serverTimestamp()
      });

      // Send notification to driver
      await this.notifyDriverOfApplicationUpdate(applicationData, status);

      console.log('✅ Application status updated:', applicationId, 'to', status);
    } catch (error) {
      console.error('❌ Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Get applications for a specific vehicle owner
   */
  subscribeToOwnerApplications(
    ownerId: string,
    callback: (applications: VehicleApplication[]) => void
  ): () => void {
    try {
      const applicationsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('ownerId', '==', ownerId)
      );

      const unsubscribe = onSnapshot(
        applicationsQuery,
        (snapshot) => {
          const applications: VehicleApplication[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as VehicleApplication));
          
          // Sort by application date manually
          applications.sort((a, b) => {
            const aTime = (a.appliedAt && typeof a.appliedAt === 'object' && 'toDate' in a.appliedAt) 
              ? (a.appliedAt as any).toDate() : new Date(0);
            const bTime = (b.appliedAt && typeof b.appliedAt === 'object' && 'toDate' in b.appliedAt) 
              ? (b.appliedAt as any).toDate() : new Date(0);
            return bTime.getTime() - aTime.getTime();
          });

          console.log('📋 Owner applications updated:', applications.length, 'applications for owner', ownerId);
          callback(applications);
        },
        (error) => {
          console.error('❌ Error in owner applications subscription:', error);
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to owner applications:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * Get applications submitted by a specific driver
   */
  subscribeToDriverApplications(
    driverId: string,
    callback: (applications: VehicleApplication[]) => void
  ): () => void {
    try {
      const applicationsQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('driverId', '==', driverId)
      );

      const unsubscribe = onSnapshot(
        applicationsQuery,
        (snapshot) => {
          const applications: VehicleApplication[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as VehicleApplication));
          
          // Sort by application date manually
          applications.sort((a, b) => {
            const aTime = (a.appliedAt && typeof a.appliedAt === 'object' && 'toDate' in a.appliedAt) 
              ? (a.appliedAt as any).toDate() : new Date(0);
            const bTime = (b.appliedAt && typeof b.appliedAt === 'object' && 'toDate' in b.appliedAt) 
              ? (b.appliedAt as any).toDate() : new Date(0);
            return bTime.getTime() - aTime.getTime();
          });

          console.log('🚗 Driver applications updated:', applications.length, 'applications for driver', driverId);
          callback(applications);
        },
        (error) => {
          console.error('❌ Error in driver applications subscription:', error);
          callback([]);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to driver applications:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * Increment vehicle application count
   */
  private async incrementVehicleApplications(vehicleId: string): Promise<void> {
    try {
      const vehicleRef = doc(db, this.VEHICLES_COLLECTION, vehicleId);
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
    }
  }

  /**
   * Send notification to vehicle owner about new application
   */
  private async notifyOwnerOfNewApplication(
    applicationData: Omit<VehicleApplication, 'id'>,
    applicationId: string
  ): Promise<void> {
    try {
      await notificationService.createNotification({
        type: 'new_vehicle', // Reusing existing type for now
        title: 'New Driver Application',
        message: `${applicationData.driverName} has applied to rent your ${applicationData.vehicleMake}. Experience: ${applicationData.experience}`,
        read: false,
        priority: 'high',
        actionUrl: '/marketplace?tab=applications',
        metadata: {
          vehicleId: applicationData.vehicleId,
          vehicleMake: applicationData.vehicleMake,
          driverId: applicationData.driverId,
          applicationId: applicationId
        },
        userId: applicationData.ownerId,
        createdBy: applicationData.driverId,
        timestamp: serverTimestamp()
      });

      console.log('✅ Notification sent to owner about new application');
    } catch (error) {
      console.error('❌ Error sending notification to owner:', error);
    }
  }

  /**
   * Send notification to driver about application status update
   */
  private async notifyDriverOfApplicationUpdate(
    applicationData: VehicleApplication,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    try {
      const title = status === 'approved' ? 'Application Approved!' : 'Application Update';
      const message = status === 'approved' 
        ? `Great news! Your application for ${applicationData.vehicleMake} has been approved by ${applicationData.ownerName}.`
        : `Your application for ${applicationData.vehicleMake} has been reviewed by ${applicationData.ownerName}.`;

      await notificationService.createNotification({
        type: 'new_vehicle', // Reusing existing type for now
        title,
        message,
        read: false,
        priority: status === 'approved' ? 'high' : 'medium',
        actionUrl: '/marketplace?tab=applications',
        metadata: {
          vehicleId: applicationData.vehicleId,
          vehicleMake: applicationData.vehicleMake,
          ownerId: applicationData.ownerId,
          applicationId: applicationData.id,
          status: status
        },
        userId: applicationData.driverId,
        createdBy: applicationData.ownerId,
        timestamp: serverTimestamp()
      });

      console.log('✅ Notification sent to driver about application update:', status);
    } catch (error) {
      console.error('❌ Error sending notification to driver:', error);
    }
  }
}

export const applicationService = new ApplicationService();
export default applicationService; 