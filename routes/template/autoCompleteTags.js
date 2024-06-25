const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions.js')
const Joi = require('@hapi/joi')
/* GET users listing. */

const schema = Joi.object().keys({
  tag_title: Joi.string().required()
})

router.post('/', async function (req, res) {
  try {
    const validated = await schema.validate(req.body)
    if (!validated.error) {
      const query = `Select id, title from tags where title like "%${req.body.tag_title}%"`
      const queryResults = await functions.runQuery(query)
      res.status(200).send({message: 'Success', data: queryResults})
    } else {
      res.status(406).send({message: validated.error.message})
    }
  } catch (error) {
    res.status(406).send({message: error.message})
  }
})

module.exports = router
