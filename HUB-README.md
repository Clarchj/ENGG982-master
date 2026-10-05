# ENGG982 Hub

A one-page action board for the Team 3 final report and final presentation. Plain HTML, CSS and JavaScript. No build step.

## What it does

- Two artifacts only: the Final Report (chapters) and the Final Presentation (slides). One square each, coloured by status.
- An action is one dot: **found (red), fixing (amber), waiting for approval (purple), approved (green)**. It moves left to right on the board, like a GitHub issue becoming a merged pull request.
- Anyone logs an action in three taps. Only the leader (PIN) approves.
- A timeline heatmap like GitHub's: shade is actions logged that day, a dot is an action due that day, an outline is a deadline.

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
