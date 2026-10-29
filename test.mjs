import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { tempoTiming, compareTempos, camelotNeighbors } from './index.mjs';

test('calculates beat and bar timing', () => {
  assert.equal(tempoTiming(120).beatMilliseconds, 500);
  assert.equal(tempoTiming(120).barMilliseconds, 2000);
});
test('finds half-time equivalence and wraps Camelot wheel', () => {
  assert.equal(compareTempos(90, 180).closestInterpretation.interpretation, 'half-time');
  assert.deepEqual(camelotNeighbors('1A').commonHarmonicOptions, ['1A', '12A', '2A', '1B']);
});
test('MCP client can call timing tool', async () => {
  const client = new Client({ name: 'findbpm-test', version: '0.1.0' });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [new URL('./index.mjs', import.meta.url).pathname] }));
  try {
    assert.equal((await client.listTools()).tools.length, 4);
    const result = await client.callTool({ name: 'tempo_timing', arguments: { bpm: 120 } });
    assert.equal(JSON.parse(result.content[0].text).beatMilliseconds, 500);
  } finally { await client.close(); }
});
