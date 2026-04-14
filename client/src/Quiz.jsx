import React, { useState, useEffect, useRef } from 'react';
import { useUser } from './UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Timer, Award, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]); // Store questions user failed
  const { addPoints } = useUser();
  const startTime = useRef(Date.now());
  const latencies = useRef([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('greenquest_token');
      const response = await axios.get('http://localhost:5000/api/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Append some Advanced tests if they exist or just use random standard ones
      // For this phase we just map the fetched questions
      let loaded = response.data;
      if(loaded.length > 0 && !loaded[0].type) {
         loaded = loaded.map(q => ({...q, type: 'MCQ'})); 
      }
      // Inject our mock advanced questions to guarantee display for the user
      loaded.push({ question: "Plastics are easily recycled in all facilities.", type: "TF", options: ["True", "False"], answer: "False", hint: "They often jam equipment." });
      loaded.push({ question: "E-waste stands for _________ waste.", type: "FillBlank", options: [], answer: "Electronic", hint: "Starts with E" });

      setQuestions(loaded);
      startTime.current = Date.now();
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (option) => {
    if (selectedOption !== null && isCorrect !== null) return; 
    
    let userAnswer = option;
    if (questions[currentQuestion].type === 'FillBlank') {
       userAnswer = fillBlankAnswer;
    }

    const latency = (Date.now() - startTime.current) / 1000;
    latencies.current.push(latency);
    setSelectedOption(userAnswer);

    // Case insensitive comparison for fill in the blank
    const correct = String(userAnswer).toLowerCase() === String(questions[currentQuestion].answer).toLowerCase();
    setIsCorrect(correct);
    
    if (correct) {
       setScore(s => s + 1);
    } else {
       setWrongAnswers(prev => [...prev, {
          q: questions[currentQuestion].question,
          wrong: userAnswer,
          right: questions[currentQuestion].answer,
          hint: questions[currentQuestion].hint || "Review this topic's module."
       }]);
    }

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedOption(null);
        setIsCorrect(null);
        setFillBlankAnswer('');
        startTime.current = Date.now();
      } else {
        finishQuiz(correct ? score + 1 : score);
      }
    }, 2000);
  };

  const finishQuiz = async (finalScore) => {
    setShowScore(true);
    const pointsEarned = finalScore * 15; // increased XP for advanced
    addPoints(pointsEarned);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setWrongAnswers([]);
    setFillBlankAnswer('');
    latencies.current = [];
    fetchQuestions();
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-green-800">
      <RefreshCw className="animate-spin mb-4" size={48} aria-hidden="true" />
      <p className="font-bold">Synthesizing Eco-Challenges...</p>
    </div>
  );

  const q = questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <AnimatePresence mode="wait">
        {showScore ? (
          <motion.div 
            key="score"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center"
          >
            <Award className="mx-auto text-yellow-500 mb-6" size={80} aria-hidden="true" />
            <h2 className="text-4xl font-black text-green-900 mb-2">Assessment Complete!</h2>
            <p className="text-green-700 text-lg mb-8">You successfully verified {score} logic matrices.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-white/60 p-4 rounded-2xl shadow-inner">
                  <p className="text-xs font-bold text-green-600 uppercase">Impact Gained</p>
                  <p className="text-2xl font-black text-green-900">+{score * 15}</p>
               </div>
               <div className="bg-white/60 p-4 rounded-2xl shadow-inner">
                  <p className="text-xs font-bold text-green-600 uppercase">Accuracy</p>
                  <p className="text-2xl font-black text-green-900">{Math.round((score/questions.length)*100)}%</p>
               </div>
            </div>

            {wrongAnswers.length > 0 && (
                <div className="text-left bg-red-50 p-6 rounded-2xl border-2 border-red-200 mb-8">
                   <h3 className="text-red-900 font-bold mb-4 flex items-center gap-2"><AlertCircle aria-hidden="true"/> Modules for Review</h3>
                   <div className="space-y-4">
                      {wrongAnswers.map((w, idx) => (
                         <div key={idx} className="bg-white p-4 rounded-xl shadow-sm">
                            <p className="font-bold text-red-900 text-sm mb-1">{w.q}</p>
                            <p className="text-xs text-red-700 line-through">You answered: {w.wrong}</p>
                            <p className="text-xs text-green-700 font-bold mb-2">Correct answer: {w.right}</p>
                            <div className="bg-red-50 text-[10px] uppercase font-black tracking-widest text-red-800 p-2 rounded-lg inline-block">Hint: {w.hint}</div>
                         </div>
                      ))}
                   </div>
                </div>
            )}

            <button 
              onClick={resetQuiz}
              className="btn-primary text-white px-8 py-3 rounded-full font-bold flex items-center mx-auto shadow-lg active:scale-95 transition-all"
            >
              Re-initialize <ArrowRight className="ml-2" size={20} aria-hidden="true" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8"
          >
            <div className="flex justify-between items-center mb-8">
               <div className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full uppercase tracking-widest flex items-center gap-2">
                  <Timer size={14} aria-hidden="true" /> Time Limit Mode
               </div>
               <div className="flex items-center text-green-700 font-black text-sm">
                  {currentQuestion + 1} / {questions.length}
               </div>
            </div>

            <h2 className="text-2xl font-bold text-green-900 mb-8 leading-relaxed border-b-2 border-green-800/10 pb-6">
               {q.question}
            </h2>

            {q.type === 'FillBlank' ? (
                <div className="space-y-4">
                   <input
                       type="text"
                       value={fillBlankAnswer}
                       onChange={(e) => setFillBlankAnswer(e.target.value)}
                       disabled={isCorrect !== null}
                       className="w-full bg-white/50 border-2 border-green-800/20 rounded-xl p-5 text-xl font-bold text-green-900 focus:ring-4 focus:ring-green-400 outline-none"
                       placeholder="Type your answer here..."
                       aria-label="Fill in the blank answer"
                   />
                   <button 
                      onClick={() => handleAnswerSubmit(fillBlankAnswer)}
                      disabled={isCorrect !== null || !fillBlankAnswer.trim()}
                      className="w-full btn-primary text-white font-black py-4 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                   >
                     Submit Answer
                   </button>
                   {isCorrect !== null && (
                       <div className={`mt-4 p-4 rounded-xl font-black text-center flex items-center justify-center gap-2 ${isCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                           {isCorrect ? <CheckCircle2 aria-hidden="true"/> : <XCircle aria-hidden="true"/>}
                           {isCorrect ? 'Correct!' : `Incorrect. Correct Answer: ${q.answer}`}
                       </div>
                   )}
                </div>
            ) : (
               <div className={`grid ${q.type === 'TF' ? 'grid-cols-2' : 'gap-4'}`}>
                 {q.options.map((option, index) => {
                   const isSelected = selectedOption === option;
                   const ariaPressed = isSelected ? 'true' : 'false';
                   const isCorrectOption = isCorrect !== null && option === q.answer;
                   const isWrongOption = isCorrect === false && isSelected;

                   return (
                     <button
                       key={index}
                       disabled={selectedOption !== null}
                       onClick={() => handleAnswerSubmit(option)}
                       aria-pressed={ariaPressed}
                       className={`
                         text-left p-5 rounded-2xl border-2 transition-all duration-300 flex justify-between items-center outline-none focus:ring-4 focus:ring-green-400 font-bold text-lg
                         ${isSelected ? 'scale-[1.02]' : 'hover:bg-white/40 hover:border-green-300'}
                         ${isCorrectOption ? 'bg-green-100 border-green-500 text-green-900 shadow-lg' : 
                           isWrongOption ? 'bg-red-50 border-red-300 text-red-900' : 
                           'bg-white/50 border-transparent text-green-800'}
                         ${q.type === 'TF' && 'justify-center text-center m-2'}
                       `}
                     >
                       <span>{option}</span>
                       {isCorrectOption && <CheckCircle2 className="text-green-600" size={24} aria-hidden="true" />}
                       {isWrongOption && <XCircle className="text-red-500" size={24} aria-hidden="true" />}
                     </button>
                   );
                 })}
               </div>
            )}
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
