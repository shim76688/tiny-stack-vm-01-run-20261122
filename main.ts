const fs = require('node:fs');
const A = process.env.MAKEFUN_INPUT_DIR || '/input', B = process.env.MAKEFUN_OUTPUT_DIR || '/output';
function run(p, inp) {
  const s = new Int32Array(256), c = new Int32Array(64), m = new Int32Array(256);
  const o = Buffer.alloc(65536), d = new Uint8Array(12);
  let sp = 0, cp = 0, pc = 0, st = 0, ol = 0, ip = 0;
  const n = p.length, q = () => o.subarray(0, ol);
  for (;;) {
    if (st >= 1e6) return [10, q()];
    if (pc < 0 || pc >= n) return [9, q()];
    const op = p[pc];
    if (!(op <= 7 || (op >= 0x10 && op <= 0x22 && op !== 0x1f) || (op >= 0x30 && op <= 0x34) ||
          op === 0x40 || op === 0x41 || (op >= 0x50 && op <= 0x53))) return [5, q()];
    const im = op === 1 ? 1 : op === 2 ? 4 : op >= 0x30 && op <= 0x33 ? 2 : 0;
    if (pc + im >= n) return [9, q()];
    let nd = 0, gv = 0;
    if (op === 5) { nd = 2; gv = 2; }
    else if (op === 6) { nd = 2; gv = 3; }
    else if (op === 7) { nd = 3; gv = 3; }
    else if (op === 3 || op === 0x31 || op === 0x32 || op === 0x50 || op === 0x51 || op === 0x53) nd = 1;
    else if (op === 4) { nd = 1; gv = 2; }
    else if (op === 0x17 || op === 0x1b || op === 0x40) { nd = 1; gv = 1; }
    else if (op === 0x41) nd = 2;
    else if (op === 1 || op === 2 || op === 0x52) gv = 1;
    else if (op >= 0x10 && op <= 0x22) { nd = 2; gv = 1; }
    if (sp < nd) return [2, q()];
    if (sp - nd + gv > 256) return [3, q()];
    st++;
    let f = 0;
    if (op === 0x30 || op === 0x31 || op === 0x32) { f = p[pc + 1] | (p[pc + 2] << 8); if (f > 32767) f -= 65536; }
    switch (op) {
      case 0x00: return [0, q()];
      case 0x01: { const b = p[pc + 1]; s[sp++] = b > 127 ? b - 256 : b; pc += 2; break; }
      case 0x02: s[sp++] = p[pc + 1] | (p[pc + 2] << 8) | (p[pc + 3] << 16) | (p[pc + 4] << 24); pc += 5; break;
      case 0x03: sp--; pc++; break;
      case 0x04: s[sp] = s[sp - 1]; sp++; pc++; break;
      case 0x05: { const t = s[sp - 1]; s[sp - 1] = s[sp - 2]; s[sp - 2] = t; pc++; break; }
      case 0x06: s[sp] = s[sp - 2]; sp++; pc++; break;
      case 0x07: { const a = s[sp - 3], b = s[sp - 2], e = s[sp - 1]; s[sp - 3] = b; s[sp - 2] = e; s[sp - 1] = a; pc++; break; }
      case 0x10: s[sp - 2] = s[sp - 2] + s[sp - 1]; sp--; pc++; break;
      case 0x11: s[sp - 2] = s[sp - 2] - s[sp - 1]; sp--; pc++; break;
      case 0x12: s[sp - 2] = Math.imul(s[sp - 2], s[sp - 1]); sp--; pc++; break;
      case 0x13: { const a = s[sp - 2], b = s[sp - 1]; if (!b) return [4, q()]; s[sp - 2] = (a / b) | 0; sp--; pc++; break; }
      case 0x14: { const a = s[sp - 2], b = s[sp - 1]; if (!b) return [4, q()]; s[sp - 2] = a % b; sp--; pc++; break; }
      case 0x15: { const a = s[sp - 2] >>> 0, b = s[sp - 1] >>> 0; if (!b) return [4, q()]; s[sp - 2] = (a / b) | 0; sp--; pc++; break; }
      case 0x16: { const a = s[sp - 2] >>> 0, b = s[sp - 1] >>> 0; if (!b) return [4, q()]; s[sp - 2] = (a % b) | 0; sp--; pc++; break; }
      case 0x17: s[sp - 1] = -s[sp - 1]; pc++; break;
      case 0x18: s[sp - 2] = s[sp - 2] & s[sp - 1]; sp--; pc++; break;
      case 0x19: s[sp - 2] = s[sp - 2] | s[sp - 1]; sp--; pc++; break;
      case 0x1a: s[sp - 2] = s[sp - 2] ^ s[sp - 1]; sp--; pc++; break;
      case 0x1b: s[sp - 1] = ~s[sp - 1]; pc++; break;
      case 0x1c: s[sp - 2] = s[sp - 2] << (s[sp - 1] & 31); sp--; pc++; break;
      case 0x1d: s[sp - 2] = s[sp - 2] >> (s[sp - 1] & 31); sp--; pc++; break;
      case 0x1e: s[sp - 2] = s[sp - 2] >>> (s[sp - 1] & 31); sp--; pc++; break;
      case 0x20: s[sp - 2] = s[sp - 2] === s[sp - 1] ? 1 : 0; sp--; pc++; break;
      case 0x21: s[sp - 2] = s[sp - 2] < s[sp - 1] ? 1 : 0; sp--; pc++; break;
      case 0x22: s[sp - 2] = (s[sp - 2] >>> 0) < (s[sp - 1] >>> 0) ? 1 : 0; sp--; pc++; break;
      case 0x30: pc = pc + 3 + f; break;
      case 0x31: { const v = s[--sp]; pc = v === 0 ? pc + 3 + f : pc + 3; break; }
      case 0x32: { const v = s[--sp]; pc = v !== 0 ? pc + 3 + f : pc + 3; break; }
      case 0x33: if (cp >= 64) return [7, q()]; c[cp++] = pc + 3; pc = p[pc + 1] | (p[pc + 2] << 8); break;
      case 0x34: if (!cp) return [8, q()]; pc = c[--cp]; break;
      case 0x40: { const a = s[sp - 1]; if (a < 0 || a > 255) return [6, q()]; s[sp - 1] = m[a]; pc++; break; }
      case 0x41: { const a = s[sp - 1], v = s[sp - 2]; if (a < 0 || a > 255) return [6, q()]; m[a] = v; sp -= 2; pc++; break; }
      case 0x50: {
        let v = s[--sp], neg = 0;
        if (v < 0) { neg = 1; v = -v; }
        let k = 0;
        if (v === 0) d[k++] = 48;
        else { let t = v; while (t > 0) { d[k++] = 48 + (t % 10); t = (t / 10) | 0; } }
        if (ol + k + neg > 65536) return [11, q()];
        if (neg) o[ol++] = 45;
        while (k > 0) o[ol++] = d[--k];
        pc++; break;
      }
      case 0x51: { const v = s[--sp]; if (ol >= 65536) return [11, q()]; o[ol++] = v & 255; pc++; break; }
      case 0x52: s[sp++] = ip < inp.length ? inp[ip++] : -1; pc++; break;
      case 0x53: return [s[--sp] & 255, q()];
      default: return [5, q()];
    }
  }
}

for (let i = 1; i <= 40; i++) {
  const id = 'i' + String(i).padStart(3, '0'), a = A + '/' + id + '/', b = B + '/' + id + '/';
  let p, x;
  try { p = fs.readFileSync(a + 'program.bin'); } catch { p = Buffer.alloc(0); }
  try { x = fs.readFileSync(a + 'input.bin'); } catch { x = Buffer.alloc(0); }
  const r = run(p, x);
  fs.mkdirSync(b, { recursive: true });
  fs.writeFileSync(b + 'stdout.bin', r[1]);
  fs.writeFileSync(b + 'exit.txt', r[0] + '\n');
}
