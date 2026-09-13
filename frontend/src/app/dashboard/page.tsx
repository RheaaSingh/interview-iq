'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { DashboardStats, Interview } from '@/types';
import {
  Brain, Target, TrendingUp, Clock, Award, AlertTriangle,
  Plus, ArrowRight, BarChart3, History, Upload, FileText
} from 'lucide-react';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, [token, router]);

  const loadData = async () => {
    if (!token) return;
    try {
      const [statsRes, interviewsRes] = await Promise.all([
        api.dashboard.getStats(token),
        api.interviews.getAll(token),
      ]);
      setStats(statsRes.stats);
      setRecentInterviews(interviewsRes.interviews.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Interviews',
      value: stats?.total || 0,
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Completed',
      value: stats?.completed || 0,
      icon: Award,
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Average Score',
      value: `${Math.round(stats?.averageScore || 0)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Weak Areas',
      value: stats?.weakAreas?.length || 0,
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
        <p className="text-gray-600 mt-1">Here&apos;s your interview preparation overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-6">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent Interviews</h2>
                <Link href="/history" className="text-sm text-primary-600 hover:text-primary-500 flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentInterviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No interviews yet. Start your first one!</p>
                  <Link href="/interview/setup" className="btn-primary mt-4 inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Start Interview
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => router.push(`/interview/results/${interview.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          interview.status === 'completed' ? 'bg-green-100' :
                          interview.status === 'in_progress' ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <Brain className={`h-5 w-5 ${
                            interview.status === 'completed' ? 'text-green-600' :
                            interview.status === 'in_progress' ? 'text-yellow-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{interview.role}</p>
                          <p className="text-sm text-gray-500 capitalize">
                            {interview.interview_type} &middot; {interview.difficulty}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {interview.status === 'completed' && interview.total_score !== undefined && interview.total_score !== null ? (
                          <span className={`badge ${
                            interview.total_score >= 70 ? 'badge-success' :
                            interview.total_score >= 50 ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {Math.round(interview.total_score)}%
                          </span>
                        ) : (
                          <span className="badge badge-primary capitalize">{interview.status}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/interview/setup" className="btn-primary w-full flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> New Interview
              </Link>
              <Link href="/resume" className="btn-secondary w-full flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" /> Upload Resume
              </Link>
              <Link href="/job-description" className="btn-secondary w-full flex items-center justify-center gap-2">
                <FileText className="h-4 w-4" /> Add Job Description
              </Link>
            </div>
          </div>

          {stats?.weakAreas && stats.weakAreas.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Weak Areas</h2>
              <div className="space-y-2">
                {stats.weakAreas.slice(0, 5).map((area) => (
                  <div key={area.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                    <span className="text-sm font-medium text-red-800">{area.topic}</span>
                    <span className="text-xs text-red-600">{Math.round(area.average_score)}%</span>
                  </div>
                ))}
              </div>
              <Link
                href={`/interview/setup?weak=true&topic=${encodeURIComponent(stats.weakAreas[0]?.topic || '')}`}
                className="btn-accent w-full mt-4 flex items-center justify-center gap-2"
              >
                <Target className="h-4 w-4" /> Practice Weak Areas
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
