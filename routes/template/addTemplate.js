const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions')
const { templateValidate } = require('../../middleware/templateValidate')
const clone = require('clone')
const supertest = require('supertest')
const lodash = require('lodash')
const api = supertest('http://localhost:' + process.env.PORT)
const connection = require('../../db')
router.post('/', async function (req, res) {
  console.log("🚀 ~ req:", req.body.template_name)
  connection.getConnection(function (err, con) {
    con.beginTransaction(async function (err) {
      if (err) {
        con.rollback(function () {
          con.release()
          // Failure
        })
        res.status(406).send({message: err.message})
      }
      console.log("🚀 ~ req.body.user_name:", req.body.user_name)
      req.body["user_name"]= "shahroze"
      req.body["user_id"] = 1

      try {
        const validated = await templateValidate(req.body)
        if (!validated.error) {
          req.body.user_name = req.body.user_name.replace(/\\/g, '\\\\')
          req.body.user_name = req.body.user_name.replace(/"/g, '\\"')
          req.body.user_name = req.body.user_name.replace(/'/g, '\\\'')
          let tempName = req.body.boundTemplateStatement
          tempName = tempName.replace(/\\/g, '\\\\')
          tempName = tempName.replace(/"/g, '\\"')
          tempName = tempName.replace(/'/g, '\\\'')
          req.body.boundTemplateStatement = tempName
          const tagsObject = []
          let updateCheck = false

          if (!req.body.template_id) {
            req.body.template_id = null
          } else {
            updateCheck = true
          }
          let previousDoctorPermissions = []
          let previousFacilityPermissions = []
          const previousTemplatePermissions = await functions.runTransactionQuery(
            `Select * from template_user_permissions where template_id = ${req.body.template_id}`,
            con
          )
         
          await functions.runTransactionQuery(
            `Delete from template where id = ${req.body.template_id}`,
            con
          )

          const tempName2 = req.body.template_name
          let templateProperties = {
            tags: req.body.tags,
            uiCompIds: req.body.uiCompIds,
            carryOriginalDeleted: req.body.carryOriginalDeleted,
            carryNewDeleted: JSON.stringify(req.body.carryNewDeleted),
            hideTemplateName: req.body.hideTemplateName,

            backgroundColor: req.body.backgroundColor,
            bgColor: req.body.bgColor,
            bottomUIBorder: req.body.bottomUIBorder,
            bottomUIPadding: req.body.bottomUIPadding,
            fontColor: req.body.fontColor,
            fontColorCode: req.body.fontColorCode,
            fontFamily: req.body.fontFamily,
            fontFamilyValue: req.body.fontFamilyValue,
            leftUIBorder: req.body.leftUIBorder,
            leftUIPadding: req.body.leftUIPadding,
            lineSpacing: req.body.lineSpacing,
            lineSpacingValue: req.body.lineSpacingValue,
            rightUIBorder: req.body.rightUIBorder,
            rightUIPadding: req.body.rightUIPadding,
            topUIBorder: req.body.topUIBorder,
            topUIPadding: req.body.topUIPadding,
            uiBorders: req.body.uiBorders,
            uiPaddings: req.body.uiPaddings,

            templateName: tempName2,
            mappingKeyWords: req.body.mappingKeyWords,
            allExternalSlugs: req.body.allExternalSlugs,
            pdfMarginLeft: req.body.pdfMarginLeft,
            pdfMarginRight: req.body.pdfMarginRight,
            pdfMarginTop: req.body.pdfMarginTop,
            paSignatureCheck: req.body.paSignatureCheck,
            doctorSignatureCheck: req.body.doctorSignatureCheck,
            patientSignatureCheck: req.body.patientSignatureCheck,
            pdfMarginBottom: req.body.pdfMarginBottom,
            pdf_type: req.body.pdf_type,
            pageSize: req.body.pageSize,
          }
          // //;
          templateProperties = JSON.stringify(templateProperties)
          templateProperties = templateProperties.replace(/\\/g, '\\\\')
          templateProperties = templateProperties.replace(/"/g, '\\"')
          templateProperties = templateProperties.replace(/'/g, '\\"')
          console.log("🚀 ~ req.body.user_id:", req.body.user_id)

          const previousNames = await functions.runTransactionQuery(
            `Select name from template where created_by = ${req.body.user_id} && deleted_at is null`,
            con
          )
          for (const template of previousNames) {
            if (template.name === req.body.boundTemplateStatement) {
              throw { code: 'ER_DUP_ENTRY' }
            }
          }

          let query = `Insert into template(id, name, properties, default_columns, public, shared, created_by,updated_at,user_name) values (${req.body.template_id}, "${req.body.boundTemplateStatement}",
        "${templateProperties}", ${req.body.default_columns}, ${req.body.public}, ${req.body.shared}, ${req.body.user_id},CURRENT_TIMESTAMP,'${req.body.user_name}')`
          // //;
          console.log(query)
          let queryResults = await functions.runTransactionQuery(query, con)
          req.body.template_id = queryResults.insertId
         
          let permissionsQuery = 'Insert into template_user_permissions(id, user_id, template_id, location_id, speciality_id, visit_type_id, case_type, is_default) values('
          for (let i = 0; i < previousTemplatePermissions.length; i++) {
            permissionsQuery += `${previousTemplatePermissions[i].id}, ${previousTemplatePermissions[i].user_id}, ${previousTemplatePermissions[i].template_id}, ${previousTemplatePermissions[i].location_id}, ${previousTemplatePermissions[i].speciality_id}, ${previousTemplatePermissions[i].visit_type_id}, ${previousTemplatePermissions[i].case_type}, ${previousTemplatePermissions[i].is_default}),(`
          }

          if (previousTemplatePermissions.length) {
            permissionsQuery = permissionsQuery.slice(0, -2)
            await functions.runTransactionQuery(permissionsQuery, con)
          }

          tagsObject.push({
            tags: req.body.tags,
            id: queryResults.insertId,
            identifier: 't',
          })
          let sectionProperties
          const sectionMapper = {}
          const carryForwardOriginal = []
          const carryForwardCurrent = {}

          if (req.body.sections.length > 0) {
            
            let query = 'Insert into section(id, title, template_id, properties, parent_section_id, type, linked_component, created_by, updated_at) values('
            for (let i = 0; i < req.body.sections.length; i++) {
              let tempTitle = JSON.parse(
                JSON.stringify(req.body.sections[i].section_title)
              )
              console.log("🚀 ~ tempTitle:", tempTitle)
              tempTitle = tempTitle.replace(/\\/g, '\\\\')
              tempTitle = tempTitle.replace(/"/g, '\\"')
              tempTitle = tempTitle.replace(/'/g, '\\\'')
              if (!req.body.sections[i].section_id)
                req.body.sections[i].section_id = null
              req.body.sections[i].options.index = i
              sectionProperties = clone(req.body.sections[i].options)
              sectionProperties.ui_name_count =
                                req.body.sections[i].ui_name_count
              sectionProperties.isSelected = req.body.sections[i].isSelected
              sectionProperties.defaultColumn =
                                req.body.sections[i].defaultColumn
              sectionProperties.mainPdf = req.body.sections[i].mainPdf
              sectionProperties.hideInInstance =
                                req.body.sections[i].hideInInstance
              sectionProperties.selectedModules =
                                req.body.sections[i].selectedModules
              sectionProperties.horizontalThemeCheck =
                                req.body.sections[i].horizontalThemeCheck
              sectionProperties.verticalThemeCheck =
                                req.body.sections[i].verticalThemeCheck
              sectionProperties.isCarried = req.body.sections[i].isCarried
              sectionProperties.hideSectionName =
                                req.body.sections[i].hideSectionName
              sectionProperties.sectionBorders =
                                req.body.sections[i].sectionBorders
              sectionProperties.uiBorders = req.body.sections[i].uiBorders
              sectionProperties.completeBorder =
                                req.body.sections[i].completeBorder
              sectionProperties.leftSectionBorder =
                                req.body.sections[i].leftSectionBorder
              sectionProperties.topSectionPadding =
									req.body.sections[i].topSectionPadding
              sectionProperties.rightSectionBorder =
                                req.body.sections[i].rightSectionBorder
              sectionProperties.topSectionBorder =
                                req.body.sections[i].topSectionBorder
              sectionProperties.bottomSectionBorder =
                                req.body.sections[i].bottomSectionBorder
              sectionProperties.uiPaddings = req.body.sections[i].uiPaddings
              sectionProperties.fontColor = req.body.sections[i].fontColor
              sectionProperties.fontFamily = req.body.sections[i].fontFamily
              sectionProperties.fontColorCode =
                                req.body.sections[i].fontColorCode
              sectionProperties.fontFamilyValue =
                                req.body.sections[i].fontFamilyValue
              sectionProperties.lineSpacing = req.body.sections[i].lineSpacing
              sectionProperties.lineSpacingValue =
                                req.body.sections[i].lineSpacingValue
              sectionProperties.bgColor = req.body.sections[i].bgColor
              sectionProperties.backgroundColor =
                                req.body.sections[i].backgroundColor
              sectionProperties.leftUIPadding =
                                req.body.sections[i].leftUIPadding
              sectionProperties.rightUIPadding =
                                req.body.sections[i].rightUIPadding
              sectionProperties.topUIPadding =
                                req.body.sections[i].topUIPadding
              sectionProperties.bottomUIPadding =
                                req.body.sections[i].bottomUIPadding
              sectionProperties.leftUIBorder =
                                req.body.sections[i].leftUIBorder
              sectionProperties.rightUIBorder =
                                req.body.sections[i].rightUIBorder
              sectionProperties.topUIBorder = req.body.sections[i].topUIBorder
              sectionProperties.bottomUIBorder =
                                req.body.sections[i].bottomUIBorder
              sectionProperties.is_table = req.body.sections[i].is_table
              sectionProperties.errors = req.body.sections[i].errors
              sectionProperties.sectionClick =
                                req.body.sections[i].sectionClick
              sectionProperties.seperatePdf = req.body.sections[i].seperatePdf
              sectionProperties.printNewPage =
                                req.body.sections[i].printNewPage
              sectionProperties.requiredFilled =
                                req.body.sections[i].requiredFilled
              sectionProperties.selected_linked_component = 0
              sectionProperties.isSubSection =
                                req.body.sections[i].isSubSection
              sectionProperties.carryForward =
                                req.body.sections[i].carryForward
              sectionProperties.secNo = req.body.sections[i].secNo
              sectionProperties.subsection = req.body.sections[i].subsection
              sectionProperties.theme = req.body.sections[i].theme
              sectionProperties.isFilled = req.body.sections[i].isFilled
              sectionProperties.frontendid = req.body.sections[i].id
              sectionProperties.tags = req.body.sections[i].tags
              sectionProperties.mapper = req.body.sections[i].mapper
              sectionProperties.boundSectionStatement =
                                req.body.sections[i].boundSectionStatement
              sectionProperties.carrySections =
                                req.body.sections[i].carrySections
              sectionProperties = JSON.stringify(sectionProperties)
              sectionProperties = sectionProperties.replace(/\\/g, '\\\\')
              sectionProperties = sectionProperties.replace(/"/g, '\\"')
              sectionProperties = sectionProperties.replace(/'/g, '\\\'')
              if (req.body.sections[i].parentId === 0) {
                req.body.sections[i].parentId = null
              }
              req.body.sections[i].linked_component =
                                req.body.sections[i].linked_component || 0
              query += `${req.body.sections[i].section_id}, "${tempTitle}",
              ${req.body.template_id}, "${sectionProperties}", null, ${req.body.sections[i].section_type},
              ${req.body.sections[i].linked_component}, ${req.body.user_id}, CURRENT_TIMESTAMP),(`
            }

            query = query.slice(0, -2)
            query +=
                            'on duplicate key update title=values(title), template_id = values(template_id), properties = values(properties), parent_section_id = values(parent_section_id), type = values(type), linked_component = values(linked_component)'
            console.log(query)
            // //;
            queryResults = await functions.runTransactionQuery(query, con)
            // //;
            queryResults = await functions.runTransactionQuery(
              `Select id, properties from section where template_id = ${req.body.template_id} order by id ASC`,
              con
            )
            queryResults = functions.sortSections(queryResults)

            for (let i = 0; i < req.body.sections.length; i++) {
              sectionMapper[req.body.sections[i].id] = queryResults[i].id
              req.body.sections[i].section_id = queryResults[i].id
              req.body.sections[i].id = queryResults[i].id
              req.body.sections[i].parentId =
                                sectionMapper[req.body.sections[i].parentId] || null
              tagsObject.push({
                tags: req.body.sections[i].tags,
                id: req.body.sections[i].section_id,
                identifier: 's',
              })
            }

            query = 'Insert into section(id, title, template_id, properties, parent_section_id, type, linked_component, created_by, updated_at) values('
            for (let i = 0; i < req.body.sections.length; i++) {
              if (
                req.body.sections[i].carrySections &&
                                req.body.sections[i].carrySections.length &&
                                req.body.sections[i].isUpdated
              ) {
                // eslint-disable-next-line no-await-in-loop
                const updatedCarrySections = await functions.runTransactionQuery(
                  `select * from section where id in (${req.body.sections[
                    i
                  ].carrySections.toString()})`,
                  con
                )
                let updatedCarryQuery =
                                    'Update section set properties = CASE id '
                const updatedCarryIds = []
                for (let t = 0; t < updatedCarrySections.length; t++) {
                  let tempProperties = JSON.parse(
                    updatedCarrySections[t].properties
                  )
                  // //;
                  if (tempProperties.carryForward) {
                    tempProperties.carryForward.originalUpdated = true
                  }
                  tempProperties = JSON.stringify(tempProperties)
                  tempProperties = tempProperties.replace(/\\/g, '\\\\')
                  tempProperties = tempProperties.replace(/"/g, '\\"')
                  tempProperties = tempProperties.replace(/'/g, '\\\'')
                  updatedCarryQuery += `WHEN ${updatedCarrySections[t].id} THEN "${tempProperties}" `
                  updatedCarryIds.push(updatedCarrySections[t].id)
                }
                updatedCarryQuery += `END WHERE id in (${updatedCarryIds.toString()})`
                if (updatedCarryIds.length) {
                  // eslint-disable-next-line no-await-in-loop
                  await functions.runTransactionQuery(updatedCarryQuery, con)
                  // //;
                }
              }
              if (
                req.body.sections[i].carryForward &&
                                req.body.sections[i].carryForward.isCarryForward
              ) {
                carryForwardOriginal.push(
                  req.body.sections[i].carryForward.sectionId
                )
                if (!carryForwardCurrent[
                  `${req.body.sections[i].carryForward.sectionId}`
                ]) {
                  carryForwardCurrent[
                    `${req.body.sections[i].carryForward.sectionId}`
                  ] = []
                }
                carryForwardCurrent[
                  `${req.body.sections[i].carryForward.sectionId}`
                ].push(req.body.sections[i].section_id)
              }
              let tempTitle = JSON.parse(
                JSON.stringify(req.body.sections[i].section_title)
              )
              tempTitle = tempTitle.replace(/\\/g, '\\\\')
              tempTitle = tempTitle.replace(/"/g, '\\"')
              tempTitle = tempTitle.replace(/'/g, '\\\'')
              query += `${req.body.sections[i].section_id}, "${tempTitle}",
              ${req.body.template_id}, "${sectionProperties}", ${req.body.sections[i].parentId}, ${req.body.sections[i].section_type},
              ${req.body.sections[i].linked_component}, ${req.body.user_id}, CURRENT_TIMESTAMP),(`
            }
            query = query.slice(0, -2)
            console.log(query)
            query += ' on duplicate key update parent_section_id = values(parent_section_id)'
            await functions.runTransactionQuery(query, con)
            // carryForward
            const queryCarry = `select * from section where id in (${carryForwardOriginal.toString()})`
            // //
            // //
            let carrySections = []
            if (carryForwardOriginal.length) {
              // ;
              carrySections = await functions.runTransactionQuery(
                queryCarry,
                con
              )
            }
            const changeIdCarry = []
            const changeIdCarryIds = []
            for (let a = 0; a < carrySections.length; a++) {
              carrySections[a].properties = JSON.parse(
                carrySections[a].properties
              )
              // //;

              for (const id of carryForwardCurrent[carrySections[a].id]) {
                if (
                  carrySections[a].properties.carrySections &&
                                    !carrySections[a].properties.carrySections.includes(id)
                ) {
                  carrySections[a].properties.carrySections.push(id)
                  changeIdCarry.push(carrySections[a])
                  changeIdCarryIds.push(carrySections[a].id)
                }
                if (!carrySections[a].properties.carrySections) {
                  carrySections[a].properties['carrySections'] = []

                  carrySections[a].properties.carrySections.push(id)

                  changeIdCarry.push(carrySections[a])
                  changeIdCarryIds.push(carrySections[a].id)
                }
              }
            }

            query = 'Update section set properties = CASE id '
            for (let t = 0; t < changeIdCarry.length; t++) {
              let tempProperties = changeIdCarry[t].properties
              tempProperties = JSON.stringify(tempProperties)
              tempProperties = tempProperties.replace(/\\/g, '\\\\')
              tempProperties = tempProperties.replace(/"/g, '\\"')
              tempProperties = tempProperties.replace(/'/g, '\\\'')
              query += `WHEN ${changeIdCarry[t].id} THEN "${tempProperties}" `
            }
            query += `END WHERE id in (${changeIdCarryIds.toString()})`
            // //

            if (changeIdCarryIds.length) {
              await functions.runTransactionQuery(query, con)
            }

            query =
                            'Insert into ui_component(id, name, statement, type, properties, section_id, created_by, updated_at) values('
            let uiCheck = false
            // //;
            for (let i = 0; i < req.body.sections.length; i++) {
              for (let j = 0; j < req.body.sections[i].dashboard.length; j++) {
                req.body.sections[i].dashboard[
                  j
                ].obj.selected_linked_ui_component = 0
                req.body.sections[i].dashboard[j].obj.selected_linked_row = 0
                if (req.body.sections[i].dashboard[j].obj.options) {
                  for (
                    let k = 0; k < req.body.sections[i].dashboard[j].obj.options.length; k++
                  ) {
                    req.body.sections[i].dashboard[j].obj.options[
                      k
                    ].selected = false
                    // commented code is to empty the comments on save of a template
                    // if (req.body.sections[i].dashboard[j].obj.options[
                    //   k
                    // ].inputValue) {
                    //   req.body.sections[i].dashboard[j].obj.options[
                    //     k
                    //   ].inputValue = ''
                    //   req.body.sections[i].dashboard[j].obj.options[
                    //     k
                    //   ].instanceInputValue = ''
                    // }

                    if (
                      req.body.sections[i].dashboard[j].obj.options[k]
                        .selectedLinkSection &&
                                            req.body.sections[i].dashboard[j].obj.options[k].selectedLinkSection.id
                    ) {
                      req.body.sections[i].dashboard[j].obj.options[k].selectedLinkSection.id = sectionMapper[req.body.sections[i].dashboard[j].obj.options[k].selectedLinkSection.id]
                    }
                  }
                }
                uiCheck = true
                if (!req.body.sections[i].dashboard[j].uicomponent_id) {
                  req.body.sections[i].dashboard[j].uicomponent_id = null
                }
                req.body.sections[i].dashboard[j].obj.index = `${i}` + `${j}`

                if (req.body.sections[i].dashboard[j].obj.answers) {
                  for (
                    let z = 0; z < req.body.sections[i].dashboard[j].obj.answers.length; z++
                  ) {
                    if (
                      req.body.sections[i].dashboard[j].obj.answers[z].answer_id
                    ) {
                      delete req.body.sections[i].dashboard[j].obj.answers[z]
                        .answer_id
                    }
                  }
                }
                let uiProperties = clone(req.body.sections[i].dashboard[j].obj)
                uiProperties.cols = req.body.sections[i].dashboard[j].cols
                uiProperties.isClick =
                                    req.body.sections[i].dashboard[j].isClick
                uiProperties.oddRow = req.body.sections[i].dashboard[j].oddRow
                uiProperties.evenRow =
                                    req.body.sections[i].dashboard[j].evenRow
                uiProperties.rows = req.body.sections[i].dashboard[j].rows
                uiProperties.x = req.body.sections[i].dashboard[j].x
                uiProperties.y = req.body.sections[i].dashboard[j].y

                uiProperties.frontendid = req.body.sections[i].dashboard[j].id
                delete uiProperties.uicomponent_name
                delete uiProperties.statement
                delete uiProperties.type
                uiProperties = JSON.stringify(uiProperties)
                uiProperties = uiProperties.replace(/\\/g, '\\\\')
                uiProperties = uiProperties.replace(/"/g, '\\"')
                uiProperties = uiProperties.replace(/'/g, '\\\'')

                let tempUIStatement =
                                    req.body.sections[i].dashboard[j].obj.statement
                if (typeof tempUIStatement === 'string') {
                  tempUIStatement = tempUIStatement.replace(/\\/g, '\\\\')
                  tempUIStatement = tempUIStatement.replace(/"/g, '\\"')
                  tempUIStatement = tempUIStatement.replace(/'/g, '\\\'')
                }

                query += `${req.body.sections[i].dashboard[j].uicomponent_id}, "${req.body.sections[i].dashboard[j].obj.uicomponent_name}",
                "${tempUIStatement}", "${req.body.sections[i].dashboard[j].obj.type}", "${uiProperties}",
                ${req.body.sections[i].section_id}, ${req.body.user_id}, CURRENT_TIMESTAMP),(`
              }
            }

            if (uiCheck) {
              query = query.slice(0, -2)
              // //;
              await functions.runTransactionQuery(query, con)

              queryResults = await functions.runTransactionQuery(
                `select u.id, u.section_id, u.properties from ui_component u inner join section s on u.section_id = s.id
                  where template_id = ${req.body.template_id} order by u.id ASC`,
                con
              )
            }
            let k = 0

            for (let i = 0; i < req.body.sections.length; i++) {
              for (let j = 0; j < req.body.sections[i].dashboard.length; j++) {
                req.body.sections[i].dashboard[j].uicomponent_id =
                                    queryResults[k].id
                k++
                tagsObject.push({
                  tags: req.body.sections[i].dashboard[j].obj.tags,
                  id: req.body.sections[i].dashboard[j].uicomponent_id,
                  identifier: 'u',
                })
              }
            }
          }

          if (
            req.body.carryOriginalDeleted &&
                        req.body.carryOriginalDeleted.length
          ) {
            const deletedOriginalSections = await functions.runTransactionQuery(
              `Select * from section where id in (${req.body.carryOriginalDeleted.toString()})`,
              con
            )

            let deletedOriginalQuery = 'Update section set PROPERTIES = case id '
            for (let i = 0; i < deletedOriginalSections.length; i++) {
              let tempProperties = JSON.parse(
                deletedOriginalSections[i].properties
              )

              if (tempProperties.carryForward) {
                tempProperties.carryForward = null
              }
              tempProperties = JSON.stringify(tempProperties)

              tempProperties = tempProperties.replace(/\\/g, '\\\\')
              tempProperties = tempProperties.replace(/"/g, '\\"')
              tempProperties = tempProperties.replace(/'/g, '\\\'')
              deletedOriginalQuery += `WHEN ${deletedOriginalSections[i].id} THEN "${tempProperties}" `
            }
            deletedOriginalQuery += `END where id in (${req.body.carryOriginalDeleted.toString()})`
            // //;
            if (deletedOriginalSections.length) {
              await functions.runTransactionQuery(deletedOriginalQuery, con)
            }
          }

          if (
            req.body.carryNewDeleted &&
                        req.body.carryNewDeleted.length 
                        // &&
                        // req.body.carryNewDeleted[0] !== {}
          ) {
            const carryNewDeletedArray = []
            const carryNewDeletedLinked = []
            for (const obj of req.body.carryNewDeleted) {
              carryNewDeletedArray.push(obj.section_id)
              carryNewDeletedLinked.push(obj.linked_to)
            }

            const deletedNewSections = await functions.runTransactionQuery(
              `Select * from section where id in (${carryNewDeletedArray.toString()})`,
              con
            )

            let deletedNewQuery = 'Update section set PROPERTIES = case id '
            for (let i = 0; i < deletedNewSections.length; i++) {
              let tempProperties = JSON.parse(deletedNewSections[i].properties)
              if (
                tempProperties.carrySections &&
                                tempProperties.carrySections.length
              ) {
                for (const obj of req.body.carryNewDeleted) {
                  if (obj.section_id === deletedNewSections[i].id) {
                    tempProperties.carrySections = lodash.remove(
                      tempProperties.carrySections,
                      function (n) {
                        // //;

                        return n !== obj.linked_to
                      }
                    )
                  }
                }
              }
              tempProperties = JSON.stringify(tempProperties)

              tempProperties = tempProperties.replace(/\\/g, '\\\\')
              tempProperties = tempProperties.replace(/"/g, '\\"')
              tempProperties = tempProperties.replace(/'/g, '\\\'')
              deletedNewQuery += `WHEN ${deletedNewSections[i].id} THEN "${tempProperties}" `
            }
            deletedNewQuery += ` END where id in (${carryNewDeletedArray.toString()})`
            // //;
            if (deletedNewSections.length) {
              await functions.runTransactionQuery(deletedNewQuery, con)
            }
          }

          new Promise(function (resolve, reject) {
            api.post('/addTags')
              .send(tagsObject)
              .end(function (err, response) {
                if (err) reject(err)
                resolve(response)
              })
          })

          con.commit(function (err) {
            if (err) {
              con.rollback(function () {
                con.release()
                // Failure
              })
            } else {
              con.release()
              // Success
            }
          })

          const dataToSend = [req.body]
          if (!updateCheck) {
            res.status(200).send({
              message: 'Template Inserted Successfully',
              data: dataToSend,
            })
          } else {
            res.status(200).send({
              message: 'Template Updated Successfully',
              data: dataToSend,
            })
          }
        } else {
          con.rollback(function () {
            con.release()
            // Failure
          })
          res.status(406).send({ message: validated.error.message })
        }
      } catch (error) {
        con.rollback(function () {
          con.release()
          // Failure
        })
        if (error.code === 'ER_DUP_ENTRY')
          res.status(406).send({
            message: 'Template Already Exists. Kindly Change the Template Name.',
            sameName: true,
          })
        else res.status(406).send({ message: error.message })
      }
    })
  })
})

module.exports = router