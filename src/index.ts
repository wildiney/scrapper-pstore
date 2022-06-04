import puppeteer from 'puppeteer'
import autoScroll from './utils/puppeteer-autoscroll'
import fs from 'fs'

const search = encodeURI('agronegocio');

(async () => {
  console.log('start')
  const browser = await puppeteer.launch({ headless: false, devtools: false })
  const page = await browser.newPage()
  await page.goto(`https://play.google.com/store/search?q=${search}&c=apps`, { waitUntil: 'networkidle2' })
  await autoScroll(page)
  const links = await page.evaluate(() => {
    const alink: any = Array.from(document.querySelectorAll('.Si6A0c.Gy4nib'))
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

    try { title = await page.$eval('h1', (item) => { return item.textContent }) } catch (e) { console.log(e) }
    try {
      channel = await page.$eval('.Vbfug.auoIOc a', (item) => { return item.textContent })
    } catch (e) { console.log('Error getting channel from ', title) }
    try {
      genre = await page.$eval('#yDmH0d > c-wiz.SSPGKf.Czez9d > div > div > div.tU8Y5c > div.wkMJlb.YWi3ub > div > div.qZmL0 > c-wiz:nth-child(2) > div > section > div > div.Uc6QCc > div > div > span', (item) => { return item.textContent })
    } catch (e) { console.log('Error getting genre from ', title) }
    try {
      reviews = await page.$eval('#yDmH0d > c-wiz.SSPGKf.Czez9d > div > div > div.tU8Y5c > div:nth-child(1) > div > div > c-wiz > div.hnnXjf > div.JU1wdd > div > div > div:nth-child(1) > div.g1rdde', (item) => { return item.textContent?.replace('.', '') })
      if (reviews?.indexOf('avaliações') === -1) {
        reviews = '0'
      }
    } catch (e) { console.log('Error getting reviews from ', title) }
    try {
      stars = await page.$eval('#yDmH0d > c-wiz.SSPGKf.Czez9d > div > div > div.tU8Y5c > div:nth-child(1) > div > div > c-wiz > div.hnnXjf > div.JU1wdd > div > div > div:nth-child(1) > div.ClM7O > div > div', (item) => { return item.textContent?.replace(',', '.').replace('star', '') })
    } catch (e) { console.log('Error getting stars from ', title) }
    // lastUpdate
    try {
      lastUpdate = await page.$eval('.xg1aie', (item) => { return item.textContent })
    } catch (e) { console.log(e) }
    if (lastUpdate === null) {
      try {
        lastUpdate = await page.$eval('#fcxH9b > div.WpDbMd > c-wiz > div > div.ZfcPIb > div > div > main > c-wiz:nth-child(4) > div.W4P4ne > div.JHTxhe.IQ1z0d > div > div:nth-child(1) > span > div > span', (item) => { return item.textContent })
      } catch (e) { console.log(e) }
    }
    // installs
    try {
      installs = await page.$eval('#yDmH0d > c-wiz.SSPGKf.Czez9d > div > div > div.tU8Y5c > div:nth-child(1) > div > div > c-wiz > div.hnnXjf > div.JU1wdd > div > div > div:nth-child(1) > div.ClM7O', (item) => { return item.textContent?.replace('+', '') })
      if (installs!.indexOf('star') > -1) {
        installs = await page.$eval('#yDmH0d > c-wiz.SSPGKf.Czez9d > div > div > div.tU8Y5c > div:nth-child(1) > div > div > c-wiz > div.hnnXjf > div.JU1wdd > div > div > div:nth-child(2) > div.ClM7O', (item) => { return item.textContent?.replace('+', '') })
      }
    } catch (e) { console.log('Error getting installs from ', title) }
    const content = `${title};${channel};${genre};${reviews};${stars};${lastUpdate};${installs};${link}\n`
    fs.appendFileSync(`${decodeURI(search)}.csv`, content)
    apps.push({ title, channel, genre, reviews, stars, lastUpdate, installs, link })
  }
  console.log(apps)
  browser.close()
})()
