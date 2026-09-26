import { defineConfig } from "vitepress";

export default defineConfig({
  title: "IceTrackVault",
  description:
    "Cross-platform desktop music player for figure skating EMS projects — projects, playlists, waveform playback, and EMS download updates.",
  base: "/IceTrackVault/",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Download", link: "/guide/releases" },
      {
        text: "GitHub",
        link: "https://github.com/NathanMeyersVO/IceTrackVault",
      },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting started", link: "/guide/getting-started" },
          { text: "Using the app", link: "/guide/usage" },
          { text: "CLI tools", link: "/guide/cli-tools" },
          { text: "Download & releases", link: "/guide/releases" },
        ],
      },
      {
        text: "Developers",
        items: [
          { text: "Build from source", link: "/guide/development" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/NathanMeyersVO/IceTrackVault",
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © Nathan Meyers",
    },
  },
});
