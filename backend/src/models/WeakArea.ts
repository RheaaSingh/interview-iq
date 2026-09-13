import db from '../config/database';

export interface WeakArea {
  id: string;
  user_id: string;
  interview_id: string;
  topic: string;
  average_score: number;
  occurrence_count: number;
  created_at: Date;
  updated_at: Date;
}

const WeakAreaModel = {
  async findByUser(userId: string): Promise<WeakArea[]> {
    return db('weak_areas')
      .where({ user_id: userId })
      .orderBy('average_score', 'asc');
  },

  async findByUserAndTopic(userId: string, topic: string): Promise<WeakArea | undefined> {
    return db('weak_areas').where({ user_id: userId, topic }).first();
  },

  async createOrUpdate(data: {
    user_id: string;
    interview_id: string;
    topic: string;
    average_score: number;
  }): Promise<WeakArea> {
    const existing = await this.findByUserAndTopic(data.user_id, data.topic);
    if (existing) {
      const newCount = existing.occurrence_count + 1;
      const newAvg = (existing.average_score * existing.occurrence_count + data.average_score) / newCount;
      await db('weak_areas').where({ id: existing.id }).update({
        average_score: newAvg,
        occurrence_count: newCount,
        interview_id: data.interview_id,
        updated_at: db.fn.now(),
      });
      return db('weak_areas').where({ id: existing.id }).first() as Promise<WeakArea>;
    }
    const [area] = await db('weak_areas')
      .insert({ ...data, occurrence_count: 1 })
      .returning('*');
    return area;
  },

  async deleteByUser(userId: string): Promise<void> {
    await db('weak_areas').where({ user_id: userId }).del();
  },
};

export default WeakAreaModel;
