import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from './UserContext';
import { Leaf, Award, Zap, TrendingUp, MessageSquare, Send, Trophy, Globe, Activity, Flame, Coins, Shield } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user, addPoints } = useUser();
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [impactAction, setImpactAction] = useState('recycle');
  const [impactValue, setImpactValue] = useState(1);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('greenquest_token');
      const res = await axios.get('http://localhost:5000/api/leaderboard', {
           headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(res.data);
    } catch (err) {
      console.error("Leaderboard error", err);
    }
  };

  const handleTutor = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    
    setLoading(true);
    const userMsg = { role: 'user', text: msg };
    setChat(prev => [...prev, userMsg]);
    setMsg('');

    try {
      const token = localStorage.getItem('greenquest_token');
      const res = await axios.post('http://localhost:5000/api/ai/tutor', 
        { message: msg, context: { points: user.points, level: user.level, role: user.role } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChat(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'bot', text: "Eco-Tutor is resting. Try again later!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImpactSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('greenquest_token');
      const res = await axios.post('http://localhost:5000/api/impact/sync', 
        { actionType: impactAction, value: parseInt(impactValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addPoints(res.data.pointsEarned);
      // Optional: Add some notification or visual feedback here
    } catch (err) {
      console.error("Impact sync failed", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-left relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Leaf size={120} className="text-green-800" aria-hidden="true" />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img src={user.avatar?.startsWith('http') ? user.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-green-100" />
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full shadow border-2 border-white">
                Lv {user.level}
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-green-900 leading-tight">Empowering Sustainability, {user.username}!</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-green-700 font-medium flex items-center gap-1"><Shield size={16} /> {user.league || 'Bronze'} League</span>
                <span className="text-orange-500 font-bold flex items-center gap-1"><Flame size={16} /> {user.streak || 0} Day Streak</span>
                <span className="text-yellow-600 font-bold flex items-center gap-1"><Coins size={16} /> {user.coins || 0} Coins</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 shrink-0">
            <div className="text-center bg-white/60 p-4 rounded-2xl border border-white/40 shadow-sm min-w-[100px]">
              <Zap className="text-yellow-500 mx-auto mb-1" size={24} aria-hidden="true" />
              <p className="text-2xl font-black text-green-900">{user.points}</p>
              <p className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Impact Points</p>
            </div>
            {user.role === 'educator' && (
               <div role="button" tabIndex="0" className="text-center bg-green-600 p-4 rounded-2xl shadow-lg cursor-pointer hover:bg-green-700 transition-colors flex flex-col justify-center">
                 <Trophy className="text-white mx-auto mb-1" size={24} aria-hidden="true" />
                 <p className="text-xs font-bold text-white">Class View</p>
               </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Real-World Impact Sync */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 bg-gradient-to-br from-white to-blue-50"
        >
          <div className="flex items-center space-x-3 mb-6">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Globe size={20} aria-hidden="true" />
             </div>
             <h2 className="text-lg font-black text-blue-900">Ecosystem Sync</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-700 uppercase tracking-widest pl-1">Action Category</label>
              <select 
                value={impactAction} 
                onChange={(e) => setImpactAction(e.target.value)}
                className="w-full bg-white/60 border-2 border-blue-100 rounded-xl p-3 text-sm font-bold text-blue-900 outline-none"
                aria-label="Action Category"
              >
                <option value="recycle">Sustainable Waste Sorting</option>
                <option value="energy_save">Carbon Offset (Energy)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-blue-700 uppercase tracking-widest pl-1">Quantum Value</label>
              <input 
                type="number" 
                value={impactValue}
                aria-label="Quantum Value"
                onChange={(e) => setImpactValue(e.target.value)}
                className="w-full bg-white/60 border-2 border-blue-100 rounded-xl p-3 text-sm font-bold text-blue-900 outline-none"
              />
            </div>
            <button 
              onClick={handleImpactSync}
              disabled={syncing}
              className="w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center active:scale-95"
            >
               {syncing ? 'Syncing...' : 'Log Real-World Action'}
            </button>
          </div>
          <p className="text-[9px] text-blue-800/40 text-center mt-4 uppercase font-bold tracking-widest leading-relaxed">
            Data validated against local ecological thresholds
          </p>
        </motion.div>

        {/* Global Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold text-green-800 flex items-center mb-6">
            <Trophy className="mr-2 text-yellow-600" size={20} aria-hidden="true" /> Global Rankings
          </h2>
          <div className="space-y-4">
            {leaderboard.map((member, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${member.username === user.username ? 'bg-green-600/10 border border-green-600/20 shadow-inner' : 'bg-white/40 shadow-sm'}`}>
                <div className="flex items-center space-x-3">
                  <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${i < 3 ? 'bg-yellow-400 text-yellow-900' : 'bg-green-100 text-green-800'}`}>
                    {i + 1}
                  </span>
                  <span className="font-bold text-green-900">{member.username}</span>
                </div>
                <span className="font-black text-green-700 text-sm">{member.points}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-[10px] font-black uppercase text-green-600 tracking-widest hover:text-green-800 transition-colors">
            View Expanded Standings
          </button>
        </motion.div>

        {/* AI Eco-Tutor */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 flex flex-col h-[450px]"
        >
          <div className="flex items-center space-x-3 mb-6">
             <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <MessageSquare size={20} aria-hidden="true" />
             </div>
             <h2 className="text-lg font-black text-purple-900">Cognitive Assistant</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-hide text-sm">
            {chat.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-4">
                 <Activity className="text-purple-200" size={48} aria-hidden="true" />
                 <p className="text-green-800/40 italic font-medium">Inquire about ecological phenomena or sustainable practices.</p>
              </div>
            )}
            <AnimatePresence>
            {chat.map((c, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: c.role === 'user' ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${c.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div className={`inline-block p-4 rounded-2xl max-w-[90%] shadow-sm ${c.role === 'user' ? 'bg-green-600 text-white' : 'bg-white/80 text-green-900 border border-green-100'}`}>
                  {c.text}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
            {loading && <div className="text-purple-600 animate-pulse text-[10px] font-black uppercase tracking-widest pl-3">Heuristic Analysis underway...</div>}
          </div>
          <form onSubmit={handleTutor} className="flex space-x-2 bg-white/60 p-1 rounded-2xl shadow-inner border border-white/40">
            <input 
              type="text" 
              value={msg} 
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none rounded-2xl p-3 focus:ring-0 outline-none text-sm text-green-900 font-medium"
              aria-label="Chat input"
            />
            <button aria-label="Send message" className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-all shadow-lg active:scale-95">
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
