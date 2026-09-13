import knex from 'knex';
import config from './knexfile';

async function run() {
  const db = knex(config.development);
  try {
    console.log('Running migrations...');
    await db.migrate.latest({ directory: './migrations', extension: 'ts' });
    console.log('Migrations complete');
    console.log('Running seeds...');
    await db.seed.run({ directory: './seeds', extension: 'ts' });
    console.log('Seeds complete');
  } catch (e) {
    console.error(e);
  } finally {
    await db.destroy();
  }
}
run();
