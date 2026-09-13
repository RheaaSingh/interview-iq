'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Resume, JobDescription } from '@/types';
import {
  User, Mail, Save, Loader2, Upload, FileText, Trash2,
  CheckCircle, AlertCircle, Download
} from 'lucide-react';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [jdTitle, setJDTitle] = useState('');
  const [jdContent, setJDContent] = useState('');
  const [isCreatingJD, setIsCreatingJD] = useState(false);
  const [showJDForm, setShowJDForm] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
    }
    loadData();
  }, [token, router, user]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSaving(true);
    setSaveMessage('');
    try {
      const data = await api.auth.updateProfile(token, { name, bio });
      updateUser(data.user);
      setSaveMessage('Profile updated successfully');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      setSaveMessage(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploading(true);
    setUploadMessage('');
    try {
      await api.resumes.upload(token, file);
      setUploadMessage('Resume uploaded successfully');
      loadData();
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error: any) {
      setUploadMessage(error.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!token || !confirm('Delete this resume?')) return;
    try {
      await api.resumes.delete(token, id);
      setResumes(resumes.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Failed to delete resume:', error);
    }
  };

  const handleCreateJD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !jdTitle.trim() || !jdContent.trim()) return;

    setIsCreatingJD(true);
    try {
      await api.jobDescriptions.create(token, { title: jdTitle.trim(), content: jdContent.trim() });
      setJDTitle('');
      setJDContent('');
      setShowJDForm(false);
      loadData();
    } catch (error: any) {
      console.error('Failed to create JD:', error);
    } finally {
      setIsCreatingJD(false);
    }
  };

  const handleDeleteJD = async (id: string) => {
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
      <h1 className="text-3xl font-bold mb-8">Profile & Resources</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="textarea-field h-24"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {saveMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  saveMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {saveMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </form>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Descriptions
              </h2>
              <button
                onClick={() => setShowJDForm(!showJDForm)}
                className="btn-secondary text-sm"
              >
                {showJDForm ? 'Cancel' : '+ Add New'}
              </button>
            </div>

            {showJDForm && (
              <form onSubmit={handleCreateJD} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <input
                  type="text"
                  value={jdTitle}
                  onChange={(e) => setJDTitle(e.target.value)}
                  className="input-field"
                  placeholder="Job title (e.g., Senior Software Engineer)"
                  required
                />
                <textarea
                  value={jdContent}
                  onChange={(e) => setJDContent(e.target.value)}
                  className="textarea-field h-32"
                  placeholder="Paste the full job description here..."
                  required
                />
                <button
                  type="submit"
                  disabled={isCreatingJD}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  {isCreatingJD ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create
                </button>
              </form>
            )}

            {jobDescriptions.length === 0 ? (
              <p className="text-sm text-gray-500">No job descriptions added yet.</p>
            ) : (
              <div className="space-y-2">
                {jobDescriptions.map((jd) => (
                  <div key={jd.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{jd.title}</p>
                      <p className="text-xs text-gray-500">
                        {jd.extracted_skills?.length || 0} skills extracted
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteJD(jd.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Resumes
            </h2>

            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleUploadResume}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Resume
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2">PDF, DOCX, or TXT (max 5MB)</p>
            </div>

            {uploadMessage && (
              <div className={`p-3 rounded-lg text-sm mb-3 ${
                uploadMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {uploadMessage}
              </div>
            )}

            {resumes.length === 0 ? (
              <p className="text-sm text-gray-500">No resumes uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {resumes.map((resume) => (
                  <div key={resume.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{resume.original_filename}</p>
                        <p className="text-xs text-gray-500">
                          {resume.extracted_skills?.length || 0} skills found
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {resume.extracted_skills && resume.extracted_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resume.extracted_skills.slice(0, 8).map((skill, i) => (
                          <span key={i} className="badge bg-primary-50 text-primary-700 text-xs">
                            {skill}
                          </span>
                        ))}
                        {resume.extracted_skills.length > 8 && (
                          <span className="badge bg-gray-100 text-gray-600 text-xs">
                            +{resume.extracted_skills.length - 8} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-3">Account Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Member since</span>
                <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resumes</span>
                <span>{resumes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Job Descriptions</span>
                <span>{jobDescriptions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


