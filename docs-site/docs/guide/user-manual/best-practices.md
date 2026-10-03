# Best practices

This page collects recommendations for competition staff and music volunteers who plan to run **IceTrackVault** at a real figure skating event. It complements the task-focused chapters: use [Getting started](./getting-started) for install and first import, [Using the music player](./using-music-player) for playback and ordering, [Common problems](./common-problems) for fixes, and [Stored collections](./stored-collections) for anthems and other permanent libraries.

## Before competition day

**Install on the rink PC early.** Download the latest installer from [Download & releases](../releases) and complete setup on the machine that will play music—not only on a personal laptop. Allow time for Windows SmartScreen prompts during install (see [Getting started](./getting-started#install)).

**Build the project from EMS, then stay current.** Create the competition project from your EMS download folder (archives plus event schedule). Whenever EMS publishes an updated download before the event, use **Project → Apply EMS Download…**, review the summary, and apply changes—the same preview flow as creating a project.

**Run a dry rehearsal.** Open several events across the schedule, play a sample of tracks, and confirm waveforms and volume on the rink sound system. Set OS and app volume once so levels are predictable on competition day.

**Match schedule order before doors open.** EMS import order may not match the published event list or start order. Drag events under **Project Taglists → Events** and drag competitor rows within each event until they match the official schedule. Order is saved in the project database when you reopen the project. See [Rearranging skating order and event order](./using-music-player#rearranging-skating-order-and-event-order).

**Clear NO-TAG.** Check **NO-TAG** at the bottom of the Events list. Tracks there are not assigned to any numbered event; resolve or upload fixes before the meet so nothing is missing when you select an event.

**Prepare stored collections if you use them.** Load national anthems, continuous-play lists, or other assets into stored collections ahead of time so you are not building libraries during the competition. See [Stored collections](./stored-collections).

**Optional practice import.** Maintainers can generate a fake EMS folder with the [generate-demo-dataset](../cli-tools#generate-demo-dataset) CLI tool to practice **Import EMS download…** without real competitor music.

## Validate the project

Use this checklist once the project reflects the latest EMS download and order edits:

- Event names and counts look reasonable compared to the schedule spreadsheet.
- Spot-check a few skater names with **Search project…** and confirm the right event and track open.
- Play at least one track per session or day you will operate, if the schedule spans multiple days.
- Export a backup when the project is stable: **Project → Export Project…** (full project archive for safety or transfer to another PC).

**Consider lock mode before play begins.** In **Project → Projects…**, each project has a **Lock mode** setting:

- **Unlocked** — full editing; required for **Apply EMS Download…** and most structural changes.
- **Lock all except playlists against changes** — protects events and tracklists while still allowing championship or custom playlists during the meet.
- **Lock all against changes** — strongest guard against accidental edits; unlock temporarily if you must apply an EMS update or fix tags.

The window title shows `(locked)` or `(playlists editable)` when a lock is active.

## During the competition

**Favor keyboard control.** Once order is set, you can move between events (**Page Up** / **Page Down**), highlight the next skater (**↑** / **↓**), start music (**Enter**), and pause (**P**) with minimal mouse use. Open **Help → Keyboard shortcuts…** for the in-app list. Details are in [Keyboard shortcuts](./using-music-player#keyboard-shortcuts).

**Use search and the next-event footer.** **Search project…** jumps to a competitor across the whole project. At the bottom of each event tracklist, **Next project taglist (…)** moves to the following event without clicking the sidebar.

**Follow the playing track when you browse.** If you open another event or list while music is playing, the player bar shows **↩ Playing track**. Click it to return to the list and row that is actually playing. Playback continues; only the view changes.

**Fix problems deliberately.** Late uploads, wrong files, program swaps, and roster moves are covered in [Common problems](./common-problems). If the project is locked, unlock it (or use a lock mode that allows the change) before applying EMS updates or editing tags.

## Contingency and handoff

**Export after major changes.** After a large EMS apply or many manual fixes, run **Project → Export Project…** again so you have a recent archive.

**Plan for two operators.** A backup person who knows how to search, reorder, and follow [Common problems](./common-problems) reduces risk if the primary operator steps away.

**Protect the music machine.** Disable sleep during sessions, defer non-critical Windows updates, and avoid unrelated apps that might grab audio output.

**Phone upload (if used).** If your venue relies on **Settings → Phone upload setup…** for late files, configure and test the tunnel before the event—not between groups.

## What to read next

- [Solutions for common problems](./common-problems) — missing music, replacements, swaps, EMS re-downloads.
- [User manual introduction](./index) — full table of contents.
