import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from './UserContext';
import { Users, AlertTriangle, TrendingUp, BookOpen, User } from 'lucide-react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const EducatorDashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('greenquest_token');
        const res = await axios.get('http://localhost:5000/api/analytics/class', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-green-800">Assessing class performance...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-900">Educator Portal</h1>
        <div className="bg-white/50 px-4 py-2 rounded-full border border-green-200 text-green-700 text-sm font-medium">
          Role: Institutional Administrator
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Students</p>
              <h3 className="text-2xl font-bold text-green-900">{stats?.studentStats.length || 0}</h3>
            </div>
            <Users className="text-green-500 opacity-20" size={40} />
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-yellow-700 text-sm font-medium">At-Risk Students</p>
              <h3 className="text-2xl font-bold text-yellow-900">{stats?.atRisk.length || 0}</h3>
            </div>
            <AlertTriangle className="text-yellow-500 opacity-20" size={40} />
          </div>
        </div>
        <div className="glass-card p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-700 text-sm font-medium">Class Engagement</p>
              <h3 className="text-2xl font-bold text-blue-900">84%</h3>
            </div>
            <TrendingUp className="text-blue-500 opacity-20" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center">
            <BookOpen className="mr-2" size={20} /> Learning Analytics: Points Distribution
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.studentStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="username" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="points" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Student Roster */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 overflow-hidden"
        >
          <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center">
            <User className="mr-2" size={20} /> Student Performance Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-green-100 text-green-600 font-medium text-sm">
                  <th className="pb-3 px-2">Student</th>
                  <th className="pb-3 px-2">Exp Level</th>
                  <th className="pb-3 px-2">Total Points</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50">
                {stats?.studentStats.map((student, idx) => (
                  <tr key={idx} className="hover:bg-green-50/50 transition-colors">
                    <td className="py-4 px-2 font-medium text-green-900">{student.username}</td>
                    <td className="py-4 px-2 text-green-700">Level {student.level}</td>
                    <td className="py-4 px-2 text-green-700 font-bold">{student.points}</td>
                    <td className="py-4 px-2">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${student.points > 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {student.points > 100 ? 'On Track' : 'Needs Reinforcement'}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EducatorDashboard;
