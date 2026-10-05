---
next:
  text: Managing projects
  link: /guide/user-manual/managing-projects
---

# Getting started

IceTrackVault is available on **Windows** and **Linux** (installers on GitHub Releases). macOS is not offered as a supported platform today; see [Build from source](../development) if you are a contributor exploring a local macOS build.

## Install

### Windows

1. Open [Releases](https://github.com/NathanMeyersVO/IceTrackVault/releases) and download the latest installer (`.msi` and/or `.exe`).
2. Run the installer. Because the installer is "not downloaded frequently", Windows SmartScreen will probably display a security warning asking whether you want to keep or discard the file; select keep to proceed with the installation.

### Linux

1. Open [Releases](https://github.com/NathanMeyersVO/IceTrackVault/releases) and download the latest `.deb` or `.AppImage`.
2. On Debian or Ubuntu, install the package (this also installs WebKitGTK):

   ```bash
   sudo apt install ./IceTrackVault_*_amd64.deb
   ```

3. Or run the AppImage after marking it executable:

   ```bash
   chmod +x IceTrackVault_*_amd64.AppImage
   ./IceTrackVault_*_amd64.AppImage
   ```

   If the AppImage will not start, install `libfuse2`.

4. For **file and folder pickers** (import, open archive, etc.), install portal support if dialogs do not appear:

   ```bash
   sudo apt install xdg-desktop-portal xdg-desktop-portal-gtk
   ```

   When installing a `.deb` from your `Downloads` folder, apt may warn that `_apt` cannot read the file; copy the package to `/tmp` first or use `sudo dpkg -i ~/Downloads/IceTrackVault_*_amd64.deb`.

## First steps in the app

<figure class="screenshot-box">
  <img
    src="/screenshots/initial-display.png"
    alt="IceTrackVault main window after a fresh installation"
    data-zoomable
  />
  <figcaption>Main window after a fresh installation, with no music loaded. Click the image to view full size.</figcaption>
</figure>

A new competition project is created using one or more ZIP archives of tracks - tagged and packaged by EMS - along with an EMS-generated schedule report. The schedule report provides the names for each event.

To start, *collect the schedule report and all the music ZIPs in one directory*. Then, in the steps below, you will select the directory where these files are located.


1. Open **Project → Projects…** and select "New Project"
<figure class="screenshot-box">
  <img
    src="/screenshots/open-project-dialog.png"
    alt="IceTrackVault main window after a fresh installation"
    data-zoomable
  />
  <figcaption>This dialog will display your current projects (there are none yet) and allow you to create a new one.</figcaption>
</figure>

2. In the **New Project** dialog, type in a project name and choose the **USFigureSkating EMS** application.
<figure class="screenshot-box">
  <img
    src="/screenshots/new-project.png"
    alt="New Project Dialog"
    data-zoomable
  />
  <figcaption>Set up the project name and application.</figcaption>
</figure>

3. Either click **Import EMS Download...** or drag and drop an EMS download folder from Windows Explorer. For this example, we clicked the import button. From there, navigate to the folder containing your tagged music ZIP archive(s) and EMS schedule report.

<figure class="screenshot-box">
  <img
    src="/screenshots/select-download-folder.png"
    alt="Choose New Download Folder Dialog"
    data-zoomable
  />
  <figcaption>Navigate to the folder containing your downloaded music ZIP archives and your EMS schedule report.</figcaption>
</figure>

4. Click **Continue**. IceTrackVault will take a few moments to examine the content, then show you a summary of what it read.

<figure class="screenshot-box">
  <img
    src="/screenshots/create-project-summary.png"
    alt="Summary of project being created"
    data-zoomable
  />
  <figcaption>This summarizes the data IceTrackVault just read to start the project. You can expand this view if needed to see more detail.</figcaption>
</figure>

5. Click **Apply Selected Changes**. IceTrackVault will take a few moments to process the files, and then you'll see the loaded project.

<figure class="screenshot-box">
  <img
    src="/screenshots/project-loaded.png"
    alt="Tracks and events have been loaded"
    data-zoomable
  />
  <figcaption>IceTrackVault has loaded the project. The left-hand column lets you navigate - it's currently showing you "Project Tracks", a list of all the tracks. The big center window shows the tracks, and you can see the music player at the bottom.</figcaption>
</figure>

## What to read next

- [Managing projects](./managing-projects) — multiple competitions on one PC, the Projects hub, and lock modes.
- [Using the music player](./using-music-player) — events, playback, and keyboard shortcuts during the competition.
