'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { FileText, Plus, Trash2, Loader2 } from 'lucide-react';

export default function JobDescriptionPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [jobDescriptions, setJobDescriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    loadData();
  }, [token, router]);

  const loadData = async () => {
    if (!token) return;
    try {
      const data = await api.jobDescriptions.getAll(token);
      setJobDescriptions(data.jobDescriptions);
    } catch (error) {
      console.error('Failed to load JDs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim() || !content.trim()) return;
    setIsCreating(true);
    setMessage('');
    try {
      await api.jobDescriptions.create(token, { title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
      setMessage('Job description created successfully!');
      loadData();
    } catch (error: any) {
      setMessage(error.message || 'Failed to create job description');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this job description?')) return;
    try {
      await api.jobDescriptions.delete(token, id);
      setJobDescriptions(jobDescriptions.filter((jd) => jd.id !== id));
    } catch (error) {
      console.error('Failed to delete JD:', error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Job Descriptions</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Job Description
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Job title (e.g., Senior Software Engineer)"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="textarea-field h-48"
            placeholder="Paste the full job description here..."
            required
          />
          <button type="submit" disabled={isCreating} className="btn-primary flex items-center gap-2">
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Job Description
          </button>
        </form>
        {message && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Your Job Descriptions</h2>
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" /></div>
        ) : jobDescriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No job descriptions added yet.</p>
        ) : (
          <div className="space-y-3">
            {jobDescriptions.map((jd) => (
              <div key={jd.id} className="p-4 bg-gray-50 rounded-lg flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{jd.title}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{jd.content.substring(0, 150)}...</p>
                    {jd.extracted_skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {jd.extracted_skills.slice(0, 6).map((skill: string, i: number) => (
                          <span key={i} className="badge bg-primary-50 text-primary-700 text-xs">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(jd.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


