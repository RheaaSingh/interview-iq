import { env } from '../config/env';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as fs from 'fs';
import * as path from 'path';

export async function extractTextFromFile(filePath: string, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.docx') {
    const buffer = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

export function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
    'git', 'github', 'gitlab', 'ci/cd', 'devops',
    'rest api', 'graphql', 'grpc', 'websocket',
    'agile', 'scrum', 'jira', 'confluence',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp',
    'sql', 'nosql', 'mongodb', 'firebase',
    'linux', 'bash', 'shell scripting',
    'figma', 'sketch', 'adobe xd', 'ui/ux',
    'communication', 'leadership', 'teamwork', 'problem solving',
  ];

  const lowerText = text.toLowerCase();
  const foundSkills: string[] = [];

  for (const skill of commonSkills) {
    if (lowerText.includes(skill)) {
      foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  return [...new Set(foundSkills)];
}

export function extractExperienceFromText(text: string): any[] {
  const experiences: any[] = [];
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi,
    /(?:senior|junior|lead|principal|staff|associate|entry)\s*(?:software|frontend|backend|full[\s-]?stack|devops|data|ml|ai|cloud|systems?|network|security)\s*(?:engineer|developer|architect|analyst|scientist)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      experiences.push({ text: match[0], index: match.index });
    }
  }

  return experiences;
}

export function extractEducationFromText(text: string): any[] {
  const education: any[] = [];
  const patterns = [
    /(?:b\.?s\.?|bachelor'?s?)\s+(?:of\s+)?(?:science|arts|engineering|technology|computer science)/gi,
    /(?:m\.?s\.?|master'?s?)\s+(?:of\s+)?(?:science|arts|engineering|technology|computer science)/gi,
    /(?:ph\.?d\.?|doctorate|doctoral)/gi,
    /(?:b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      education.push({ text: match[0], index: match.index });
    }
  }

  return education;
}
