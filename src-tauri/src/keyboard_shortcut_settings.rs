use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::db::Database;

pub const KEYBOARD_SHORTCUTS_KEY: &str = "keyboard_shortcuts";

const VALID_ACTION_IDS: &[&str] = &[
    "trackSelectPrevious",
    "trackSelectNext",
    "playHighlighted",
    "togglePlayPause",
    "volumeDown",
    "volumeUp",
    "seekToStart",
    "seekToEnd",
    "sidebarGroupPrevious",
    "sidebarGroupNext",
];

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct KeyBinding {
    pub key: String,
    #[serde(default)]
    pub ctrl: bool,
    #[serde(default)]
    pub alt: bool,
    #[serde(default)]
    pub shift: bool,
    #[serde(default)]
    pub meta: bool,
}

pub type KeyboardShortcutSettings = HashMap<String, Option<KeyBinding>>;

fn is_valid_action_id(id: &str) -> bool {
    VALID_ACTION_IDS.contains(&id)
}

fn normalize_binding(binding: KeyBinding) -> Option<KeyBinding> {
    if binding.key.is_empty() {
        return None;
    }
    let key = binding.key.trim();
    let key = if key.is_empty() {
        binding.key.clone()
    } else {
        key.to_string()
    };
    Some(KeyBinding {
        key,
        ctrl: binding.ctrl,
        alt: binding.alt,
        shift: binding.shift,
        meta: binding.meta,
    })
}

pub fn normalize_keyboard_shortcuts(
    settings: KeyboardShortcutSettings,
) -> KeyboardShortcutSettings {
    let mut out = KeyboardShortcutSettings::new();
    for (id, binding) in settings {
        if !is_valid_action_id(&id) {
            continue;
        }
        let value = match binding {
            None => None,
            Some(b) => normalize_binding(b),
        };
        out.insert(id, value);
    }
    out
}

pub fn get_keyboard_shortcuts(db: &Database) -> Result<KeyboardShortcutSettings, String> {
    let stored = db
        .get_app_setting(KEYBOARD_SHORTCUTS_KEY)
        .map_err(|e| e.to_string())?;
    let Some(json) = stored else {
        return Ok(KeyboardShortcutSettings::new());
    };

    let parsed: KeyboardShortcutSettings =
        serde_json::from_str(&json).map_err(|e| e.to_string())?;
    Ok(normalize_keyboard_shortcuts(parsed))
}

pub fn set_keyboard_shortcuts(
    db: &Database,
    settings: KeyboardShortcutSettings,
) -> Result<KeyboardShortcutSettings, String> {
    let normalized = normalize_keyboard_shortcuts(settings);
    let json = serde_json::to_string(&normalized).map_err(|e| e.to_string())?;
    db.set_app_setting(KEYBOARD_SHORTCUTS_KEY, &json)
        .map_err(|e| e.to_string())?;
    Ok(normalized)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn round_trip_shortcuts() {
        let db = Database::open(std::path::Path::new(":memory:")).expect("db");
        let mut settings = KeyboardShortcutSettings::new();
        settings.insert(
            "togglePlayPause".to_string(),
            Some(KeyBinding {
                key: " ".to_string(),
                ctrl: true,
                alt: false,
                shift: false,
                meta: false,
            }),
        );
        settings.insert("volumeDown".to_string(), None);
        set_keyboard_shortcuts(&db, settings.clone()).expect("save");
        let loaded = get_keyboard_shortcuts(&db).expect("load");
        assert_eq!(loaded.get("togglePlayPause"), settings.get("togglePlayPause"));
        assert_eq!(loaded.get("volumeDown"), Some(&None));
    }

    #[test]
    fn drops_unknown_action_ids() {
        let mut settings = KeyboardShortcutSettings::new();
        settings.insert("notAnAction".to_string(), Some(KeyBinding {
            key: "x".to_string(),
            ctrl: false,
            alt: false,
            shift: false,
            meta: false,
        }));
        let normalized = normalize_keyboard_shortcuts(settings);
        assert!(normalized.is_empty());
    }
}
