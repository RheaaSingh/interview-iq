import type { Knex } from 'knex';
import path from 'path';

const rootDir = path.resolve(process.cwd());

const config: { [key: string]: Knex.Config } = {
  development: {
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
  },
};

export default config;
