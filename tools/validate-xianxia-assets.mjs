import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const assetRoot = path.join(repoRoot, 'assets', 'resources', 'art', 'generated', 'xianxia');

const rules = [
  {
    name: 'rarity-topbar-v2',
    files: [
      'rarity-topbar-green-v2.png',
      'rarity-topbar-blue-v2.png',
      'rarity-topbar-purple-v2.png',
      'rarity-topbar-orange-v2.png',
    ],
    maxWidth: 320,
    maxHeight: 128,
    requireAlpha: true,
    note: 'Expected a cropped top bar control, not a full-canvas export.',
  },
  {
    name: 'rarity-corner-v2',
    files: [
      'rarity-corner-green-v2.png',
      'rarity-corner-blue-v2.png',
      'rarity-corner-purple-v2.png',
      'rarity-corner-orange-v2.png',
    ],
    maxWidth: 128,
    maxHeight: 128,
    requireAlpha: true,
    note: 'Expected a cropped corner badge control.',
  },
  {
    name: 'alchemy-cauldron',
    files: ['ui-alchemy-cauldron.png'],
    maxWidth: 256,
    maxHeight: 256,
    requireAlpha: true,
    note: 'Expected a single cauldron sprite for a 148x148 slot.',
  },
  {
    name: 'lottery-border-v2',
    files: ['ui-lottery-border-v2.png'],
    maxWidth: 640,
    maxHeight: 640,
    requireAlpha: true,
    note: 'Expected a transparent wheel border with a hollow center.',
  },
  {
    name: 'lottery-sector-v2',
    files: ['ui-lottery-sector-v2.png'],
    maxWidth: 320,
    maxHeight: 320,
    requireAlpha: true,
    note: 'Expected a single 45-degree transparent wheel sector.',
  },
  {
    name: 'rarity-chest-glow',
    files: ['rarity-chest-glow.png', 'rarity-chest-glow-v2.png'],
    maxWidth: 320,
    maxHeight: 320,
    requireAlpha: true,
    note: 'Expected a standalone transparent glow overlay.',
  },
  {
    name: 'lottery-effect-icons-v2',
    files: [
      'icon-lottery-benefit-fuyuan-v2.png',
      'icon-lottery-benefit-huiyuan-v2.png',
      'icon-lottery-harm-shaqi-v2.png',
      'icon-lottery-harm-xinmo-v2.png',
    ],
    maxWidth: 128,
    maxHeight: 128,
    requireAlpha: true,
    note: 'Expected small transparent status icons.',
  },
];

function readPngInfo(filePath) {
  const buffer = fs.readFileSync(filePath);
  const pngSignature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== pngSignature) {
    throw new Error('Not a PNG file');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = -1;
  let bitDepth = -1;
  let hasTransparencyChunk = false;

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;

    if (type === 'IHDR') {
      width = buffer.readUInt32BE(dataStart);
      height = buffer.readUInt32BE(dataStart + 4);
      bitDepth = buffer.readUInt8(dataStart + 8);
      colorType = buffer.readUInt8(dataStart + 9);
    }
    if (type === 'tRNS') {
      hasTransparencyChunk = true;
    }
    if (type === 'IEND') {
      break;
    }

    offset = dataEnd + 4;
  }

  const alphaByColorType = colorType === 4 || colorType === 6;
  return {
    width,
    height,
    bitDepth,
    colorType,
    hasAlpha: alphaByColorType || hasTransparencyChunk,
    colorTypeLabel: describeColorType(colorType),
  };
}

function describeColorType(colorType) {
  switch (colorType) {
    case 0: return 'grayscale';
    case 2: return 'rgb';
    case 3: return 'indexed';
    case 4: return 'grayscale+alpha';
    case 6: return 'rgba';
    default: return `unknown(${colorType})`;
  }
}

function validateRule(rule) {
  const results = [];
  for (const fileName of rule.files) {
    const filePath = path.join(assetRoot, fileName);
    if (!fs.existsSync(filePath)) {
      results.push({ fileName, ok: false, reason: 'missing file' });
      continue;
    }

    const info = readPngInfo(filePath);
    const failures = [];

    if (info.width > rule.maxWidth || info.height > rule.maxHeight) {
      failures.push(`size ${info.width}x${info.height} exceeds ${rule.maxWidth}x${rule.maxHeight}`);
    }
    if (rule.requireAlpha && !info.hasAlpha) {
      failures.push(`missing alpha (${info.colorTypeLabel}, bitDepth ${info.bitDepth})`);
    }

    results.push({
      fileName,
      ok: failures.length === 0,
      reason: failures.join('; '),
      info,
    });
  }
  return results;
}

let hasFailures = false;
console.log('Validating xianxia runtime art files against local UI-control rules...');
console.log(`Asset root: ${assetRoot}`);

for (const rule of rules) {
  console.log(`\n[${rule.name}] ${rule.note}`);
  const results = validateRule(rule);
  for (const result of results) {
    if (result.ok) {
      console.log(`  OK   ${result.fileName}  ${result.info.width}x${result.info.height}  ${result.info.colorTypeLabel}`);
      continue;
    }
    hasFailures = true;
    if (result.info) {
      console.log(`  FAIL ${result.fileName}  ${result.info.width}x${result.info.height}  ${result.info.colorTypeLabel}  ${result.reason}`);
    } else {
      console.log(`  FAIL ${result.fileName}  ${result.reason}`);
    }
  }
}

if (hasFailures) {
  console.log('\nValidation failed. The files above are still not safe to bind as small UI controls.');
  process.exitCode = 1;
} else {
  console.log('\nValidation passed. The checked files are cropped and alpha-capable for UI use.');
}