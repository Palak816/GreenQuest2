import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // Initialize state from localStorage or default values
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('greenquest_user');
    return savedUser ? JSON.parse(savedUser) : {
      points: 0,
      level: 1,
      levelName: 'Seedling',
      badges: []
    };
  });

  // Save to localStorage whenever user state changes
  useEffect(() => {
    localStorage.setItem('greenquest_user', JSON.stringify(user));
  }, [user]);

  const addPoints = (amount) => {
    setUser(prev => {
      const newPoints = prev.points + amount;
      let newLevel = prev.level;
      let newLevelName = prev.levelName;

      // Simple leveling logic
      if (newPoints >= 100 && newPoints < 300) {
        newLevel = 2;
        newLevelName = 'Sprout';
      } else if (newPoints >= 300 && newPoints < 600) {
        newLevel = 3;
        newLevelName = 'Sapling';
      } else if (newPoints >= 600) {
        newLevel = 4;
        newLevelName = 'Tree';
      }

      return {
        ...prev,
        points: newPoints,
        level: newLevel,
        levelName: newLevelName
      };
    });
  };

  const addBadge = (badgeName) => {
    setUser(prev => {
      if (prev.badges.includes(badgeName)) return prev;
      return { ...prev, badges: [...prev.badges, badgeName] };
    });
  };

  return (
    <UserContext.Provider value={{ user, addPoints, addBadge }}>
      {children}
    </UserContext.Provider>
  );
};
