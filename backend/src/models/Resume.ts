import db from '../config/database';

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
  created_at: Date;
  updated_at: Date;
}

const ResumeModel = {
  async findById(id: string): Promise<Resume | undefined> {
    const resume = await db('resumes').where({ id }).first();
    if (resume) {
      resume.extracted_skills = JSON.parse(resume.extracted_skills || '[]');
      resume.extracted_experience = JSON.parse(resume.extracted_experience || '[]');
      resume.extracted_education = JSON.parse(resume.extracted_education || '[]');
      resume.extracted_certifications = JSON.parse(resume.extracted_certifications || '[]');
      resume.metadata = JSON.parse(resume.metadata || '{}');
    }
    return resume;
  },

  async findByUser(userId: string): Promise<Resume[]> {
    const resumes = await db('resumes').where({ user_id: userId }).orderBy('created_at', 'desc');
    return resumes.map((r) => {
      r.extracted_skills = JSON.parse(r.extracted_skills || '[]');
      r.extracted_experience = JSON.parse(r.extracted_experience || '[]');
      r.extracted_education = JSON.parse(r.extracted_education || '[]');
      r.extracted_certifications = JSON.parse(r.extracted_certifications || '[]');
      r.metadata = JSON.parse(r.metadata || '{}');
      return r;
    });
  },

  async create(data: {
    user_id: string;
    original_filename: string;
    stored_filename: string;
    file_path: string;
    raw_text?: string;
    extracted_skills?: string[];
    extracted_experience?: any[];
    extracted_education?: any[];
    extracted_certifications?: string[];
    metadata?: Record<string, any>;
  }): Promise<Resume> {
    const [resume] = await db('resumes')
      .insert({
        ...data,
        extracted_skills: JSON.stringify(data.extracted_skills || []),
        extracted_experience: JSON.stringify(data.extracted_experience || []),
        extracted_education: JSON.stringify(data.extracted_education || []),
        extracted_certifications: JSON.stringify(data.extracted_certifications || []),
        metadata: JSON.stringify(data.metadata || {}),
      })
      .returning('*');
    return this.findById(resume.id) as Promise<Resume>;
  },

  async update(id: string, data: Partial<Omit<Resume, 'id' | 'created_at' | 'updated_at'>>): Promise<Resume | undefined> {
    const updateData: any = { ...data, updated_at: db.fn.now() };
    if (data.extracted_skills) updateData.extracted_skills = JSON.stringify(data.extracted_skills);
    if (data.extracted_experience) updateData.extracted_experience = JSON.stringify(data.extracted_experience);
    if (data.extracted_education) updateData.extracted_education = JSON.stringify(data.extracted_education);
    if (data.extracted_certifications) updateData.extracted_certifications = JSON.stringify(data.extracted_certifications);
    if (data.metadata) updateData.metadata = JSON.stringify(data.metadata);

    await db('resumes').where({ id }).update(updateData);
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await db('resumes').where({ id }).del();
  },
};

export default ResumeModel;
