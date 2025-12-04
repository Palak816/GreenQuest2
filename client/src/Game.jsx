import React, { useState } from 'react'
import TrashSorter from './TrashSorter'
import TreePlanter from './TreePlanter'

export default function Game() {
  const [selectedGame, setSelectedGame] = useState(null)

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Eco Arcade</h1>
      
      {!selectedGame ? (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            onClick={() => setSelectedGame('trash')}
            className="bg-white p-8 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border-2 border-transparent hover:border-green-500"
          >
            <h2 className="text-2xl font-bold mb-4 text-green-700">Trash Sorter</h2>
            <p className="text-gray-600 mb-4">Help clean up the environment! Catch the falling recyclables in your bin.</p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold">Play Now</button>
          </div>

          <div 
            onClick={() => setSelectedGame('tree')}
            className="bg-white p-8 rounded-xl shadow-lg cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border-2 border-transparent hover:border-green-500"
          >
            <h2 className="text-2xl font-bold mb-4 text-green-700">Tree Planter</h2>
            <p className="text-gray-600 mb-4">Reforest the planet! Click to plant trees and watch them grow.</p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold">Play Now</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setSelectedGame(null)}
            className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 self-start"
          >
            ? Back to Menu
          </button>
          
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {selectedGame === 'trash' && <TrashSorter />}
            {selectedGame === 'tree' && <TreePlanter />}
          </div>
        </div>
      )}
    </div>
  )
}
