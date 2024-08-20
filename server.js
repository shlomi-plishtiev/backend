const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000

// ייבוא הפונקציה מהמנהל
const fetchMetadata = require('./actions/fetchMetadata')

// אמצעי עבודה עם JSON
app.use(express.json())

// הגדרת הנתיב
app.post('/api/fetch-metadata', fetchMetadata)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})