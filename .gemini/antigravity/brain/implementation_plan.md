# Implementation Plan

## Goal
- Hash user passwords on signup and verify with hashing on login.
- Update security guidance in agents.md to align with OWASP practices.

## Steps
1. Add password hashing and verification helpers in backend auth flow.
2. Update backend tests to use hashed passwords.
3. Extend agents.md with OWASP-aligned security checklist items.
4. Run backend tests and verify frontend dev server starts cleanly.

## Risks
- Existing plaintext passwords will need to be upgraded on first login.
