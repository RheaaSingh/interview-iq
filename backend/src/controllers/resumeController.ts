import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ResumeModel from '../models/Resume';
import { extractTextFromFile, extractSkillsFromText, extractExperienceFromText, extractEducationFromText } from '../services/resumeService';
import { extractSkillsFromResume, calculateSkillMatch } from '../services/aiService';
import { env } from '../config/env';
import * as fs from 'fs';
import * as path from 'path';

export const resumeController = {
  async upload(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const file = req.file;
      const allowedTypes = ['.pdf', '.docx', '.txt'];
      const ext = path.extname(file.originalname).toLowerCase();

      if (!allowedTypes.includes(ext)) {
        fs.unlinkSync(file.path);
        res.status(400).json({ error: 'Only PDF, DOCX, and TXT files are allowed' });
        return;
      }

      let rawText = '';
      try {
        rawText = await extractTextFromFile(file.path, file.originalname);
      } catch (error: any) {
        console.error('Text extraction error:', error);
        rawText = '';
      }

      let extractedSkills = extractSkillsFromText(rawText);
      let experience = extractExperienceFromText(rawText);
      let education = extractEducationFromText(rawText);

      try {
        const aiSkills = await extractSkillsFromResume(rawText);
        if (aiSkills.length > extractedSkills.length) {
          extractedSkills = aiSkills;
        }
      } catch (error) {
        console.error('AI skill extraction failed, using fallback');
      }

      const resume = await ResumeModel.create({
        user_id: req.user.id,
        original_filename: file.originalname,
        stored_filename: file.filename,
        file_path: file.path,
        raw_text: rawText,
        extracted_skills: extractedSkills,
        extracted_experience: experience,
        extracted_education: education,
      });

      res.status(201).json({ resume });
    } catch (error: any) {
      console.error('Upload resume error:', error);
      res.status(500).json({ error: 'Failed to upload resume' });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const resumes = await ResumeModel.findByUser(req.user.id);
      res.json({ resumes });
    } catch (error: any) {
      console.error('Get resumes error:', error);
      res.status(500).json({ error: 'Failed to get resumes' });
    }
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const resume = await ResumeModel.findById(req.params.id);
      if (!resume || resume.user_id !== req.user.id) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      res.json({ resume });
    } catch (error: any) {
      console.error('Get resume error:', error);
      res.status(500).json({ error: 'Failed to get resume' });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const resume = await ResumeModel.findById(req.params.id);
      if (!resume || resume.user_id !== req.user.id) {
        res.status(404).json({ error: 'Resume not found' });
        return;
      }

      if (fs.existsSync(resume.file_path)) {
        fs.unlinkSync(resume.file_path);
      }

      await ResumeModel.delete(req.params.id);
      res.json({ message: 'Resume deleted successfully' });
    } catch (error: any) {
      console.error('Delete resume error:', error);
      res.status(500).json({ error: 'Failed to delete resume' });
    }
  },
};
