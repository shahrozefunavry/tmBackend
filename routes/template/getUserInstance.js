const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions')
const supertest = require('supertest')
const api = supertest('http://localhost:' + process.env.PORT)
const lodash = require('lodash')
const Joi = require('@hapi/joi')
const ovadaApi = supertest(process.env.FD_API_URL)
const zlib = require('zlib')

const schema = Joi.object().keys({
  user_id: Joi.number().integer(),
  visit_id: Joi.number().integer(),
  appointment_id: Joi.number().integer().required(),
  speciality_id: Joi.number().integer().required(),
  visit_type_id: Joi.number().integer().required(),
  location_id: Joi.number().integer().required(),
  case_id: Joi.number().integer(),
})

router.post('/', async function (req, res) {
  try {
    const validated = await schema.validate(req.body)
    let defaultTemplate = {}
    if (!validated.error) {
      const query = `Select f.id as form_id, f.doc_id, f.patient_id, d.id as data_id, d.statement, d.tags as data_tags, d.section_id,
      d.uicomponent_id from form f left join data d on d.form_id = f.id where f.visit_id = ${req.body.visit_id}&& f.deleted_at is null`

      let queryResults = await functions.runQuery(query)

      const templateResults = await functions.runQuery(`Select template from form where visit_id = ${req.body.visit_id}&& form.deleted_at is null`)

      let template = {}
      if (templateResults[0]) {
        const decompressedData = zlib.gunzipSync(templateResults[0].template)
        template = JSON.parse(decompressedData.toString())
        template.form_id = queryResults[0].form_id
        const answersObject = lodash.uniqBy(queryResults, 'answer_id')
        lodash.remove(answersObject, function (n) {
          return functions.isNil(n.answer_id)
        })
        let dataIndex = 0
        for (let i = 0; i < template.sections.length; i++) {
          for (let j = 0; j < template.sections[i].dashboard.length; j++) {
            template.sections[i].dashboard[j].data_id = queryResults[dataIndex].data_id
            dataIndex++
          }
        }
        defaultTemplate = template
      } else {
        const reqObj = {
          user_id: req.body.user_id,
          appointment_id: req.body.appointment_id,
          speciality_id: req.body.speciality_id,
          visit_type_id: req.body.visit_type_id,
          facility_location_id: req.body.location_id,
          case_type_id: req.body.case_id,
        }

        const getUserTemplate = await ovadaApi.get('/get_user_template').set('Authorization', req.headers.authorization).send(reqObj)
        if (!(getUserTemplate.body && getUserTemplate.body.result && !functions.isNil(getUserTemplate.body.result.data))) {
          res.status(200).send({ data: [], message: 'No Template Stored' })
          return
        }
        // inner join template_user_permissions p on t.id = p .template_id where t.id in
        // (Select template_id from template_user_permissions where user_id = ${req.body.user_id} &&
        //   location_id = ${req.body.location_id} && speciality_id = ${req.body.speciality_id} && visit_type_id =${req.body.visit_type_id})`)
        queryResults = await functions.runQuery(`Select t.id as template_id, t.name as boundTemplateStatement, t.public, shared, t.default_columns, t.properties, t.created_by as user_id, p.is_default from template t
                inner join template_user_permissions p on t.id = p .template_id where t.id = ${getUserTemplate.body.result.data}
                && t.deleted_at is null`)


        if (queryResults.length) {
          defaultTemplate = queryResults[0]
          for (let i = 0; i < queryResults.length; i++) {
            if (!functions.isNil(queryResults[i].is_default) && queryResults[i].is_default !== 0) {
              defaultTemplate = queryResults[i]
            }
          }
          if (typeof(defaultTemplate.properties) === 'string') {
            defaultTemplate.properties = JSON.parse(defaultTemplate.properties)
          }
          defaultTemplate.tags = defaultTemplate.properties.tags
          defaultTemplate.hideTemplateName = defaultTemplate.properties.hideTemplateName
          defaultTemplate.pdf_type = defaultTemplate.properties.pdf_type

          defaultTemplate.pdfMarginLeft = defaultTemplate.properties.pdfMarginLeft
          defaultTemplate.pdfMarginRight = defaultTemplate.properties.pdfMarginRight
          defaultTemplate.pdfMarginBottom = defaultTemplate.properties.pdfMarginBottom
          defaultTemplate.pdfMarginTop = defaultTemplate.properties.pdfMarginTop
          defaultTemplate.pageSize = defaultTemplate.properties.pageSize
          if (defaultTemplate.properties.uiCompIds) {
            defaultTemplate.uiCompIds = defaultTemplate.properties.uiCompIds
          } else {
            defaultTemplate.uiCompIds = 0
          }
          if (defaultTemplate.properties.mappingKeyWords) {
            defaultTemplate.mappingKeyWords = defaultTemplate.properties.mappingKeyWords
          } else {
            defaultTemplate.mappingKeyWords = []
          }

          if (defaultTemplate.properties.allExternalSlugs) {
            defaultTemplate.allExternalSlugs = defaultTemplate.properties.allExternalSlugs
          } else {
            defaultTemplate.allExternalSlugs = []
          }
          if (defaultTemplate.properties.externalModules) {
            defaultTemplate.externalModules = defaultTemplate.properties.externalModules
          } else {
            defaultTemplate.externalModules = []
          }
          if (defaultTemplate.properties.templateName) {
            defaultTemplate.template_name = defaultTemplate.properties.templateName
          } else {
            defaultTemplate.template_name = defaultTemplate.boundTemplateStatement
          }
          delete defaultTemplate.properties
          const sectionsResponse = await api.post('/getSectionsByTemplate').set('Authorization', req.headers.authorization).send({
            template_id: defaultTemplate.template_id
          })
          if (sectionsResponse.status === 200) {
            defaultTemplate.sections = sectionsResponse.body.data
          } else {
            defaultTemplate.sections = []
          }
        }
      }


      if (Object.keys(defaultTemplate).length) {
        res.status(200).send({ data: defaultTemplate, message: 'Instance Retrieved Successfully' })
      } else {
        res.status(200).send({ data: [], message: 'Instance Retrieved Successfully' })
      }

      // res.status(200).send({data: [template], message:"Instance retrieved successfully"});
    } else {
      res.status(406).send({ message: validated.error.message })
    }
  } catch (error) {
    console.error(error)
    res.status(406).send({ message: error.message })
  }
})

module.exports = router
