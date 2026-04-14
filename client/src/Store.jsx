import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Package, Shield, Gift, AlertCircle } from 'lucide-react';
import { useUser } from './UserContext';

export default function Store() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState(null);
  const { user, login } = useUser(); // We can trigger a context re-fetch or manually update

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem('greenquest_token');
      const res = await axios.get('http://localhost:5000/api/store/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data);
    };
    fetchItems();
  }, []);

  const buyItem = async (itemId) => {
      setError(null);
      setLoading(true);
      try {
        const token = localStorage.getItem('greenquest_token');
        const res = await axios.post('http://localhost:5000/api/store/buy', { itemId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Re-inject updated user data to localStorage / Context (simplistic manual update for phase requirements)
        const updatedUser = { ...user, coins: res.data.coins, badges: res.data.inventory, avatar: res.data.avatar || user.avatar };
        localStorage.setItem('greenquest_user', JSON.stringify(updatedUser));
        window.location.reload(); // Quick sync
      } catch (err) {
         setError(err.response?.data?.message || 'Error occurred');
      } finally {
         setLoading(false);
      }
  };

  const handleSpin = async () => {
      if(user.coins < 10) return setError('Not enough coins to spin!');
      setError(null);
      setIsSpinning(true);
      try {
        const token = localStorage.getItem('greenquest_token');
        const res = await axios.post('http://localhost:5000/api/store/spin', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTimeout(() => {
          setSpinResult(res.data.reward);
          setIsSpinning(false);
          // Sync coins
          const updatedUser = { ...user, coins: res.data.coins };
          localStorage.setItem('greenquest_user', JSON.stringify(updatedUser));
        }, 1500); // 1.5s spin animation wait
      } catch (err) {
         setError(err.response?.data?.message);
         setIsSpinning(false);
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="glass-card p-8 flex justify-between items-center bg-gradient-to-r from-green-900 to-green-700 text-white">
         <div>
             <h1 className="text-4xl font-black mb-2 flex items-center gap-3"><Package size={40} /> Eco-Store</h1>
             <p className="text-green-100 font-medium">Exchange your Green Coins for exclusive avatars and power-ups.</p>
         </div>
         <div className="text-center bg-black/20 p-4 rounded-2xl border-2 border-white/10 shadow-inner">
             <Coins size={28} className="mx-auto text-yellow-400 mb-1" />
             <p className="text-3xl font-black text-yellow-400">{user.coins}</p>
             <p className="text-[10px] uppercase font-bold tracking-widest text-green-200">Balance</p>
         </div>
      </div>
      
      {error && <div className="bg-red-100 text-red-800 p-4 rounded-xl flex items-center font-bold absolute top-20 right-4 z-50 shadow-xl border-l-4 border-red-500"><AlertCircle className="mr-2" /> {error} <button onClick={()=>setError(null)} className="ml-4 text-red-400 hover:text-red-900">&times;</button></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Shop Inventory */}
          <div className="space-y-4">
             <h2 className="text-2xl font-black text-green-900 px-2 flex items-center gap-2"><Package aria-hidden="true" /> Market</h2>
             {items.map(item => {
                 const isOwned = user.badges?.includes(item.id);
                 return (
                 <div key={item.id} className="glass-card p-6 flex justify-between items-center transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                       {item.img ? (
                          <img src={item.img} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-md" />
                       ) : (
                          <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500 shadow-inner"><Shield size={32} /></div>
                       )}
                       <div>
                           <p className="font-black text-green-900 text-lg">{item.name}</p>
                           <p className="text-xs font-bold text-green-700">{item.desc}</p>
                           {isOwned && <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-800 px-2 py-1 uppercase tracking-widest font-black rounded-md">Owned</span>}
                       </div>
                    </div>
                    {isOwned && item.type === 'cosmetic' ? (
                       <button disabled className="btn-primary opacity-50 text-white px-6 py-2 rounded-full font-bold shadow-none">Equipped</button>
                    ) : (
                       <button onClick={() => buyItem(item.id)} disabled={loading || user.coins < item.price} className="btn-primary text-white px-6 py-2 rounded-full font-black shadow-lg flex flex-col items-center leading-none active:scale-95 disabled:opacity-50">
                          {item.price} 
                          <span className="text-[9px] uppercase tracking-widest">Coins</span>
                       </button>
                    )}
                 </div>
             )})}
          </div>

          {/* Spin the Wheel minigame */}
          <div className="glass-card p-8 text-center flex flex-col justify-center items-center bg-gradient-to-tr from-white to-yellow-50 relative overflow-hidden h-full min-h-[400px]">
             <div className="absolute top-0 right-0 p-4 opacity-5"><Gift size={200} /></div>
             
             <h2 className="text-3xl font-black text-yellow-600 mb-2 relative z-10">Daily Fortune</h2>
             <p className="text-sm font-bold text-yellow-800/60 mb-8 relative z-10">Spin the wheel to win up to 100 extra Green Coins!</p>

             <div className="relative mb-8 z-10">
                 <motion.div 
                    animate={isSpinning ? { rotate: 1080 } : { rotate: 0 }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="w-48 h-48 rounded-full border-8 border-yellow-400 bg-white shadow-[0_0_40px_rgba(250,204,21,0.4)] flex items-center justify-center relative overflow-hidden"
                 >
                    <div className="absolute w-1 h-full bg-yellow-100/50"></div>
                    <div className="absolute w-full h-1 bg-yellow-100/50"></div>
                    <Gift size={60} className={`text-yellow-500 ${isSpinning ? 'animate-pulse' : ''}`} />
                 </motion.div>
                 {spinResult !== null && !isSpinning && (
                     <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white font-black text-2xl px-6 py-3 rounded-2xl shadow-2xl border-4 border-white z-20">
                         +{spinResult}
                     </motion.div>
                 )}
             </div>

             <button onClick={handleSpin} disabled={isSpinning} className="bg-yellow-500 hover:bg-yellow-400 border-b-4 border-yellow-600 text-yellow-900 font-black text-xl px-12 py-4 rounded-full shadow-xl active:translate-y-1 active:border-b-0 disabled:opacity-50 transition-all z-10">
                 SPIN (10 Coins)
             </button>
             
             {spinResult !== null && !isSpinning && (
                 <button onClick={() => {setSpinResult(null); window.location.reload();}} className="mt-4 text-xs font-bold text-green-600 underline">Claim & Refresh</button>
             )}
          </div>
      </div>
    </div>
  );
}
