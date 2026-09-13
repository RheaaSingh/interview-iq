import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import JobDescriptionModel from '../models/JobDescription';
import SkillMatchModel from '../models/SkillMatch';
import ResumeModel from '../models/Resume';
import { extractSkillsFromJD, calculateSkillMatch } from '../services/aiService';

export const jobDescriptionController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { title, content } = req.body;
      if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required' });
        return;
      }

      let extractedSkills: string[] = [];
      try {
        extractedSkills = await extractSkillsFromJD(content);
      } catch (error) {
        console.error('AI skill extraction failed, using fallback');
      }

      const jd = await JobDescriptionModel.create({
        user_id: req.user.id,
        title,
        content,
        extracted_skills: extractedSkills,
      });

      res.status(201).json({ jobDescription: jd });
    } catch (error: any) {
      console.error('Create JD error:', error);
      res.status(500).json({ error: 'Failed to create job description' });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const jds = await JobDescriptionModel.findByUser(req.user.id);
      res.json({ jobDescriptions: jds });
    } catch (error: any) {
      console.error('Get JDs error:', error);
      res.status(500).json({ error: 'Failed to get job descriptions' });
    }
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const jd = await JobDescriptionModel.findById(req.params.id);
      if (!jd || jd.user_id !== req.user.id) {
        res.status(404).json({ error: 'Job description not found' });
        return;
      }

      res.json({ jobDescription: jd });
    } catch (error: any) {
      console.error('Get JD error:', error);
      res.status(500).json({ error: 'Failed to get job description' });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const jd = await JobDescriptionModel.findById(req.params.id);
      if (!jd || jd.user_id !== req.user.id) {
        res.status(404).json({ error: 'Job description not found' });
        return;
      }

      await JobDescriptionModel.delete(req.params.id);
      res.json({ message: 'Job description deleted successfully' });
    } catch (error: any) {
      console.error('Delete JD error:', error);
      res.status(500).json({ error: 'Failed to delete job description' });
    }
  },

  async matchWithResume(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { resume_id, job_description_id } = req.body;
      if (!resume_id || !job_description_id) {
        res.status(400).json({ error: 'resume_id and job_description_id are required' });
        return;
      }

      const resume = await ResumeModel.findById(resume_id);
      if (!resume || resume.user_id !== req.user.id) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      const jd = await JobDescriptionModel.findById(job_description_id);
      if (!jd || jd.user_id !== req.user.id) {
        res.status(404).json({ error: 'Job description not found' });
        return;
      }

      await SkillMatchModel.deleteByResumeAndJD(resume_id, job_description_id);

      const matchResult = calculateSkillMatch(
        resume.extracted_skills || [],
        jd.extracted_skills || []
      );

      const skillMatch = await SkillMatchModel.create({
        resume_id,
        job_description_id,
        ...matchResult,
      });

      res.json({ skillMatch });
    } catch (error: any) {
      console.error('Match skills error:', error);
      res.status(500).json({ error: 'Failed to match skills' });
    }
  },
};
