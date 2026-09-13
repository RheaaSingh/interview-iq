import db from '../config/database';

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
  created_at: Date;
  updated_at: Date;
}

const AnswerModel = {
  async findById(id: string): Promise<Answer | undefined> {
    const a = await db('answers').where({ id }).first();
    if (a) {
      a.strengths = JSON.parse(a.strengths || '[]');
      a.improvements = JSON.parse(a.improvements || '[]');
    }
    return a;
  },

  async findByQuestion(questionId: string): Promise<Answer | undefined> {
    const a = await db('answers').where({ question_id: questionId }).first();
    if (a) {
      a.strengths = JSON.parse(a.strengths || '[]');
      a.improvements = JSON.parse(a.improvements || '[]');
    }
    return a;
  },

  async findByInterview(interviewId: string): Promise<Answer[]> {
    const answers = await db('answers').where({ interview_id: interviewId });
    return answers.map((a) => {
      a.strengths = JSON.parse(a.strengths || '[]');
      a.improvements = JSON.parse(a.improvements || '[]');
      return a;
    });
  },

  async create(data: {
    question_id: string;
    interview_id: string;
    answer_text: string;
    accuracy_score?: number;
    relevance_score?: number;
    clarity_score?: number;
    technical_depth_score?: number;
    overall_score?: number;
    ai_feedback?: string;
    strengths?: string[];
    improvements?: string[];
  }): Promise<Answer> {
    const [answer] = await db('answers')
      .insert({
        ...data,
        strengths: JSON.stringify(data.strengths || []),
        improvements: JSON.stringify(data.improvements || []),
      })
      .returning('*');
    return this.findById(answer.id) as Promise<Answer>;
  },

  async update(id: string, data: Partial<Omit<Answer, 'id' | 'created_at' | 'updated_at'>>): Promise<Answer | undefined> {
    const updateData: any = { ...data, updated_at: db.fn.now() };
    if (data.strengths) updateData.strengths = JSON.stringify(data.strengths);
    if (data.improvements) updateData.improvements = JSON.stringify(data.improvements);

    await db('answers').where({ id }).update(updateData);
    return this.findById(id);
  },

  async getInterviewScores(interviewId: string) {
    const results = await db('answers')
      .where({ interview_id: interviewId })
      .avg('accuracy_score as avg_accuracy')
      .avg('relevance_score as avg_relevance')
      .avg('clarity_score as avg_clarity')
      .avg('technical_depth_score as avg_technical_depth')
      .avg('overall_score as avg_overall')
      .first();

    const allStrengths: string[] = [];
    const allImprovements: string[] = [];
    const answers = await this.findByInterview(interviewId);
    answers.forEach((a) => {
      allStrengths.push(...(a.strengths || []));
      allImprovements.push(...(a.improvements || []));
    });

    return {
      scores: results,
      strengths: [...new Set(allStrengths)],
      improvements: [...new Set(allImprovements)],
    };
  },
};

export default AnswerModel;
