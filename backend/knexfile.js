const path = require('path');

const rootDir = path.resolve(__dirname);

const config = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.join(rootDir, 'data', 'interview_iq.db'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(rootDir, 'migrations'),
      extension: 'js',
    },
    seeds: {
      directory: path.join(rootDir, 'seeds'),
      extension: 'js',
    },
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: path.join(rootDir, 'data', 'interview_iq.db'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(rootDir, 'migrations'),
      extension: 'js',
    },
    seeds: {
      directory: path.join(rootDir, 'seeds'),
      extension: 'js',
    },
  },
};

module.exports = config;
