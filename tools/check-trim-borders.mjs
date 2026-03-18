/**
 * 检查 xianxia 目录下所有 PNG 是否存在可裁切的透明边（内容外有多余透明像素）。
 * 运行：node tools/check-trim-borders.mjs
 * 依赖：sharp（与 crop-xianxia-assets 共用）
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const assetRoot = path.join(repoRoot, 'assets', 'resources', 'art', 'generated', 'xianxia');

/** 视为「有内容」的 alpha 阈值，小于等于此视为透明 */
const ALPHA_THRESHOLD = 10;

/**
 * 计算非透明内容的包围盒。raw 为 RGBA buffer，stride 每行字节数。
 * 返回 { minX, minY, maxX, maxY } 或 null（全透明/无 alpha）。
 */
function contentBounds(raw, width, height, channels = 4) {
  const stride = width * channels;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  const hasAlpha = channels === 4;
  const alphaOffset = 3;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * stride + x * channels;
      const a = hasAlpha ? raw[i + alphaOffset] : 255;
      if (a > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0 || maxY < 0) return null;
  return { minX, minY, maxX, maxY };
}

async function run() {
  const sharp = (await import('sharp')).default;

  const files = fs.readdirSync(assetRoot).filter((f) => f.endsWith('.png'));
  console.log(`Checking ${files.length} PNGs in xianxia for trimable transparent borders...`);
  console.log(`Asset root: ${assetRoot}\n`);

  const withBorder = [];
  const noAlpha = [];
  const errors = [];

  for (const fileName of files.sort()) {
    const filePath = path.join(assetRoot, fileName);
    try {
      const pipeline = sharp(filePath);
      const meta = await pipeline.metadata();
      const w = meta.width || 0;
      const h = meta.height || 0;
      if (w === 0 || h === 0) continue;

      const { data, info } = await pipeline
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const channels = info.channels || 4;
      const bounds = contentBounds(data, info.width, info.height, channels);
      if (!bounds) {
        noAlpha.push({ file: fileName, w, h });
        continue;
      }

      const contentW = bounds.maxX - bounds.minX + 1;
      const contentH = bounds.maxY - bounds.minY + 1;
      const trimLeft = bounds.minX;
      const trimTop = bounds.minY;
      const trimRight = w - 1 - bounds.maxX;
      const trimBottom = h - 1 - bounds.maxY;

      if (trimLeft > 0 || trimTop > 0 || trimRight > 0 || trimBottom > 0) {
        withBorder.push({
          file: fileName,
          w,
          h,
          content: `${contentW}x${contentH}`,
          crop: `left=${trimLeft} top=${trimTop} right=${trimRight} bottom=${trimBottom}`,
          suggest: `extract(${bounds.minX},${bounds.minY},${contentW},${contentH})`,
        });
      }
    } catch (err) {
      errors.push({ file: fileName, err: err.message });
    }
  }

  if (withBorder.length > 0) {
    console.log('--- 存在可裁切透明边的图片（未紧裁）---');
    for (const x of withBorder) {
      console.log(`  ${x.file}`);
      console.log(`    尺寸 ${x.w}x${x.h}  内容约 ${x.content}  透明边: ${x.crop}`);
      console.log(`    建议裁切: ${x.suggest}`);
    }
    console.log('');
  }

  if (noAlpha.length > 0) {
    console.log('--- 无有效透明通道或全透明（无法按透明边裁切）---');
    for (const x of noAlpha) {
      console.log(`  ${x.file}  ${x.w}x${x.h}`);
    }
    console.log('');
  }

  if (errors.length > 0) {
    console.log('--- 读取失败 ---');
    for (const x of errors) {
      console.log(`  ${x.file}  ${x.err}`);
    }
    console.log('');
  }

  const tight = files.length - withBorder.length - noAlpha.length - errors.length;
  console.log(`汇总: 共 ${files.length} 张，紧裁无多余透明边 ${tight} 张，未紧裁 ${withBorder.length} 张，无/全透明 ${noAlpha.length} 张，失败 ${errors.length} 张。`);
  if (withBorder.length > 0) process.exitCode = 1;
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
