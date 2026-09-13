'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Interview, Question, Answer } from '@/types';
import {
  Brain, Award, TrendingUp, AlertTriangle, Target,
  ArrowLeft, CheckCircle, XCircle, BarChart3, Loader2
} from 'lucide-react';

export default function InterviewResultsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [scores, setScores] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadResults();
  }, [token, router, interviewId]);

  const loadResults = async () => {
    if (!token) return;
    try {
      const data = await api.interviews.getResults(token, interviewId);
      setInterview(data.interview);
      setQuestions(data.questions);
      setAnswers(data.answers);
      setScores(data.scores);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">Interview not found</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500">
          <Award className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Interview Complete!</h1>
        <p className="text-gray-600 mt-1">{interview.role} &middot; {interview.interview_type}</p>
      </div>

      <div className="card p-8 mb-8">
        <div className="text-center mb-6">
          <div className={`text-6xl font-bold ${getScoreColor(interview.total_score || 0)}`}>
            {Math.round(interview.total_score || 0)}%
          </div>
          <div className="text-lg text-gray-500 mt-1">Overall Score</div>
          <div className={`inline-flex mt-2 px-4 py-1 rounded-full text-sm font-bold ${
            (interview.total_score || 0) >= 70 ? 'bg-green-100 text-green-700' :
            (interview.total_score || 0) >= 50 ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            Grade: {getGrade(interview.total_score || 0)}
          </div>
        </div>

        {scores?.scores && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Accuracy</p>
              <p className={`text-xl font-bold ${getScoreColor(scores.scores.avg_accuracy || 0)}`}>
                {Math.round(scores.scores.avg_accuracy || 0)}%
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Relevance</p>
              <p className={`text-xl font-bold ${getScoreColor(scores.scores.avg_relevance || 0)}`}>
                {Math.round(scores.scores.avg_relevance || 0)}%
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Clarity</p>
              <p className={`text-xl font-bold ${getScoreColor(scores.scores.avg_clarity || 0)}`}>
                {Math.round(scores.scores.avg_clarity || 0)}%
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Technical Depth</p>
              <p className={`text-xl font-bold ${getScoreColor(scores.scores.avg_technical_depth || 0)}`}>
                {Math.round(scores.scores.avg_technical_depth || 0)}%
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {interview.strengths && interview.strengths.length > 0 && (
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-4">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </h3>
            <div className="space-y-2">
              {interview.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <span className="text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {interview.weaknesses && interview.weaknesses.length > 0 && (
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-orange-700 mb-4">
              <AlertTriangle className="h-5 w-5" />
              Weaknesses
            </h3>
            <div className="space-y-2">
              {interview.weaknesses.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <span className="text-gray-700">{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {interview.suggestions && interview.suggestions.length > 0 && (
          <div className="card p-6">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-700 mb-4">
              <Target className="h-5 w-5" />
              Suggestions
            </h3>
            <div className="space-y-2">
              {interview.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <span className="text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Question Details</h3>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const answer = answers.find((a) => a.question_id === q.id);
            return (
              <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">Q{i + 1}</span>
                    <span className={`badge text-xs ${
                      q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{q.difficulty}</span>
                    <span className="badge bg-gray-100 text-gray-700 text-xs">{q.category}</span>
                  </div>
                  {answer?.overall_score !== undefined && answer.overall_score !== null && (
                    <span className={`text-sm font-bold ${getScoreColor(answer.overall_score)}`}>
                      {Math.round(answer.overall_score)}%
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 mb-2">{q.question_text}</p>
                {answer && (
                  <>
                    <p className="text-sm text-gray-600 mb-2">{answer.answer_text}</p>
                    {answer.ai_feedback && (
                      <p className="text-xs text-gray-500 italic">Feedback: {answer.ai_feedback}</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <NextLink href="/interview/setup" className="btn-primary inline-flex items-center gap-2">
          <Brain className="h-4 w-4" />
          New Interview
        </NextLink>
        {interview.weaknesses && interview.weaknesses.length > 0 && (
          <NextLink
            href={`/interview/setup?weak=true&topic=${encodeURIComponent(interview.weaknesses[0])}`}
            className="btn-accent inline-flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Practice Weak Areas
          </NextLink>
        )}
      </div>
    </div>
  );
}
