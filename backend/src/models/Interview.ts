import db from '../config/database';

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
  created_at: Date;
  updated_at: Date;
}

const InterviewModel = {
  async findById(id: string): Promise<Interview | undefined> {
    const interview = await db('interviews').where({ id }).first();
    if (interview) {
      interview.strengths = JSON.parse(interview.strengths || '[]');
      interview.weaknesses = JSON.parse(interview.weaknesses || '[]');
      interview.suggestions = JSON.parse(interview.suggestions || '[]');
    }
    return interview;
  },

  async findByUser(userId: string): Promise<Interview[]> {
    const interviews = await db('interviews').where({ user_id: userId }).orderBy('created_at', 'desc');
    return interviews.map((i) => {
      i.strengths = JSON.parse(i.strengths || '[]');
      i.weaknesses = JSON.parse(i.weaknesses || '[]');
      i.suggestions = JSON.parse(i.suggestions || '[]');
      return i;
    });
  },

  async create(data: {
    user_id: string;
    resume_id?: string;
    job_description_id?: string;
    role: string;
    interview_type: string;
    difficulty: string;
    total_questions: number;
  }): Promise<Interview> {
    const [interview] = await db('interviews')
      .insert({
        ...data,
        status: 'setup',
        current_question_index: 0,
        current_difficulty_level: 0.5,
      })
      .returning('*');
    return this.findById(interview.id) as Promise<Interview>;
  },

  async update(id: string, data: Partial<Omit<Interview, 'id' | 'created_at' | 'updated_at'>>): Promise<Interview | undefined> {
    const updateData: any = { ...data, updated_at: db.fn.now() };
    if (data.strengths) updateData.strengths = JSON.stringify(data.strengths);
    if (data.weaknesses) updateData.weaknesses = JSON.stringify(data.weaknesses);
    if (data.suggestions) updateData.suggestions = JSON.stringify(data.suggestions);

    await db('interviews').where({ id }).update(updateData);
    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await db('interviews').where({ id }).del();
  },

  async getStats(userId: string) {
    const total = await db('interviews').where({ user_id: userId }).count('id as total').first();
    const completed = await db('interviews')
      .where({ user_id: userId, status: 'completed' })
      .count('id as total')
      .first();
    const avgScore = await db('interviews')
      .where({ user_id: userId, status: 'completed' })
      .avg('total_score as average')
      .first();
    const byType = await db('interviews')
      .where({ user_id: userId, status: 'completed' })
      .select('interview_type')
      .count('id as count')
      .avg('total_score as average_score')
      .groupBy('interview_type');

    return {
      total: total?.total || 0,
      completed: completed?.total || 0,
      averageScore: avgScore?.average || 0,
      byType,
    };
  },
};

export default InterviewModel;
