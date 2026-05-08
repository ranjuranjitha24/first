import { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'interview', title: 'Interview Updated', message: 'Technical interview with John Doe moved to 3:00 PM', time: '5m ago', read: false },
    { id: 2, type: 'leave', title: 'Leave Approved', message: 'Your leave request for next Monday has been approved.', time: '1h ago', read: false },
    { id: 3, type: 'candidate', title: 'New Application', message: 'Sarah Smith applied for Senior Frontend Developer position.', time: '2h ago', read: true },
    { id: 4, type: 'event', title: 'Team Meeting', message: 'Quarterly review starts in 30 minutes in Room A.', time: '3h ago', read: true },
  ]);

  const [toasts, setToasts] = useState([]);

  const addNotification = (notif) => {
    const newNotif = { id: Date.now(), ...notif, time: 'Just now', read: false };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(newNotif);
  };

  const showToast = (notif) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, ...notif }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Simulate real-time notifications for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      addNotification({
        type: 'candidate',
        title: 'New Candidate',
        message: 'Michael Brown just submitted an application for Backend Lead.',
      });
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      toasts, 
      addNotification, 
      markAsRead, 
      markAllRead, 
      clearNotification 
    }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'interview' && '📅'}
              {toast.type === 'leave' && '🌴'}
              {toast.type === 'candidate' && '🎯'}
              {toast.type === 'event' && '✨'}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>✕</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
