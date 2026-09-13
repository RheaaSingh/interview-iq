const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, 'data');
if (fs.existsSync(dataDir)) {
  fs.rmSync(dataDir, { recursive: true, force: true });
  console.log('Deleted old data directory');
}
fs.mkdirSync(dataDir, { recursive: true });
console.log('Created fresh data directory');
