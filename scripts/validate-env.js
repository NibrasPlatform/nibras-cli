#!/usr/bin/env node
'use strict';

const REQUIRED = [
  'DATABASE_URL',
  'NIBRAS_ENCRYPTION_KEY',
  'GITHUB_APP_ID',
  'GITHUB_APP_CLIENT_ID',
  'GITHUB_APP_CLIENT_SECRET',
  'GITHUB_APP_PRIVATE_KEY',
  'GITHUB_APP_NAME',
  'GITHUB_WEBHOOK_SECRET',
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('\n❌  Missing required environment variables:\n');
  missing.forEach((key) => console.error(`   • ${key}`));
  console.error('\nSet these in your .env file or deployment environment.\n');
  process.exit(1);
}

console.log('✓  All required environment variables are set.');
