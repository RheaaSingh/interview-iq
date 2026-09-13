import db from '../config/database';

export interface SkillMatch {
  id: string;
  resume_id: string;
  job_description_id: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  created_at: Date;
  updated_at: Date;
}

const SkillMatchModel = {
  async findById(id: string): Promise<SkillMatch | undefined> {
    const match = await db('skill_matches').where({ id }).first();
    if (match) {
      match.matched_skills = JSON.parse(match.matched_skills || '[]');
      match.missing_skills = JSON.parse(match.missing_skills || '[]');
      match.additional_skills = JSON.parse(match.additional_skills || '[]');
    }
    return match;
  },

  async findByResumeAndJD(resumeId: string, jdId: string): Promise<SkillMatch | undefined> {
    const match = await db('skill_matches')
      .where({ resume_id: resumeId, job_description_id: jdId })
      .first();
    if (match) {
      match.matched_skills = JSON.parse(match.matched_skills || '[]');
      match.missing_skills = JSON.parse(match.missing_skills || '[]');
      match.additional_skills = JSON.parse(match.additional_skills || '[]');
    }
    return match;
  },

  async create(data: {
    resume_id: string;
    job_description_id: string;
    match_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
    additional_skills: string[];
  }): Promise<SkillMatch> {
    const [match] = await db('skill_matches')
      .insert({
        ...data,
        matched_skills: JSON.stringify(data.matched_skills),
        missing_skills: JSON.stringify(data.missing_skills),
        additional_skills: JSON.stringify(data.additional_skills),
      })
      .returning('*');
    return this.findById(match.id) as Promise<SkillMatch>;
  },

  async deleteByResumeAndJD(resumeId: string, jdId: string): Promise<void> {
    await db('skill_matches').where({ resume_id: resumeId, job_description_id: jdId }).del();
  },
};

export default SkillMatchModel;
