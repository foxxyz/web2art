#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { ArgumentParser, ArgumentDefaultsHelpFormatter, SUPPRESS } from 'argparse'
import 'fresh-console'
import { chromium } from 'playwright'
import { SamsungFrameClient as TV } from 'samsung-frame-connect'
import packageInfo from './package.json' with { type: 'json' }

// Parse arguments
// eslint-disable-next-line
const parser = new ArgumentParser({ add_help: true, description: packageInfo.description, formatter_class: ArgumentDefaultsHelpFormatter })
parser.add_argument('-v', { action: 'version', version: packageInfo.version })
parser.add_argument('--host', { help: 'TV Host or IP', required: true, default: SUPPRESS })
parser.add_argument('--url', { help: 'URL to capture', required: true, default: SUPPRESS })
parser.add_argument('--width', { help: 'Screenshot width to capture', default: 1920 })
parser.add_argument('--height', { help: 'Screenshot width to capture', default: 1080 })
parser.add_argument('--matte-type', { help: 'Type of matte to use when displaying', default: 'none', choices: ['none', 'modernthin', 'modern', 'modernwide', 'flexible', 'shadowbox', 'panoramic', 'triptych', 'mix', 'squares'] })
parser.add_argument('--matte-color', { help: 'Color of matte to use when displaying', choices: ['black', 'neutral', 'antique', 'warm', 'polar', 'sand', 'seafoam', 'sage', 'burgandy', 'navy', 'apricot', 'byzantine', 'lavender', 'redorange', 'skyblue', 'turquoise'] })
const args = parser.parse_args()

async function captureScreenshot({ url, path = 'screenshot.png', width, height }) {
    console.info('Launching browser...')
    const browser = await chromium.launch()
    console.info('Creating page...')
    const page = await browser.newPage({ viewport: { width, height } })
    console.info('Navigating to address...')
    await page.goto(url)
    console.info('Giving time to render...')
    await setTimeout(2000)
    console.info('Taking screenshot...')
    await page.screenshot({ path })
    console.info('Closing browser...')
    await browser.close()
    // eslint-disable-next-line
    console.success(`Screenshot successfully saved to ${path}!`)
    return path
}

async function sendToTV({ host, imagePath, matteType, matteColor }) {
    console.info('Connecting to TV...')
    const tv = new TV({ host, verbosity: 0 })
    await tv.connect()
    // eslint-disable-next-line
    console.success('Successfully connected to TV!')
    // Read the image
    const imageBuffer = await readFile(imagePath)
    // Upload and return the content ID
    console.info('Uploading image to TV...')
    const newImageID = await tv.upload(imageBuffer, {
        fileType: extname(imagePath).slice(1),
        matteType,
        matteColor,
    })
    // Set the TV to the new art
    console.info('Setting new art...')
    await tv.setCurrentArt({ id: newImageID })
    console.info('Closing connection to TV...')
    await tv.close()
}

const imagePath = await captureScreenshot(args)
await sendToTV({
    ...args,
    imagePath,
    matteType: args.matte_type,
    matteColor: args.matte_color
})

// eslint-disable-next-line
console.success('Done!')
