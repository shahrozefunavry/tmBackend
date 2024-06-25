const express = require('express')
const router = express.Router()
const {isNil, runTransactionQuery, runTransactionQueryWithParams} = require('../../middleware/functions')
const { instanceValidate } = require('../../middleware/instanceValidate')
const pool = require('../../db.js')
const zlib = require('zlib')

router.post('/', function (req, res) {
  pool.getConnection(function (err, con) {
    con.beginTransaction(async function (err) {
      if (err) {
        con.rollback(function () {
          con.release()
        })
        res.status(406).send({message: err.message})
      }
      try {
        const validated = await instanceValidate(req.body)
        const templateBlob = zlib.gzipSync(JSON.stringify(req.body))
        if (!validated.error) {
          if (!isNil(req.body.form_id)) {
            await runTransactionQuery(
              `Delete from form where id = ${req.body.form_id}`,
              con
            )
          }
          let query = `Insert into form(template, visit_type_id,patient_id,case_id,doc_id,visit_id,appointment_date) values(?, 0, ?, ?, ?, ?, ?)
          on duplicate key update template=values(template), visit_type_id=values(visit_type_id), patient_id=values(patient_id), 
          case_id=values(case_id), doc_id=values(doc_id), appointment_date=values(appointment_date)`
          const params = [templateBlob, req.body.chart_no, req.body.case_id, req.body.user_id, req.body.visit_id, req.body.appointment_date]
          console.log(query)
          let queryResults = await runTransactionQueryWithParams(query, con, params)
          console.log('query success')
          let dataCheck = false
          let form_id = queryResults.insertId
          // where no data is updated form 0
          if (isNil(form_id) || form_id==0) {
            console.log(req.body.visit_id)
            const formResults = await runTransactionQueryWithParams('select * from form where visit_id = ?', con, [req.body.visit_id])
            console.log(formResults)
            form_id = formResults[0].id
          }
          query =
                        'Insert into data(statement, form_id, section_id, uicomponent_id, data_index) values('
          for (let i = 0; i < req.body.sections.length; i++) {
            for (let j = 0; j < req.body.sections[i].dashboard.length; j++) {
              dataCheck = true
              let tempStatement =
                                req.body.sections[i].dashboard[j].obj.instanceStatement ||
                                req.body.sections[i].dashboard[j].obj.statement
              if (typeof tempStatement === 'string') {
                tempStatement = tempStatement.replace(/\\/g, '\\\\')
                tempStatement = tempStatement.replace(/"/g, '\\"')
                tempStatement = tempStatement.replace(/'/g, '\\\'')
              }
              query += `"${tempStatement}", ${form_id}, ${req.body.sections[i].section_id}, 
              ${req.body.sections[i].dashboard[j].uicomponent_id}, ${j + 1}),(`
            }
          }
          if (dataCheck) {
            query = query.slice(0, -2)
            console.log('running data query', query)
            await runTransactionQuery(query, con)
            console.log('query success')
          }
          let answerCheck = false
          queryResults = await runTransactionQuery(
            `Select id from data where form_id = ${form_id} order by data_index ASC`,
            con
          )
          query = 'Insert into answer(answer, data_id, answer_index) values('
          let dataIndex = 0
          for (let i = 0; i < req.body.sections.length; i++) {
            for (let j = 0; j < req.body.sections[i].dashboard.length; j++) {
              req.body.sections[i].dashboard[j].data_id = queryResults[dataIndex].id
              dataIndex++
              if (req.body.sections[i].dashboard[j].obj.answers) {
                for (
                  let k = 0; k < req.body.sections[i].dashboard[j].obj.answers.length; k++
                ) {
                  answerCheck = true
                  let tempAnswer =
                                      req.body.sections[i].dashboard[j].obj.answers[k].answer
                  if (typeof tempAnswer === 'string') {
                    tempAnswer = tempAnswer.replace(/\\/g, '\\\\')
                    tempAnswer = tempAnswer.replace(/"/g, '\\"')
                    tempAnswer = tempAnswer.replace(/'/g, '\\\'')
                  }
                  query += `"${tempAnswer}", ${
                    req.body.sections[i].dashboard[j].data_id
                  }, ${k + 1} ),(`
                }
              }
            }
          }
          query = query.slice(0, -2)
          if (answerCheck) {
            console.log('running answer query', query)

            await runTransactionQuery(query, con)
            console.log('query success')
          }
          con.commit(function (err) {
            if (err) {
              con.rollback(function () {
                con.release()
              })
            } else {
              con.release()
            }
          })
          res.status(200).send({
            message: 'Updated Instance Successfully',
          })
        } else {
          con.rollback(function () {
            con.release()
          })
          res.status(406).send({ message: validated.error.message })
        }
      } catch (error) {
        con.rollback(function () {
          con.release()
        })
        res.status(406).send({ message: error.message })
      }
    })
  })
})

module.exports = router
