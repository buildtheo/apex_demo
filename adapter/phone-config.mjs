import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {z} from 'zod';
import {openaiCredentials} from './openai-config.mjs';

const schema = z.object({
  origin: z.string().url().refine(v => {const u = new URL(v); return u.protocol === 'https:' && u.pathname === '/' && !u.search && !u.hash && !u.username && !u.password;}),
  accountSid: z.string().regex(/^AC[a-fA-F0-9]{32}$/), authToken: z.string().min(1),
  number: z.string().regex(/^\+[1-9]\d{7,14}$/), caller: z.string().regex(/^\+[1-9]\d{7,14}$/),
  supportCode: z.string().regex(/^\d{4}$/),
  apiKey: z.string().min(1), model: z.string().min(1), voice: z.enum(['cedar', 'marin', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse']),
});
export function phoneConfig(env = process.env) {
  let source = {};
  if (env.APEX_OPENAI_ENV_FILE) source = parseEnv(readFileSync(env.APEX_OPENAI_ENV_FILE, 'utf8'));
  const result = schema.safeParse({origin: env.APEX_MCP_ORIGIN, accountSid: env.TWILIO_ACCOUNT_SID || source.TWILIO_ACCOUNT_SID,
    authToken: env.TWILIO_AUTH_TOKEN || source.TWILIO_AUTH_TOKEN, number: env.TWILIO_PHONE_NUMBER || source.TWILIO_PHONE_NUMBER,
    caller: env.PHONE_ALLOWED_CALLER || source.PHONE_ALLOWED_CALLER,
    supportCode: env.APEX_SUPPORT_CODE || source.DRIVER_SOFT_PIN, apiKey: openaiCredentials(env).apiKey,
    model: env.APEX_REALTIME_MODEL || 'gpt-realtime-2.1', voice: env.APEX_REALTIME_VOICE || 'cedar'});
  if (!result.success) throw Error('Missing or invalid Apex phone configuration. Configure credentials locally; do not paste them.');
  return result.data;
}
