import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useUser } from './UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trophy, Zap, RefreshCw, AlertCircle, Award } from 'lucide-react';
import axios from 'axios';

export default function TrashSorter() {
  const gameRef = useRef(null);
  const { addPoints } = useUser();
  const [gameState, setGameState] = useState('playing'); 
  const [stats, setStats] = useState({ score: 0, lives: 3, level: 1 });
  
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const startTime = useRef(Date.now());

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 500,
      parent: 'trash-sorter-game',
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
      },
      scene: { preload, create, update }
    };

    let player, cursors, trashItems;

    function preload() {
      this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
      this.load.image('trash', 'https://labs.phaser.io/assets/particles/red.png');
      this.load.image('bin', 'assets/sprites/dustbin.svg');
    }

    function create() {
      const platforms = this.physics.add.staticGroup();
      platforms.create(400, 480, 'ground').setScale(2).refreshBody();

      player = this.physics.add.sprite(400, 420, 'bin').setScale(0.8);
      player.setCollideWorldBounds(true);

      trashItems = this.physics.add.group();
      spawnTrash.call(this);

      this.physics.add.collider(player, platforms);
      this.physics.add.overlap(player, trashItems, collectTrash, null, this);
      cursors = this.input.keyboard.createCursorKeys();
      
      this.time.addEvent({ delay: 2000, callback: spawnTrash, callbackScope: this, loop: true });
    }

    function spawnTrash() {
      if (gameStateRef.current !== 'playing') return;
      const x = Phaser.Math.Between(50, 750);
      const trash = trashItems.create(x, 0, 'trash');
      trash.setBounceY(0.4);
      
      // ADAPTIVE DIFFICULTY: Speed scales with current score
      const adaptiveSpeed = 150 + (statsRef.current.score * 2);
      trash.setVelocityY(adaptiveSpeed);
    }

    function update() {
      if (gameStateRef.current !== 'playing') {
        this.physics.pause();
        return;
      }

      if (cursors.left.isDown) player.setVelocityX(-400);
      else if (cursors.right.isDown) player.setVelocityX(400);
      else player.setVelocityX(0);

      trashItems.children.iterate((child) => {
        if (child && child.y > 450) {
          loseLife();
          child.destroy();
        }
      });
    }

    function collectTrash(p, t) {
      t.destroy();
      const newScore = statsRef.current.score + 10;
      const newLevel = Math.floor(newScore / 100) + 1;
      setStatsRef(prev => ({ ...prev, score: newScore, level: newLevel }));
      
      if (newScore >= 200) finishGame('won', newScore);
    }

    function loseLife() {
      const newLives = statsRef.current.lives - 1;
      setStatsRef(prev => ({ ...prev, lives: newLives }));
      if (newLives <= 0) finishGame('lost', statsRef.current.score);
    }

    const setStatsRef = (fn) => setStats(fn);

    const finishGame = async (status, finalScore) => {
      setGameState(status);
      const timeTaken = (Date.now() - startTime.current) / 1000;
      
      try {
        const token = localStorage.getItem('greenquest_token');
        await axios.post('http://localhost:5000/api/telemetry/log', {
          activityType: 'game',
          activityId: 'trash_sorter_pro',
          score: finalScore,
          timeSpent: timeTaken,
          errorsCount: 3 - statsRef.current.lives
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addPoints(finalScore);
      } catch (err) {
        console.error("Telemetry failed", err);
      }
    };

    const gameInstance = new Phaser.Game(config);
    return () => gameInstance.destroy(true);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-4xl flex justify-between items-center glass-card p-4">
         <div className="flex items-center space-x-6">
            <div className="flex items-center text-green-800 font-bold">
               <Trophy className="mr-2 text-yellow-500" size={20} /> Score: {stats.score}
            </div>
            <div className="flex items-center text-blue-800 font-bold">
               <Zap className="mr-2 text-blue-500" size={20} /> Level: {stats.level}
            </div>
         </div>
         <div className="flex items-center space-x-1">
            {[...Array(3)].map((_, i) => (
               <Heart key={i} size={20} className={i < stats.lives ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
            ))}
         </div>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white/20">
        <div id="trash-sorter-game" className="bg-gradient-to-b from-blue-100 to-green-100"></div>
        
        <AnimatePresence>
          {gameState !== 'playing' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-20"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card p-10 text-center max-w-sm"
              >
                {gameState === 'won' ? (
                  <>
                    <Award className="mx-auto text-yellow-500 mb-4" size={64} />
                    <h2 className="text-3xl font-black text-green-900 mb-2">Ecological Victory!</h2>
                    <p className="text-green-700 mb-6">You've successfully mitigated the waste crisis for this sector.</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                    <h2 className="text-3xl font-black text-red-900 mb-2">Sector Breach</h2>
                    <p className="text-red-700 mb-6">Critical waste levels reached. Strategic retreat advised.</p>
                  </>
                )}
                
                <div className="bg-white/40 p-4 rounded-2xl mb-6">
                   <p className="text-xs font-bold text-green-800 tracking-widest uppercase">Performance Points</p>
                   <p className="text-3xl font-black text-green-900">+{stats.score}</p>
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full btn-primary text-white py-3 rounded-xl font-bold flex items-center justify-center"
                >
                  <RefreshCw className="mr-2" size={18} /> Re-initialize Sector
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <p className="text-green-800/60 text-xs font-medium uppercase tracking-widest">
        Reactive HUD Interface • Real-time Telemetry Active
      </p>
    </div>
  );
}
