import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

export const officialLinks = Object.freeze({ analyzer: 'https://findbpm.net/', contact: 'https://findbpm.net/contact' });
const round = value => Number(value.toFixed(3));

export function tempoTiming(bpm, beatsPerBar = 4) {
  if (!Number.isFinite(bpm) || bpm <= 0 || !Number.isInteger(beatsPerBar) || beatsPerBar < 1) throw new Error('Use a positive BPM and a valid beats-per-bar count.');
  const beatMs = 60000 / bpm;
  return { bpm, beatsPerBar, beatMilliseconds: round(beatMs), eighthNoteMilliseconds: round(beatMs / 2), sixteenthNoteMilliseconds: round(beatMs / 4), barMilliseconds: round(beatMs * beatsPerBar), halfTimeBpm: round(bpm / 2), doubleTimeBpm: round(bpm * 2), note: 'A tempo estimate may represent half or double the pulse you hear; verify by tapping with the audio.' };
}

export function compareTempos(firstBpm, secondBpm) {
  if (![firstBpm, secondBpm].every(x => Number.isFinite(x) && x > 0)) throw new Error('Both BPM values must be positive.');
  const candidates = [secondBpm / 2, secondBpm, secondBpm * 2].map((value, index) => ({ interpretation: ['half-time', 'as reported', 'double-time'][index], bpm: round(value), differencePercent: round(Math.abs(value - firstBpm) / firstBpm * 100) }));
  candidates.sort((a, b) => a.differencePercent - b.differencePercent);
  return { firstBpm, secondBpm, closestInterpretation: candidates[0], candidates, note: 'This compares pulse rates only. Listen to phrasing and check the key before planning a transition.' };
}

export function camelotNeighbors(code) {
  const match = /^(1[0-2]|[1-9])([AB])$/i.exec(code.trim());
  if (!match) throw new Error('Camelot code must be 1A–12A or 1B–12B.');
  const number = Number(match[1]);
  const letter = match[2].toUpperCase();
  return { code: `${number}${letter}`, commonHarmonicOptions: [`${number}${letter}`, `${number === 1 ? 12 : number - 1}${letter}`, `${number === 12 ? 1 : number + 1}${letter}`, `${number}${letter === 'A' ? 'B' : 'A'}`], note: 'These are common starting points, not a guarantee of a good mix. Confirm by ear.' };
}

const reply = value => ({ content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] });
export function createServer() {
  const server = new McpServer({ name: 'findbpm-tempo-planning', version: '0.1.0' });
  server.registerTool('tempo_timing', { title: 'Convert BPM to timing', description: 'Convert a known BPM to beat, subdivision, and bar lengths. Audio is not accessed.', inputSchema: z.object({ bpm: z.number().positive().max(500), beatsPerBar: z.number().int().min(1).max(32).default(4) }) }, async ({ bpm, beatsPerBar }) => reply(tempoTiming(bpm, beatsPerBar)));
  server.registerTool('compare_tempos', { title: 'Compare two tempos', description: 'Compare reported BPMs including half-time and double-time interpretations.', inputSchema: z.object({ firstBpm: z.number().positive().max(500), secondBpm: z.number().positive().max(500) }) }, async ({ firstBpm, secondBpm }) => reply(compareTempos(firstBpm, secondBpm)));
  server.registerTool('camelot_neighbors', { title: 'Find nearby Camelot codes', description: 'List common neighboring Camelot wheel codes for a known key estimate.', inputSchema: z.object({ code: z.string().max(3) }) }, async ({ code }) => { try { return reply(camelotNeighbors(code)); } catch (error) { return { ...reply({ error: error.message }), isError: true }; } });
  server.registerTool('get_official_links', { title: 'Official FindBPM links', description: 'Return the official browser-based audio analyzer.', inputSchema: z.object({}) }, async () => reply(officialLinks));
  return server;
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) void serveStdio(createServer);
