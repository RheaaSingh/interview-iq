const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.error || 'An error occurred',
      details: data.details,
    };
  }

  return data;
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    getProfile: (token: string) =>
      request<{ user: any }>('/auth/profile', { token }),

    updateProfile: (token: string, data: { name?: string; bio?: string }) =>
      request<{ user: any }>('/auth/profile', {
        method: 'PUT',
        token,
        body: JSON.stringify(data),
      }),
  },

  resumes: {
    upload: (token: string, file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      return request<{ resume: any }>('/resumes', {
        method: 'POST',
        token,
        body: formData,
      });
    },

    getAll: (token: string) =>
      request<{ resumes: any[] }>('/resumes', { token }),

    getById: (token: string, id: string) =>
      request<{ resume: any }>(`/resumes/${id}`, { token }),

    delete: (token: string, id: string) =>
      request<{ message: string }>(`/resumes/${id}`, {
        method: 'DELETE',
        token,
      }),
  },

  jobDescriptions: {
    create: (token: string, data: { title: string; content: string }) =>
      request<{ jobDescription: any }>('/job-descriptions', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),

    getAll: (token: string) =>
      request<{ jobDescriptions: any[] }>('/job-descriptions', { token }),

    getById: (token: string, id: string) =>
      request<{ jobDescription: any }>(`/job-descriptions/${id}`, { token }),

    delete: (token: string, id: string) =>
      request<{ message: string }>(`/job-descriptions/${id}`, {
        method: 'DELETE',
        token,
      }),

    matchWithResume: (token: string, data: { resume_id: string; job_description_id: string }) =>
      request<{ skillMatch: any }>('/job-descriptions/match', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
  },

  interviews: {
    create: (token: string, data: {
      role: string;
      interview_type?: string;
      difficulty?: string;
      total_questions?: number;
      resume_id?: string;
      job_description_id?: string;
    }) =>
      request<{ interview: any }>('/interviews', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),

    getAll: (token: string) =>
      request<{ interviews: any[] }>('/interviews', { token }),

    getById: (token: string, id: string) =>
      request<{ interview: any; questions: any[]; answers: any[] }>(`/interviews/${id}`, { token }),

    start: (token: string, id: string) =>
      request<{ interview: any; questions: any[] }>(`/interviews/${id}/start`, {
        method: 'POST',
        token,
      }),

    getCurrentQuestion: (token: string, id: string) =>
      request<{ question: any; questionNumber: number; totalQuestions: number; answer: any }>(
        `/interviews/${id}/question`,
        { token }
      ),

    submitAnswer: (token: string, interviewId: string, data: { question_id: string; answer_text: string }) =>
      request<{
        evaluation: any;
        nextQuestionIndex: number;
        isComplete: boolean;
        summary: any;
      }>(`/interviews/${interviewId}/answer`, {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),

    complete: (token: string, id: string) =>
      request<{ interview: any; summary: any }>(`/interviews/${id}/complete`, {
        method: 'POST',
        token,
      }),

    getResults: (token: string, id: string) =>
      request<{
        interview: any;
        questions: any[];
        answers: any[];
        scores: any;
      }>(`/interviews/${id}/results`, { token }),

    delete: (token: string, id: string) =>
      request<{ message: string }>(`/interviews/${id}`, {
        method: 'DELETE',
        token,
      }),
  },

  dashboard: {
    getStats: (token: string) =>
      request<{ stats: any }>('/dashboard/stats', { token }),

    getWeakAreas: (token: string) =>
      request<{ weakAreas: any[] }>('/dashboard/weak-areas', { token }),

    createPracticeInterview: (token: string, data: { topic: string; difficulty?: string }) =>
      request<{ interview: any; questions: any[] }>('/dashboard/practice', {
        method: 'POST',
        token,
        body: JSON.stringify(data),
      }),
  },
};
