/**
 * One-time credential rotation for accounts that already exist in the live DB.
 *
 * The seed routine only creates users on an empty table, so it cannot fix
 * passwords that were shipped in an earlier build. Run this once, on the VM,
 * after setting the new passwords in the environment:
 *
 *   SEED_ADMIN_PASSWORD=...  SEED_EMPLOYEE_PASSWORD=...  npx tsx scripts/rotate-credentials.ts
 *
 * It updates the password hash in place; it never prints the passwords.
 */
import bcrypt from 'bcryptjs';
import { db } from '../src/db/database.js';

async function rotate(email: string, envKey: string) {
  const password = (process.env[envKey] || '').trim();
  if (!password) {
    console.log(`skip ${email}: ${envKey} not set`);
    return;
  }
  const { rowCount } = await db.query('UPDATE users SET password = $1 WHERE email = $2', [
    bcrypt.hashSync(password, 10),
    email,
  ]);
  console.log(rowCount ? `rotated ${email}` : `no row for ${email} (nothing changed)`);
}

async function main() {
  await rotate(process.env.SEED_ADMIN_EMAIL || 'admin@irur.com', 'SEED_ADMIN_PASSWORD');
  await rotate(process.env.SEED_EMPLOYEE_EMAIL || 'employee@irur.com', 'SEED_EMPLOYEE_PASSWORD');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
