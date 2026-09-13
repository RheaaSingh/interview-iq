'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Interview } from '@/types';
import {
  Brain, Calendar, Award, Clock, Filter, Trash2,
  ChevronRight, Plus, Loader2
} from 'lucide-react';

export default function HistoryPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadInterviews();
  }, [token, router]);

  useEffect(() => {
    let filtered = interviews;
    if (filterType !== 'all') {
      filtered = filtered.filter((i) => i.interview_type === filterType);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((i) => i.status === filterStatus);
    }
    setFilteredInterviews(filtered);
  }, [interviews, filterType, filterStatus]);

  const loadInterviews = async () => {
    if (!token) return;
    try {
      const data = await api.interviews.getAll(token);
      setInterviews(data.interviews);
      setFilteredInterviews(data.interviews);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this interview?')) return;
    setDeletingId(id);
    try {
      await api.interviews.delete(token, id);
      setInterviews(interviews.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Failed to delete interview:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Interview History</h1>
          <p className="text-gray-600 mt-1">Review your past interview sessions</p>
        </div>
        <Link href="/interview/setup" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Interview
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">Filter:</span>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field w-auto text-sm"
        >
          <option value="all">All Types</option>
          <option value="technical">Technical</option>
          <option value="hr">HR</option>
          <option value="behavioral">Behavioral</option>
          <option value="mixed">Mixed</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-auto text-sm"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="setup">Setup</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto">
          {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredInterviews.length === 0 ? (
        <div className="card p-12 text-center">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No interviews yet</h2>
          <p className="text-gray-500 mb-6">Start your first interview to begin tracking your progress.</p>
          <Link href="/interview/setup" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Start First Interview
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInterviews.map((interview) => (
            <div
              key={interview.id}
              className="card-hover p-6 cursor-pointer"
              onClick={() => router.push(`/interview/results/${interview.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    interview.status === 'completed' ? 'bg-green-100' :
                    interview.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Brain className={`h-6 w-6 ${
                      interview.status === 'completed' ? 'text-green-600' :
                      interview.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{interview.role}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="capitalize">{interview.interview_type}</span>
                      <span>&middot;</span>
                      <span className="capitalize">{interview.difficulty}</span>
                      <span>&middot;</span>
                      <span>{interview.total_questions} questions</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {formatDate(interview.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {interview.status === 'completed' && interview.total_score !== undefined && interview.total_score !== null ? (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        interview.total_score >= 70 ? 'text-green-600' :
                        interview.total_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(interview.total_score)}%
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  ) : (
                    <span className={`badge capitalize ${
                      interview.status === 'in_progress' ? 'badge-warning' : 'badge-primary'
                    }`}>
                      {interview.status === 'in_progress' ? 'In Progress' : interview.status}
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(interview.id);
                    }}
                    disabled={deletingId === interview.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {deletingId === interview.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>

                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


