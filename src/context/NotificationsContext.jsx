// src/context/NotificationsContext.jsx
import { createContext, useState, useContext } from 'react';

const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = (notification) => {
    setNotifications(prev => [{
      id: Date.now(),
      ...notification,
      read: false
    }, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? {...n, read: true} : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationsContext.Provider 
      value={{ notifications, addNotification, markAsRead, clearAll }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);