import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const dir = 'assets/resources/art/角色/1K/一键分割-v1';
const resultPath = 'assets/resources/art/角色/1K/result.png';

async function main() {
  const resultImg = sharp(resultPath).ensureAlpha();
  const resultMeta = await sharp(resultPath).metadata();
  const resultBuf = await resultImg.raw().toBuffer();
  const rw = resultMeta.width, rh = resultMeta.height;

  // Check slice 1 alpha
  const s1 = await sharp(path.join(dir, '一键分割-v1_1.png')).ensureAlpha().raw().toBuffer();
  const s1meta = await sharp(path.join(dir, '一键分割-v1_1.png')).metadata();
  console.log('Slice 1 channels:', s1meta.channels, 'hasAlpha:', s1meta.hasAlpha);
  // Show corner pixels of slice 1
  console.log('Slice1 [0,0] RGBA:', s1[0], s1[1], s1[2], s1[3]);
  console.log('Slice1 [center] RGBA:', s1[(Math.floor(s1meta.height/2)*s1meta.width + Math.floor(s1meta.width/2))*4+0], s1[(Math.floor(s1meta.height/2)*s1meta.width + Math.floor(s1meta.width/2))*4+1], s1[(Math.floor(s1meta.height/2)*s1meta.width + Math.floor(s1meta.width/2))*4+2], s1[(Math.floor(s1meta.height/2)*s1meta.width + Math.floor(s1meta.width/2))*4+3]);
  
  // Show result pixel at a few positions
  for (const [x,y] of [[0,0],[100,100],[360,400],[360,640]]) {
    const ri = (y * rw + x) * 4;
    console.log(`Result [${x},${y}] RGBA:`, resultBuf[ri], resultBuf[ri+1], resultBuf[ri+2], resultBuf[ri+3]);
  }

  // Try matching with tolerance 30
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort((a,b) => {
    const na = parseInt(a.match(/_(\d+)\.png/)[1]);
    const nb = parseInt(b.match(/_(\d+)\.png/)[1]);
    return na - nb;
  });

  const TOL = 40;
  for (const file of files) {
    const slice = sharp(path.join(dir, file)).ensureAlpha();
    const meta = await sharp(path.join(dir, file)).metadata();
    const sw = meta.width, sh = meta.height;
    const sliceBuf = await slice.raw().toBuffer();

    // Find a "solid" pixel in the slice (alpha > 200, not near edge)
    let anchorX = -1, anchorY = -1;
    for (let ty = Math.floor(sh * 0.3); ty < Math.floor(sh * 0.7); ty++) {
      for (let tx = Math.floor(sw * 0.3); tx < Math.floor(sw * 0.7); tx++) {
        const si = (ty * sw + tx) * 4;
        if (sliceBuf[si+3] > 200) {
          anchorX = tx; anchorY = ty;
          break;
        }
      }
      if (anchorX >= 0) break;
    }
    if (anchorX < 0) { console.log(file, 'no solid anchor pixel'); continue; }
    
    const ar = sliceBuf[(anchorY * sw + anchorX) * 4];
    const ag = sliceBuf[(anchorY * sw + anchorX) * 4 + 1];
    const ab = sliceBuf[(anchorY * sw + anchorX) * 4 + 2];
    console.log(`\n${file} ${sw}x${sh} anchor[${anchorX},${anchorY}] RGB: ${ar},${ag},${ab}`);
    
    let found = false;
    for (let ry = 0; ry <= rh - sh && !found; ry++) {
      for (let rx = 0; rx <= rw - sw && !found; rx++) {
        const ri = ((ry + anchorY) * rw + (rx + anchorX)) * 4;
        if (Math.abs(resultBuf[ri] - ar) > TOL || 
            Math.abs(resultBuf[ri+1] - ag) > TOL || 
            Math.abs(resultBuf[ri+2] - ab) > TOL) continue;
        
        // Quick check 5 more points
        let ok = true;
        const pts = [
          [0,0], [sw-1,0], [0,sh-1], [sw-1,sh-1],
          [Math.floor(sw/3), Math.floor(sh/3)]
        ];
        for (const [tx,ty] of pts) {
          const si = (ty * sw + tx) * 4;
          const ri2 = ((ry+ty) * rw + (rx+tx)) * 4;
          if (sliceBuf[si+3] < 100) continue; // skip transparent
          if (Math.abs(sliceBuf[si] - resultBuf[ri2]) > TOL ||
              Math.abs(sliceBuf[si+1] - resultBuf[ri2+1]) > TOL ||
              Math.abs(sliceBuf[si+2] - resultBuf[ri2+2]) > TOL) {
            ok = false; break;
          }
        }
        if (!ok) continue;
        
        // Deeper check
        let goodCount = 0, badCount = 0;
        for (let cy = 0; cy < sh; cy += Math.max(1, Math.floor(sh/8))) {
          for (let cx = 0; cx < sw; cx += Math.max(1, Math.floor(sw/8))) {
            const si = (cy * sw + cx) * 4;
            if (sliceBuf[si+3] < 100) continue;
            const ri2 = ((ry+cy) * rw + (rx+cx)) * 4;
            const d = Math.abs(sliceBuf[si] - resultBuf[ri2]) +
                      Math.abs(sliceBuf[si+1] - resultBuf[ri2+1]) +
                      Math.abs(sliceBuf[si+2] - resultBuf[ri2+2]);
            if (d > 90) badCount++; else goodCount++;
          }
        }
        if (goodCount > badCount * 2 && goodCount > 5) {
          console.log(`  FOUND @ (${rx}, ${ry}) good=${goodCount} bad=${badCount}`);
          found = true;
        }
      }
    }
    if (!found) console.log(`  NOT FOUND`);
  }
}
main().catch(e => console.error(e));
