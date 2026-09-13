import OpenAI from 'openai';
import { env } from '../config/env';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface AIGeneratedQuestion {
  question_text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context: Record<string, any>;
}

export interface AIEvaluation {
  accuracy_score: number;
  relevance_score: number;
  clarity_score: number;
  technical_depth_score: number;
  overall_score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

function getDifficultyForLevel(level: number): 'easy' | 'medium' | 'hard' {
  if (level < 0.33) return 'easy';
  if (level < 0.66) return 'medium';
  return 'hard';
}

export async function generateInterviewQuestions(
  resumeText: string,
  jdContent: string | null,
  role: string,
  interviewType: string,
  difficulty: string,
  count: number,
  currentDifficultyLevel: number
): Promise<AIGeneratedQuestion[]> {
  const prompt = `You are an expert technical interviewer. Generate ${count} interview questions for a ${role} position.

Interview Type: ${interviewType}
Difficulty Level: ${difficulty === 'adaptive' ? getDifficultyForLevel(currentDifficultyLevel) : difficulty}

${resumeText ? `Candidate Resume Summary:\n${resumeText.substring(0, 2000)}` : 'No resume provided.'}

${jdContent ? `Job Description:\n${jdContent.substring(0, 2000)}` : 'No job description provided.'}

Generate questions that are:
1. Relevant to the role and job requirements
2. Based on the candidate's experience
3. Mix of different categories appropriate for ${interviewType} interview
4. Appropriate difficulty level

For ${interviewType} interviews include:
${interviewType === 'technical' ? '- Technical concepts and system design\n- Coding and algorithm questions\n- Technology-specific questions' : ''}
${interviewType === 'hr' ? '- Behavioral questions (STAR method)\n- Cultural fit questions\n- Career goals and motivation' : ''}
${interviewType === 'behavioral' ? '- Past experience questions\n- Leadership and teamwork\n- Conflict resolution and problem solving' : ''}
${interviewType === 'mixed' ? '- Mix of technical, behavioral, and situational questions\n- Both technical depth and soft skills assessment' : ''}

Return a JSON array with objects containing:
- question_text: The interview question
- category: Question category (e.g., "Technical", "Behavioral", "System Design", "Problem Solving", "Cultural Fit")
- difficulty: "easy", "medium", or "hard"
- context: An object with any additional context for the question

Return ONLY the JSON array, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content || '[]';
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      return parsed.map((q: any) => ({
        question_text: q.question_text,
        category: q.category || 'General',
        difficulty: q.difficulty || 'medium',
        context: q.context || {},
      }));
    }

    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions.map((q: any) => ({
        question_text: q.question_text,
        category: q.category || 'General',
        difficulty: q.difficulty || 'medium',
        context: q.context || {},
      }));
    }

    return generateFallbackQuestions(role, interviewType, difficulty, count);
  } catch (error) {
    console.error('AI question generation failed:', error);
    return generateFallbackQuestions(role, interviewType, difficulty, count);
  }
}

export async function evaluateAnswer(
  questionText: string,
  answerText: string,
  questionCategory: string,
  difficulty: string,
  role: string
): Promise<AIEvaluation> {
  const prompt = `You are an expert interviewer evaluating a candidate's answer.

Role: ${role}
Question Category: ${questionCategory}
Question Difficulty: ${difficulty}

Question: ${questionText}

Candidate's Answer: ${answerText}

Evaluate the answer on the following criteria (each 0-100):
1. accuracy_score: How factually correct and accurate is the answer?
2. relevance_score: How relevant is the answer to the question asked?
3. clarity_score: How clear and well-structured is the answer?
4. technical_depth_score: How deep is the technical knowledge demonstrated?

Also provide:
- overall_score: Weighted average (accuracy 30%, relevance 25%, clarity 20%, technical_depth 25%)
- feedback: 2-3 sentences of constructive feedback
- strengths: Array of 2-3 specific strengths demonstrated
- improvements: Array of 2-3 areas for improvement

Return a JSON object with these exact fields. Return ONLY the JSON, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);

    return {
      accuracy_score: Math.min(100, Math.max(0, parsed.accuracy_score || 50)),
      relevance_score: Math.min(100, Math.max(0, parsed.relevance_score || 50)),
      clarity_score: Math.min(100, Math.max(0, parsed.clarity_score || 50)),
      technical_depth_score: Math.min(100, Math.max(0, parsed.technical_depth_score || 50)),
      overall_score: Math.min(100, Math.max(0, parsed.overall_score || 50)),
      feedback: parsed.feedback || 'No feedback available.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    };
  } catch (error) {
    console.error('AI answer evaluation failed:', error);
    return {
      accuracy_score: 50,
      relevance_score: 50,
      clarity_score: 50,
      technical_depth_score: 50,
      overall_score: 50,
      feedback: 'Unable to evaluate answer at this time. Please try again.',
      strengths: [],
      improvements: [],
    };
  }
}

