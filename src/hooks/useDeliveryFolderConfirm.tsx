import { useCallback, useState } from "react";

import { DeliverySourceBrowserModal } from "../components/DeliverySourceBrowserModal";
import { getApplicationConfig, getDeliveryCopy } from "../lib/applicationConfig";
import { pickDeliveryFolder } from "../lib/pickDeliveryFolder";
import type { ApplicationId } from "../lib/tauri";

export function useDeliveryFolderConfirm(options: {
  applicationId: ApplicationId;
  onConfirm: (sourcePaths: string[]) => void | Promise<void>;
}) {
  const { applicationId, onConfirm } = options;
  const deliveryCopy = getDeliveryCopy(applicationId);
  const supportsScheduleDelivery =
    getApplicationConfig(applicationId).supportsScheduleDelivery;
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [startPath, setStartPath] = useState<string | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setStartPath(null);
  }, []);

  const openBrowser = useCallback((path: string | null) => {
    setStartPath(path);
    setSession((n) => n + 1);
    setOpen(true);
  }, []);

  const loadFolder = useCallback(
    (folder: string) => {
      openBrowser(folder);
    },
    [openBrowser],
  );

  const pickAndShow = useCallback(() => {
    openBrowser(null);
  }, [openBrowser]);

  const pickSystemFolder = useCallback(async () => {
    return pickDeliveryFolder(deliveryCopy.pickFolderDialogTitle);
  }, [deliveryCopy.pickFolderDialogTitle]);

  const confirm = useCallback(
    (paths: string[]) => {
      close();
      void onConfirm(paths);
    },
    [close, onConfirm],
  );

  const modal = open ? (
    <DeliverySourceBrowserModal
      key={session}
      title={deliveryCopy.sourceBrowserTitle}
      supportsScheduleDelivery={supportsScheduleDelivery}
      deliveryOnlyLabel={deliveryCopy.sourceBrowserDeliveryOnlyLabel}
      showAllLabel={deliveryCopy.sourceBrowserShowAllLabel}
      continueLabel={deliveryCopy.sourceBrowserContinueLabel}
      systemFolderPickerLabel={deliveryCopy.sourceBrowserSystemFolderLabel}
      importFolderHint={deliveryCopy.sourceBrowserImportFolderHint}
      initialPath={startPath}
      onClose={close}
      onContinue={confirm}
      onPickSystemFolder={pickSystemFolder}
    />
  ) : null;

  return { pickAndShow, loadFolder, modal };
}
