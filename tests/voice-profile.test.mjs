import test from 'node:test';
import assert from 'node:assert/strict';
import {apexVoiceOpening, apexVoiceInstructions} from '../adapter/voice-profile.mjs';

test('Apex opening discloses AI and warns before collecting the problem', () => {
  assert.match(apexVoiceOpening, /AI assistant/);
  for (const secret of ['full card number', 'card security code', 'PIN', 'password']) {
    assert.ok(apexVoiceOpening.indexOf(secret) < apexVoiceOpening.indexOf('How can I help'));
  }
});

test('Apex profile requires confirmed current draft and saved-case verification', () => {
  for (const requirement of ['explicit customer confirmation', 'revision and nonce',
    'If the caller hangs up before confirmation, do not submit',
    'separately verify the saved case', 'never blindly create another case']) {
    assert.ok(apexVoiceInstructions.includes(requirement), requirement);
  }
});

test('Apex profile does not inherit M. Price recovery authority or identity claims', () => {
  assert.match(apexVoiceInstructions, /routing check, not authenticated bank identity/);
  assert.match(apexVoiceInstructions, /cannot approve evidence requests/);
  assert.match(apexVoiceInstructions, /do not claim the audio was never transmitted or erased/);
  assert.doesNotMatch(apexVoiceInstructions, /Daryl|Route 17|1776|recover_app_session|verify_soft_pin/);
});
