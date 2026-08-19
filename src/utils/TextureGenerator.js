// Procedural texture generator using HTML5 Canvas.
// Generates high-quality textures dynamically without loading image files.

import * as THREE from 'three';

// Create a texture from a draw callback
const createTexture = (drawFn, width = 256, height = 256, repeatX = 1, repeatY = 1) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  drawFn(ctx, width, height);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  return texture;
};

// 1. Carbon Fiber Texture (micro basket-weave repeating pattern)
export const getCarbonFiberTexture = () => {
  return createTexture((ctx, w, h) => {
    // Base color
    ctx.fillStyle = '#151516';
    ctx.fillRect(0, 0, w, h);
    
    // Draw weaving pattern
    const size = 8;
    for (let x = 0; x < w; x += size) {
      for (let y = 0; y < h; y += size) {
        if ((x / size + y / size) % 2 === 0) {
          // Dark block
          ctx.fillStyle = '#0d0d0e';
          ctx.fillRect(x, y, size, size);
          // Highlights
          ctx.fillStyle = '#1e1e20';
          ctx.fillRect(x, y, size / 2, size / 2);
        } else {
          // Lighter block
          ctx.fillStyle = '#181819';
          ctx.fillRect(x, y, size, size);
          // Highlights
          ctx.fillStyle = '#222225';
          ctx.fillRect(x + size / 2, y + size / 2, size / 2, size / 2);
        }
      }
    }
  }, 32, 32, 25, 25);
};

// 2. Arctic Camo Texture (digital pixelated camo)
export const getArcticCamoTexture = () => {
  return createTexture((ctx, w, h) => {
    // Arctic base
    ctx.fillStyle = '#e8ecf1';
    ctx.fillRect(0, 0, w, h);
    
    const colors = [
      '#a0abbd', // Ice gray
      '#5c687a', // Slate blue-gray
      '#212836', // Navy shadow
      '#ffffff'  // Pure snow white
    ];
    
    // Digital noise/splotches
    for (let i = 0; i < 400; i++) {
      const cx = Math.floor(Math.random() * w);
      const cy = Math.floor(Math.random() * h);
      const sw = Math.floor(Math.random() * 24) + 12;
      const sh = Math.floor(Math.random() * 24) + 12;
      
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      
      // Draw pixelated blobs
      ctx.fillRect(
        Math.floor(cx / 8) * 8, 
        Math.floor(cy / 8) * 8, 
        Math.floor(sw / 8) * 8, 
        Math.floor(sh / 8) * 8
      );
    }
  }, 256, 256, 2, 2);
};

// 3. Damascus Steel Texture (wavy fluid-like organic lines)
export const getDamascusSteelTexture = () => {
  return createTexture((ctx, w, h) => {
    // Dark steel base
    ctx.fillStyle = '#1c1e24';
    ctx.fillRect(0, 0, w, h);
    
    ctx.lineWidth = 2.5;
    
    // Draw organic wavy line layers
    for (let i = -w; i < w * 2; i += 6) {
      ctx.beginPath();
      let first = true;
      
      for (let y = 0; y < h; y += 4) {
        // Build complex wave equation to mimic Perlin fluid noise flow
        const wave1 = Math.sin(y * 0.03 + i * 0.01) * 35;
        const wave2 = Math.cos(y * 0.08 - i * 0.02) * 12;
        const wave3 = Math.sin((y + i) * 0.05) * 8;
        const x = i + wave1 + wave2 + wave3;
        
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // Alternate steel shades
      const shade = Math.floor(Math.sin(i * 0.5) * 25) + 40;
      ctx.strokeStyle = `rgb(${shade}, ${shade + 4}, ${shade + 10})`;
      ctx.stroke();
    }
    
    // Add micro scratching highlights
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (let j = 0; j < 30; j++) {
      ctx.beginPath();
      const sx = Math.random() * w;
      const sy = Math.random() * h;
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.random() * 40 - 20, sy + Math.random() * 40 - 20);
      ctx.stroke();
    }
  }, 512, 512, 1, 1);
};

// 4. Cyberpunk Neon Circuits
export const getNeonGlitchTexture = () => {
  return createTexture((ctx, w, h) => {
    // Dark cyberpunk base
    ctx.fillStyle = '#05060b';
    ctx.fillRect(0, 0, w, h);
    
    // Neon lines grid background
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.04)';
    ctx.lineWidth = 1;
    const gridVal = 16;
    for (let g = 0; g < w; g += gridVal) {
      ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(w, g); ctx.stroke();
    }
    
    // Glowing circuits
    const circuitColors = [
      '#00f2fe', // Cyan glow
      '#ff007f', // Neon Pink
      '#9b51e0'  // Purple
    ];
    
    for (let c = 0; c < 24; c++) {
      const startX = Math.floor(Math.random() * w / 16) * 16;
      const startY = Math.floor(Math.random() * h / 16) * 16;
      
      ctx.strokeStyle = circuitColors[Math.floor(Math.random() * circuitColors.length)];
      ctx.lineWidth = Math.random() > 0.7 ? 3 : 1.5;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      let curX = startX;
      let curY = startY;
      const segments = Math.floor(Math.random() * 3) + 2;
      
      for (let s = 0; s < segments; s++) {
        const dir = Math.floor(Math.random() * 4); // 0:R, 1:L, 2:D, 3:U
        const dist = (Math.floor(Math.random() * 3) + 1) * 32;
        
        if (dir === 0) curX += dist;
        else if (dir === 1) curX -= dist;
        else if (dir === 2) curY += dist;
        else curY -= dist;
        
        ctx.lineTo(curX, curY);
      }
      ctx.stroke();
      
      // Node point at end of path
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(curX, curY, ctx.lineWidth * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw some tech text
    ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';
    ctx.font = '10px monospace';
    ctx.fillText('SYS.STATUS: ACTIVE', 20, 40);
    ctx.fillText('WEAPON_DEV_v2.09', 20, 55);
  }, 256, 256, 2, 2);
};
