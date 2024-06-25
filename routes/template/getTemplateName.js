const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions.js')
const Joi = require('@hapi/joi')

const schema = Joi.object().keys({
  id: Joi.number().integer().required()
})

router.get('/', async function (req, res) {
  try {
    const validated = await schema.validate(req.query)
    if (!validated.error) {
      const queryResults = await functions.runQuery(`Select name from template where id = ${req.query.id} && deleted_at is null`)
      res.status(200).send({message: 'Success', data: queryResults})
    } else {
      res.status(406).send({message: validated.error.message})
    }
  } catch (error) {
    res.status(406).send({message: error.message})
  }
})

module.exports = router
