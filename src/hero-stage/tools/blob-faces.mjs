import { blobatar } from 'blobatar';
import { happy, sad, thinking } from 'blobatar/expression';
import fs from 'fs';
const P = { Noor: ['Noor', 155], Sara: ['Sara K', 290], Omar: ['omar@leadish', 65], Maha: ['Maha R', 235] };
const E = { idle: undefined, happy, sad, thinking };
const out = {};
for (const n in P) { out[n] = {}; for (const f in E) out[n][f] = blobatar(P[n][0], { hue: P[n][1], tone: 0.45, expression: E[f] }).replace('<svg ', '<svg aria-hidden="true" '); }
fs.writeFileSync(process.argv[2], '// Player faces from Blobatar (MIT, github.com/Alain00/blobatar), pre-rendered.\n// Locked hue per player; the expression follows what just happened on their call.\nexport type Face = "idle" | "happy" | "sad" | "thinking"\nexport const BLOBS: Record<string, Record<Face, string>> = ' + JSON.stringify(out, null, 0) + '\n');
