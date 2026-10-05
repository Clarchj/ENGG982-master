# ENGG982 Hub

A one-page action board for the Team 3 final report and final presentation. Plain HTML, CSS and JavaScript. No build step.

## What it does

- Opens with **Who are you?** every time. Nothing shows until you pick your name. The leader also enters a PIN.
- Three tabs: **Report**, **Presentation**, **Timeline**. The leader also gets **Approvals** (nobody else sees it) and **Settings**.
- The report's chapters and sub-sections come from V1.4 (headings only; the text stays in the Word file). The leader can add, rename, reorder and remove chapters, sub-sections and slides.
- Every change is an action that travels like a GitHub issue: **issue (red), plan to approve (blue), in progress (amber), work to approve (purple), done (green)**. Two gates, both the leader's: approve the plan, then approve the work.
- Anyone can flag a flaw, ask to change content, or ask to add content on any chapter, sub-section or slide. Anyone can sign off a whole chapter on the four checks (Review, Edit, Proofread, Publish). A writer cannot check their own chapter.
- **Sections** view lists the chapters and sub-sections. **Board** view shows the five columns.
- A timeline heatmap like GitHub's: shade is actions logged that day, a dot is work due that day, an outline is a deadline.

## Run it

See HOW-TO-RUN.md. Short version: double-click `launch.bat`, or put the folder on GitHub Pages (add Supabase for a shared database).

## Where the data lives

One of four places, picked automatically: the published page database, the local server (`data/hub.json`), Supabase (`config.js`), or this browser only. The pill at the top says which.

## Files

- `index.html`, `css/styles.css`
- `js/` in load order: `util`, `defaults`, `store`, `model`, `views`, `forms`, `app`
- `server.js` local server, `launch.bat`, `share-on-network.bat`
- `supabase.sql` table for the shared database, `tools/make-config.js` fills `config.js` from `.env`
- `tools/build-single.js` makes one file for publishing as a claude.ai page
