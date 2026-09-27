---
layout: home
hero:
  name: IceTrackVault
  text: Music player for skating competitions
  tagline: Manage competitions playlists, with waveform playback on Windows.
  actions:
    - theme: brand
      text: Download
      link: /guide/releases
    - theme: alt
      text: User manual
      link: /guide/user-manual/
---

## About

**IceTrackVault** is a Windows desktop music player built specifically for US Figure Skating competitions. While event organizers have long relied on iTunes — using templates and build procedures provided by US Figure Skating — using iTunes creates a lot of extra work. IceTrackVault eliminates much of the heavy workload and tedious change management required by traditional setups, streamlining the entire competition music workflow.

**IceTrackVault**'s main job is to

- Load music tracks and events data from EMS (EntryEeze support is targeted for future work), automatically building playlists for each event
- Make it simple to set start order and adjust event order
- Provide an easy-to-use music player, with waveform display

In addition to those basic functions, **IceTrackVault** provides simple operations for common issues faced before and during the competition:

- Uploading and tagging missing music tracks
- Replacing music tracks that are incorrect due to mistaken upload or technical problems
- Swapping music tracks between events - for example, if short and freeskate programs were mistakenly uploaded to each others' event.
- Moving competitors to different events
- Building custom playlists during the competition for championship events

Finally, **IceTrackVault** helps you manage your builds with the following features:

- Multiple competition projects can be managed at once.
- Full project configuration + music can be backed up to an archive to use as a safety backup or to transfer your work to a different system.
- Separate collections can be built - outside of the competition projects - for permanent assets like national anthems and background music continuous-play playlists.

---

Pre-built **Windows installers** are on [GitHub Releases](https://github.com/NathanMeyersVO/IceTrackVault/releases). macOS is not supported for end users today. The codebase is OS-independent (Tauri); a local macOS build may work, but Windows is the focus and macOS delivery is not a current priority. Contributions from macOS developers who want to help enable macOS are welcome—open an issue or pull request on [GitHub](https://github.com/NathanMeyersVO/IceTrackVault). See [Build from source](/guide/development) for prerequisites.

**Documentation:** [User manual](/guide/user-manual/) · [Source on GitHub](https://github.com/NathanMeyersVO/IceTrackVault)