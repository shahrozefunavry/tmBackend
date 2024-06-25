const express = require('express')
const router = express.Router()
const multer  = require('multer')
const fs = require('fs')
const path = require('path')
const relativePath = path.resolve(__dirname, '../../public/Images')

let imageFiles = [
]

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `${relativePath}`
    fs.mkdir(dir, err=>{
      if (err && err.code !== 'EEXIST') throw err
    })
    cb(null, `${dir}`)
  },
  filename: (req, file, cb) => {
    const temp = {images: ''}

    temp[file.fieldname] = file.fieldname + Date.now() + path.extname(file.originalname)
    imageFiles.push(temp)
    cb(null, imageFiles[imageFiles.length - 1][file.fieldname])
  }
})

const upload = multer({ // multer settings
  storage,
  fileFilter (req, file, callback) {
    const ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
      const err = new Error('Only images are allowed')
      err.status = 406
      return callback(err)
    } else {
      callback(null, true)
    }
  }
}).fields([{name: 'images'}])
router.post('/', upload, function (req, res) {
  try {
    if (req.files) {
      const pathToSend = '/Images'
      for (const item of imageFiles) {
        item['images'] = `${pathToSend}/${item['images']}`
      }

      res.status(200).send({message: 'Image Uploaded', data: [imageFiles]})
      imageFiles = []
    } else {
      res.status(406).send({message: 'No Image Uploaded'})
    }
  } catch (error) {
    res.status(406).send({message: error.message})
  }
})
module.exports = router
