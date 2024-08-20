const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const csurf = require('csurf')
const cookieParser = require('cookie-parser')
const cors = require('cors') 

const app = express()
const PORT = process.env.PORT || 5000

//  הגבלת קצב הבקשות ל-5 בקשות לשנייה
const limiter = rateLimit({
  windowMs: 1000, 
  max: 5, 
  message: 'Too many requests, please try again later.'
})

// הפעלת Cookie Parser
app.use(cookieParser())

// שימוש באמצעי אבטחה כמו Helmet
app.use(helmet())

// הפעלת Rate Limiting בכל הבקשות
app.use(limiter)

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}))
app.use(express.static(path.join(__dirname, 'public')));

// הגנת CSRF - יש להוסיף את התצורה המתאימה
app.use(csurf({ cookie: true }))

// ייבוא הפונקציה מהמנהל
const fetchMetadata = require('./actions/fetchMetadata')


app.use(express.json())

// הגדרת הנתיב לקבלת CSRF Token
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// הגדרת הנתיב לקבלת Metadata
app.post('/api/fetch-metadata', fetchMetadata)

// טיפול בשגיאות CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ message: 'Invalid CSRF token' })
  } else {
    next(err)
  }
})

// טיפול בשגיאות כלליות
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
