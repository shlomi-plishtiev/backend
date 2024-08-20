const axios = require('axios')
const metascraper = require('metascraper')([
    require('metascraper-image')(),
    require('metascraper-title')(),
    require('metascraper-description')()
])
const { JSDOM } = require('jsdom')

async function fetchMetadata(req, res) {
    const { urls } = req.body

    // בדיקת אם urls הוא מערך תקין
    if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'Please provide a list of URLs' })
    }

    try {
        const metadataPromises = urls.map(async (url) => {
            try {
                const { data: html } = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                })
                const { window: { document } } = new JSDOM(html)
                const metadata = await metascraper({ html, url })

                return {
                    url,
                    title: metadata.title || 'No title found',
                    description: metadata.description || 'No description found',
                    image: metadata.image || 'No image found',
                }
            } catch (err) {
                console.error(`Error fetching metadata for ${url}: ${err.message}`)
                return {
                    url,
                    error: `Failed to retrieve metadata for ${url}`,
                }
            }
        })

        const metadataList = await Promise.all(metadataPromises)
        res.json(metadataList)
    } catch (err) {
        console.error('Failed to process the URLs:', err.message)
        res.status(500).json({ error: 'Failed to process the URLs' })
    }
}

module.exports = fetchMetadata
