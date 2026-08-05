// scripts/generate-og.js
// 生成 OG image (1200x630) — Agent KG Hub 品牌主视觉
// 主题色板:Indigo-600 (#4F46E5) + Sky-500 (#0EA5E9) 渐变

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT = path.join(__dirname, '..', 'src', 'assets', 'images', 'default.png');

// 背景渐变 SVG(靛青 → 天空蓝)
const bgGradient = `
<defs>
  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#1E1B4B"/>
    <stop offset="50%" stop-color="#312E81"/>
    <stop offset="100%" stop-color="#0C4A6E"/>
  </linearGradient>
  <radialGradient id="glow" cx="20%" cy="20%" r="60%">
    <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="#4F46E5" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glow2" cx="80%" cy="80%" r="50%">
    <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0"/>
  </radialGradient>
  <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#4F46E5" stroke-width="0.5" stroke-opacity="0.15"/>
  </pattern>
</defs>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow2)"/>
`;

// 装饰节点(模拟知识图谱)
const nodeNetwork = `
<g opacity="0.35" stroke="#A5B4FC" stroke-width="1.2" fill="#6366F1">
  <!-- 一组随机连线的节点,模拟 KG 网络 -->
  <circle cx="180" cy="120" r="4"/>
  <circle cx="280" cy="80" r="3"/>
  <circle cx="240" cy="220" r="5"/>
  <circle cx="120" cy="280" r="3"/>
  <circle cx="1000" cy="100" r="4"/>
  <circle cx="1080" cy="200" r="3"/>
  <circle cx="950" cy="350" r="5"/>
  <circle cx="1100" cy="450" r="3"/>
  <circle cx="900" cy="520" r="4"/>
  <line x1="180" y1="120" x2="280" y2="80"/>
  <line x1="280" y1="80" x2="240" y2="220"/>
  <line x1="240" y1="220" x2="120" y2="280"/>
  <line x1="180" y1="120" x2="240" y2="220"/>
  <line x1="1000" y1="100" x2="1080" y2="200"/>
  <line x1="1080" y1="200" x2="950" y2="350"/>
  <line x1="950" y1="350" x2="1100" y2="450"/>
  <line x1="950" y1="350" x2="900" y2="520"/>
  <line x1="1100" y1="450" x2="900" y2="520"/>
</g>
`;

// 主文字内容
const textContent = `
<g font-family="Inter, ui-sans-serif, system-ui, -apple-system, sans-serif" fill="#F1F5F9">
  <!-- 顶部小徽章 -->
  <g transform="translate(80, 80)">
    <rect x="0" y="0" width="200" height="44" rx="22" fill="#4F46E5" fill-opacity="0.2" stroke="#4F46E5" stroke-width="1"/>
    <text x="100" y="29" font-size="16" font-weight="600" fill="#A5B4FC" text-anchor="middle">AGENT × KNOWLEDGE GRAPH</text>
  </g>

  <!-- 主标题 -->
  <text x="80" y="280" font-size="84" font-weight="800" fill="#FFFFFF">Agent KG Hub</text>

  <!-- 副标题 -->
  <text x="80" y="350" font-size="36" font-weight="500" fill="#E0E7FF">LLM Agent × 知识图谱</text>

  <!-- 描述 -->
  <text x="80" y="410" font-size="22" font-weight="400" fill="#CBD5E1">技术资源导航 + 关键概念深度解读</text>

  <!-- 三标签 -->
  <g transform="translate(80, 460)">
    <g>
      <rect x="0" y="0" width="140" height="36" rx="18" fill="#0EA5E9" fill-opacity="0.15" stroke="#0EA5E9" stroke-width="1"/>
      <text x="70" y="24" font-size="15" font-weight="600" fill="#7DD3FC" text-anchor="middle">GraphRAG</text>
    </g>
    <g transform="translate(150, 0)">
      <rect x="0" y="0" width="140" height="36" rx="18" fill="#0EA5E9" fill-opacity="0.15" stroke="#0EA5E9" stroke-width="1"/>
      <text x="70" y="24" font-size="15" font-weight="600" fill="#7DD3FC" text-anchor="middle">图智能体</text>
    </g>
    <g transform="translate(300, 0)">
      <rect x="0" y="0" width="160" height="36" rx="18" fill="#0EA5E9" fill-opacity="0.15" stroke="#0EA5E9" stroke-width="1"/>
      <text x="80" y="24" font-size="15" font-weight="600" fill="#7DD3FC" text-anchor="middle">KG 增强 LLM</text>
    </g>
  </g>

  <!-- 底部 URL -->
  <text x="80" y="565" font-size="18" font-weight="500" fill="#A5B4FC">lyubailin.github.io/agent-kg-hub</text>

  <!-- 装饰星标(右上角) -->
  <g transform="translate(1020, 100)">
    <circle r="30" fill="#4F46E5" fill-opacity="0.2" stroke="#4F46E5" stroke-width="2"/>
    <text y="8" font-size="32" font-weight="700" fill="#FFFFFF" text-anchor="middle">★</text>
  </g>
</g>
`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  ${bgGradient}
  ${nodeNetwork}
  ${textContent}
</svg>`;

async function main() {
  // 确保输出目录存在
  const dir = path.dirname(OUTPUT);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await sharp(Buffer.from(svg)).png().toFile(OUTPUT);

  const stats = fs.statSync(OUTPUT);
  console.log(`✅ OG image generated: ${OUTPUT} (${(stats.size / 1024).toFixed(1)} KB, ${WIDTH}x${HEIGHT})`);
}

main().catch((err) => {
  console.error('❌ Failed to generate OG image:', err);
  process.exit(1);
});
