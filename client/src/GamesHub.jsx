import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gamepad2, AlertTriangle, Swords, Leaf } from 'lucide-react';

export default function GamesHub() {
  return (
      <div className="max-w-5xl mx-auto py-8">
           <div className="text-center mb-12">
               <h1 className="text-5xl font-black text-green-900 mb-4 flex justify-center items-center gap-4"><Gamepad2 size={48} className="text-green-600"/> Arcade</h1>
               <p className="text-green-800 font-medium text-lg">Apply your environmental knowledge in dynamic simulations.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <motion.div whileHover={{scale: 1.02}} className="glass-card p-8 flex flex-col h-full relative overflow-hidden group">
                   <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-20 transition-opacity"><Leaf size={200} /></div>
                   <h2 className="text-3xl font-black text-green-900 mb-2 relative z-10">Carbon Footprint Calculator</h2>
                   <p className="text-green-700 font-medium mb-6 relative z-10">Analyze your lifestyle and discover areas of impact. Receive a definitive carbon score and earn Coins for strong eco-conscious routines.</p>
                   
                   <div className="mt-auto relative z-10">
                       <Link to="/games/carbon" className="btn-primary text-white font-black px-6 py-3 rounded-xl inline-block shadow-lg">Start Simulation</Link>
                   </div>
               </motion.div>

               <motion.div whileHover={{scale: 1.02}} className="glass-card p-8 flex flex-col h-full bg-gradient-to-br from-white to-red-50 border-r-4 border-red-300 relative overflow-hidden group">
                   <div className="absolute -bottom-8 -right-8 opacity-5 text-red-500 group-hover:opacity-10 transition-opacity"><Swords size={200} /></div>
                   <div className="flex justify-between items-start relative z-10">
                       <h2 className="text-3xl font-black text-red-900 mb-2">Quiz Battles (1v1)</h2>
                       <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">Dev Build</span>
                   </div>
                   <p className="text-red-800/70 font-medium mb-6 relative z-10">Challenge a rival operative in a real-time web-socket contest of ecological knowledge. Fastest correct answer claims the prize pool.</p>
                   
                   <div className="mt-auto relative z-10">
                       <button disabled className="bg-red-900/10 text-red-900/50 cursor-not-allowed font-black px-6 py-3 rounded-xl inline-block">Awaiting Network Sync</button>
                   </div>
               </motion.div>

               <motion.div whileHover={{scale: 1.02}} className="col-span-1 md:col-span-2 glass-card p-8 flex items-center justify-between border-l-4 border-blue-400 bg-gradient-to-r from-white to-blue-50 relative overflow-hidden group">
                   <div className="relative z-10 max-w-xl">
                       <h2 className="text-2xl font-black text-blue-900 mb-2">Ocean Cleanup: Phaser Engine</h2>
                       <p className="text-blue-800/70 font-medium">Pilot a sub and sort microscopic plastics from native wildlife using external Phaser Game bounds.</p>
                   </div>
                   <button className="btn-primary bg-blue-600 hover:bg-blue-500 border-blue-700 shadow-blue-500/30 text-white font-black px-8 py-4 rounded-2xl relative z-10">Launch Engine</button>
               </motion.div>
           </div>
      </div>
  );
}
