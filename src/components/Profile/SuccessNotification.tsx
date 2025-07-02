import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessNotificationProps {
  isVisible: boolean;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({ 
  isVisible, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] max-w-sm">
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 flex items-center space-x-3 animate-in slide-in-from-right-5 duration-300">
        <div className="flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Success!</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default SuccessNotification; 