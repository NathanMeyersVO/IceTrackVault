import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

import type { DeliveryProgress } from "../lib/tauri";
import { usePlayerStore } from "../store/playerStore";

export function useDeliveryProgressEvents() {
  const setDeliveryProgress = usePlayerStore((s) => s.setDeliveryProgress);

  useEffect(() => {
    const unlisten = listen<DeliveryProgress>("delivery-progress", (event) => {
      setDeliveryProgress(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [setDeliveryProgress]);
}
