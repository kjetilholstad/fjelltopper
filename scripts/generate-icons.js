const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const iconsDir = path.join(__dirname, '..', 'public', 'icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Exact Lucide Mountain path (lucide-react v1.16.0)
// Source: node_modules/lucide-react/dist/esm/icons/mountain.mjs
const MOUNTAIN_PATH = 'm8 3 4 8 5-5 5 15H2L8 3z'

// 100x100 wrapper: parchment bg + mountain icon centered at 60% width
// 24px icon scaled 2.5x = 60px; offset = (100-60)/2 = 20
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#F7F4EF"/>
  <g transform="translate(20,20) scale(2.5)">
    <path d="${MOUNTAIN_PATH}" fill="none" stroke="#2D5016" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`

const svgBuffer = Buffer.from(svgContent)

async function generate() {
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'))
  console.log('Generated icon-192.png')

  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'))
  console.log('Generated icon-512.png')

  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'))
  console.log('Generated apple-touch-icon.png')

  console.log('All icons generated successfully.')
  console.log(`Mountain path used: ${MOUNTAIN_PATH}`)
}

generate().catch(err => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})
