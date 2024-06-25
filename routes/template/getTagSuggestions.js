const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions.js')
const lodash = require('lodash')
const Joi = require('@hapi/joi')

const schema = Joi.object().keys({
  tags: Joi.array().required()
})

router.post('/', async function (req, res) {
  try {
    const validated = await schema.validate(req.body)
    if (!validated.error) {
      let queryString = ''
      for (let i = 0; i < req.body.tags.length; i++) {
        queryString += `SELECT object_id FROM object_tags INNER JOIN tags ON tags.id = object_tags.tag_id WHERE tags.title = "${req.body.tags[i]}"`
        if (!(i === (req.body.tags.length - 1))) {
          queryString += ' AND object_tags.object_id IN('
        } else {
          for (let j = 0; j < req.body.tags.length - 1; j++) {
            queryString += ')'
          }
        }
      }
      const query = `SELECT DISTINCT t.id, t.title FROM tags t INNER JOIN object_tags o ON t.id = o.tag_id WHERE object_id IN(${queryString}) LIMIT 20`
      let queryResults = await functions.runQuery(query)
      for (let  i = 0; i < req.body.tags.length; i++) {
        queryResults = queryResults.filter(function (obj) {
          return obj.title !== req.body.tags[i]
        })
      }
      if (queryResults.length < 5) {
        const query = `SELECT DISTINCT t.id, t.title FROM tags t INNER JOIN object_tags o ON t.id = o.tag_id WHERE object_id IN(SELECT object_id FROM
            object_tags INNER JOIN tags ON tags.id = object_tags.tag_id WHERE tags.title = "${req.body.tags[req.body.tags.length - 1]}") LIMIT 20`
        let tempResults = await functions.runQuery(query)
        for (let  i = 0; i < req.body.tags.length; i++) {
          tempResults = tempResults.filter(function (obj) {
            return obj.title !== req.body.tags[i]
          })
        }
        queryResults.push(...tempResults)
        queryResults = lodash.uniqBy(queryResults, (e) =>{
          return e.id
        })
      }
      res.status(200).send({message: 'Success', data: [queryResults]})
    } else {
      res.status(406).send({message: validated.error.message})
    }
  } catch (error) {
    res.status(406).send({message: error.message})
  }
})

module.exports = router
