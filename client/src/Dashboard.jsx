import React from 'react'
import { useUser } from './UserContext'

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Eco Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Points</h2>
          <p className="text-4xl text-green-600 font-bold">{user.points}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Level</h2>
          <p className="text-4xl text-blue-600 font-bold">{user.level} - {user.levelName}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Badges</h2>
          <div className="flex space-x-2 flex-wrap gap-2">
            {user.badges.length > 0 ? (
              user.badges.map((badge, index) => (
                <span key={index} className="bg-yellow-200 px-2 py-1 rounded text-sm">{badge}</span>
              ))
            ) : (
              <p className="text-gray-500">No badges yet. Play games to earn them!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
