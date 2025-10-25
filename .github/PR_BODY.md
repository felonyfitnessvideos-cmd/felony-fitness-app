Summary:
- Adds diet_preference to user_profiles (migration + frontend), includes diet preference in the nutrition Edge Function prompt so recommendations can respect Vegetarian/Vegan preferences.
- Makes mesocycle cards fully clickable (card -> detail) and removes redundant links.
- Fixes mobile numeric input behavior in Nutrition log (text+inputMode sanitization) to avoid auto-inserted values.
- Wide JSDoc/docstring and defensive/accessibility sweep across ~25 files (JSDoc, small guards, aria improvements, error boundary tweaks, lazy import cache, etc.).

Testing:
- Ran targeted unit tests: test/generateCycleSessions.test.js and test/parseProRoutines.test.js — both passed locally.

Notes & Action items for reviewer:
- Docstring coverage currently reports ~59.26% (below required 80%). I left a JSDoc sweep in progress; recommend reviewer confirm target areas and I will continue batched updates until >=80%.
- Migration file added: supabase/migrations/20251025130000_add_diet_preference_to_user_profiles.sql. Please run migration in Supabase before using the new profile field.
- Supabase Edge Function generate-nutrition-recommendations updated and deployed; fixed Deno import extensions.

@coderabbit please review the migration, the Edge Function changes, and the docstring/accessibility additions. If you prefer, I can split this PR into smaller, focused PRs (migration + function, UI fixes, docs) — let me know your preference.
