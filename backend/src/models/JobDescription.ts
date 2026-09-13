import db from '../config/database';

export interface JobDescription {
  id: string;
  user_id: string;
  title: string;
  content: string;
  extracted_skills: string[];
  extracted_requirements: string[];
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

const JobDescriptionModel = {
  async findById(id: string): Promise<JobDescription | undefined> {
    const jd = await db('job_descriptions').where({ id }).first();
    if (jd) {
      jd.extracted_skills = JSON.parse(jd.extracted_skills || '[]');
      jd.extracted_requirements = JSON.parse(jd.extracted_requirements || '[]');
      jd.metadata = JSON.parse(jd.metadata || '{}');
    }
    return jd;
  },

  async findByUser(userId: string): Promise<JobDescription[]> {
    const jds = await db('job_descriptions').where({ user_id: userId }).orderBy('created_at', 'desc');
    return jds.map((jd) => {
      jd.extracted_skills = JSON.parse(jd.extracted_skills || '[]');
      jd.extracted_requirements = JSON.parse(jd.extracted_requirements || '[]');
      jd.metadata = JSON.parse(jd.metadata || '{}');
      return jd;
    });
  },

  async create(data: {
    user_id: string;
    title: string;
    content: string;
    extracted_skills?: string[];
    extracted_requirements?: string[];
    metadata?: Record<string, any>;
  }): Promise<JobDescription> {
    const [jd] = await db('job_descriptions')
      .insert({
        ...data,
        extracted_skills: JSON.stringify(data.extracted_skills || []),
        extracted_requirements: JSON.stringify(data.extracted_requirements || []),
        metadata: JSON.stringify(data.metadata || {}),
      })
      .returning('*');
    return this.findById(jd.id) as Promise<JobDescription>;
  },

  async delete(id: string): Promise<void> {
    await db('job_descriptions').where({ id }).del();
  },
};

export default JobDescriptionModel;