export async function generateInterviewSummary(
  answers: Array<{
    question_text: string;
    answer_text: string;
    category: string;
    difficulty: string;
    scores: {
      accuracy_score: number;
      relevance_score: number;
      clarity_score: number;
      technical_depth_score: number;
      overall_score: number;
    };
  }>,
  role: string
): Promise<{
  total_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}> {
  const answersSummary = answers.map((a, i) =>
    `Q${i + 1} [${a.category}/${a.difficulty}]: ${a.question_text}\nA: ${a.answer_text.substring(0, 200)}\nScores: Acc=${a.scores.accuracy_score}, Rel=${a.scores.relevance_score}, Clr=${a.scores.clarity_score}, Tech=${a.scores.technical_depth_score}`
  ).join('\n\n');

  const prompt = `You are an expert interview coach. Based on the following interview results for a ${role} position, provide a comprehensive summary.

Interview Results:
${answersSummary}

Provide:
1. total_score: Overall score (0-100), weighted average of all answer scores
2. strengths: Array of 3-5 key strengths demonstrated across the interview
3. weaknesses: Array of 3-5 areas that need improvement
4. suggestions: Array of 3-5 specific, actionable suggestions for improvement

Return a JSON object with these fields. Return ONLY the JSON, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content || '{}';
    const parsed = JSON.parse(content);

    const avgScore = answers.reduce((sum, a) => sum + a.scores.overall_score, 0) / (answers.length || 1);

    return {
      total_score: parsed.total_score || Math.round(avgScore),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (error) {
    console.error('AI summary generation failed:', error);
    const avgScore = answers.reduce((sum, a) => sum + a.scores.overall_score, 0) / (answers.length || 1);
    return {
      total_score: Math.round(avgScore),
      strengths: [],
      weaknesses: [],
      suggestions: ['Practice more questions in your weak areas.'],
    };
  }
}

export async function extractSkillsFromResume(text: string): Promise<string[]> {
  const prompt = `Extract all technical and professional skills from this resume text. Return a JSON array of skill strings.

Resume Text:
${text.substring(0, 3000)}

Return ONLY a JSON array of skill strings, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content || '[]';
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.skills || [];
  } catch (error) {
    console.error('AI skill extraction failed:', error);
    return [];
  }
}

export async function extractSkillsFromJD(text: string): Promise<string[]> {
  const prompt = `Extract all required skills and technologies from this job description. Return a JSON array of skill strings.

Job Description:
${text.substring(0, 3000)}

Return ONLY a JSON array of skill strings, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content || '[]';
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : parsed.skills || [];
  } catch (error) {
    console.error('AI skill extraction failed:', error);
    return [];
  }
}

export function calculateSkillMatch(
  resumeSkills: string[],
  jdSkills: string[]
): {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
} {
  const normalizedResume = resumeSkills.map((s) => s.toLowerCase().trim());
  const normalizedJD = jdSkills.map((s) => s.toLowerCase().trim());

  const matched = normalizedJD.filter((s) => normalizedResume.includes(s));
  const missing = normalizedJD.filter((s) => !normalizedResume.includes(s));
  const additional = normalizedResume.filter((s) => !normalizedJD.includes(s));

  const matchPercentage = normalizedJD.length > 0
    ? Math.round((matched.length / normalizedJD.length) * 100)
    : 0;

  return {
    match_percentage: matchPercentage,
    matched_skills: matched.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    missing_skills: missing.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    additional_skills: additional.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  };
}

function generateFallbackQuestions(
  role: string,
  interviewType: string,
  difficulty: string,
  count: number
): AIGeneratedQuestion[] {
  const technicalQuestions: Record<string, string[]> = {
    easy: [
      'What is the difference between a stack and a queue?',
      'Explain the concept of object-oriented programming.',
      'What is REST API and how does it work?',
      'Explain the difference between SQL and NoSQL databases.',
      'What is version control and why is it important?',
    ],
    medium: [
      'Explain the difference between TCP and UDP. When would you use each?',
      'What are microservices and what are their advantages and disadvantages?',
      'Explain the concept of database indexing and when you would use it.',
      'What is the difference between concurrency and parallelism?',
      'How would you design a URL shortening service?',
    ],
    hard: [
      'Explain how you would design a distributed caching system.',
      'How would you handle data consistency in a microservices architecture?',
      'Describe the CAP theorem and its implications for distributed systems.',
      'How would you design a real-time notification system at scale?',
      'Explain the trade-offs between different message queue architectures.',
    ],
  };

  const behavioralQuestions: string[] = [
    'Tell me about a time when you had to deal with a difficult team member.',
    'Describe a project where you had to learn a new technology quickly.',
    'Tell me about a time you failed. How did you handle it?',
    'How do you prioritize tasks when working on multiple projects?',
    'Describe a situation where you had to make a difficult decision with incomplete information.',
  ];

  const questions: AIGeneratedQuestion[] = [];
  const qCount = Math.min(count, 10);

  for (let i = 0; i < qCount; i++) {
    if (interviewType === 'technical' || interviewType === 'mixed') {
      const diff = difficulty === 'adaptive' ? getDifficultyForLevel(0.5) : difficulty;
      const pool = technicalQuestions[diff] || technicalQuestions.medium;
      const q = pool[i % pool.length];
      questions.push({
        question_text: q,
        category: 'Technical',
        difficulty: diff as 'easy' | 'medium' | 'hard',
        context: { role },
      });
    } else {
      const q = behavioralQuestions[i % behavioralQuestions.length];
      questions.push({
        question_text: q,
        category: 'Behavioral',
        difficulty: 'medium',
        context: { role },
      });
    }
  }

  return questions;
}
