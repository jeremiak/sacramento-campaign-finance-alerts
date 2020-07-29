const cheerio = require('cheerio')
const http = require('axios')
const sheet = require('gsheetdb')

const creds = require('./google-creds.json')

const rssUrls =[
  "https://netfile.com/connect2/api/public/list/filing/rss/SAC/campaign.xml",
  "https://netfile.com/connect2/api/public/list/filing/rss/SCO/campaign.xml"
]
const db = new sheet({
  spreadsheetId: "1wkLI963DMOC-kHwbFO2nP26vfy3nIJLi_UlzGwJEoLs", // replace with spreadsheet id
  sheetName: "Recent filings", // replace with sheet name
  credentialsJSON: creds, // replace with JSON formatted credentials
})

async function parseRss(url) {
  let jurisdiction = url.includes('SAC') ? 'city' : 'county'
  const req = await http.get(url)
  if (req.status !== 200) throw new Error(req.status)

  const $ = cheerio.load(req.data, { xmlMode: true })
  const items = $('item').toArray().map(item => {
    const $item = $(item)
    return {
      guid: $item.find("guid").text(),
      link: $item.find("link").text(),
      title: $item.find("title").text(),
      description: $item.find("description").text(),
      updatedAt: $item.find("a10\\:updated").text(),
      jurisdiction,
    }
  })
  return items
}

async function main(url) {
  const rssItems = await parseRss(url)
  const data = await db.getData()
  const scrapeTime = new Date()

  const notExisting = rssItems.filter((rssItem) => {
    const existing = data.find((d) => d.values[0] === rssItem.guid)
    return !existing
  })

  const rowsToAdd = notExisting.map((rssItem) => [
    rssItem.guid,
    rssItem.link,
    rssItem.title,
    rssItem.description,
    rssItem.updatedAt,
    scrapeTime,
    rssItem.jurisdiction,
  ])

  if (rowsToAdd.length > 0) await db.insertRows(rowsToAdd)

  console.log(`Found ${rssItems.length} items in the RSS feed, ${notExisting.length} of which did not already exist (by guid)`)
}

rssUrls.forEach(url => main(url))