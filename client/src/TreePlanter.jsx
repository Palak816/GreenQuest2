import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useUser } from './UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Timer, Trophy, RefreshCw, Award, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function TreePlanter() {
  const { addPoints } = useUser();
  const [gameState, setGameState] = useState('playing');
  const [stats, setStats] = useState({ trees: 0, timeLeft: 30, target: 10 });
  
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
      parent: 'tree-planter-game',
      transparent: true,
      scene: { preload, create, update }
    };

    let gameInstance;
    let lastTime = 0;

    function preload() {
      this.load.setBaseURL('https://labs.phaser.io');
      this.load.image('tree', 'assets/sprites/mushroom2.png');
    }

    function create() {
      this.input.on('pointerdown', (pointer) => {
        if (gameStateRef.current !== 'playing') return;

        const tree = this.add.image(pointer.x, pointer.y, 'tree');
        tree.setScale(0.1);
        this.tweens.add({
          targets: tree,
          scaleX: 0.8,
          scaleY: 0.8,
          duration: 600,
          ease: 'Bounce'
        });

        const newTrees = statsRef.current.trees + 1;
        setStats(prev => ({ ...prev, trees: newTrees }));
        
        if (newTrees >= statsRef.current.target) finishGame('won', newTrees);
      });
    }

    function update(time) {
      if (gameStateRef.current !== 'playing') return;

      if (time > lastTime + 1000) {
        lastTime = time;
        const newTime = statsRef.current.timeLeft - 1;
        setStats(prev => ({ ...prev, timeLeft: newTime }));
        if (newTime <= 0) finishGame('lost', statsRef.current.trees);
      }
    }

    const finishGame = async (status, finalTrees) => {
      setGameState(status);
      const timeTaken = (Date.now() - startTime.current) / 1000;
      const pointsEarned = finalTrees * 5;

      try {
        const token = localStorage.getItem('greenquest_token');
        await axios.post('http://localhost:5000/api/telemetry/log', {
          activityType: 'game',
          activityId: 'tree_planter_pro',
          score: pointsEarned,
          timeSpent: timeTaken,
          errorsCount: status === 'lost' ? statsRef.current.target - finalTrees : 0
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addPoints(pointsEarned);
      } catch (err) {
        console.error("Telemetry failed", err);
      }
    };

    gameInstance = new Phaser.Game(config);
    return () => gameInstance.destroy(true);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-4xl flex justify-between items-center glass-card p-4">
         <div className="flex items-center space-x-8">
            <div className="flex items-center text-green-800 font-bold">
               <TreePine className="mr-2 text-green-600" size={20} /> Trees: {stats.trees} / {stats.target}
            </div>
            <div className={`flex items-center font-bold ${stats.timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-blue-800'}`}>
               <Timer className="mr-2" size={20} /> {stats.timeLeft}s
            </div>
         </div>
         <div className="bg-white/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-green-700 border border-white/20">
            Arboreal Restoration Protocol
         </div>
      </div>

      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white/20 cursor-crosshair">
        <div id="tree-planter-game" className="bg-gradient-to-b from-sky-100 to-green-50"></div>
        
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
                    <h2 className="text-3xl font-black text-green-900 mb-2">Reforestation Complete</h2>
                    <p className="text-green-700 mb-6">Biodiversity targets achieved. Sector stability increased.</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                    <h2 className="text-3xl font-black text-red-900 mb-2">Operation Halted</h2>
                    <p className="text-red-700 mb-6">Time constraints violated. Planting quotas not met.</p>
                  </>
                )}
                
                <div className="bg-white/40 p-4 rounded-2xl mb-6">
                   <p className="text-xs font-bold text-green-800 tracking-widest uppercase">Ecosystem Credit</p>
                   <p className="text-3xl font-black text-green-900">+{stats.trees * 5}</p>
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full btn-primary text-white py-3 rounded-xl font-bold flex items-center justify-center"
                >
                  <RefreshCw className="mr-2" size={18} /> Re-seed Sector
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <p className="text-green-800/60 text-[10px] font-bold uppercase tracking-[0.2em]">
        Cognitive Load Balancer • Adaptive Timer Active
      </p>
    </div>
  );
}
