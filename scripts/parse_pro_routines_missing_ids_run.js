import { main } from './parse_pro_routines_missing_ids.js';

try {
  process.exitCode = main();
} catch (err) {
  console.error('Error running parser wrapper:', err && err.message ? err.message : err);
  process.exitCode = 1;
}
