import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import EducatorDashboard from './EducatorDashboard'
import SocialHub from './SocialHub'
import Modules from './Modules'
import Lesson from './Lesson'
import Store from './Store'
import GamesHub from './GamesHub'
import CarbonFootprint from './CarbonFootprint'
import AdminPanel from './AdminPanel'
import Quiz from './Quiz'
import Game from './Game'
import { UserProvider, useUser } from './UserContext'
import { LayoutDashboard, BookOpen, Gamepad2, Leaf, ShieldCheck, Users } from 'lucide-react'
import './App.css'

function AppContent() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="nav-blur p-4 text-white hover:shadow-lg transition-all sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <Leaf className="mr-2" aria-hidden="true" /> GreenQuest
          </Link>
          <div className="flex space-x-6 items-center font-medium">
            <Link to="/" className="flex items-center hover:scale-110 transition-transform">
              <LayoutDashboard size={18} className="mr-1" aria-hidden="true" /> Dashboard
            </Link>
            
            <Link to="/social" className="flex items-center hover:scale-110 transition-transform">
              <Users size={18} className="mr-1" aria-hidden="true" /> SQUADS
            </Link>

            {user.role === 'educator' && (
              <Link to="/educator" className="flex items-center hover:scale-110 transition-transform text-white">
                <ShieldCheck size={18} className="mr-1 text-yellow-300" aria-hidden="true" /> Educator
              </Link>
            )}

            <Link to="/store" className="flex items-center hover:scale-110 transition-transform text-yellow-300 font-black">
              Store
            </Link>
            <Link to="/games" className="flex items-center hover:scale-110 transition-transform font-black">
              Arcade
            </Link>
            <Link to="/learning" className="flex items-center hover:scale-110 transition-transform">
              <BookOpen size={18} className="mr-1" aria-hidden="true" /> Learn
            </Link>
            <Link to="/quiz" className="flex items-center hover:scale-110 transition-transform">
              <Gamepad2 size={18} className="mr-1" aria-hidden="true" /> Quizzes
            </Link>
            <Link to="/game" className="flex items-center hover:scale-110 transition-transform">
              <Gamepad2 size={18} className="mr-1" aria-hidden="true" /> Games
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-6 flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learning" element={<Modules />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/store" element={<Store />} />
          <Route path="/games" element={<GamesHub />} />
          <Route path="/games/carbon" element={<CarbonFootprint />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/social" element={<SocialHub />} />
          <Route path="/educator" element={user.role === 'educator' ? <EducatorDashboard /> : <Navigate to="/" />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/game" element={<Game />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="text-center p-8 text-green-800/40 text-[10px] tracking-widest uppercase">
        GreenQuest Professional * Capstone System Design * 2026
      </footer>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  )
}

export default App