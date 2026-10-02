# ENGG982 Hub

A one-person command centre for Team 3's final report, final presentation and contribution evidence. It tracks structure, sources, tasks, people and evidence. Writing and editing stay in Word on OneDrive.

Tabs: Dashboard, Workflow (the Week 10 team writing process), Report, Library, Team, Presentation, Plan, Inbox, Setup. Every tab has **Export text**, and almost everything (sections, roles, rubric, weeks, milestones, risks, lists) is editable data.

## Run it

| Where | How | Where the data lives |
|---|---|---|
| Your computer | Double-click `launch.bat` (needs Node.js 18+, `winget install OpenJS.NodeJS.LTS`) | `data/hub.json`, with hourly copies in `backups/` |
| Teammates on your Wi-Fi | Double-click `share-on-network.bat` | same file, optional password |
| GitHub Pages | See below | This browser, or Supabase if you set it up |

Nothing else to install. There is no build step.

## Publish on GitHub Pages

1. Create a repository and upload everything in this folder.
2. Settings > Pages > Source: **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/pages.yml` publishes the site at `https://<you>.github.io/<repo>/`.

On first visit the hub loads `data/seed.json` (team, report sections, 37 starting tasks) into the browser's database, so it opens ready to use. Use **Backup** in the header regularly: browser storage can be cleared.

### Optional: one shared database (Supabase, free)

GitHub Pages only hosts files, so sharing data between devices needs a small cloud database.

1. Create a project at supabase.com.
2. SQL Editor > paste `supabase.sql` > Run.
3. Project Settings > API: copy the Project URL and the `anon public` key into `config.js`, commit, push.
4. Open the site. The header pill says **Cloud database, saved**. An empty table is filled from `data/seed.json` on first load.

Trade-off: the anon key is visible to anyone who views the page, and the policy lets that key read and write the table. Do not store private information. To lock it down, change the policy in `supabase.sql` to require a signed-in user.

## Folder map

```
index.html            the page shell
config.js             optional Supabase settings
css/styles.css        look and feel
js/util.js            small helpers, dates
js/defaults.js        built-in report sections, rubric, roles, workflow, lists
js/store.js           the database layer: shared page, local server, Supabase, browser
js/model.js           flags and counts (what needs attention)
js/views.js           one function per tab
js/export.js          the plain-text export for each tab
js/forms.js           add and edit forms
js/app.js             clicks and changes
data/seed.json        starting data
server.js             local backend, no packages
supabase.sql          table for the optional cloud database
tools/build-single.js builds one self-contained file (for claude.ai artifacts)
```

## Changing things

- Wording, sections, rubric, roles, stages, weeks, milestones, risks: edit in the app (Setup, Workflow, Plan). **Reset** in Setup restores a built-in list.
- A new tab: add a `vName()` in `js/views.js`, a `tName()` in `js/export.js`, and one entry in `TABS` and the two lookup lines.
- The data shape is simple: `{ collection: { id: { ...fields } } }`.
