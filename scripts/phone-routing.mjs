import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import twilio from 'twilio';
import {phoneConfig} from '../adapter/phone-config.mjs';

try {process.loadEnvFile('.env');} catch (e) {if (e.code !== 'ENOENT') throw e;}
const config = phoneConfig();
const client = twilio(config.accountSid, config.authToken);
const expected = config.origin + '/twilio/voice';
const backupPath = '.local/twilio-routing-backup.json';
mkdirSync('.local', {recursive: true});
const numbers = await client.incomingPhoneNumbers.list({phoneNumber: config.number, limit: 2});
if (numbers.length !== 1) throw Error('Expected exactly one owned demo number.');
let number = numbers[0];
if (process.argv.includes('--apply')) {
  if (!existsSync(backupPath)) {
    if (number.voiceUrl === expected) throw Error('Number already points to Apex, but no previous-route backup exists.');
    writeFileSync(backupPath, JSON.stringify({number: number.phoneNumber, sid: number.sid, voiceUrl: number.voiceUrl,
      voiceMethod: number.voiceMethod, saved_at: new Date().toISOString()}, null, 2), {flag: 'wx', mode: 0o600});
  }
  const backup = JSON.parse(readFileSync(backupPath, 'utf8'));
  if (backup.sid !== number.sid || backup.number !== config.number) throw Error('Routing backup is for another number.');
  number = await client.incomingPhoneNumbers(number.sid).update({voiceUrl: expected, voiceMethod: 'POST'});
} else if (process.argv.includes('--restore')) {
  const backup = JSON.parse(readFileSync(backupPath, 'utf8'));
  if (backup.sid !== number.sid || backup.number !== config.number) throw Error('Routing backup is for another number.');
  if (number.voiceUrl !== expected && number.voiceUrl !== backup.voiceUrl) throw Error('The route changed elsewhere; review before restoring.');
  number = await client.incomingPhoneNumbers(number.sid).update({voiceUrl: backup.voiceUrl, voiceMethod: backup.voiceMethod});
}
number = await client.incomingPhoneNumbers(number.sid).fetch();
const routed = number.voiceUrl === expected && number.voiceMethod === 'POST';
writeFileSync('.local/phone-runtime.json', JSON.stringify({routed, number: config.number, checked_at: new Date().toISOString()}, null, 2), {mode: 0o600});
console.log(JSON.stringify({number: config.number, apex_routed: routed, backup_saved: existsSync(backupPath),
  mode: process.argv.includes('--apply') ? 'applied_and_read_back' : process.argv.includes('--restore') ? 'restored_and_read_back' : 'read_only_check'}));
