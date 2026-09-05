/**
 * Centralised, fail-closed secret loading.
 *
 * Security-critical secrets have NO hardcoded fallback: if they are missing the
 * process refuses to start, rather than silently running on a value that is
 * public in the source tree. Set them in the deployment .env before booting.
 */

function required(key: string): string {
  const value = (process.env[key] || '').trim();
  if (!value) {
    console.error(
      `\n[FATAL] Required environment variable ${key} is not set.\n` +
        `Refusing to start on an insecure default. Add it to server/.env (or the root .env) and restart.\n`
    );
    process.exit(1);
  }
  return value;
}

/** In production every secret is mandatory. In dev we allow a clearly-marked throwaway. */
const IS_PROD = process.env.NODE_ENV === 'production';

function requiredInProd(key: string, devFallback: string): string {
  if (IS_PROD) return required(key);
  return (process.env[key] || '').trim() || devFallback;
}

export const config = {
  jwtSecret: requiredInProd('JWT_SECRET', 'dev-only-insecure-secret'),
  isProd: IS_PROD,
};
