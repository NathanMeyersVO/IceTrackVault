/** Lets the webview paint (e.g. busy overlay) before a long Tauri invoke. */
export function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}
