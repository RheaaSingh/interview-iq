import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';
import { authValidation } from '../middleware/validation';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;
      const errors = authValidation.register({ name, email, password });
      if (errors.length > 0) {
        res.status(400).json({ error: 'Validation failed', details: errors });
        return;
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await UserModel.create({ name, email, password_hash: passwordHash });
      const token = generateToken({ id: user.id, email: user.email, name: user.name });

      res.status(201).json({
        user: UserModel.toPublic(user),
        token,
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const errors = authValidation.login({ email, password });
      if (errors.length > 0) {
        res.status(400).json({ error: 'Validation failed', details: errors });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const token = generateToken({ id: user.id, email: user.email, name: user.name });
      res.json({
        user: UserModel.toPublic(user),
        token,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  },

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user: UserModel.toPublic(user) });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { name, bio } = req.body;
      const updated = await UserModel.update(req.user.id, { name, bio });
      if (!updated) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user: UserModel.toPublic(updated) });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },
};
