const knex = require('knex');
const path = require('path');

const rootDir = path.resolve(__dirname);

const config = {
  client: 'sqlite3',
  connection: {
    filename: path.join(rootDir, 'data', 'interview_iq.db'),
  },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(rootDir, 'migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: path.join(rootDir, 'seeds'),
    extension: 'ts',
  },
};

async function setup() {
  const db = knex(config);
  try {
    console.log('Running migrations...');
    await db.migrate.latest();
    console.log('Migrations complete');
    console.log('Running seeds...');
    await db.seed.run();
    console.log('Seeds complete');
  } catch (e) {
    console.error('Setup error:', e);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

setup();
