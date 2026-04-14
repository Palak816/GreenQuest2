import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Award } from 'lucide-react';
import { useUser } from './UserContext';

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addPoints } = useUser();
  const [lesson, setLesson] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      const token = localStorage.getItem('greenquest_token');
      const res = await axios.get(`http://localhost:5000/api/learning/lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLesson(res.data);
    };
    fetchLesson();
  }, [id]);

  const handleComplete = async () => {
     try {
        const token = localStorage.getItem('greenquest_token');
        await axios.post('http://localhost:5000/api/learning/complete-lesson', {
           lessonId: id,
           xpReward: lesson.xpReward
        }, { headers: { Authorization: `Bearer ${token}` }});
        // visually unlock
        addPoints(lesson.xpReward); // Just local update for show
        setCompleted(true);
     } catch(e) {
       console.error("error completing", e);
     }
  };

  if(!lesson) return <div className="text-center p-12 text-green-800 animate-pulse font-bold">Loading curriculum...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/learning')} className="text-green-700 font-bold flex items-center mb-6 hover:text-green-900">
         <ArrowLeft className="mr-2" size={18} /> Back to Modules
      </button>

      <motion.div 
         initial={{opacity: 0, scale: 0.95}} 
         animate={{opacity: 1, scale: 1}} 
         className="glass-card p-10 mt-6 min-h-[60vh] flex flex-col"
      >
         <h1 className="text-3xl font-black text-green-900 mb-6">{lesson.title}</h1>
         
         <div className="flex-1 text-lg text-green-800 leading-relaxed font-medium mb-12">
            {lesson.type === 'image' ? (
                <img src={lesson.content} alt="Lesson illustration" className="rounded-2xl shadow-lg w-full object-cover" />
            ) : (
                <p>{lesson.content}</p>
            )}
         </div>

         {completed ? (
            <div className="bg-green-100 border-2 border-green-500 rounded-2xl p-6 text-center text-green-900">
               <CheckCircle className="mx-auto text-green-500 mb-2" size={40} />
               <p className="font-black text-xl mb-1">Lesson Conquered!</p>
               <p className="text-sm font-bold flex items-center justify-center gap-1 text-green-700"><Award size={16} className="text-yellow-500"/> +{lesson.xpReward} XP Earned</p>
            </div>
         ) : (
            <button onClick={handleComplete} className="btn-primary w-full text-white font-black text-lg py-4 rounded-xl shadow-lg active:scale-95 transition-transform">
               Mark as Completed
            </button>
         )}
      </motion.div>
    </div>
  );
}
