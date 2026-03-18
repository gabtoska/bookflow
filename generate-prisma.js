#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', {
    cwd: __dirname,
    stdio: 'inherit',
    shell: 'cmd.exe'
  });
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Failed to generate Prisma client:', error.message);
  process.exit(1);
}
