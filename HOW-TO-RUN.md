# How the ENGG982 Hub works

Two artifacts: the **Final Report** (a row per chapter and sub-section, from V1.4 headings) and the **Final Presentation** (a row per slide, empty until the leader adds the first). Each has its own tab.

**Teammate:** open the site and pick your name first. On a chapter, sub-section or slide row press the flag (flaw), pencil (change content) or plus (add content), say what and where in one line. Leave it open, or press **I'll plan it** and write a one-line plan. When the leader approves the plan, do the work in the Word file, then press **Submit work**. Sign off a whole chapter with its four check buttons (you cannot check your own writing).

**Leader (Long):** pick your name and enter your PIN. The **Approvals** tab lists everything waiting for you: **Approve plan**, then later **Approve work** (or **Send back** with a note). Only you see Approvals and Settings. Open a row and press **Edit** to rename, reorder or remove a chapter, **+ Sub-section** to add one, or the **+** square to add a chapter or slide.

**The tutor's workflow (Workshop 10), built in:** plan first (outline, limit, writer, and a dashed square for parts that need other parts first), then write, then four checks in order: Review, Edit, Proofread, Publish. The four dots on each square show which checks are approved. Press **Our workflow** for the roles and the feedback tips. Set who is Editor, Proofreader and Publisher in Settings.

Colours: red = issue, blue = plan to approve, amber = in progress, purple = work to approve, green = done. A chapter square turns green when all four checks are approved and nothing is open. The percentage is the share of approved checks across all chapters.

**First time, Long only:** tap your name, choose a PIN (4 to 8 digits). Do this before you send the link to anyone. Forgot it? In Settings you can change it while signed in. If locked out, ask Claude to reset it.

The PIN is a soft lock for a team of six. It stops accidents, not a determined hacker.

---

# How to run it

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
4. In this folder, copy the file `.env.example` and name the copy `.env`. Open `.env` and paste the two values in:
   `SUPABASE_URL=` and `SUPABASE_ANON_KEY=`
5. In Command Prompt, in this folder, run: `node tools/make-config.js`
6. Push to GitHub. The top bar now says **Cloud database, saved**.

Never paste the `service_role` key or your database password anywhere in this project.

## Test that the database is connected

1. Open the site and look at the pill in the top bar. **Cloud database, saved** is good. **Saved in this browser only** means it is not connected.
2. Sign in as Long, click **Settings** (bottom right), open **Database**, click **Test database**. It writes a test row, reads it back and deletes it, then says PASS or FAIL and why.
3. Real-world check: add an action on your computer, then open the site on your phone. After a reload, the action is there.
4. In Supabase, open Table Editor > `hub`. You should see rows.

## Something wrong?

- "Node.js is not installed": do step 1 of option A, then double-click launch.bat again.
- "Port 3982 is already in use": the hub is already running. Open http://localhost:3982
- Page is empty on GitHub Pages: check that Pages is set to the `main` branch and the root folder.

More detail is in HUB-README.md.
