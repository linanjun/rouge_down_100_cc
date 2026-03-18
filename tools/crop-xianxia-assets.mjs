/**
 * 从 1376×768 等大画布 PNG 裁切出单控件尺寸，并输出为 RGBA，覆盖 xianxia 目录下原文件。
 * 运行：node tools/crop-xianxia-assets.mjs
 * 依赖：npm install --save-dev sharp
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const assetRoot = path.join(repoRoot, 'assets', 'resources', 'art', 'generated', 'xianxia');

/** 画布假定尺寸（与待返修清单一致） */
const CANVAS_W = 1376;
const CANVAS_H = 768;
const cx = Math.floor(CANVAS_W / 2);
const cy = Math.floor(CANVAS_H / 2);

/**
 * 每条规则：从大图裁切区域 + 输出最大尺寸，输出必为 RGBA。
 * left, top, width, height 为源图裁切矩形；outMaxW, outMaxH 为校验脚本的 max 限制，输出会缩放到不超该尺寸。
 */
const CROP_RULES = [
  {
    name: 'rarity-topbar-v2',
    files: [
      'rarity-topbar-green-v2.png',
      'rarity-topbar-blue-v2.png',
      'rarity-topbar-purple-v2.png',
      'rarity-topbar-orange-v2.png',
    ],
    crop: { left: 0, top: 0, width: 1376, height: 56 },
    outMaxW: 320,
    outMaxH: 128,
  },
  {
    name: 'rarity-corner-v2',
    files: [
      'rarity-corner-green-v2.png',
      'rarity-corner-blue-v2.png',
      'rarity-corner-purple-v2.png',
      'rarity-corner-orange-v2.png',
    ],
    crop: { left: CANVAS_W - 128, top: 0, width: 128, height: 128 },
    outMaxW: 128,
    outMaxH: 128,
  },
  {
    name: 'alchemy-cauldron',
    files: ['ui-alchemy-cauldron.png'],
    crop: { left: cx - 128, top: cy - 128, width: 256, height: 256 },
    outMaxW: 256,
    outMaxH: 256,
  },
  {
    name: 'lottery-border-v2',
    files: ['ui-lottery-border-v2.png'],
    crop: { left: cx - 320, top: cy - 320, width: 640, height: 640 },
    outMaxW: 640,
    outMaxH: 640,
  },
  {
    name: 'lottery-sector-v2',
    files: ['ui-lottery-sector-v2.png'],
    crop: { left: cx - 160, top: cy - 160, width: 320, height: 320 },
    outMaxW: 320,
    outMaxH: 320,
  },
  {
    name: 'rarity-chest-glow',
    files: ['rarity-chest-glow.png', 'rarity-chest-glow-v2.png'],
    crop: { left: cx - 160, top: cy - 160, width: 320, height: 320 },
    outMaxW: 320,
    outMaxH: 320,
  },
  {
    name: 'lottery-effect-icons-v2',
    files: [
      'icon-lottery-benefit-fuyuan-v2.png',
      'icon-lottery-benefit-huiyuan-v2.png',
      'icon-lottery-harm-shaqi-v2.png',
      'icon-lottery-harm-xinmo-v2.png',
    ],
    crop: { left: cx - 64, top: cy - 64, width: 128, height: 128 },
    outMaxW: 128,
    outMaxH: 128,
  },
];

async function run() {
  const sharp = (await import('sharp')).default;

  console.log('Cropping xianxia assets from full canvas to control size (RGBA)...');
  console.log(`Asset root: ${assetRoot}`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const rule of CROP_RULES) {
    const { left, top, width, height } = rule.crop;
    for (const fileName of rule.files) {
      const filePath = path.join(assetRoot, fileName);
      if (!fs.existsSync(filePath)) {
        console.log(`  SKIP ${fileName} (missing)`);
        skip++;
        continue;
      }

      try {
        const meta = await sharp(filePath).metadata();
        const w = meta.width || CANVAS_W;
        const h = meta.height || CANVAS_H;
        if (w <= rule.outMaxW && h <= rule.outMaxH) {
          console.log(`  SKIP ${fileName} (already within ${rule.outMaxW}x${rule.outMaxH})`);
          skip++;
          continue;
        }
        const l = Math.max(0, Math.min(left, w - 1));
        const t = Math.max(0, Math.min(top, h - 1));
        const cw = Math.min(width, w - l);
        const ch = Math.min(height, h - t);

        if (cw <= 0 || ch <= 0) {
          console.log(`  FAIL ${fileName} (invalid crop region)`);
          fail++;
          continue;
        }

        const pipeline = sharp(filePath)
          .extract({ left: l, top: t, width: cw, height: ch })
          .ensureAlpha()
          .resize(rule.outMaxW, rule.outMaxH, { fit: 'inside' });

        const outBuf = await pipeline.png().toBuffer();
        const outMeta = await sharp(outBuf).metadata();
        fs.writeFileSync(filePath, outBuf);
        console.log(`  OK   ${fileName} -> ${outMeta.width}x${outMeta.height} rgba`);
        ok++;
      } catch (err) {
        console.log(`  FAIL ${fileName}  ${err.message}`);
        fail++;
      }
    }
  }

  console.log(`\nDone. OK: ${ok}, skipped: ${skip}, failed: ${fail}`);
  if (fail > 0) process.exitCode = 1;
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
