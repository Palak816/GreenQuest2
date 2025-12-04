import React, { useState, useEffect } from 'react'
import { useUser } from './UserContext'

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)
  const [loading, setLoading] = useState(true)
  const { addPoints, addBadge } = useUser()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/quizzes')
      const data = await response.json()
      setQuestions(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setLoading(false)
    }
  }

  const handleAnswerClick = (selectedOption) => {
    if (selectedOption === questions[currentQuestion].answer) {
      setScore(score + 1)
    }

    const nextQuestion = currentQuestion + 1
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion)
    } else {
      setShowScore(true)
      // Award points: 10 points per correct answer
      const finalScore = score + (selectedOption === questions[currentQuestion].answer ? 1 : 0)
      const pointsEarned = finalScore * 10
      addPoints(pointsEarned)
      
      if (finalScore === questions.length) {
        addBadge('Quiz Master')
      }
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowScore(false)
    fetchQuestions() // Fetch new random questions
  }

  if (loading) {
    return <div className="p-6 text-center">Loading Quiz...</div>
  }

  if (questions.length === 0) {
    return <div className="p-6 text-center">Failed to load questions. Please try again later.</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Eco Challenge</h1>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        {showScore ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
            <p className="text-xl mb-4">You scored {score} out of {questions.length}</p>
            <p className="text-green-600 font-bold mb-4">Points Earned: {score * 10}</p>
            <button 
              onClick={resetQuiz}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Play Again (New Questions)
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Question {currentQuestion + 1}/{questions.length}
            </div>
            <h2 className="text-xl font-semibold mb-6">{questions[currentQuestion].question}</h2>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  className="block w-full text-left p-4 border-2 border-green-100 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
