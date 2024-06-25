const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions.js')
const Joi = require('@hapi/joi')

const schema = Joi.object().keys({
  public: Joi.number().integer().required().valid(0, 1),
  shared: Joi.number().integer().required().valid(0, 1),
  template_id: Joi.number().integer().required()
})

router.post('/', async function (req, res) {
  try {
    const validated = await schema.validate(req.body)
    if (!validated.error) {
      const oldPermissions = await functions.runQuery(`Select shared from template where id = ${req.body.template_id}`)
      if (oldPermissions[0].shared && !req.body.shared) {
        await functions.runQuery(`Delete from doctor_templates where template_id = ${req.body.template_id}`)
        await functions.runQuery(`Delete from facility_templates where template_id = ${req.body.template_id}`)
      }
      const query = `Update template set public = ${req.body.public}, shared = ${req.body.shared} where id = ${req.body.template_id}`
      await functions.runQuery(query)
      res.status(200).send({message: 'Successfully Added Template Permissions'})
    } else {
      res.status(406).send({message: validated.error.message})
    }
  } catch (error) {
    res.status(406).send({message: error.message})
  }
})

module.exports = router
