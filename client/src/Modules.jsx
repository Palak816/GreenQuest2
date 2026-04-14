import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Book, PlayCircle, CheckCircle } from 'lucide-react';
import { useUser } from './UserContext';

export default function Modules() {
  const [modules, setModules] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchModules = async () => {
      const token = localStorage.getItem('greenquest_token');
      const res = await axios.get('http://localhost:5000/api/learning/modules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModules(res.data);
    };
    fetchModules();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
         <h1 className="text-4xl font-black text-green-900 mb-2">Knowledge Paths</h1>
         <p className="text-green-700">Master ecological topics and earn XP to rank up leagues.</p>
      </div>
      
      {modules.map((mod, i) => (
        <motion.div 
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: i * 0.1}}
          key={mod._id} 
          className="glass-card p-6 border-l-8 border-green-600"
        >
          <h2 className="text-2xl font-bold text-green-800 mb-1">{mod.title}</h2>
          <p className="text-sm text-green-600 mb-6">{mod.description}</p>
          <div className="space-y-3">
             {mod.lessons.map(lesson => {
                const isCompleted = user.badges?.includes(lesson._id) || false; // Just visual mocking
                return (
                 <div key={lesson._id} className="flex justify-between items-center p-4 bg-white/40 rounded-xl">
                   <div className="flex items-center gap-3">
                     {lesson.type === 'video' ? <PlayCircle className="text-green-600" /> : <Book className="text-green-600" />}
                     <span className="font-bold text-green-900">{lesson.title}</span>
                   </div>
                   <Link to={`/lesson/${lesson._id}`} className="btn-primary text-white text-sm px-6 py-2 rounded-full font-bold">
                     Start (+{lesson.xpReward} XP)
                   </Link>
                 </div>
                );
             })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
