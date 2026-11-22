# Shared account settings

Settings now shows `Account: <username>` on one line. The same Firebase user ID owns the profile, scores and saves on the app and website.

- Username updates patch only `profiles/{uid}.username` and `updatedAt`, then update the Auth display name. Existing profile fields, timestamps, counters, games and saves are retained. Usernames follow the existing 3–18 letter/number/underscore format; they are not unique handles.
- Email changes call `verifyBeforeUpdateEmail` after password/Google reauthentication. The old email remains active until the verification link is completed. Refresh account reloads the authoritative Auth user and profile. Emails are not added to Firestore profiles.
- Password changes require identity confirmation, 8 or more characters and matching confirmation. Google-only website users can add a password to their existing UID.
- Google linking first confirms the current account, then uses a second click to open Google's popup without losing browser user activation. It uses `linkWithPopup`, never sign-in, account merging or account deletion. A credential owned by another UID is rejected.
- The Mac wrapper opens Google connection on the public website in the system browser. The UID travels in a fragment, never as an authentication token. The website refuses linking until the signed-in UID matches the app's requested UID. The user then refreshes account details in the Mac app. Google sign-in directly into the Mac wrapper is still separate, unfinished work.
- Sign out retains existing account data. Passwords and Google credentials are never written to local storage by this UI.

On 2026-11-22, Google was enabled through Firebase's Auth provisioning API for the existing `rod-space-rooms-2026` web app. A subsequent admin read confirmed: Google enabled, OAuth client present, password configuration unchanged, anonymous configuration unchanged, one-account-per-email enabled. No user accounts, passwords, scores or saves were changed during setup/testing.

Tests: `node --experimental-vm-modules tests/account-settings.cjs`, `tests/home-settings.cjs` and `tests/rod-space-account-ui.cjs`. These execute the real UI with remote SDK operations replaced by test doubles; they do not prove a real email delivery or OAuth consent exchange. Live credential changes must be tested by the account holder, not by silently modifying their account.
