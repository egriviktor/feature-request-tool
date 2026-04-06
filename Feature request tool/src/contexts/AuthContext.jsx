import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

const USER_KEY = 'auth_user';
const ALL_USERS_KEY = 'app_users';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [allUsers, setAllUsers] = useState(() => {
    const stored = localStorage.getItem(ALL_USERS_KEY);
    const users = stored ? JSON.parse(stored) : [
      { name: 'Viktor (Admin)', email: 'viktor@example.com', password: '1234', role: 'admin' }
    ];
    
    // FORCED SYNC: Ensure the default admin exists and HAS the admin role
    const adminIndex = users.findIndex(u => u.email === 'viktor@example.com');
    if (adminIndex === -1) {
      users.push({ name: 'Viktor (Admin)', email: 'viktor@example.com', password: '1234', role: 'admin' });
    } else {
      // Overwrite to ensure role is correct even if local storage says otherwise
      users[adminIndex].role = 'admin';
      // If password was 123456 before, keep it or keep 1234 as per requirements
      if (users[adminIndex].password !== '1234') users[adminIndex].password = '1234';
    }
    return users;
  });

  const registerDirect = useCallback((name, email, password, role = 'user') => {
    // Check if user already exists
    if (allUsers.find(u => u.email === email)) {
      return { success: false, message: 'Account already exists with this email.' };
    }

    const newUser = { name, email, password, role };
    const updatedUsers = [...allUsers, newUser];
    
    // Save to "database"
    setAllUsers(updatedUsers);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(updatedUsers));
    
    // Auto-login
    const { password: _, ...userData } = newUser;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    
    return { success: true };
  }, [allUsers]);

  const loginDirect = useCallback((email, password) => {
    const existingUser = allUsers.find(u => u.email === email);
    
    if (!existingUser) {
      return { success: false, message: 'No account found with this email.' };
    }
    
    if (existingUser.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    const { password: _, ...userData } = existingUser;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    
    return { success: true };
  }, [allUsers]);

  const loginAdmin = useCallback((email, password) => {
    const existingUser = allUsers.find(u => u.email === email);
    
    if (!existingUser) {
      return { success: false, message: 'No admin account found with this email.' };
    }
    
    if (existingUser.password !== password) {
      return { success: false, message: 'Incorrect password.' };
    }

    if (existingUser.role !== 'admin') {
      return { success: false, message: 'Access denied: Administrative privileges required.' };
    }

    const { password: _, ...userData } = existingUser;
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
    
    return { success: true };
  }, [allUsers]);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, registerDirect, loginDirect, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
