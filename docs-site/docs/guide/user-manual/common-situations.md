---
next:
  text: Best practices
  link: /guide/user-manual/best-practices
---

# Solutions for common situations

**IceTrackVault** was written not just to play music, but to provide robust support for problems that music coordinators routinely deal with. This page walks through typical issues before and during an event: missing music, incorrect files, swapped short and long programs, moving skaters between events, creating events on the schedule, and applying updated EMS downloads.

## Before you edit

Most fixes on this page change **tags** and sometimes **files on disk** in your project folder. They are only available when the project is **Unlocked**:

1. Open **Project → Projects…**
2. Set **Lock mode** to **Unlocked** for that project

While a lock is active, track row menus and sidebar edits that would change events or tags are unavailable. See [Best practices](./best-practices#use-lock-down-modes-during-the-competition) for when to lock again during the meet.

## Missing track

A competitor's music may be missing: perhaps they never uploaded it, or uploaded it after you took the EMS downloads. Here's how you can load their music directly into the competition:

### Add or assign music

1. **Project → Upload track to project…**
2. Choose files, drag and drop, or use **Upload from phone** if you configured [Phone upload setup](./phone-upload).
3. The uploaded track will probably show up in the **NO-TAG** event. (In the unlikely event the track had a **`Composer`** tag set, it wil instead show up in an event matching that tag.) Go to that event and select the track’s **⋮** menu → **Edit tags…**
4. Add tags for **`Composer`** (set to the event number) and **`Track Title`** (set to the competitor name). Or edit those tags if they already exist. Then **Save**.

## Swap tracks

Occasionally, a competitor (or coach or parent) will upload tracks to the wrong event: for example, uploading freeskate music to the short program and vice-versa.

You can quickly correct this with Use a **swap** operation:

1. Select the event and open the track’s **⋮** menu → **Swap Event…**
2. That brings up a dialog showing the competitor's tracks in other events. Select the event you want to swap. and press **Swap…**.
3. Review the preview, which shows you the details of the files and tags that will be swapped.
4. Click **OK**.

## Moving a competitor to a different event

Use a **move** when one competitor should be in a different event and you are **not** exchanging music with a track in the other event. There are a couple of ways to do this:

### Drag to the Events list

1. Pointer-drag a row in the event tracklist.
2. Drop it on the destination **Event** in the sidebar.
3. Confirm the **Move**.

### Change Event…

1. **⋮ → Change Event…**
2. Enter the new event number (the **`Composer`** tag value).
3. Click **OK**. The file’s metadata is updated on disk.

## Creating a new event in the taglist

The schedule report defines most events at project creation. If an event is missing from **Events** (added late on the schedule, or not in the import), add it manually:

1. In the sidebar, hover the **Events** header.
2. Click **+Event**.
   - If **+Event** is grayed out, turn off **Hide empty Event rows** for that taglist, or unlock the project.
3. Enter **Tag value** — the **`Composer`** number EMS uses (for example `14`).
4. Enter **Display title** — the name shown in the sidebar (for example `14 - Juvenile Girls FS`).
5. Click **Add**.

IceTrackVault opens the new empty event. Assign tracks by uploading and tagging, dragging from **NO-TAG**, or moving from another event.

## Replace track

Use **Replace file** when tags, event, and skater identity are correct but the **audio** is wrong—corrupt file, wrong mix, or a corrected upload from the skater. The track stays the same row in the project; only the project copy of the audio changes.

1. Select the track and open **⋮ → Replace file…**
2. Provide the new audio through one of the three upload options:
   - **Choose file…**
   - Drag and drop onto the dialog
   - **Upload from phone** (see [Phone upload setup](./phone-upload))
3. Review **What will happen**:
   - IceTrackVault copies the new file into the project folder that holds this track.
   - IceTrackVault copies tags from the old file into the new one.
4. Confirm when the preview matches what you want.

## Applying an updated EMS download

You might want to download updated tracks and event names from EMS after your original setup.

1. **Export Project…** first to create a safety backup ([Best practices](./best-practices#export-before-ems-updates)).
2. Ensure the project is **Unlocked**.
3. **Project → Apply EMS Download…** and select the new download folder (same idea as creating a project).
4. Review the preview summary. Choose how to apply:
   - **Merge** — add and update tracks and schedule entries; generally safer for routine updates.
   - **Full replacement (include removals)** — treat the download as complete and authoritative: a *full replacement* of the current competition information and music.
5. Click **Apply Selected Changes** (or the equivalent confirm control in the preview).

After apply, spot-check **Events** and a few competitors. Use the sections above for any track still missing, in the wrong event, or needing a file replacement.

## What to read next

- [Best practices](./best-practices) — backups, lock modes, and recovery if something goes wrong.
- [Phone upload setup](./phone-upload) — late files from a phone at the rink.
- [Using the music player](./using-music-player) — playback, search, and event navigation during the competition.
