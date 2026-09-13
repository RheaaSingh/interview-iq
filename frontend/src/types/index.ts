export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  raw_text?: string;
  extracted_skills: string[];
  extracted_experience: any[];
  extracted_education: any[];
  extracted_certifications: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: string;
  user_id: string;
  title: string;
  content: string;
  extracted_skills: string[];
  extracted_requirements: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SkillMatch {
  id: string;
  resume_id: string;
  job_description_id: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  resume_id?: string;
  job_description_id?: string;
  role: string;
  interview_type: 'technical' | 'hr' | 'behavioral' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  total_questions: number;
  current_question_index: number;
  current_difficulty_level: number;
  status: 'setup' | 'in_progress' | 'completed' | 'abandoned';
  total_score?: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  interview_id: string;
  order_index: number;
  question_text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  interview_id: string;
  answer_text: string;
  accuracy_score?: number;
  relevance_score?: number;
  clarity_score?: number;
  technical_depth_score?: number;
  overall_score?: number;
  ai_feedback?: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
  updated_at: string;
}

export interface WeakArea {
  id: string;
  user_id: string;
  interview_id: string;
  topic: string;
  average_score: number;
  occurrence_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total: number;
  completed: number;
  averageScore: number;
  byType: Array<{
    interview_type: string;
    count: number;
    average_score: number;
  }>;
  weakAreas: WeakArea[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}
