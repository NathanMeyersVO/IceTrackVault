import { describe, expect, it } from "vitest";

import type { Playlist, Taglist } from "./tauri";
import { reconcileProjectView } from "./reconcileProjectView";

const taglist = (id: number, name: string): Taglist => ({
  id,
  name,
  tag_key: "Comment",
  entry_tag_key: "",
  value_singular_name: "",
  created_at: 0,
});

const playlist = (id: number, name: string): Playlist => ({
  id,
  name,
  created_at: 0,
  track_count: 0,
});

describe("reconcileProjectView", () => {
  it("remaps taglist sublist by taglist name", () => {
    const result = reconcileProjectView({
      view: { taglistId: 1, value: "01" },
      previousTaglists: [taglist(1, "Events")],
      previousPlaylists: [],
      nextTaglists: [taglist(9, "Events")],
      nextPlaylists: [],
    });
    expect(result).toEqual({ taglistId: 9, value: "01" });
  });

  it("returns null when taglist id already matches after switch", () => {
    const result = reconcileProjectView({
      view: { taglistId: 3, value: "02" },
      previousTaglists: [taglist(3, "Events")],
      previousPlaylists: [],
      nextTaglists: [taglist(3, "Events")],
      nextPlaylists: [],
    });
    expect(result).toBeNull();
  });

  it("falls back to project_tracks when taglist name is missing in new project", () => {
    const result = reconcileProjectView({
      view: { taglistId: 1, value: "01" },
      previousTaglists: [taglist(1, "Events")],
      previousPlaylists: [],
      nextTaglists: [taglist(2, "By Comment")],
      nextPlaylists: [],
    });
    expect(result).toBe("project_tracks");
  });

  it("remaps playlist by name", () => {
    const result = reconcileProjectView({
      view: { playlistId: 4 },
      previousTaglists: [],
      previousPlaylists: [playlist(4, "Warm-up")],
      nextTaglists: [],
      nextPlaylists: [playlist(11, "Warm-up")],
    });
    expect(result).toEqual({ playlistId: 11 });
  });

  it("leaves project_tracks and collection views unchanged", () => {
    expect(
      reconcileProjectView({
        view: "project_tracks",
        previousTaglists: [taglist(1, "Events")],
        previousPlaylists: [],
        nextTaglists: [],
        nextPlaylists: [],
      }),
    ).toBeNull();
    expect(
      reconcileProjectView({
        view: { collectionId: 5 },
        previousTaglists: [],
        previousPlaylists: [],
        nextTaglists: [],
        nextPlaylists: [],
      }),
    ).toBeNull();
  });
});
