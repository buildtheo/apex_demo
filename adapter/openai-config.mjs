import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';

// Import only API credentials, never the prior demo's Twilio settings or model choices.
export function openaiCredentials(env = process.env) {
  let source = {};
  if (env.APEX_OPENAI_ENV_FILE) {
    try { source = parseEnv(readFileSync(env.APEX_OPENAI_ENV_FILE, 'utf8')); }
    catch { throw Error('Cannot read configured OpenAI credential source.'); }
  }
  const apiKey = env.OPENAI_API_KEY || source.OPENAI_API_KEY;
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw Error('Configure an OpenAI API key locally.');
  return {
    apiKey,
    project: env.OPENAI_PROJECT_ID || source.OPENAI_PROJECT_ID || undefined,
    organization: env.OPENAI_ORG_ID || source.OPENAI_ORG_ID || undefined,
  };
}
