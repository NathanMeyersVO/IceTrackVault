# Using the music player

This chapter covers running music during a skating competition. It explains how **Events** are organized in the sidebar, how each event’s **tracklist** (skating order) works, how to **play and seek** tracks, and how to **reorder events and competitors** to match starting and event orders.

If you have not loaded a project yet, start with [Getting started](./getting-started).

## Main window layout

After a project is loaded, the window has three areas of interest:

1. **Sidebar (left)** — navigate through the project's events, playlists, and stored collections.
2. **Center** — the music tracks (**tracklist**) in the current event.
3. **Player bar (bottom)** — title, transport controls, volume, elapsed time, and a **waveform** for the highlighted or playing track.

<figure class="screenshot-box">
  <img
    src="/screenshots/sample-view.png"
    alt="IceTrackVault with an event selected: Events taglist in the sidebar, competitor tracklist in the center, and the player bar at the bottom"
    data-zoomable
  />
  <figcaption>An event selected under <strong>Events</strong>. The center lists that event’s tracks; the player bar shows the highlighted track. Click the image to view full size.</figcaption>
</figure>

In the previous section, you saw all of the music tracks under **Project Tracks**. Below that, we see the tracks organized by **Events**. The list of events is called a **taglist** because the events are organized by an MP3 tag applied by EMS - similar to iTunes smartlists, but requiring much less work to set up.

## Events and the Events taglist

When loading EMS projects, IceTrackVault creates the **Events** under **Project Taglists** in the sidebar. 

Each row under **Events** is one **event** (for example `04 - Basic 1`). IceTrackVault builds that list from the EMS-applied tags in the music tracks, plus the event names read from the EMS **Event Schedule** spreadsheet.

The number in parentheses on each sidebar row, such as `(2)`, is how many tracks belong to that event.

### Select an event

Click an event in the sidebar. The center panel switches to that event’s tracklist and shows the event name at the top, along with a track count.

