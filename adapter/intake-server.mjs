import express from 'express';
import {openaiCredentials} from './openai-config.mjs';
import {respondToIntake} from './intake-model.mjs';

try { process.loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const credentials = openaiCredentials();
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (req.headers.host !== '127.0.0.1:8788' || req.headers.origin) return res.status(403).json({error: 'origin_denied'});
  next();
});
app.use(express.json({limit: '32kb'}));
app.post('/respond', async (req, res) => {
  try { res.json(await respondToIntake(req.body, {credentials, model: process.env.APEX_INTAKE_MODEL || 'gpt-5.4-mini'})); }
  catch { res.status(502).json({error: 'intake_model_unavailable'}); }
});
app.use((_error, _req, res, _next) => res.status(400).json({error: 'invalid_request'}));
app.listen(8788, '127.0.0.1', () => console.log('Private Apex Responses intake worker on 127.0.0.1:8788; never tunnel this port.'));
