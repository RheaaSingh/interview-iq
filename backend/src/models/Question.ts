import db from '../config/database';

export interface Question {
  id: string;
  interview_id: string;
  order_index: number;
  question_text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

const QuestionModel = {
  async findById(id: string): Promise<Question | undefined> {
    const q = await db('questions').where({ id }).first();
    if (q) {
      q.context = JSON.parse(q.context || '{}');
    }
    return q;
  },

  async findByInterview(interviewId: string): Promise<Question[]> {
    const questions = await db('questions')
      .where({ interview_id: interviewId })
      .orderBy('order_index', 'asc');
    return questions.map((q) => {
      q.context = JSON.parse(q.context || '{}');
      return q;
    });
  },

  async create(data: {
    interview_id: string;
    order_index: number;
    question_text: string;
    category: string;
    difficulty: string;
    context?: Record<string, any>;
  }): Promise<Question> {
    const [q] = await db('questions')
      .insert({
        ...data,
        context: JSON.stringify(data.context || {}),
      })
      .returning('*');
    return this.findById(q.id) as Promise<Question>;
  },

  async bulkCreate(questions: Array<{
    interview_id: string;
    order_index: number;
    question_text: string;
    category: string;
    difficulty: string;
    context?: Record<string, any>;
  }>): Promise<Question[]> {
    const inserted = await db('questions')
      .insert(questions.map((q) => ({
        ...q,
        context: JSON.stringify(q.context || {}),
      })))
      .returning('*');
    return inserted.map((q) => {
      q.context = JSON.parse(q.context || '{}');
      return q;
    });
  },

  async deleteByInterview(interviewId: string): Promise<void> {
    await db('questions').where({ interview_id: interviewId }).del();
  },
};

export default QuestionModel;