You can also use **Page Up** and **Page Down** to move to the previous or next event while an event view is open (see [Keyboard shortcuts](#keyboard-shortcuts)).

### NO-TAG

At the bottom of the **Events** list, **NO-TAG** lists project tracks that do not have a tag placing them in any event. Those files will not appear under any numbered event until tags are set (we discuss later how to do that).

## Per-event tracklist (competitors)

With an event selected, the center table is the **skating order for that event**. Each row is one track - typically one competitor’s program.

**Single-click** a row to **highlight** it (cursor row). The player bar updates to that track’s information and waveform.

**Double-click** a row (or press **Enter** while it is highlighted) to **load and play** play the track.

The **⋮** menu on each row opens actions such as editing tags, moving a skater to another event, replacing a file, or deleting a track. These operations are described in [Common problems](./common-problems).

### Search within the project

The **Search project…** field above the table finds tracks across the whole project. Start typing a name to search for a competitor's events, and clear the search to return to the normal event list and drag handles.

### Jump to the next event

At the end of each event, you'll see a footer row labeled **Next project taglist (…)** with the next event name. This provides an easy way to navigate to the next event directly from the current event's tracklist - without having to mouse over to the **Events** list.


<!-- Screenshot opportunity: crop of the track table footer row "Next project taglist (05 - …)" with callout. Save as docs-site/docs/public/screenshots/taglist-next-event-footer.png -->

## Playing music



### Highlight vs play

IceTrackVault separates **which track is selected** from **what is loaded in the audio engine**:

- **Highlighted (cursor) row** — shown with the cursor background color in the table. You can scrub the waveform and use **Home** / **End** to set a **preview** position before playing.
- **Playing row** — shown with playing colors. Transport and seeking affect live playback.

Press **P** to toggle play/pause. Play uses the preview position if you adjusted it while the track was only highlighted.

### Transport controls

The player bar (bottom) provides:

| Control | Action |
|---------|--------|
| **Stop (■)** | Stops playback and unloads the current track |
| **Jump to beginning (⏮)** | Seeks to the start (or preview start if not yet playing) |
| **Play / Pause** | Starts or pauses the highlighted or loaded track |
| **Jump to end (⏭)** | Seeks near the end (useful for endings checks) |
| **Volume** | Slider plus **←** / **→** keyboard adjustment |

While the engine is seeking or loading, controls dim briefly and a **⌛** indicator appears; wait until it clears before clicking again.

### Waveform seeking

The waveform shows peak levels for the highlighted or playing track. **Click** anywhere on the waveform to seek to that time. If the track is already playing, playback jumps immediately; if it is only highlighted, the click sets where **Play** will start.

During play, the bright portion of the waveform shows progress; a cursor line marks the current time. Time readout on the right shows **elapsed / duration**.

<!-- Screenshot opportunity: close-up of the player bar with transport, volume, time, and waveform during playback. Save as docs-site/docs/public/screenshots/player-bar-playing.png -->

## Rearranging skating order and event order

Competition order on the ice does not always match the EMS download. IceTrackVault lets you reorder **competitors within an event** and **events within the day** without re-importing ZIP files. Order is stored in the project database and is kept when you reopen the project.

### Reorder competitors (rows in the tracklist)

1. Open the event in the sidebar.
2. On the left side of each row, use the **grip** (six-dot handle).
3. **Press and drag** the grip up or down. A line shows where the row will land.
4. **Release** to save the new order.

You can drag from the grip or from the row; avoid starting a drag from the **⋮** menu. Reordering is only available when you are viewing the full event list (not project search results).

### Reorder events (rows in the Events taglist)

1. In the sidebar, under **Project Taglists → Events**, each numbered event has a grip on the left (same pattern as the track table).
2. Drag an event up or down to match the rink schedule.
3. Release to save.

**NO-TAG** is not reorderable; it always stays at the bottom.

Event order affects sidebar navigation, the **Next project taglist** footer, and **Page Up** / **Page Down** when moving between events.

<!-- Screenshot opportunity: sidebar crop showing Events with one row mid-drag and a drop indicator between two events. Save as docs-site/docs/public/screenshots/reorder-events-sidebar.png -->

<!-- Screenshot opportunity: track table crop showing grip handles and a drop indicator between two competitor rows. Save as docs-site/docs/public/screenshots/reorder-tracks-in-event.png -->

## Keyboard shortcuts

Shortcuts work when focus is not in a text field. Open **Help → Keyboard shortcuts…** in the menu bar for the in-app list.

| Keys | Action |
|------|--------|
| **↑** / **↓** | Previous / next track in the current event list (or move to/from the next-event footer) |
| **Enter** | Play or restart the highlighted track; or open the next event from the footer |
| **P** | Play / pause |
| **←** / **→** | Volume down / up |
| **Home** / **End** | Jump to beginning / near end of track |
| **Page Up** / **Page Down** | Previous / next event in the sidebar (when viewing an event) |

## Suggested screenshots for this chapter

The following assets would complete this page beyond the main `sample-view.png` figure already embedded above.

| File (under `docs-site/docs/public/screenshots/`) | What to capture | Where to use |
|---------------------------------------------------|-----------------|--------------|
| `sample-view.png` | Full window: **Events** sidebar, one event’s tracklist, player with waveform | Main layout figure (already in use) |
| `project-loaded.png` | **Project Tracks** selected, all tracks visible | Optional callout comparing “all tracks” vs event view |
| `taglist-next-event-footer.png` | Bottom of event track table showing **Next project taglist (…)** | [Jump to the next event](#jump-to-the-next-event) |
| `player-bar-playing.png` | Player bar during playback: pause icon, elapsed time, waveform progress | [Playing music](#playing-music) |
| `reorder-tracks-in-event.png` | Track table with drag indicator between two rows | [Reorder competitors](#reorder-competitors-rows-in-the-tracklist) |
| `reorder-events-sidebar.png` | **Events** list with drag indicator between two events | [Reorder events](#reorder-events-rows-in-the-events-taglist) |
| `keyboard-shortcuts-dialog.png` | **Help → Keyboard shortcuts…** modal | [Keyboard shortcuts](#keyboard-shortcuts) |

## What to read next

- [Solutions for common problems](./common-problems) — wrong file, missing music, moving skaters between events, EMS re-downloads.
- [Stored collections](./stored-collections) — anthems and other libraries outside the competition project.
