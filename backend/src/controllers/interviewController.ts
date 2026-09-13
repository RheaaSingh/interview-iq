import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import InterviewModel from '../models/Interview';
import QuestionModel from '../models/Question';
import AnswerModel from '../models/Answer';
import WeakAreaModel from '../models/WeakArea';
import ResumeModel from '../models/Resume';
import JobDescriptionModel from '../models/JobDescription';
import {
  generateInterviewQuestions,
  evaluateAnswer,
  generateInterviewSummary,
} from '../services/aiService';

export const interviewController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { role, interview_type, difficulty, total_questions, resume_id, job_description_id } = req.body;

      if (!role) {
        res.status(400).json({ error: 'Role is required' });
        return;
      }

      const validTypes = ['technical', 'hr', 'behavioral', 'mixed'];
      if (interview_type && !validTypes.includes(interview_type)) {
        res.status(400).json({ error: 'Invalid interview type' });
        return;
      }

      const validDifficulties = ['easy', 'medium', 'hard', 'adaptive'];
      if (difficulty && !validDifficulties.includes(difficulty)) {
        res.status(400).json({ error: 'Invalid difficulty level' });
        return;
      }

      const interview = await InterviewModel.create({
        user_id: req.user.id,
        resume_id: resume_id || undefined,
        job_description_id: job_description_id || undefined,
        role,
        interview_type: interview_type || 'mixed',
        difficulty: difficulty || 'medium',
        total_questions: total_questions || 10,
      });

      res.status(201).json({ interview });
    } catch (error: any) {
      console.error('Create interview error:', error);
      res.status(500).json({ error: 'Failed to create interview' });
    }
  },

  async start(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const interview = await InterviewModel.findById(req.params.id);
      if (!interview || interview.user_id !== req.user.id) {
        res.status(404).json({ error: 'Interview not found' });
        return;
      }

      if (interview.status !== 'setup') {
        res.status(400).json({ error: 'Interview already started or completed' });
        return;
      }

      let resumeText = '';
      let jdContent = '';

      if (interview.resume_id) {
        const resume = await ResumeModel.findById(interview.resume_id);
        if (resume) resumeText = resume.raw_text || '';
      }

      if (interview.job_description_id) {
        const jd = await JobDescriptionModel.findById(interview.job_description_id);
        if (jd) jdContent = jd.content;
      }

      const questions = await generateInterviewQuestions(
        resumeText,
        jdContent || null,
        interview.role,
        interview.interview_type,
        interview.difficulty,
        interview.total_questions,
        interview.current_difficulty_level
      );

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

      res.json({
        interview: updatedInterview,
        questions: allQuestions,
      });
    } catch (error: any) {
      console.error('Start interview error:', error);
      res.status(500).json({ error: 'Failed to start interview' });
    }
  },

  async getCurrentQuestion(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const interview = await InterviewModel.findById(req.params.id);
      if (!interview || interview.user_id !== req.user.id) {
        res.status(404).json({ error: 'Interview not found' });
        return;
      }

      const questions = await QuestionModel.findByInterview(interview.id);
      const currentQuestion = questions[interview.current_question_index];

      if (!currentQuestion) {
        res.status(404).json({ error: 'No more questions' });
        return;
      }

      const existingAnswer = await AnswerModel.findByQuestion(currentQuestion.id);

      res.json({
        question: currentQuestion,
        questionNumber: interview.current_question_index + 1,
        totalQuestions: interview.total_questions,
        answer: existingAnswer || null,
      });
    } catch (error: any) {
      console.error('Get current question error:', error);
      res.status(500).json({ error: 'Failed to get current question' });
    }
  },

  async submitAnswer(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { question_id, answer_text } = req.body;

      if (!question_id || !answer_text) {
        res.status(400).json({ error: 'question_id and answer_text are required' });
        return;
      }

      const question = await QuestionModel.findById(question_id);
      if (!question) {
        res.status(404).json({ error: 'Question not found' });
        return;
      }

      const interview = await InterviewModel.findById(question.interview_id);
      if (!interview || interview.user_id !== req.user.id) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }

      if (interview.status !== 'in_progress') {
        res.status(400).json({ error: 'Interview is not in progress' });
        return;
      }

      const evaluation = await evaluateAnswer(
        question.question_text,
        answer_text,
        question.category,
        question.difficulty,
        interview.role
      );

      let existingAnswer = await AnswerModel.findByQuestion(question_id);
      if (existingAnswer) {
        await AnswerModel.update(existingAnswer.id, {
          answer_text,
          accuracy_score: evaluation.accuracy_score,
          relevance_score: evaluation.relevance_score,
          clarity_score: evaluation.clarity_score,
          technical_depth_score: evaluation.technical_depth_score,
          overall_score: evaluation.overall_score,
          ai_feedback: evaluation.feedback,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
        });
      } else {
        await AnswerModel.create({
          question_id,
          interview_id: interview.id,
          answer_text,
          accuracy_score: evaluation.accuracy_score,
          relevance_score: evaluation.relevance_score,
          clarity_score: evaluation.clarity_score,
          technical_depth_score: evaluation.technical_depth_score,
          overall_score: evaluation.overall_score,
          ai_feedback: evaluation.feedback,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
        });
      }

      let newDifficultyLevel = interview.current_difficulty_level;
      if (interview.difficulty === 'adaptive') {
        const scoreNormalized = evaluation.overall_score / 100;
        newDifficultyLevel = Math.max(0, Math.min(1, newDifficultyLevel + (scoreNormalized - 0.5) * 0.2));
      }

      const newQuestionIndex = interview.current_question_index + 1;
      const isComplete = newQuestionIndex >= interview.total_questions;

      await InterviewModel.update(interview.id, {
        current_question_index: newQuestionIndex,
        current_difficulty_level: newDifficultyLevel,
        status: isComplete ? 'completed' : 'in_progress',
      });

      let summary = null;
      if (isComplete) {
        const allQuestions = await QuestionModel.findByInterview(interview.id);
        const allAnswers = await AnswerModel.findByInterview(interview.id);

        const answerData = allQuestions.map((q, i) => {
          const answer = allAnswers.find((a) => a.question_id === q.id);
          return {
            question_text: q.question_text,
            answer_text: answer?.answer_text || 'No answer',
            category: q.category,
            difficulty: q.difficulty,
            scores: {
              accuracy_score: answer?.accuracy_score || 0,
              relevance_score: answer?.relevance_score || 0,
              clarity_score: answer?.clarity_score || 0,
              technical_depth_score: answer?.technical_depth_score || 0,
              overall_score: answer?.overall_score || 0,
            },
          };
        });

        summary = await generateInterviewSummary(answerData, interview.role);

        await InterviewModel.update(interview.id, {
          total_score: summary.total_score,
          strengths: summary.strengths,
          weaknesses: summary.weaknesses,
          suggestions: summary.suggestions,
          status: 'completed',
        });

        for (const weakness of summary.weaknesses) {
          await WeakAreaModel.createOrUpdate({
            user_id: req.user.id,
            interview_id: interview.id,
            topic: weakness,
            average_score: summary.total_score,
          });
        }
      }

      res.json({
        evaluation,
        nextQuestionIndex: newQuestionIndex,
        isComplete,
        summary,
      });
    } catch (error: any) {
      console.error('Submit answer error:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  },

  async complete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const interview = await InterviewModel.findById(req.params.id);
      if (!interview || interview.user_id !== req.user.id) {
        res.status(404).json({ error: 'Interview not found' });
        return;
      }

      if (interview.status !== 'in_progress') {
        res.status(400).json({ error: 'Interview is not in progress' });
        return;
      }

      const allQuestions = await QuestionModel.findByInterview(interview.id);
      const allAnswers = await AnswerModel.findByInterview(interview.id);

      const answerData = allQuestions.map((q) => {
        const answer = allAnswers.find((a) => a.question_id === q.id);
        return {
          question_text: q.question_text,
          answer_text: answer?.answer_text || 'No answer',
          category: q.category,
          difficulty: q.difficulty,
          scores: {
            accuracy_score: answer?.accuracy_score || 0,
            relevance_score: answer?.relevance_score || 0,
            clarity_score: answer?.clarity_score || 0,
            technical_depth_score: answer?.technical_depth_score || 0,
            overall_score: answer?.overall_score || 0,
          },
        };
      });

      const summary = await generateInterviewSummary(answerData, interview.role);

      await InterviewModel.update(interview.id, {
        total_score: summary.total_score,
        strengths: summary.strengths,
        weaknesses: summary.weaknesses,
        suggestions: summary.suggestions,
        status: 'completed',
      });

      for (const weakness of summary.weaknesses) {
        await WeakAreaModel.createOrUpdate({
          user_id: req.user.id,
          interview_id: interview.id,
          topic: weakness,
          average_score: summary.total_score,
        });
      }

      const updatedInterview = await InterviewModel.findById(interview.id);

      res.json({
        interview: updatedInterview,
        summary,
      });
    } catch (error: any) {
      console.error('Complete interview error:', error);
      res.status(500).json({ error: 'Failed to complete interview' });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const interviews = await InterviewModel.findByUser(req.user.id);
      res.json({ interviews });
    } catch (error: any) {
      console.error('Get interviews error:', error);
      res.status(500).json({ error: 'Failed to get interviews' });
    }
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const interview = await InterviewModel.findById(req.params.id);
      if (!interview || interview.user_id !== req.user.id) {
        res.status(404).json({ error: 'Interview not found' });
        return;
      }

      const questions = await QuestionModel.findByInterview(interview.id);
      const answers = await AnswerModel.findByInterview(interview.id);

      res.json({ interview, questions, answers });
    } catch (error: any) {
      console.error('Get interview error:', error);
      res.status(500).json({ error: 'Failed to get interview' });
    }
  },

  async getResults(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const interview = await InterviewModel.findById(req.params.id);
      if (!interview || interview.user_id !== req.user.id) {
        res.status(404).json({ error: 'Interview not found' });
        return;
      }

      const questions = await QuestionModel.findByInterview(interview.id);
      const answers = await AnswerModel.findByInterview(interview.id);
      const scores = await AnswerModel.getInterviewScores(interview.id);

      res.json({
        interview,
        questions,
        answers,
        scores,
      });
    } catch (error: any) {
      console.error('Get results error:', error);
      res.status(500).json({ error: 'Failed to get results' });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const interview = await InterviewModel.findById(req.params.id);
      if (!interview || interview.user_id !== req.user.id) {
        res.status(404).json({ error: 'Interview not found' });
        return;
      }

      await InterviewModel.delete(req.params.id);
      res.json({ message: 'Interview deleted successfully' });
    } catch (error: any) {
      console.error('Delete interview error:', error);
      res.status(500).json({ error: 'Failed to delete interview' });
    }
  },
};
