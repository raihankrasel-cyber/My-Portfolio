# Portfolio contact form setup

The bilingual contact form saves submissions in the private Supabase table `contact_submissions`. For email alerts, a Google Apps Script web app sends the alert through your Google account.

## Email alert setup

1. Sign in to the Google account that owns `raihan.k.rasel@gmail.com` and create an Apps Script project.
2. Copy `supabase/apps-script/contact-alert.gs` into `Code.gs` and save.
3. In **Project Settings > Script properties**, set `CONTACT_FORM_SHARED_SECRET` to a long random value. Keep it private.
4. Deploy as a **Web app**, execute as your account, and allow access to anyone. The endpoint checks the shared secret.
5. In Supabase **Edge Functions > Secrets**, add `CONTACT_ALERT_WEBHOOK_URL` with the deployment URL and `CONTACT_ALERT_SHARED_SECRET` with the same random value.

Never put the secret in GitHub or browser code. The form still saves leads in Supabase when alerts are not configured.

## Supabase deployment

Apply `supabase/migrations/20261109120000_contact_submissions.sql`, then deploy `supabase/functions/contact-submit/index.ts` with JWT verification disabled. The function checks the portfolio origin and publishable key itself.

Review submissions in Supabase's Table Editor while signed into the project owner account; public visitors cannot read the table.
