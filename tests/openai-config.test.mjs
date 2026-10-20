import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {openaiCredentials} from '../adapter/openai-config.mjs';

test('only server-side OpenAI credential fields are returned', () => {
  assert.deepEqual(openaiCredentials({OPENAI_API_KEY: 'synthetic-test-key', OPENAI_PROJECT_ID: 'synthetic-project',
    TWILIO_AUTH_TOKEN: 'not-imported', OPENAI_REALTIME_MODEL: 'not-inherited'}), {
    apiKey: 'synthetic-test-key', project: 'synthetic-project', organization: undefined,
  });
});

test('external env reuse imports credentials only and honors explicit overrides', t => {
  const dir = mkdtempSync(join(tmpdir(), 'apex-config-'));
  t.after(() => rmSync(dir, {recursive: true, force: true}));
  const path = join(dir, 'prior-demo.env');
  writeFileSync(path, 'OPENAI_API_KEY="synthetic-file-key"\nOPENAI_ORG_ID=synthetic-org\nTWILIO_AUTH_TOKEN=not-imported\nOPENAI_REALTIME_VOICE=not-inherited\n');
  const result = openaiCredentials({APEX_OPENAI_ENV_FILE: path});
  assert.deepEqual(result, {apiKey: 'synthetic-file-key', organization: 'synthetic-org', project: undefined});
  assert.equal(openaiCredentials({APEX_OPENAI_ENV_FILE: path, OPENAI_API_KEY: 'synthetic-override'}).apiKey, 'synthetic-override');
});

test('missing/unreadable credential configuration fails without leaking values or paths', () => {
  assert.throws(() => openaiCredentials({}), /Configure an OpenAI API key locally/);
  assert.throws(() => openaiCredentials({APEX_OPENAI_ENV_FILE: '/nonexistent/private/path'}),
    error => error.message === 'Cannot read configured OpenAI credential source.');
});
