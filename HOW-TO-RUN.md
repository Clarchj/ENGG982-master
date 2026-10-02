# How to run the ENGG982 Hub

Pick one. Option A is the easiest.

## A. Run it on your computer (saves to a file on your computer)

1. Install Node.js once. Open Command Prompt and run:
   `winget install OpenJS.NodeJS.LTS`
   (Or download it from https://nodejs.org and click Next through the installer.)
2. Open this folder.
3. Double-click **launch.bat**.
4. Your browser opens the hub. Leave the black window open while you work.
5. To stop, close the black window.

Your data is saved in `data/hub.json`. Copies are kept in `backups/`.

## B. Share it with teammates on the same Wi-Fi

1. Double-click **share-on-network.bat**.
2. Type a password if you want one, then press Enter.
3. Send teammates the "Same network" address shown in the black window.

## C. Put it online with GitHub Pages (no Node needed)

1. Push this folder to your GitHub repository.
2. On GitHub: Settings > Pages.
3. Source: **Deploy from a branch**. Branch: **main**. Folder: **/ (root)**. Save.
4. After about a minute the site is at `https://<your-username>.github.io/<repo-name>/`.

This version saves in the browser you use. Press **Backup** in the top bar now and then.

## D. Add the shared Supabase database (optional)

1. Create a free project at https://supabase.com.
2. In Supabase, open SQL Editor, paste everything from `supabase.sql`, click Run.
3. In Supabase, open Project Settings > API. Copy the **Project URL** and the **anon public** key.
4. Open `.env` in this folder and paste them in:
   `SUPABASE_URL=` and `SUPABASE_ANON_KEY=`
5. In Command Prompt, in this folder, run: `node tools/make-config.js`
6. Push to GitHub. The top bar now says **Cloud database, saved**.

Never paste the `service_role` key or your database password anywhere in this project.

## Something wrong?

- "Node.js is not installed": do step 1 of option A, then double-click launch.bat again.
- "Port 3982 is already in use": the hub is already running. Open http://localhost:3982
- Page is empty on GitHub Pages: check that Pages is set to the `main` branch and the root folder.

More detail is in HUB-README.md.
