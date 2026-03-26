const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')

const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb)  => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowed = ['.xlsx', '.xls']
  const ext     = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Only .xlsx and .xls files are allowed'), false)
}

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })