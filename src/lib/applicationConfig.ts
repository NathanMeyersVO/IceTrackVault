import type { ApplicationId } from "./tauri";

export interface TitleImportDialogConfig {
  title: string;
  filters: { name: string; extensions: string[] }[];
}

export interface DeliveryCopy {
  /** Singular noun for inline copy, e.g. "EMS download" */
  deliverySingular: string;
  createProjectHint: string;
  importButton: string;
  /** Projects hub drop target label (Explorer folder drag) */
  createProjectDropZoneLabel: string;
  pickFolderDialogTitle: string;
  confirmFolderModalTitle: string;
  sourceBrowserTitle: string;
  sourceBrowserDeliveryOnlyLabel: string;
  sourceBrowserShowAllLabel: string;
  sourceBrowserContinueLabel: string;
  sourceBrowserSystemFolderLabel: string;
  sourceBrowserImportFolderHint: string;
  applyUpdateMenuLabel: string;
  applyUpdateMenuLabelStaging: string;
  applyUpdateMenuTitle: string;
  applyUpdatePickerTitle: string;
  applyUpdateChooseFolderButton: string;
  applyUpdateDropZoneLabel: string;
  previewCreateTitle: string;
  previewApplyTitle: string;
  stagingBusyTitle: string;
  applyingBusyTitle: string;
  appliedSuccessMessage: string;
  projectEmptyWithProject: string;
  appEmptyTracksFooter: string;
}

export interface ApplicationConfig {
  supportsTitleImport: boolean;
  supportsScheduleDelivery: boolean;
  /** Tag key always copied from the project file on replace (application partition). */
  partitionTagKey: string | null;
  /** Tag key used for project search matching; null means match on filename. */
  entryTagKey: string | null;
  titleImportDialog?: TitleImportDialogConfig;
  deliveryCopy: DeliveryCopy;
}

const NONE_DELIVERY_COPY: DeliveryCopy = {
  deliverySingular: "delivery",
  createProjectHint:
    "Choose the folder that contains your music track archives (.zip, .tar, etc.).",
  importButton: "Import delivery…",
  createProjectDropZoneLabel: "Drop delivery folder here",
  pickFolderDialogTitle: "Select delivery folder",
  confirmFolderModalTitle: "Confirm delivery folder",
  sourceBrowserTitle: "Choose delivery folder",
  sourceBrowserDeliveryOnlyLabel: "Delivery files only",
  sourceBrowserShowAllLabel: "Show all files",
  sourceBrowserContinueLabel: "Continue",
  sourceBrowserSystemFolderLabel: "Jump to folder in system dialog…",
  sourceBrowserImportFolderHint:
    "Continue imports archives and schedule files in this folder only (not subfolders).",
  applyUpdateMenuLabel: "Apply Delivery Update…",
  applyUpdateMenuLabelStaging: "Staging delivery…",
  applyUpdateMenuTitle:
    "Choose a delivery folder with music track archives to preview and apply.",
  applyUpdatePickerTitle: "Apply delivery update",
  applyUpdateChooseFolderButton: "Choose folder…",
  applyUpdateDropZoneLabel: "Drop delivery folder here",
  previewCreateTitle: "Create project from delivery",
  previewApplyTitle: "Apply delivery update",
  stagingBusyTitle: "Staging delivery…",
  applyingBusyTitle: "Applying delivery update…",
  appliedSuccessMessage: "Delivery update applied",
  projectEmptyWithProject:
    "No tracks yet. Project → Projects… (or Apply Delivery Update…) and choose your delivery folder.",
  appEmptyTracksFooter:
    "Use Project → Projects to import a delivery and open a project.",
};

const USFS_EMS_DELIVERY_COPY: DeliveryCopy = {
  deliverySingular: "EMS download",
  createProjectHint:
    "Choose a folder of EMS downloads with audio archives and/or an event schedule spreadsheet (.xls, .xlsx).",
  importButton: "Import EMS download…",
  createProjectDropZoneLabel: "Drop EMS download folder here",
  pickFolderDialogTitle: "Select EMS downloads folder",
  confirmFolderModalTitle: "Confirm EMS downloads folder",
  sourceBrowserTitle: "Choose EMS download folder",
  sourceBrowserDeliveryOnlyLabel: "EMS files only",
  sourceBrowserShowAllLabel: "Show all files",
  sourceBrowserContinueLabel: "Continue",
  sourceBrowserSystemFolderLabel: "Jump to folder in system dialog…",
  sourceBrowserImportFolderHint:
    "Continue imports archives and the event schedule in this folder only (not subfolders).",
  applyUpdateMenuLabel: "Apply EMS Download…",
  applyUpdateMenuLabelStaging: "Staging EMS download…",
  applyUpdateMenuTitle:
    "Choose a folder of EMS downloads (archives and/or event schedule) to preview and apply.",
  applyUpdatePickerTitle: "Apply EMS download",
  applyUpdateChooseFolderButton: "Choose folder…",
  applyUpdateDropZoneLabel: "Drop EMS download folder here",
  previewCreateTitle: "Create project from EMS download",
  previewApplyTitle: "Apply EMS download",
  stagingBusyTitle: "Staging EMS download…",
  applyingBusyTitle: "Applying EMS download…",
  appliedSuccessMessage: "EMS download applied",
  projectEmptyWithProject:
    "No tracks yet. Project → Projects… (or Apply EMS Download…) and choose your EMS downloads folder.",
  appEmptyTracksFooter:
    "Use Project → Projects to import an EMS download and open a project.",
};

export const APPLICATION_CONFIG: Record<ApplicationId, ApplicationConfig> = {
  none: {
    supportsTitleImport: false,
    supportsScheduleDelivery: false,
    partitionTagKey: null,
    entryTagKey: null,
    deliveryCopy: NONE_DELIVERY_COPY,
  },
  usfs_ems: {
    supportsTitleImport: true,
    supportsScheduleDelivery: true,
    partitionTagKey: "Composer",
    entryTagKey: "Track Title",
    titleImportDialog: {
      title: "Choose event schedule",
      filters: [{ name: "Schedule", extensions: ["xls", "xlsx", "csv"] }],
    },
    deliveryCopy: USFS_EMS_DELIVERY_COPY,
  },
};

export function normalizeApplicationId(applicationId: string | null | undefined): ApplicationId {
  return applicationId === "usfs_ems" ? "usfs_ems" : "none";
}

export function getApplicationConfig(applicationId: ApplicationId): ApplicationConfig {
  return APPLICATION_CONFIG[applicationId];
}

export function getPartitionTagKey(
  applicationId: string | null | undefined,
): string | null {
  return getApplicationConfig(normalizeApplicationId(applicationId)).partitionTagKey;
}

export function getEntryTagKey(
  applicationId: string | null | undefined,
): string | null {
  return getApplicationConfig(normalizeApplicationId(applicationId)).entryTagKey;
}

export function getDeliveryCopy(applicationId: string | null | undefined): DeliveryCopy {
  return getApplicationConfig(normalizeApplicationId(applicationId)).deliveryCopy;
}
