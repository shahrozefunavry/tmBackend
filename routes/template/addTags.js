const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions.js')


router.post('/', async function (req,res) {
  try {
    let tagsObject = req.body
    tagsObject = tagsObject.filter(function (obj) {
      return obj.tags.length !== 0
    })
    for (let i = 0; i < tagsObject.length; i++) {
      let tagsString = tagsObject[i].tags.join()
      tagsString = tagsString.replace(/,/g,'"),("')
      tagsString = tagsString.replace(/\\/g, '\\\\')
      tagsString = tagsString.replace(/"/g, '\\"')
      tagsString = tagsString.replace(/'/g, '\\\'')
      const query = `Insert ignore into tags(title) values("${tagsString}")`
      // eslint-disable-next-line no-await-in-loop
      await functions.runQuery(query)
      for (let j = 0; j < tagsObject[i].tags.length; j++) {
        tagsObject[i].tags[j] = tagsObject[i].tags[j].replace(/,/g,'"),("')
        tagsObject[i].tags[j] = tagsObject[i].tags[j].replace(/\\/g, '\\\\')
        tagsObject[i].tags[j] = tagsObject[i].tags[j].replace(/"/g, '\\"')
        tagsObject[i].tags[j] = tagsObject[i].tags[j].replace(/'/g, '\\\'')
        const query2 = `Insert ignore into object_tags(object_id, tag_id, identifier) values(${tagsObject[i].id}, (Select id from tags where title =
          "${tagsObject[i].tags[j]}"), "${tagsObject[i].identifier}")`
        // eslint-disable-next-line no-await-in-loop
        await functions.runQuery(query2)
      }
    }
    res.status(200).send({message: 'Tags Inserted Successfully'})
  } catch (error) {
    console.error(error.message)
    res.status(406).send({message: error.message})
  }
})

module.exports = router
