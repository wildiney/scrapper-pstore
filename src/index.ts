import puppeteer from 'puppeteer'
import autoScroll from './utils/puppeteer-autoscroll'
import fs from 'fs'

const search = encodeURI('agro');

(async () => {
  console.log('start')
  const browser = await puppeteer.launch({ headless: true, devtools: false })
  const page = await browser.newPage()
  await page.goto(`https://play.google.com/store/search?q=${search}&c=apps`, { waitUntil: 'networkidle2' })
  await autoScroll(page)
  const links = await page.evaluate(() => {
    const alink: any = Array.from(document.querySelectorAll('.wXUyZd a'))
    return alink.map((a: any) => a.href)
  })
  const cleanedLinks: any = new Set(links)
  console.log('Total:', cleanedLinks.size)
  const apps = []

  for (const link of cleanedLinks) {
    await page.goto(link, { waitUntil: 'networkidle2' })
    await page.waitForTimeout(1000)

    let title, channel, genre
    let reviews: string | number | undefined | null = 0
    let stars: string | number | undefined = 0
    let lastUpdate = null
    let installs: string | number | undefined = 0

    try { title = await page.$eval('.AHFaub span', (item) => { return item.textContent }) } catch (e) { console.log(e) }
    try {
      channel = await page.$eval('.qQKdcc span:first-child a', (item) => { return item.textContent })
    } catch (e) { console.log(e) }
    try {
      genre = await page.$eval('.qQKdcc span:last-child a', (item) => { return item.textContent })
    } catch (e) { console.log(e) }
    try {
      reviews = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(1) > c-wiz:nth-child(1) > div > div.D0ZKYe > div > div.sIskre > div.jdjqLd > div.dNLKff > c-wiz > span > span:nth-child(1)', (item) => { return item.textContent?.replace('.', '') })
    } catch (e) { console.log(e) }
    try {
      stars = await page.$eval('.BHMmbe', (item) => { return item.textContent?.replace(',', '.') })
    } catch (e) { console.log(e) }
    // lastUpdate
    try {
      lastUpdate = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(3) > div.W4P4ne > div.JHTxhe.IQ1z0d > div > div:nth-child(1) > span > div > span', (item) => { return item.textContent })
    } catch (e) { console.log(e) }
    if (lastUpdate === null) {
      try {
        lastUpdate = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(4) > div.W4P4ne > div.JHTxhe.IQ1z0d > div > div:nth-child(1) > span > div > span', (item) => { return item.textContent })
      } catch (e) { console.log(e) }
    }
    // installs
    try {
      installs = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(4) > div.W4P4ne > div.JHTxhe.IQ1z0d > div > div:nth-child(3) > span > div > span', (item) => { return item.textContent?.replace('+', '') })
    } catch (e) { console.log(e) }
    if (installs === 0) {
      try {
        installs = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(3) > div.W4P4ne > div.JHTxhe.IQ1z0d > div > div:nth-child(3) > span > div > span', (item) => { return item.textContent?.replace('+', '') })
      } catch (e) { console.log(e) }
    }
    const content = `${title};${channel};${genre};${reviews};${stars};${lastUpdate};${installs};${link}\n`
    fs.appendFileSync(`${decodeURI(search)}.csv`, content)
    apps.push({ title, channel, genre, reviews, stars, lastUpdate, installs, link })
  }
  console.log(apps)
  browser.close()
})()
