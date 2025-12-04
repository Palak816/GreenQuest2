import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './Dashboard'
import Quiz from './Quiz'
import Game from './Game'
import { UserProvider } from './UserContext'

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-green-50">
          <nav className="bg-green-600 p-4 text-white">
            <div className="container mx-auto flex justify-between">
              <Link to="/" className="text-2xl font-bold">GreenQuest</Link>
              <div className="space-x-4">
                <Link to="/" className="hover:underline">Dashboard</Link>
                <Link to="/quiz" className="hover:underline">Quizzes</Link>
                <Link to="/game" className="hover:underline">Game</Link>
              </div>
            </div>
          </nav>
          <div className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/game" element={<Game />} />
            </Routes>
          </div>
        </div>
      </Router>
    </UserProvider>
  )
}

export default App
