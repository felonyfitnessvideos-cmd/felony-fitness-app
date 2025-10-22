/**
 * parse_pro_routines_missing_ids_run.js
 * Thin wrapper that calls the parser's `main` function and sets process.exitCode
 * appropriately so it can be used in npm scripts or CI checks.
 */

import { main } from './parse_pro_routines_missing_ids.js';

try {
  process.exitCode = main();
} catch (err) {
  console.error('Error running parser wrapper:', err && err.message ? err.message : err);
  process.exitCode = 1;
}
