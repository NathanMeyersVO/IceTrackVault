import { defineConfig } from "vitepress";
import lightbox from "vitepress-plugin-lightbox";

export default defineConfig({
  title: "IceTrackVault",
  description:
    "Windows desktop music player for figure skating EMS projects — projects, playlists, waveform playback, and EMS download updates.",
  base: "/IceTrackVault/",
  rewrites: {
    "guide/getting-started.md": "guide/user-manual/getting-started.md",
    "guide/user-manual/common-problems.md":
      "guide/user-manual/common-situations.md",
  },
  themeConfig: {
    nav: [
      { text: "User manual", link: "/guide/user-manual/" },
      { text: "Guide", link: "/guide/cli-tools" },
      { text: "Download", link: "/guide/releases" },
      {
        text: "GitHub",
        link: "https://github.com/NathanMeyersVO/IceTrackVault",
      },
    ],
    sidebar: [
      {
        text: "User manual",
        items: [
          { text: "Introduction", link: "/guide/user-manual/" },
          { text: "Getting started", link: "/guide/user-manual/getting-started" },
          {
            text: "Using the music player",
            link: "/guide/user-manual/using-music-player",
          },
          {
            text: "Common situations",
            link: "/guide/user-manual/common-situations",
          },
          {
            text: "Stored collections",
            link: "/guide/user-manual/stored-collections",
          },
          {
            text: "Phone upload setup",
            link: "/guide/user-manual/phone-upload",
          },
          {
            text: "Best practices",
            link: "/guide/user-manual/best-practices",
          },
          {
            text: "Contact us",
            link: "/guide/user-manual/contact-us",
          },
        ],
      },
      {
        text: "Guide",
        items: [
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
  markdown: {
    config: (md) => {
      md.use(lightbox, {});
    },
  },
});
