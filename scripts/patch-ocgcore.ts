import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function patchOcgcore(): boolean {
  const targetFile = path.join(rootDir, 'node_modules/ocgcore-wasm/dist/index.js');
  if (!fs.existsSync(targetFile)) {
    console.warn('[patch-ocgcore] Target file not found:', targetFile);
    return false;
  }

  let code = fs.readFileSync(targetFile, 'utf8');
  let modified = false;

  // 1. Fix MSG_SHUFFLE_SET_CARD (case 36):
  // Upstream ocgcore-wasm bugs:
  // - count is serialized as e.u8(), not e.u32()
  // - ocgcore writes all `from` records (count * 10 bytes) followed by all `to` records (count * 10 bytes) in two separate loops, NOT interleaved!
  const originalCase36 = 'case 36:return{type:t,location:e.u8(),cards:Array.from({length:e.u32()},()=>({from:p(e),to:p(e)}))};';
  const intermediateCase36 = 'case 36:return{type:t,location:e.u8(),cards:Array.from({length:e.u8()},()=>({from:p(e),to:p(e)}))};';
  const desiredCase36 = 'case 36:{let l=e.u8(),n=e.u8(),f=Array.from({length:n},()=>p(e)),o=Array.from({length:n},()=>p(e));return{type:t,location:l,cards:f.map((k,i)=>({from:k,to:o[i]}))}};';

  if (!code.includes(desiredCase36)) {
    if (code.includes(intermediateCase36)) {
      code = code.replace(intermediateCase36, desiredCase36);
      modified = true;
    } else if (code.includes(originalCase36)) {
      code = code.replace(originalCase36, desiredCase36);
      modified = true;
    } else {
      console.warn('[patch-ocgcore] Could not find exact original or intermediate case 36 in index.js');
    }
  }

  // 2. Fix MSG_SELECT_SUM (case 23):
  // Upstream ocgcore-wasm bug:
  // - selects_must is serialized BEFORE selects by ocgcore
  // - each candidate card has position: e.u32() between sequence and amount (18 bytes per card, not 14)
  const originalCase23 = 'case 23:return{type:t,player:e.u8(),select_max:e.u8(),amount:e.u32(),min:e.u32(),max:e.u32(),selects:Array.from({length:e.u32()},()=>({code:e.u32(),controller:e.u8(),location:e.u8(),sequence:e.u32(),amount:e.u32()})),selects_must:Array.from({length:e.u32()},()=>({code:e.u32(),controller:e.u8(),location:e.u8(),sequence:e.u32(),amount:e.u32()}))};';
  const desiredCase23 = 'case 23:return{type:t,player:e.u8(),select_max:e.u8(),amount:e.u32(),min:e.u32(),max:e.u32(),selects_must:Array.from({length:e.u32()},()=>({code:e.u32(),controller:e.u8(),location:e.u8(),sequence:e.u32(),position:e.u32(),amount:e.u32()})),selects:Array.from({length:e.u32()},()=>({code:e.u32(),controller:e.u8(),location:e.u8(),sequence:e.u32(),position:e.u32(),amount:e.u32()}))};';

  if (!code.includes(desiredCase23)) {
    if (code.includes(originalCase23)) {
      code = code.replace(originalCase23, desiredCase23);
      modified = true;
    } else {
      console.warn('[patch-ocgcore] Could not find exact original case 23 in index.js');
    }
  }

  // 3. Wrap te(T) in duelGetMessage with try/catch to protect against unexpected deserializer crashes
  const unhandledLoop = 'for(;a.avail>0;){let i=a.i32(),T=a.sub(i),R=te(T);if(!R){T.reset(),console.warn(`failed to parse a message: ${T.u8()}`);continue}E.push(R)}';
  const safeLoop = 'for(;a.avail>0;){let i=a.i32(),T=a.sub(i);try{let R=te(T);if(!R){T.reset(),console.warn(`failed to parse a message: ${T.u8()}`);continue}E.push(R)}catch(err){console.warn(`[ocgcore-wasm] error parsing message:`,err);}}';

  if (!code.includes(safeLoop)) {
    if (code.includes(unhandledLoop)) {
      code = code.replace(unhandledLoop, safeLoop);
      modified = true;
    } else {
      console.warn('[patch-ocgcore] Could not find unhandled duelGetMessage loop in index.js');
    }
  }

  // 4. Fix SORT_CARD (case 15) response serialization:
  // Upstream ocgcore-wasm bug:
  // - In ce(), case 15 serializes `order` with a leading length byte: `t.i8(e.order.length)`.
  // - However, `field::sort_card` in ygopro-core C++ reads `returns.bvalue[i]` directly
  //   without a length byte header. The extra length byte causes `returns.bvalue[0] == m`,
  //   which triggers `v >= m` bounds check failure and emits `MSG_RETRY` every time the player confirms!
  const originalCase15 = 'case 15:if(!e.order){t.i8(-1);break}t.i8(e.order.length);for(let r of e.order)t.i8(r);break;';
  const desiredCase15 = 'case 15:if(!e.order){t.i8(-1);break}for(let r of e.order)t.i8(r);break;';

  if (!code.includes(desiredCase15)) {
    if (code.includes(originalCase15)) {
      code = code.replace(originalCase15, desiredCase15);
      modified = true;
    } else {
      console.warn('[patch-ocgcore] Could not find exact original case 15 in index.js');
    }
  }

  if (modified) {
    fs.writeFileSync(targetFile, code, 'utf8');
    console.log('[patch-ocgcore] Successfully patched ocgcore-wasm.');
    return true;
  } else {
    console.log('[patch-ocgcore] ocgcore-wasm is already up-to-date.');
    return false;
  }
}

// Auto-run when executed directly via CLI
if (process.argv[1] === __filename || process.argv[1]?.endsWith('patch-ocgcore.ts')) {
  patchOcgcore();
}
