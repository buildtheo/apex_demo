import {readFileSync} from 'node:fs';
import {createAdapter} from './app.mjs';
import {tokenVerifier} from './access.mjs';

try { process.loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
function required(name) {
  if (!process.env[name]) throw Error(`Configure ${name} locally before starting the adapter.`);
  return process.env[name];
}
const authMode = process.env.APEX_AUTH_MODE || 'oauth';
if (!['oauth', 'demo'].includes(authMode)) throw Error('Unsupported APEX_AUTH_MODE.');
function configuredOrigin(value) {
  const url = new URL(value);
  const localDemo = authMode === 'demo' && url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname);
  if ((!localDemo && url.protocol !== 'https:') || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw Error('Expected HTTPS origin, or loopback HTTP in demo mode.');
  return url.origin;
}
const origin = configuredOrigin(required('APEX_MCP_ORIGIN'));
let issuer, verifyToken, assignments;
if (authMode === 'oauth') {
  issuer = required('APEX_OAUTH_ISSUER');
  const jwksUrl = required('APEX_OAUTH_JWKS_URL');
  for (const value of [issuer, jwksUrl]) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) throw Error('OAuth endpoints must use HTTPS.');
  }
  verifyToken = tokenVerifier({issuer, audience: required('APEX_OAUTH_AUDIENCE'), jwksUrl});
  assignments = JSON.parse(readFileSync(required('APEX_ACCESS_FILE'), 'utf8'));
  if (!assignments || Array.isArray(assignments) || typeof assignments !== 'object') throw Error('Expected subject-to-case assignments.');
} else {
  assignments = {'demo:barbara': {role: 'analyst', cases: ['APX-001']}};
}
const app = createAdapter({origin, issuer, assignments, verifyToken, authMode, readState: async () => {
  const response = await fetch('http://127.0.0.1:8080/api/case', {signal: AbortSignal.timeout(5000), redirect: 'error'});
  if (!response.ok) throw Error('DMS read failed');
  return response.json();
}});
app.listen(8787, '127.0.0.1', () => console.log(`Apex read-only MCP on 127.0.0.1:8787 (${authMode === 'demo' ? 'SIMULATED IDENTITY, NO OAUTH' : 'OAuth'}); ChatGPT linking unverified.`));
