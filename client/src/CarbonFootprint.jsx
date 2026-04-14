import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useUser } from './UserContext';

const QUESTIONS = [
  { q: "How do you primarily commute?", opts: [{t: "Walk/Bike", s: 5}, {t: "Public Transit", s: 15}, {t: "Carpool", s: 25}, {t: "Drive Alone", s: 50}] },
  { q: "What is your main diet?", opts: [{t: "Vegan/Vegetarian", s: 10}, {t: "Pescatarian", s: 20}, {t: "Mixed / Moderate Meat", s: 40}, {t: "Heavy Meat", s: 60}] },
  { q: "How often do you recycle?", opts: [{t: "Always", s: 5}, {t: "Usually", s: 15}, {t: "Rarely", s: 30}, {t: "Never", s: 50}] }
];

export default function CarbonFootprint() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { addPoints } = useUser();

  const handleAnswer = (s) => {
      setScore(prev => prev + s);
      if(step < QUESTIONS.length - 1) {
          setStep(step + 1);
      } else {
          setFinished(true);
          // Reward logic: lower score = better. (Max score is 160, min is 20)
          const reward = Math.max(10, 100 - score);
          addPoints(reward); // Give XP based on how green they are!
      }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
        <Link to="/games" className="text-green-700 font-bold flex items-center mb-8 hover:text-green-900 border-b border-transparent hover:border-green-800 transition-all w-max pb-1"><ArrowLeft size={16} className="mr-2"/> Abort Simulation</Link>
        
        <AnimatePresence mode="wait">
            {!finished ? (
                <motion.div key="question" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}} className="glass-card p-12">
                   <div className="flex justify-between items-center mb-8">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Phase {step + 1} of {QUESTIONS.length}</span>
                      <Leaf className="text-green-500 opacity-50" />
                   </div>
                   
                   <h2 className="text-3xl font-black text-green-900 mb-8 leading-tight">{QUESTIONS[step].q}</h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {QUESTIONS[step].opts.map((opt, i) => (
                           <button key={i} onClick={() => handleAnswer(opt.s)} className="text-left p-6 w-full rounded-2xl bg-white/40 border-2 border-green-100 hover:border-green-400 hover:bg-green-50 transition-all font-bold text-green-900 text-lg group">
                               {opt.t}
                           </button>
                       ))}
                   </div>
                </motion.div>
            ) : (
                <motion.div key="result" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="glass-card p-12 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={200}/></div>
                   <h2 className="text-4xl font-black text-green-900 mb-4 relative z-10">Simulation Complete</h2>
                   
                   <div className="my-10 relative z-10">
                       <p className="text-sm font-bold text-green-700 uppercase tracking-widest mb-2">Estimated Footprint Score</p>
                       <div className={`text-6xl font-black mb-2 ${score < 50 ? 'text-green-500' : score < 100 ? 'text-yellow-500' : 'text-red-500'}`}>
                           {score}
                       </div>
                       <p className="text-green-800 font-medium max-w-md mx-auto">
                          {score < 50 ? "Exceptional! Your ecosystem impact is incredibly minimal. True operative." : 
                           score < 100 ? "Moderate footprint. You have solid habits but room to optimize for lower emissions." : 
                           "Critical Footprint. Review the modules on sustainability to learn how to mitigate your habits."}
                       </p>
                   </div>
                   
                   <div className="bg-green-100 text-green-800 p-4 rounded-xl inline-block font-black mb-8 relative z-10 shadow-sm border border-green-200">
                       +{Math.max(10, 100 - score)} XP Awarded
                   </div>
                   
                   <br/>
                   <Link to="/games" className="btn-primary text-white font-black px-8 py-3 rounded-full relative z-10">Return to Hub</Link>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
