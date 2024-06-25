const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions.js')
const Joi = require('@hapi/joi')
const pool = require('../../db.js')

const schema = Joi.object().keys({
  visit_id: Joi.number().integer().required()
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
          await functions.runTransactionQuery(`Update form set deleted_at=CURRENT_TIMESTAMP where visit_id = ${req.body.visit_id} && deleted_at is null`, con)
          con.commit(function (err) {
            if (err) {
              con.rollback(function () {
                con.release()
              })
            } else {
              con.release()
            }
          })
          res.status(200).send({message: 'Instance Deleted Successfully'})
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
