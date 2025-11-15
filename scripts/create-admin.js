#!/usr/bin/env node

/**
 * Helper script to create an admin account
 * Usage: node scripts/create-admin.js
 */

const crypto = require('crypto');
const readline = require('readline');
const { promisify } = require('util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = promisify(rl.question).bind(rl);

async function hashPassword(password) {
  const SALT_LENGTH = 16;
  const ITERATIONS = 100000;
  const KEY_LENGTH = 32;

  return new Promise((resolve, reject) => {
    // Generate random salt
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Hash password using PBKDF2
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, 'sha256', (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }

      // Convert to base64
      const hashBase64 = derivedKey.toString('base64');
      const saltBase64 = salt.toString('base64');

      // Create PHC-style string
      const phcString = `$pbkdf2$${ITERATIONS}$${saltBase64}$${hashBase64}`;
      resolve(phcString);
    });
  });
}

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

async function main() {
  console.log('\n=== Create Admin Account ===\n');

  try {
    const email = await question('Email: ');
    const password = await question('Password: ');

    if (!email || !password) {
      console.error('\nError: Email and password are required');
      process.exit(1);
    }

    console.log('\nGenerating password hash...');
    const hashedPassword = await hashPassword(password);
    const id = generateId();

    console.log('\n=== Account Created ===\n');
    console.log('Use the following SQL command to insert the account:\n');
    console.log('For LOCAL database:');
    console.log(`wrangler d1 execute demo_employees --local --command="INSERT INTO accounts (id, email, password) VALUES ('${id}', '${email}', '${hashedPassword}')"`);
    console.log('\nFor PRODUCTION database:');
    console.log(`wrangler d1 execute demo_employees --command="INSERT INTO accounts (id, email, password) VALUES ('${id}', '${email}', '${hashedPassword}')"`);
    console.log('\n');

  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
