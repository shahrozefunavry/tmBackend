const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions.js')

router.get('/', async function (req,res) {
  try {
    const query = 'Select * from section_type'
    const queryResults = await(functions.runQuery(query))
    res.status(200).send({message: 'Successfully retrieved section types', data: queryResults})
  } catch (error) {
    res.status(406).send({message: error.message})
  }
})

module.exports = router
