import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Coins, TrendingUp, AlertCircle, ShieldAlert } from 'lucide-react';

export default function AdminPanel() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
      try {
          const token = localStorage.getItem('greenquest_token');
          const res = await axios.get('https://palak-project-1.onrender.com/api/admin/metrics', {
              headers: { Authorization: `Bearer ${token}` }
          });
          setMetrics(res.data);
      } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  if(!metrics) return <div className="p-12 text-center text-green-800 font-bold">Verifying Administrator Privileges...</div>;

  return (
      <div className="max-w-6xl mx-auto py-8">
          <div className="flex items-center gap-4 mb-8 text-green-900 border-b-2 border-green-900/10 pb-6">
              <ShieldAlert size={40} className="text-red-600" />
              <div>
                  <h1 className="text-4xl font-black">Educator Telemetry</h1>
                  <p className="text-green-700 font-medium">Monitor overall platform health and student engagement metrics.</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                  <Users size={32} className="text-green-600 mb-2" />
                  <p className="text-4xl font-black text-green-900">{metrics.totalUsers}</p>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-1">Total Operatives</p>
              </div>
              <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                  <TrendingUp size={32} className="text-green-600 mb-2" />
                  <p className="text-4xl font-black text-green-900">{metrics.totalXp}</p>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-1">Gross Ecosystem XP</p>
              </div>
              <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                  <Coins size={32} className="text-green-600 mb-2" />
                  <p className="text-4xl font-black text-green-900">{metrics.totalCoins}</p>
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-1">Circulating Eco-Coins</p>
              </div>
          </div>

          <div className="glass-card overflow-hidden">
             <div className="bg-green-900 text-green-50 px-6 py-4">
                 <h2 className="font-bold tracking-widest uppercase">Registered Operative Ledger</h2>
             </div>
             <table className="w-full text-left">
                 <thead className="bg-green-100 text-green-800 text-xs uppercase tracking-widest">
                     <tr>
                         <th className="p-4">User</th>
                         <th className="p-4">Level</th>
                         <th className="p-4">XP</th>
                         <th className="p-4">Balance</th>
                         <th className="p-4">Streak Status</th>
                     </tr>
                 </thead>
                 <tbody className="text-sm font-bold text-green-900">
                     {metrics.activeUsersList.map(u => (
                         <tr key={u._id} className="border-b border-green-50 hover:bg-white/40 transition-colors">
                             <td className="p-4">{u.username}</td>
                             <td className="p-4">{u.level || 1}</td>
                             <td className="p-4">{u.points || 0} XP</td>
                             <td className="p-4">{u.coins || 0}</td>
                             <td className="p-4">
                                {u.streak ? (
                                    <span className="bg-green-200 text-green-900 px-2 py-1 rounded text-xs font-black">{u.streak} Days Active</span>
                                ) : (
                                    <span className="text-red-500 text-xs italic font-medium">Inactive</span>
                                )}
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      </div>
  );
}
