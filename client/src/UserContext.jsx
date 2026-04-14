import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const DEFAULT_USER = {
  id: '507f1f77bcf86cd799439011',
  username: 'Eco Explorer',
  role: 'student',
  isLoggedIn: true,
  points: 0,
  level: 1,
  levelName: 'Seedling',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EcoExplorer',
  xp: 0,
  streak: 0,
  coins: 50,
  league: 'Bronze',
  badges: [],
  loading: false
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);

  useEffect(() => {
    const savedUser = localStorage.getItem('greenquest_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({ ...parsed, isLoggedIn: true, loading: false });
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  const logout = () => {
    setUser(DEFAULT_USER);
    localStorage.removeItem('greenquest_token');
    localStorage.removeItem('greenquest_user');
  };

  const addPoints = (amount) => {
     setUser(prev => {
      const newPoints = prev.points + amount;
      let newLevel = prev.level;
      let newLevelName = prev.levelName;

      if (newPoints >= 100 && newPoints < 300) { newLevel = 2; newLevelName = 'Sprout'; }
      else if (newPoints >= 300 && newPoints < 600) { newLevel = 3; newLevelName = 'Sapling'; }
      else if (newPoints >= 600) { newLevel = 4; newLevelName = 'Tree'; }

      const updated = { ...prev, points: newPoints, level: newLevel, levelName: newLevelName };
      localStorage.setItem('greenquest_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, logout, addPoints }}>
      {children}
    </UserContext.Provider>
  );
};
