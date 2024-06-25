const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions.js')
const Joi = require('@hapi/joi')
const pool = require('../../db.js')

const schema = Joi.object().keys({
  template_id: Joi.number().integer().required(),
  user_id: Joi.number().integer().required()
})

router.post('/', function (req, res) {
  pool.getConnection(function (err, con) {
    con.beginTransaction(async function (err) {
      if (err) {
        con.rollback(function () {
          con.release()
          // Failure
        })
        res.status(406).send({message: err.message})
      }
      try {
        const validated = await schema.validate(req.body)
        if (!validated.error) {
          let allCarrySections = []
          const allCarriedSections = []
          const allCarriedSectionsOriginals = []
          const sectionsResult = await functions.runTransactionQuery(`Select * from section where template_id = ${req.body.template_id} && deleted_at is null`, con)

          for (const section of sectionsResult) {
            section.properties = JSON.parse(section.properties)
            if (section.properties.carrySections && section.properties.carrySections.length) {
              allCarrySections = allCarrySections.concat(section.properties.carrySections)
            }
            if (section.properties.carryForward && section.properties.carryForward.isCarryForward) {
              allCarriedSections.push(section.properties.carryForward.sectionId)
              allCarriedSectionsOriginals.push(section.id)
            }
          }
          const sectionsToUpdateProperties = []
          const sectionsToUpdateIds = []
          if (allCarrySections.length) {
            const allSectionProperties = await functions.runTransactionQuery(`Select properties,id from section where id in (${allCarrySections.toString()})`, con)
            for (const section of allSectionProperties) {
              section.properties = JSON.parse(section.properties)
              delete section.properties.carryForward
              // section.properties = JSON.stringify(section.properties);
              // section.properties = section.properties.replace(/\\/g, "\\\\");
              // section.properties = section.properties.replace(/"/g, '\\"');
              // section.properties = section.properties.replace(/'/g, '\\"');
              sectionsToUpdateProperties.push(section.properties)
              sectionsToUpdateIds.push(section.id)
            }
          }


          if (allCarriedSections.length) {
            const allCarriedSectionProperties = await functions.runTransactionQuery(`Select properties,id from section where id in (${allCarriedSections.toString()})`, con)
            for (const section of allCarriedSectionProperties) {
              section.properties = JSON.parse(section.properties)
              for (const carrySection of allCarriedSectionsOriginals) {
                let index = section.properties.carrySections.indexOf(carrySection)
                while (index !== -1) {
                  section.properties.carrySections.splice(index, 1)
                  index = section.properties.carrySections.indexOf(carrySection)
                }
                sectionsToUpdateProperties.push(section.properties)
                sectionsToUpdateIds.push(section.id)
              }
            }
          }

          let updateQuery = 'Update section set properties = CASE id '
          for (let t = 0; t < sectionsToUpdateIds.length; t++) {
            sectionsToUpdateProperties[t] = JSON.stringify(sectionsToUpdateProperties[t])
            sectionsToUpdateProperties[t] = sectionsToUpdateProperties[t].replace(/\\/g, '\\\\')
            sectionsToUpdateProperties[t] = sectionsToUpdateProperties[t].replace(/"/g, '\\"')
            sectionsToUpdateProperties[t] = sectionsToUpdateProperties[t].replace(/'/g, '\\"')
            updateQuery += `WHEN ${sectionsToUpdateIds[t]} THEN "${sectionsToUpdateProperties[t]}" `
          }
          updateQuery += `END WHERE id in (${sectionsToUpdateIds.toString()})`
          if (sectionsToUpdateIds.length) {
            await functions.runTransactionQuery(updateQuery, con)
          }
          let query = `Update template set deleted_at = CURRENT_TIMESTAMP, deleted_by = ${req.body.user_id} where id = ${req.body.template_id}`
          await functions.runTransactionQuery(query, con)
          query = `Update section set deleted_at = CURRENT_TIMESTAMP, deleted_by = ${req.body.user_id} where template_id = ${req.body.template_id}`
          await functions.runTransactionQuery(query, con)
          query = `Update ui_component left join section on ui_component.section_id = section.id left join template on template.id = section.template_id
					 set ui_component.deleted_at = CURRENT_TIMESTAMP, ui_component.deleted_by = ${req.body.user_id} where template.id = ${req.body.template_id}`
          await functions.runTransactionQuery(query, con)
          con.commit(function (err) {
            if (err) {
              con.rollback(function () {
                con.release()
              })
            } else {
              con.release()
            }
          })
          res.status(200).send({message: 'Template Deleted Successfully'})
        } else {
          con.rollback(function () {
            con.release()
            // Failure
          })
          res.status(406).send({message: validated.error.message})
        }
      } catch (error) {
        con.rollback(function () {
          con.release()
          // Failure
        })
        res.status(406).send({message: error.message})
      }
    })
  })
})

module.exports = router
