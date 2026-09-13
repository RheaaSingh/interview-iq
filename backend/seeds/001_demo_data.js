const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  await knex('weak_areas').del();
  await knex('answers').del();
  await knex('questions').del();
  await knex('interviews').del();
  await knex('skill_matches').del();
  await knex('job_descriptions').del();
  await knex('resumes').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('password123', 12);

  const userId = uuidv4();
  await knex('users').insert({
    id: userId,
    name: 'Demo User',
    email: 'demo@interviewiq.com',
    password_hash: passwordHash,
    bio: 'Software engineer preparing for senior roles',
  });

  const resumeId = uuidv4();
  await knex('resumes').insert({
    id: resumeId,
    user_id: userId,
    original_filename: 'demo_resume.pdf',
    stored_filename: 'demo_resume.pdf',
    file_path: '/uploads/demo_resume.pdf',
    raw_text: 'Senior Software Engineer with 7+ years of experience in full-stack development.\nSkills: JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, MongoDB, AWS, Docker, Kubernetes, Git, CI/CD, REST APIs, GraphQL.\nExperience: Led development of microservices architecture serving 10M+ users.\nEducation: B.S. Computer Science from MIT.\nCertifications: AWS Solutions Architect, Google Cloud Professional.',
    extracted_skills: JSON.stringify(['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'REST APIs', 'GraphQL']),
    extracted_experience: JSON.stringify([{ role: 'Senior Software Engineer', duration: '7+ years' }]),
    extracted_education: JSON.stringify([{ degree: 'B.S. Computer Science', institution: 'MIT' }]),
    extracted_certifications: JSON.stringify(['AWS Solutions Architect', 'Google Cloud Professional']),
    metadata: JSON.stringify({}),
  });

  const jdId = uuidv4();
  await knex('job_descriptions').insert({
    id: jdId,
    user_id: userId,
    title: 'Senior Full Stack Developer',
    content: 'We are looking for a Senior Full Stack Developer to join our team.\nRequirements:\n- 5+ years of experience with JavaScript/TypeScript\n- Strong experience with React and Node.js\n- Experience with cloud services (AWS preferred)\n- Knowledge of containerization (Docker, Kubernetes)\n- Experience with SQL and NoSQL databases\n- Strong problem-solving skills\n- Experience with microservices architecture\nNice to have:\n- GraphQL experience\n- CI/CD pipeline experience\n- System design knowledge',
    extracted_skills: JSON.stringify(['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'Microservices', 'GraphQL', 'CI/CD', 'System Design']),
    extracted_requirements: JSON.stringify(['5+ years JavaScript/TypeScript experience', 'React and Node.js expertise', 'AWS cloud services', 'Docker and Kubernetes', 'SQL and NoSQL databases']),
    metadata: JSON.stringify({}),
  });

  await knex('skill_matches').insert({
    id: uuidv4(),
    resume_id: resumeId,
    job_description_id: jdId,
    match_percentage: 85.5,
    matched_skills: JSON.stringify(['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'CI/CD']),
    missing_skills: JSON.stringify(['System Design']),
    additional_skills: JSON.stringify(['Python', 'PostgreSQL', 'MongoDB', 'Git']),
  });

  console.log('Seed data created successfully');
  console.log('Demo user: demo@interviewiq.com / password123');
};
