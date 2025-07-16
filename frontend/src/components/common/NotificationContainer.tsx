import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { removeNotification } from '../../store/slices/appSlice';

export const NotificationContainer: React.FC = () => {
  const { notifications } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  useEffect(() => {
    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration || 5000); // 5 segundos por defecto

      return () => clearTimeout(timer);
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg border max-w-sm
            ${notification.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : ''}
            ${notification.type === 'error' ? 'bg-red-100 border-red-200 text-red-800' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-100 border-yellow-200 text-yellow-800' : ''}
            ${notification.type === 'info' ? 'bg-blue-100 border-blue-200 text-blue-800' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => dispatch(removeNotification(notification.id))}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};