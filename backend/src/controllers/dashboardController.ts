import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import InterviewModel from '../models/Interview';
import WeakAreaModel from '../models/WeakArea';
import QuestionModel from '../models/Question';
import AnswerModel from '../models/Answer';

export const dashboardController = {
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const stats = await InterviewModel.getStats(req.user.id);
      const weakAreas = await WeakAreaModel.findByUser(req.user.id);

      res.json({
        stats: {
          ...stats,
          weakAreas: weakAreas.slice(0, 10),
        },
      });
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
  },

  async getWeakAreas(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const weakAreas = await WeakAreaModel.findByUser(req.user.id);
      res.json({ weakAreas });
    } catch (error: any) {
      console.error('Get weak areas error:', error);
      res.status(500).json({ error: 'Failed to get weak areas' });
    }
  },

  async createPracticeInterview(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { topic, difficulty } = req.body;

      if (!topic) {
        res.status(400).json({ error: 'Topic is required' });
        return;
      }

      const interview = await InterviewModel.create({
        user_id: req.user.id,
        role: topic,
        interview_type: 'technical',
        difficulty: difficulty || 'adaptive',
        total_questions: 5,
      });

      const questions = await generatePracticeQuestions(topic, difficulty || 'adaptive');

      await QuestionModel.bulkCreate(
        questions.map((q, i) => ({
          interview_id: interview.id,
          order_index: i,
          question_text: q.question_text,
          category: q.category,
          difficulty: q.difficulty,
          context: q.context,
        }))
      );

      await InterviewModel.update(interview.id, { status: 'in_progress' });

      const updatedInterview = await InterviewModel.findById(interview.id);
      const allQuestions = await QuestionModel.findByInterview(interview.id);

      res.status(201).json({
        interview: updatedInterview,
        questions: allQuestions,
      });
    } catch (error: any) {
      console.error('Create practice interview error:', error);
      res.status(500).json({ error: 'Failed to create practice interview' });
    }
  },
};

async function generatePracticeQuestions(topic: string, difficulty: string) {
  const categories = ['Technical', 'Problem Solving', 'System Design'];
  const questions = [];

  const topicQuestions: Record<string, string[]> = {
    'System Design': [
      'How would you design a scalable notification system?',
      'Design a URL shortening service like bit.ly.',
      'How would you design a real-time chat application?',
      'Design a distributed caching system.',
      'How would you design a rate limiting system?',
    ],
    'Data Structures': [
      'Explain the difference between arrays and linked lists. When would you use each?',
      'How would you implement a LRU cache?',
      'Explain how a hash table works and its time complexity.',
      'When would you use a tree data structure over a graph?',
      'Explain the concept of a heap and its use cases.',
    ],
    'Algorithms': [
      'Explain the difference between BFS and DFS.',
      'How would you find the longest substring without repeating characters?',
      'Explain dynamic programming with an example.',
      'How would you sort a nearly sorted array efficiently?',
      'Explain the concept of memoization.',
    ],
    'Databases': [
      'What are database indexes and when should you use them?',
      'Explain the difference between normalization and denormalization.',
      'How would you optimize a slow SQL query?',
      'What is database sharding and when would you use it?',
      'Explain ACID properties in databases.',
    ],
    'APIs': [
      'What is the difference between REST and GraphQL?',
      'How would you version a REST API?',
      'Explain the concept of API rate limiting.',
      'What are webhooks and when would you use them?',
      'How would you handle API authentication and authorization?',
    ],
    'Security': [
      'What is OWASP Top 10 and why is it important?',
      'How do you prevent SQL injection attacks?',
      'Explain the difference between authentication and authorization.',
      'What is CORS and how does it work?',
      'How would you secure a REST API?',
    ],
  };

  const topicQs = topicQuestions[topic] || [
    `Explain a key concept in ${topic}.`,
    `How would you apply ${topic} in a real-world project?`,
    `What are best practices in ${topic}?`,
    `Describe a challenge you might face with ${topic}.`,
    `How would you debug an issue related to ${topic}?`,
  ];

  const diff = difficulty === 'adaptive' ? 'medium' : difficulty;

  for (let i = 0; i < 5; i++) {
    questions.push({
      question_text: topicQs[i % topicQs.length],
      category: categories[i % categories.length],
      difficulty: diff as 'easy' | 'medium' | 'hard',
      context: { topic, practiceMode: true },
    });
  }

  return questions;
}
