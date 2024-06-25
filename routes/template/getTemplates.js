const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions')
const Joi = require('@hapi/joi')
const supertest = require('supertest')
const ovadaApi = supertest(process.env.FD_API_URL)
const templateApi = process.env.TM_URL

const schema = Joi.object().keys({
  location_id: [Joi.array(), Joi.number().integer()],
  speciality_id: [Joi.array(), Joi.number().integer()],
  visit_id: [Joi.array(), Joi.number().integer()],
  case_type_id: [Joi.array(), Joi.number().integer()],
  user_id: Joi.number().integer().required(),
  page: Joi.number().integer(),
  per_page: Joi.number().integer(),
  name: Joi.string().allow(''),
  pagination: Joi.number().integer().valid(0, 1),
  filter: Joi.number().integer().valid(0, 1),
  order: Joi.string(),
})
router.get('/', async function (req, res) {
  try {
    const locationCount = req.query.location_id.length
    const specialityCount = req.query.speciality_id.length
    const caseTypeCount = req.query.case_type_id.length
    const visitCount = req.query.visit_id.length
    if (!req.query.visit_id || req.query.visit_id.length === 0) {
      req.query.visit_id = [-1]
    }
    if (!req.query.location_id || req.query.location_id.length === 0) {
      req.query.location_id = [-1]
    }
    if (!req.query.speciality_id || req.query.speciality_id.length === 0) {
      req.query.speciality_id = [-1]
    }
    if (!req.query.case_type_id || req.query.case_type_id.length === 0) {
      req.query.case_type_id = [-1]
    }
    if (!req.query.name || !req.query.filter) {
      req.query.name = ''
    }
    if (!req.query.order) {
      req.query.order = 'ASC'
    }
    const validated = await schema.validate(req.query)
    if (!validated.error) {
      const reqObj = {
        user_id: req.query.user_id,
      }
      // await ovadaApi
      //   .get('/get_all_facilities_by_user_id')
      //   .set('Authorization', req.headers.authorization)
      //   .send(reqObj)
      if (req.query.pagination) {
        if (!req.query.page) {
          req.query.page = 1
        }
        if (!req.query.per_page) {
          req.query.per_page = 10
        }

        const offset = (req.query.per_page || 10) * (req.query.page - 1)
        const query = `SELECT  count(distinct location_id) as locations,
                count(distinct speciality_id) as specialities, count(distinct visit_type_id) as visit_types,
                count(distinct case_type) as case_types, template_id, user_id, is_default, t2.name as name from
                template t2
  		          inner join template_user_permissions p1 on t2.id = p1.template_id
  		          where (p1.user_id = ${
  req.query.user_id
} || p1.user_id = 0 ) &&(t2.name like '%${req.query.name}%')
                && (p1.speciality_id in (${req.query.speciality_id.toString()})||${
  req.query.speciality_id[0]
}=-1)
                && (p1.location_id in (${req.query.location_id.toString()})||${
  req.query.location_id[0]
}=-1)
                && (p1.case_type in (${req.query.case_type_id.toString()})||${
  req.query.case_type_id[0]
}=-1)
                && (p1.visit_type_id in (${req.query.visit_id.toString()})||${
  req.query.visit_id[0]
}=-1)
                && t2.deleted_at is null && p1.deleted_at is null  group by template_id
                having locations = ${locationCount} || ${locationCount}=0
                && specialities = ${specialityCount} || ${specialityCount}=0
                && visit_types = ${visitCount} || ${visitCount}=0
                && case_types = ${caseTypeCount} || ${caseTypeCount}=0 LIMIT ${
  req.query.per_page
} offset ${offset}`
        const templatesSize =
                    await functions.runQuery(`select count(*) from (SELECT  count(distinct location_id) as locations,
                    count(distinct speciality_id) as specialities, count(distinct visit_type_id) as visit_types,
                    count(distinct case_type) as case_types, template_id, user_id, is_default, t2.name as name from
                    template t2
      		          inner join template_user_permissions p1 on t2.id = p1.template_id
      		          where (p1.user_id = ${
  req.query.user_id
} || p1.user_id = 0 ) &&(t2.name like '%${req.query.name}%')
                    && (p1.speciality_id in (${req.query.speciality_id.toString()})||${
  req.query.speciality_id[0]
}=-1)
                    && (p1.location_id in (${req.query.location_id.toString()})||${
  req.query.location_id[0]
}=-1)
                    && (p1.case_type in (${req.query.case_type_id.toString()})||${
  req.query.case_type_id[0]
}=-1)
                    && (p1.visit_type_id in (${req.query.visit_id.toString()})||${
  req.query.visit_id[0]
}=-1)
                    && t2.deleted_at is null && p1.deleted_at is null  group by template_id
                    having locations = ${locationCount} || ${locationCount}=0
                    && specialities = ${specialityCount} || ${specialityCount}=0
                    && visit_types = ${visitCount} || ${visitCount}=0
                    && case_types = ${caseTypeCount} || ${caseTypeCount}=0) as countTemplates`)
        const templatesObject = await functions.runQuery(query)
        const result = { data: templatesObject }
        result.from = req.query.per_page * (req.query.page - 1) + 1
        result.to = req.query.per_page * req.query.page
        result.last_page = Math.ceil(
          templatesSize[0].count / req.query.per_page
        )
        result.current_page = parseInt(req.query.page)
        result.total = templatesSize[0].count
        if (result.to > result.total) {
          result.to = result.total
        }
        if (result.from > result.total) {
          result.from = result.total
        }
        result.first_page_url = `${templateApi}/getTemplates?page=1&&pagination=1`
        result.last_page_url = `${templateApi}/getTemplates?page=${result.last_page}&&pagination=1`
        if (result.current_page + 1 <= result.last_page) {
          result.next_page_url = `${templateApi}/getTemplates?page=${
            result.current_page + 1
          }&&pagination=1`
        } else {
          result.next_page_url = null
        }
        if (result.current_page > 1) {
          result.prev_page_url = `${templateApi}/getTemplates?page=${
            result.current_page - 1
          }&&pagination=1`
        } else {
          result.prev_page_url = null
        }
        result.path = `${templateApi}/getTemplates`
        res
          .status(200)
          .send({ message: 'Template Listing', result, status: true })
      } else {
        const query = `
  		          Select distinct t2.id as template_id, t2.name as name from template t2
  		          inner join template_user_permissions p1 on t2.id = p1.template_id
  		          where  ((p1.user_id = ${
  req.query.user_id
} || p1.user_id = 0 ) &&(t2.name like '%${
  req.query.name
}%')&& (p1.speciality_id = ${req.query.speciality_id}||${
  req.query.speciality_id
}=-1) && (p1.location_id = ${req.query.location_id}||${
  req.query.location_id
}=-1)  && (p1.case_type in (${req.query.case_type_id.toString()})||${
  req.query.case_type_id[0]
}=-1)
  							&& (p1.visit_type_id in (${req.query.visit_id.toString()})||${
  req.query.visit_id[0]
}=-1)

              )  &&t2.deleted_at is null && p1.deleted_at is null order by t2.id ${
  req.query.order
}`
        const templatesObject = await functions.runQuery(query)
        const result = { data: templatesObject }
        res.status(200)
          .send({ message: 'Template Listing', result, status: true })
      }
    } else {
      res.status(406).send({ message: validated.error.message, status: false })
    }
  } catch (error) {
    res.status(406).send({ message: error.message, status: false })
  }
})

module.exports = router