use std::path::Path;

use crate::db::Database;
use crate::tags;

pub fn index_track_tags(db: &Database, track_id: i64, path: &Path) -> Result<(), String> {
    let pairs = tags::read_human_tag_pairs(path)?;
    db.replace_track_tags(track_id, &pairs)
        .map_err(|e| e.to_string())
}

pub fn index_track_tags_and_sync_taglists(
    db: &Database,
    track_id: i64,
    path: &Path,
) -> Result<(), String> {
    let pairs = tags::read_human_tag_pairs(path)?;
    db.replace_track_tags(track_id, &pairs)
        .map_err(|e| e.to_string())?;
    if db.is_project_track(track_id).map_err(|e| e.to_string())? {
        let keys: Vec<String> = pairs.into_iter().map(|(key, _)| key).collect();
        db.sync_taglist_partition_order_for_tag_keys(&keys)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn backfill_unindexed_tracks(db: &Database) -> Result<(), String> {
    let ids = db.list_unindexed_track_ids().map_err(|e| e.to_string())?;
    for track_id in ids {
        let path = db
            .get_track_path(track_id)
            .map_err(|e| e.to_string())?
            .ok_or_else(|| format!("Track {track_id} not found"))?;
        index_track_tags(db, track_id, Path::new(&path))?;
    }
    Ok(())
}
