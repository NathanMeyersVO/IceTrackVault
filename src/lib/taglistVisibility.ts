import type { TaglistValue } from "./tauri";

export function taggedTaglistValues(values: TaglistValue[]): TaglistValue[] {
  return values.filter((entry) => entry.value != null);
}

export function visibleTaggedTaglistValues(
  values: TaglistValue[],
  hideEmpty: boolean,
): TaglistValue[] {
  const tagged = taggedTaglistValues(values);
  if (!hideEmpty) return tagged;
  return tagged.filter((entry) => entry.track_count > 0);
}

/** Navigation list: visible tagged partitions, then NO-TAG if present. */
export function navigationTaglistValues(
  values: TaglistValue[],
  hideEmpty: boolean,
): TaglistValue[] {
  const visible = visibleTaggedTaglistValues(values, hideEmpty);
  const noTag = values.find((entry) => entry.value == null);
  if (noTag) visible.push(noTag);
  return visible;
}
