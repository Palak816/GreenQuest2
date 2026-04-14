import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from './UserContext';
import { Users, UserPlus, Shield, Target, PlusCircle, Globe, Search, Trophy, Leaf, Zap } from 'lucide-react';
import axios from 'axios';

const SocialHub = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('feed'); // feed, leaderboard, search, squad
  const [feed, setFeed] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'feed') fetchFeed();
    if (activeTab === 'leaderboard') fetchLeaderboard();
    if (activeTab === 'squad' && !squad) fetchSquad();
  }, [activeTab]);

  const fetchFeed = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('greenquest_token');
        const res = await axios.get('http://localhost:5000/api/social/feed', { headers: { Authorization: `Bearer ${token}` }});
        setFeed(res.data);
      } catch(e) {} finally { setLoading(false); }
  };

  const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('greenquest_token');
        const res = await axios.get('http://localhost:5000/api/leaderboard', { headers: { Authorization: `Bearer ${token}` }});
        setLeaderboard(res.data);
      } catch(e) {} finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
      e.preventDefault();
      if(!searchQuery.trim()) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('greenquest_token');
        const res = await axios.get(`http://localhost:5000/api/social/search?q=${searchQuery}`, { headers: { Authorization: `Bearer ${token}` }});
        setSearchResults(res.data);
      } catch(e) {} finally { setLoading(false); }
  };

  const handleFollow = async (followId) => {
      try {
         const token = localStorage.getItem('greenquest_token');
         await axios.post('http://localhost:5000/api/social/follow', { followId }, { headers: { Authorization: `Bearer ${token}` }});
         alert('Following successful! Activity published to feed.');
      } catch(e) { alert(e.response?.data?.message || 'Error following'); }
  };

  const fetchSquad = async () => {
      try {
        const token = localStorage.getItem('greenquest_token');
        const res = await axios.get('http://localhost:5000/api/squads/mine', { headers: { Authorization: `Bearer ${token}` }});
        setSquad(res.data);
      } catch(e) {}
  };

  return (
    <div className="max-w-5xl mx-auto py-8 text-green-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black flex items-center">
          <Globe className="mr-3 text-green-600" size={36} /> Social Network
        </h1>
      </div>

      <div className="flex gap-4 mb-8 border-b-2 border-green-800/10 pb-4 overflow-x-auto">
         {['feed', 'leaderboard', 'search', 'squad'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-sm ${activeTab === tab ? 'bg-green-600 text-white shadow-lg' : 'bg-white/60 text-green-800 hover:bg-green-100'}`}>
               {tab}
            </button>
         ))}
      </div>

      <div className="glass-card p-8 min-h-[50vh]">
         {loading && <div className="text-center font-bold text-green-700 p-8 animate-pulse">Syncing Network Interfaces...</div>}
         
         {!loading && activeTab === 'feed' && (
             <div className="space-y-4">
                <h2 className="text-2xl font-black mb-6">Global Activity</h2>
                {feed.length === 0 ? <p className="text-green-700 italic">No activity broadcasts found.</p> : feed.map((item) => (
                    <div key={item._id} className="flex gap-4 items-center bg-white/40 p-4 rounded-2xl border-l-4 border-green-500 hover:bg-white/60 transition-colors">
                        <img src={(item.user?.avatar && item.user.avatar.startsWith('http')) ? item.user.avatar : '/default_avatar.png'} alt="user" className="w-12 h-12 rounded-full border-2 border-green-200 object-cover bg-green-50" />
                        <div>
                           <p className="font-bold">
                               <span className="text-green-800">{item.user?.username || 'Unknown'}</span> <span className="text-green-600 font-medium">{item.description}</span>
                           </p>
                           <p className="text-xs text-green-500 font-bold uppercase tracking-wide mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
             </div>
         )}

         {!loading && activeTab === 'leaderboard' && (
             <div className="space-y-4">
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Trophy className="text-yellow-500"/> Global Top Pioneers</h2>
                <div className="grid gap-4">
                {leaderboard.map((u, i) => (
                    <div key={u._id} className={`flex items-center gap-6 p-4 rounded-2xl transition-all shadow-sm border-2 border-transparent ${i === 0 ? 'bg-yellow-50 border-yellow-300' : i === 1 ? 'bg-gray-50 border-gray-300' : i === 2 ? 'bg-orange-50 border-orange-300' : 'bg-white/50'}`}>
                       <div className="w-8 font-black text-xl text-center opacity-50">#{i + 1}</div>
                       <div className="flex-1 flex justify-between items-center">
                          <div>
                             <p className="font-black text-lg">{u.username}</p>
                             <p className="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center"><Shield size={12} className="mr-1"/> Level {u.level || 1}</p>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-2xl text-green-800">{u.points} XP</p>
                          </div>
                       </div>
                    </div>
                ))}
                </div>
             </div>
         )}

         {!loading && activeTab === 'search' && (
             <div className="space-y-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                   <input type="text" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Search environmentalists..." className="flex-1 p-4 rounded-2xl bg-white/60 border-2 border-green-200 outline-none focus:ring-4 focus:ring-green-400 font-bold text-lg" />
                   <button type="submit" className="btn-primary text-white font-black px-8 py-4 rounded-2xl shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1"><Search /></button>
                </form>

                <div className="grid gap-4">
                   {searchResults.length === 0 ? <p className="text-center font-bold text-green-600">No results found.</p> : searchResults.map(u => (
                      <div key={u._id} className="flex justify-between items-center bg-white/40 p-4 rounded-2xl shadow-sm border border-green-100">
                          <div className="flex items-center gap-4">
                              <img src={(u.avatar && u.avatar.startsWith('http')) ? u.avatar : '/default_avatar.png'} alt="user" className="w-14 h-14 rounded-full border border-green-200 object-cover bg-green-50" />
                              <div>
                                 <p className="font-black text-lg">{u.username}</p>
                                 <p className="text-xs font-bold text-green-600 uppercase tracking-widest">{u.league || 'Bronze'} League</p>
                              </div>
                          </div>
                          <button onClick={() => handleFollow(u._id)} className="bg-green-100 text-green-800 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest hover:bg-green-200 transition-colors flex items-center gap-2">
                             <UserPlus size={16} /> Follow
                          </button>
                      </div>
                   ))}
                </div>
             </div>
         )}

         {!loading && activeTab === 'squad' && (
             <div className="text-center space-y-4 py-12">
                 <Shield size={64} className="mx-auto text-green-600 opacity-20" />
                 <h2 className="text-2xl font-black">Squad Mechanics (Requires Phase 5 Multiplayer Sync)</h2>
                 <p className="text-green-700 max-w-md mx-auto">Squads are cooperative alliances to pool points together in live events. (Check existing code implementation logic if this tab operates independently).</p>
             </div>
         )}
      </div>
    </div>
  );
};
export default SocialHub;
