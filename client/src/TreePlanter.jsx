import React, { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { useUser } from './UserContext'

export default function TreePlanter() {
  const gameRef = useRef(null)
  const { addPoints, addBadge } = useUser()
  const [gameState, setGameState] = useState('playing') // playing, won, lost
  const [stats, setStats] = useState({ trees: 0, timeLeft: 30 })
  
  const statsRef = useRef(stats)
  statsRef.current = stats
  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState
  const addPointsRef = useRef(addPoints)
  addPointsRef.current = addPoints
  const addBadgeRef = useRef(addBadge)
  addBadgeRef.current = addBadge
  const setGameStateRef = useRef(setGameState)
  setGameStateRef.current = setGameState
  const setStatsRef = useRef(setStats)
  setStatsRef.current = setStats

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'tree-planter-game',
      backgroundColor: '#87CEEB',
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    }

    let scoreText
    let timerText
    let gameInstance
    let lastTime = 0

    function preload() {
      this.load.setBaseURL('https://labs.phaser.io')
      this.load.image('tree', 'assets/sprites/mushroom2.png')
    }

    function create() {
      scoreText = this.add.text(16, 16, 'Trees: 0 / 10', { fontSize: '32px', fill: '#000' })
      timerText = this.add.text(600, 16, 'Time: 30', { fontSize: '32px', fill: '#000' })
      
      this.add.text(200, 250, 'Click fast! Plant 10 trees in 30s!', { fontSize: '24px', fill: '#000' })

      this.input.on('pointerdown', function (pointer) {
        if (gameStateRef.current !== 'playing') return

        const tree = this.add.image(pointer.x, pointer.y, 'tree')
        
        tree.setScale(0.1)
        this.tweens.add({
            targets: tree,
            scaleX: 1,
            scaleY: 1,
            duration: 1000,
            ease: 'Bounce'
        })

        const newTrees = statsRef.current.trees + 1
        setStatsRef.current(prev => ({ ...prev, trees: newTrees }))
        scoreText.setText('Trees: ' + newTrees + ' / 10')
        
        addPointsRef.current(5)

        if (newTrees >= 10) {
          setGameStateRef.current('won')
          addBadgeRef.current('Master Planter')
        }
      }, this)
    }

    function update(time, delta) {
      if (gameStateRef.current !== 'playing') return

      // Simple timer logic
      if (time > lastTime + 1000) {
        lastTime = time
        const newTime = statsRef.current.timeLeft - 1
        setStatsRef.current(prev => ({ ...prev, timeLeft: newTime }))
        timerText.setText('Time: ' + newTime)

        if (newTime <= 0) {
          setGameStateRef.current('lost')
        }
      }
    }

    gameInstance = new Phaser.Game(config)

    return () => {
      gameInstance.destroy(true)
    }
  }, [])

  return (
    <div className="flex flex-col items-center relative">
      <h2 className="text-2xl font-bold mb-2">Tree Planter</h2>
      
      {gameState === 'playing' && (
        <p className="mb-4">Plant 10 trees before time runs out!</p>
      )}

      {gameState === 'won' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl z-10 text-center border-4 border-green-500">
          <h2 className="text-4xl font-bold text-green-600 mb-4">Success!</h2>
          <p className="text-xl mb-6">You planted the forest in time!</p>
          <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-700">Play Again</button>
        </div>
      )}

      {gameState === 'lost' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl z-10 text-center border-4 border-red-500">
          <h2 className="text-4xl font-bold text-red-600 mb-4">Time's Up!</h2>
          <p className="text-xl mb-6">You didn't plant enough trees.</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-700">Try Again</button>
        </div>
      )}

      <div id="tree-planter-game"></div>
    </div>
  )
}
