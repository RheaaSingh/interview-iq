'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Resume, JobDescription } from '@/types';
import {
  Brain, Code, Users, MessageSquare, Layers, ChevronRight,
  Upload, FileText, Loader2, AlertCircle
} from 'lucide-react';

const interviewTypes = [
  { value: 'technical', label: 'Technical', icon: Code, description: 'Coding, algorithms, system design' },
  { value: 'hr', label: 'HR', icon: Users, description: 'Cultural fit, career goals, motivation' },
  { value: 'behavioral', label: 'Behavioral', icon: MessageSquare, description: 'Past experiences, STAR method' },
  { value: 'mixed', label: 'Mixed', icon: Layers, description: 'Combination of all types' },
];

const difficulties = [
  { value: 'easy', label: 'Easy', description: 'Entry level questions' },
  { value: 'medium', label: 'Medium', description: 'Mid-level difficulty' },
  { value: 'hard', label: 'Hard', description: 'Senior level questions' },
  { value: 'adaptive', label: 'Adaptive', description: 'Adjusts based on your answers' },
];

export default function InterviewSetupPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [role, setRole] = useState('');
  const [interviewType, setInterviewType] = useState('mixed');
  const [difficulty, setDifficulty] = useState('adaptive');
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedJDId, setSelectedJDId] = useState('');

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const weakTopic = searchParams.get('topic');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
    if (weakTopic) {
      setRole(weakTopic);
      setDifficulty('adaptive');
    }
  }, [token, router, weakTopic]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [resumesRes, jdsRes] = await Promise.all([
        api.resumes.getAll(token),
        api.jobDescriptions.getAll(token),
      ]);
      setResumes(resumesRes.resumes);
      setJobDescriptions(jdsRes.jobDescriptions);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role.trim()) {
      setError('Please enter a role/position');
      return;
    }

    setIsLoading(true);
    try {
      const interview = await api.interviews.create(token!, {
        role: role.trim(),
        interview_type: interviewType,
        difficulty,
        total_questions: totalQuestions,
        resume_id: selectedResumeId || undefined,
        job_description_id: selectedJDId || undefined,
      });

      const started = await api.interviews.start(token!, interview.interview.id);
      router.push(`/interview/${started.interview.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Set Up Interview</h1>
        <p className="text-gray-600 mt-1">Configure your practice interview session</p>
      </div>

      <form onSubmit={handleStart}>
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Position / Role</h2>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input-field"
            placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist"
          />
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Interview Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {interviewTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setInterviewType(type.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  interviewType === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <type.icon className={`h-6 w-6 mb-2 ${
                  interviewType === type.value ? 'text-primary-600' : 'text-gray-500'
                }`} />
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Difficulty Level</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                type="button"
                onClick={() => setDifficulty(diff.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  difficulty === diff.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`font-medium text-sm ${
                  difficulty === diff.value ? 'text-primary-600' : ''
                }`}>{diff.label}</p>
                <p className="text-xs text-gray-500 mt-1">{diff.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Number of Questions</h2>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={3}
              max={20}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-semibold w-8 text-center">{totalQuestions}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>3</span>
            <span>20</span>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Resources (Optional)</h2>

          {resumes.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-1" />
                Select Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="input-field"
              >
                <option value="">No resume selected</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.original_filename}</option>
                ))}
              </select>
            </div>
          )}

          {jobDescriptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Select Job Description
              </label>
              <select
                value={selectedJDId}
                onChange={(e) => setSelectedJDId(e.target.value)}
                className="input-field"
              >
                <option value="">No job description selected</option>
                {jobDescriptions.map((jd) => (
                  <option key={jd.id} value={jd.id}>{jd.title}</option>
                ))}
              </select>
            </div>
          )}

          {resumes.length === 0 && jobDescriptions.length === 0 && (
            <p className="text-sm text-gray-500">
              Upload a resume or add a job description for more personalized questions.{' '}
              <Link href="/resume" className="text-primary-600 hover:underline">Upload now</Link>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !role.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <Brain className="h-5 w-5" />
              Start Interview
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}


