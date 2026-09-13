/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.text('bio').nullable();
      table.string('profile_image_url').nullable();
      table.timestamps(true, true);
    });
  }

  const hasResumes = await knex.schema.hasTable('resumes');
  if (!hasResumes) {
    await knex.schema.createTable('resumes', (table) => {
      table.string('id').primary();
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('original_filename').notNullable();
      table.string('stored_filename').notNullable();
      table.string('file_path').notNullable();
      table.text('raw_text').nullable();
      table.text('extracted_skills').defaultTo('[]');
      table.text('extracted_experience').defaultTo('[]');
      table.text('extracted_education').defaultTo('[]');
      table.text('extracted_certifications').defaultTo('[]');
      table.text('metadata').defaultTo('{}');
      table.timestamps(true, true);
    });
  }

  const hasJDs = await knex.schema.hasTable('job_descriptions');
  if (!hasJDs) {
    await knex.schema.createTable('job_descriptions', (table) => {
      table.string('id').primary();
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.text('extracted_skills').defaultTo('[]');
      table.text('extracted_requirements').defaultTo('[]');
      table.text('metadata').defaultTo('{}');
      table.timestamps(true, true);
    });
  }

  const hasMatches = await knex.schema.hasTable('skill_matches');
  if (!hasMatches) {
    await knex.schema.createTable('skill_matches', (table) => {
      table.string('id').primary();
      table.string('resume_id').references('id').inTable('resumes').onDelete('CASCADE');
      table.string('job_description_id').references('id').inTable('job_descriptions').onDelete('CASCADE');
      table.float('match_percentage').notNullable();
      table.text('matched_skills').defaultTo('[]');
      table.text('missing_skills').defaultTo('[]');
      table.text('additional_skills').defaultTo('[]');
      table.timestamps(true, true);
    });
  }

  const hasInterviews = await knex.schema.hasTable('interviews');
  if (!hasInterviews) {
    await knex.schema.createTable('interviews', (table) => {
      table.string('id').primary();
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('resume_id').references('id').inTable('resumes').onDelete('SET NULL').nullable();
      table.string('job_description_id').references('id').inTable('job_descriptions').onDelete('SET NULL').nullable();
      table.string('role').notNullable();
      table.string('interview_type').notNullable().defaultTo('mixed');
      table.string('difficulty').notNullable().defaultTo('medium');
      table.integer('total_questions').notNullable().defaultTo(10);
      table.integer('current_question_index').defaultTo(0);
      table.float('current_difficulty_level').defaultTo(0.5);
      table.string('status').defaultTo('setup');
      table.float('total_score').nullable();
      table.text('strengths').defaultTo('[]');
      table.text('weaknesses').defaultTo('[]');
      table.text('suggestions').defaultTo('[]');
      table.timestamps(true, true);
    });
  }

  const hasQuestions = await knex.schema.hasTable('questions');
  if (!hasQuestions) {
    await knex.schema.createTable('questions', (table) => {
      table.string('id').primary();
      table.string('interview_id').references('id').inTable('interviews').onDelete('CASCADE');
      table.integer('order_index').notNullable();
      table.text('question_text').notNullable();
      table.string('category').notNullable();
      table.string('difficulty').notNullable();
      table.text('context').defaultTo('{}');
      table.timestamps(true, true);
    });
  }

  const hasAnswers = await knex.schema.hasTable('answers');
  if (!hasAnswers) {
    await knex.schema.createTable('answers', (table) => {
      table.string('id').primary();
      table.string('question_id').references('id').inTable('questions').onDelete('CASCADE');
      table.string('interview_id').references('id').inTable('interviews').onDelete('CASCADE');
      table.text('answer_text').notNullable();
      table.float('accuracy_score').nullable();
      table.float('relevance_score').nullable();
      table.float('clarity_score').nullable();
      table.float('technical_depth_score').nullable();
      table.float('overall_score').nullable();
      table.text('ai_feedback').nullable();
      table.text('strengths').defaultTo('[]');
      table.text('improvements').defaultTo('[]');
      table.timestamps(true, true);
    });
  }

  const hasWeakAreas = await knex.schema.hasTable('weak_areas');
  if (!hasWeakAreas) {
    await knex.schema.createTable('weak_areas', (table) => {
      table.string('id').primary();
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('interview_id').references('id').inTable('interviews').onDelete('CASCADE');
      table.string('topic').notNullable();
      table.float('average_score').notNullable();
      table.integer('occurrence_count').defaultTo(1);
      table.timestamps(true, true);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('weak_areas');
  await knex.schema.dropTableIfExists('answers');
  await knex.schema.dropTableIfExists('questions');
  await knex.schema.dropTableIfExists('interviews');
  await knex.schema.dropTableIfExists('skill_matches');
  await knex.schema.dropTableIfExists('job_descriptions');
  await knex.schema.dropTableIfExists('resumes');
  await knex.schema.dropTableIfExists('users');
};
