# Copilot instructions

## Browser testing the local sites

- Open local sites directly in VS Code's integrated browser (`openBrowserPage`); no tunnel or port forwarding is needed. Local hostnames are served by the `nginx` container on 443:
  - Admin: `https://admin.test.democracysausage.org/`
  - Public: `https://public.test.democracysausage.org/`
- To log in to the local admin site, do not mint sessions by hand or use Google login. Run the existing script from the attached Dev Container (`cd django && python create_local_admin_session.py`) and install the returned cookie with `runPlaywrightCode` + CDP `Network.setCookie`, exactly as described in [DEV_WORKFLOWS.md](../DEV_WORKFLOWS.md) ("Local admin browser session without Google login").
- The script output is a sensitive session token: never commit, save, or echo it into files or chat summaries.
