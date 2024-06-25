const express = require('express')
const router = express.Router()
const Joi = require('@hapi/joi')
const functions = require('../../middleware/functions.js')

const schema = Joi.object().keys({
  section_id: Joi.number().integer().required()
})

router.post('/', async function (req, res) {
  try {
    const validated = await schema.validate(req.body)
    if (!validated.error) {
      const query = `Select u.id as uicomponent_id, u.name as uicomponent_name, u.statement as statement, u.type as uicomponent_type, u.properties
      as uicomponent_properties from ui_component u where u.section_id = ${req.body.section_id} && u.deleted_at is null`
      const queryResults = await (functions.runQuery(query))
      for (let i = 0; i < queryResults.length; i++) {
        queryResults[i].uicomponent_properties = JSON.parse(queryResults[i].uicomponent_properties)
        queryResults[i].obj = queryResults[i].uicomponent_properties
        delete queryResults[i].uicomponent_properties
        queryResults[i].isClick = queryResults[i].obj.isClick
        delete queryResults[i].obj.isClick
        queryResults[i].cols = queryResults[i].obj.cols
        delete queryResults[i].obj.cols
        queryResults[i].rows = queryResults[i].obj.rows
        delete queryResults[i].obj.rows
        queryResults[i].x = queryResults[i].obj.x
        delete queryResults[i].obj.x
        queryResults[i].y = queryResults[i].obj.y
        delete queryResults[i].obj.y
        queryResults[i].id = queryResults[i].obj.frontendid
        delete queryResults[i].obj.frontendid
        queryResults[i].obj.statement = queryResults[i].statement
        delete queryResults[i].statement
        queryResults[i].obj.uicomponent_name = queryResults[i].uicomponent_name
        delete queryResults[i].uicomponent_name
        queryResults[i].obj.type = queryResults[i].uicomponent_type
        delete queryResults[i].uicomponent_type
      }
      res.status(200).send({ message: 'Success', data: queryResults })
    } else {
      res.status(406).send({ message: validated.error.message })
    }
  } catch (error) {
    res.status(406).send({ message: error.message })
  }
})

module.exports = router
