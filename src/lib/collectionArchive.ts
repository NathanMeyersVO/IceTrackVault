export const COLLECTION_ARCHIVE_EXTENSION = ".icecollection.zip";

export function isCollectionArchivePath(path: string): boolean {
  const base = path.replace(/\\/g, "/").split("/").pop() ?? "";
  return base.toLowerCase().endsWith(COLLECTION_ARCHIVE_EXTENSION);
}

export function collectionArchiveFileName(collectionName: string): string {
  const safe = collectionName.trim() || "collection";
  return `${safe}${COLLECTION_ARCHIVE_EXTENSION}`;
}

export const COLLECTION_ARCHIVE_DIALOG_FILTER = {
  name: "IceTrackVault stored collection (.icecollection.zip)",
  extensions: ["zip"],
};
