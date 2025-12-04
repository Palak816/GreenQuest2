import React, { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { useUser } from './UserContext'

export default function TrashSorter() {
  const gameRef = useRef(null)
  const { addPoints, addBadge } = useUser()
  const [gameState, setGameState] = useState('playing') // playing, won, lost
  const [stats, setStats] = useState({ score: 0, lives: 3, level: 1 })
  
  // Refs to access latest state/props inside Phaser
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
      parent: 'trash-sorter-game',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    }

    let player
    let cursors
    let trashItems
    let scoreText
    let livesText
    let levelText
    let gameInstance

    function preload() {
      this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png')
      this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png')
      this.load.image('trash', 'https://labs.phaser.io/assets/particles/red.png')
      this.load.image('bin', 'assets/sprites/dustbin.svg')
    }

    function create() {
      this.add.image(400, 300, 'sky')

      const platforms = this.physics.add.staticGroup()
      platforms.create(400, 568, 'ground').setScale(2).refreshBody()

      player = this.physics.add.sprite(400, 450, 'bin').setScale(0.8)
      player.setCollideWorldBounds(true)

      trashItems = this.physics.add.group({
        key: 'trash',
        repeat: 2, // Start with fewer items
        setXY: { x: 100, y: 0, stepX: 200 }
      })

      trashItems.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
        resetTrash(child)
      })

      this.physics.add.collider(player, platforms)
      this.physics.add.collider(trashItems, platforms)

      this.physics.add.overlap(player, trashItems, collectTrash, null, this)

      cursors = this.input.keyboard.createCursorKeys()

      scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' })
      livesText = this.add.text(16, 50, 'Lives: 3', { fontSize: '32px', fill: '#fff' })
      levelText = this.add.text(600, 16, 'Level: 1', { fontSize: '32px', fill: '#fff' })
    }

    function update() {
      if (gameStateRef.current !== 'playing') {
        this.physics.pause()
        return
      }

      if (cursors.left.isDown) {
        player.setVelocityX(-300)
      } else if (cursors.right.isDown) {
        player.setVelocityX(300)
      } else {
        player.setVelocityX(0)
      }

      trashItems.children.iterate(function (child) {
        if (child.body.touching.down && child.y > 500) {
           // Trash hit the ground - lose a life
           loseLife()
           resetTrash(child)
        }
      })
    }

    function resetTrash(trash) {
      trash.y = 0
      trash.x = Phaser.Math.Between(50, 750)
      
      // Speed increases with level
      const baseSpeed = 50
      const levelMultiplier = statsRef.current.level * 50
      trash.setVelocityY(Phaser.Math.Between(baseSpeed + levelMultiplier, baseSpeed + levelMultiplier + 100))
    }

    function collectTrash(player, trash) {
      resetTrash(trash)
      
      const newScore = statsRef.current.score + 10
      const newLevel = Math.floor(newScore / 50) + 1
      
      setStatsRef.current(prev => ({ ...prev, score: newScore, level: newLevel }))
      
      scoreText.setText('Score: ' + newScore)
      levelText.setText('Level: ' + newLevel)

      // Update global user points
      addPointsRef.current(10)

      if (newScore >= 100) {
        setGameStateRef.current('won')
        addBadgeRef.current('Recycle Hero')
      }
    }

    function loseLife() {
      const newLives = statsRef.current.lives - 1
      setStatsRef.current(prev => ({ ...prev, lives: newLives }))
      livesText.setText('Lives: ' + newLives)

      if (newLives <= 0) {
        setGameStateRef.current('lost')
      }
    }

    gameInstance = new Phaser.Game(config)

    return () => {
      gameInstance.destroy(true)
    }
  }, []) // Empty dependency array to run once on mount

  // Restart handler
  const handleRestart = () => {
    setStats({ score: 0, lives: 3, level: 1 })
    setGameState('playing')
    // Force component re-mount to restart Phaser
    window.location.reload() // Simple way to restart for now, or we could key the component
  }

  return (
    <div className="flex flex-col items-center relative">
      <h2 className="text-2xl font-bold mb-2">Trash Sorter</h2>
      
      {gameState === 'playing' && (
        <p className="mb-4">Catch the trash! Don't let it hit the ground.</p>
      )}

      {gameState === 'won' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl z-10 text-center border-4 border-green-500">
          <h2 className="text-4xl font-bold text-green-600 mb-4">You Won!</h2>
          <p className="text-xl mb-6">You collected 100 points and saved the planet!</p>
          <button onClick={() => window.location.reload()} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-700">Play Again</button>
        </div>
      )}

      {gameState === 'lost' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl z-10 text-center border-4 border-red-500">
          <h2 className="text-4xl font-bold text-red-600 mb-4">Game Over</h2>
          <p className="text-xl mb-6">You ran out of lives!</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-700">Try Again</button>
        </div>
      )}

      <div id="trash-sorter-game"></div>
    </div>
  )
}
