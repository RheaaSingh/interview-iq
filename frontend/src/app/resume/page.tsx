'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import { FileText, Upload, Loader2, CheckCircle } from 'lucide-react';

export default function ResumePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    loadData();
  }, [token, router]);

  const loadData = async () => {
    if (!token) return;
    try {
      const data = await api.resumes.getAll(token);
      setResumes(data.resumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setIsUploading(true);
    setMessage('');
    try {
      await api.resumes.upload(token, file);
      setMessage('Resume uploaded and processed successfully!');
      loadData();
    } catch (error: any) {
      setMessage(error.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Resume Management</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" /> Upload Resume
        </h2>
        <input type="file" accept=".pdf,.docx,.txt" onChange={handleUpload} className="hidden" id="resume-upload" />
        <label htmlFor="resume-upload" className="btn-primary cursor-pointer inline-flex items-center gap-2">
          {isUploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Choose File</>}
        </label>
        <p className="text-xs text-gray-500 mt-2">Supports PDF, DOCX, and TXT files (max 5MB)</p>
        {message && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Your Resumes</h2>
        {isLoading ? (
          <div className="text-center py-8"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" /></div>
        ) : resumes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No resumes uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{resume.original_filename}</p>
                    <p className="text-sm text-gray-500">Uploaded {new Date(resume.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {resume.extracted_skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {resume.extracted_skills.map((skill: string, i: number) => (
                      <span key={i} className="badge bg-primary-50 text-primary-700 text-xs">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


