const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const iconsDir = path.join(__dirname, '..', 'public', 'icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="#2D5016"/>
  <polygon points="50,20 80,75 20,75" fill="#E8E2D9"/>
  <polygon points="50,20 60,42 40,42" fill="#FFFFFF"/>
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
}

generate().catch(err => {
  console.error('Icon generation failed:', err)
  process.exit(1)
})
