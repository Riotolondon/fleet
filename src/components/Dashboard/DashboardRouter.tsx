import { useAuth } from '../../contexts/AuthContext';
import OwnerDashboard from '../OwnerDashboard';
import DriverDashboard from '../DriverDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return user.role === 'owner' ? <OwnerDashboard /> : <DriverDashboard />;
};

export default DashboardRouter;