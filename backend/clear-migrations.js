const knex = require('knex');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname);
const dbPath = path.join(rootDir, 'data', 'interview_iq.db');

const config = {
  client: 'sqlite3',
  connection: { filename: dbPath },
  useNullAsDefault: true,
};

async function reset() {
  const db = knex(config);
  try {
    const hasTable = await db.schema.hasTable('knex_migrations');
    if (hasTable) {
      await db.raw('DELETE FROM knex_migrations');
      console.log('Cleared knex_migrations');
    }
  } catch (e) {
    console.log('No migrations to clear');
  } finally {
    await db.destroy();
  }
}

reset();
