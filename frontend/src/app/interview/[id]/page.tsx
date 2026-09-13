'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Interview, Question, Answer } from '@/types';
import {
  Brain, Send, Loader2, CheckCircle, XCircle, ArrowRight,
  Clock, Target, BarChart3, ChevronRight
} from 'lucide-react';

export default function InterviewPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadQuestion();
  }, [token, router, interviewId]);

  const loadQuestion = async () => {
    if (!token) return;
    try {
      const data = await api.interviews.getCurrentQuestion(token, interviewId);
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setAnswerText(data.answer?.answer_text || '');
      setEvaluation(data.answer ? {
        accuracy_score: data.answer.accuracy_score,
        relevance_score: data.answer.relevance_score,
        clarity_score: data.answer.clarity_score,
        technical_depth_score: data.answer.technical_depth_score,
        overall_score: data.answer.overall_score,
        feedback: data.answer.ai_feedback,
        strengths: data.answer.strengths,
        improvements: data.answer.improvements,
      } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to load question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!token || !currentQuestion || !answerText.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await api.interviews.submitAnswer(token, interviewId, {
        question_id: currentQuestion.id,
        answer_text: answerText.trim(),
      });

      setEvaluation(result.evaluation);

      if (result.isComplete) {
        setIsComplete(true);
        if (result.summary) {
          router.push(`/interview/results/${interviewId}`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setAnswerText('');
    setEvaluation(null);
    loadQuestion();
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">No questions available</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = (questionNumber / totalQuestions) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary-600" />
            <span className="font-semibold">Interview Session</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Question {questionNumber} of {totalQuestions}
            </span>
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`badge ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="badge bg-gray-100 text-gray-700">
                  {currentQuestion.category}
                </span>
              </div>
            </div>
            <h2 className="text-lg font-medium text-gray-900 leading-relaxed">
              {currentQuestion.question_text}
            </h2>
          </div>

          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Your Answer</label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="textarea-field h-48"
              placeholder="Type your answer here... Be as detailed as possible."
              disabled={!!evaluation}
            />

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-4 flex items-center gap-3">
              {!evaluation ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !answerText.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Answer
                    </>
                  )}
                </button>
              ) : (
                <>
                  {!isComplete && (
                    <button
                      onClick={handleNextQuestion}
                      className="btn-primary flex items-center gap-2"
                    >
                      Next Question
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {isComplete && (
                    <button
                      onClick={() => router.push(`/interview/results/${interviewId}`)}
                      className="btn-accent flex items-center gap-2"
                    >
                      View Results
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {evaluation && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Evaluation
              </h3>

              <div className="space-y-3">
                <ScoreBar label="Accuracy" score={evaluation.accuracy_score} />
                <ScoreBar label="Relevance" score={evaluation.relevance_score} />
                <ScoreBar label="Clarity" score={evaluation.clarity_score} />
                <ScoreBar label="Technical Depth" score={evaluation.technical_depth_score} />
                <div className="pt-3 border-t border-gray-100">
                  <ScoreBar label="Overall" score={evaluation.overall_score} large />
                </div>
              </div>

              {evaluation.feedback && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{evaluation.feedback}</p>
                </div>
              )}

              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-green-700 mb-2">Strengths</p>
                  <div className="space-y-1">
                    {evaluation.strengths.map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-orange-700 mb-2">Improvements</p>
                  <div className="space-y-1">
                    {evaluation.improvements.map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Target className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Progress</h3>
            <div className="space-y-2">
              {Array.from({ length: totalQuestions }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full ${
                    i < questionNumber - 1 ? 'bg-green-400' :
                    i === questionNumber - 1 ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, large = false }: { label: string; score: number; large?: boolean }) {
  const getColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-gray-600 ${large ? 'text-sm font-semibold' : 'text-xs'}`}>{label}</span>
        <span className={`text-gray-900 ${large ? 'text-sm font-bold' : 'text-xs font-medium'}`}>
          {Math.round(score)}%
        </span>
      </div>
      <div className={`bg-gray-200 rounded-full ${large ? 'h-3' : 'h-2'}`}>
        <div
          className={`${getColor(score)} rounded-full transition-all duration-500 ${large ? 'h-3' : 'h-2'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
