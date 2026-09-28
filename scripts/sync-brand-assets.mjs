import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidates = [
  join(root, "brand", "icetrackvault-logo.png"),
  join(root, "brand", "icetrackvault-logo.svg"),
];

const source = candidates.find((path) => existsSync(path));
if (!source) {
  console.error(
    "Missing brand asset. Add brand/icetrackvault-logo.png or brand/icetrackvault-logo.svg.",
  );
  process.exit(1);
}

const ext = source.endsWith(".svg") ? ".svg" : ".png";
const publicDir = join(root, "public");
const assetsDir = join(root, "src", "assets");
mkdirSync(publicDir, { recursive: true });
mkdirSync(assetsDir, { recursive: true });

copyFileSync(source, join(publicDir, `favicon${ext}`));
copyFileSync(source, join(assetsDir, `icetrackvault-logo${ext}`));
console.log(`Synced ${source} → public/favicon${ext}, src/assets/icetrackvault-logo${ext}`);
