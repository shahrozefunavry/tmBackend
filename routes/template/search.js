const express = require('express')
const router = express.Router()
const functions = require('../../middleware/functions')
const lodash = require('lodash')
const Joi = require('@hapi/joi')
const supertest = require('supertest')
const ovadaApi = supertest(process.env.FD_API_URL)

const schema = Joi.object().keys({
  type: Joi.string().required(),
  searchParams: Joi.string().required().allow(''),
  user_id: Joi.number().integer(),
  offset: Joi.number().integer(),
  users_array: Joi.array().required(),
})
router.post('/', async function (req, res) {
  try {
    const validated = await schema.validate(req.body)
    req.body.searchParams = req.body.searchParams.replace(/\\/g, '\\\\')
    req.body.searchParams = req.body.searchParams.replace(/"/g, '\\"')
    req.body.searchParams = req.body.searchParams.replace(/'/g, '\\\'')
    if (!validated.error) {
      const queryResults = {
        templates: [],
        sections: [],
      }
      req.body["user_id"] = 1

      const reqObj = {
        user_id: req.body.user_id,
      }
      // const facilitiesResult = await ovadaApi
      //   .get('/get_all_facilities_by_user_id')
      //   .set('Authorization', req.headers.authorization)
      //   .send(reqObj)

        const facilitiesResult ={body:{result:{data:[{facility_locations:[]}]}}};
      let facilityList = '-1,'
      if (facilitiesResult.body.result) {
        for (
          let i = 0; i < facilitiesResult.body.result.data[0].facility_locations.length; i++
        ) {
          facilityList +=
                        facilitiesResult.body.result.data[0].facility_locations[i].id + ','
        }
      }
      facilityList = facilityList.slice(0, -1)

      if (req.body.type === 'All' || req.body.type === 'template') {
        const query = `
    SELECT DISTINCT
      t2.id AS template_id,
      t2.name AS boundTemplateStatement,
      t2.public,
      shared,
      t2.default_columns,
      t2.properties,
      t2.created_by,
      t2.updated_at,
      t2.user_name
    FROM
      template t2
    LEFT JOIN object_tags o1 ON t2.id = o1.object_id
    LEFT JOIN tags tg1 ON o1.tag_id = tg1.id
    WHERE
      (t2.name LIKE "%${req.body.searchParams}%" OR (tg1.title = "${req.body.searchParams}" AND o1.identifier = "t"))
      AND (t2.created_by = ${req.body.user_id} OR t2.public = 1 OR t2.id IN (
        SELECT DISTINCT
          t3.id
        FROM
          template t3
        WHERE
          t3.deleted_at IS NULL
          AND (t3.created_by IN (${req.body.users_array.join(',')}) OR ${req.body.users_array[0]} = -1)
        UNION
        SELECT DISTINCT
          t4.id
        FROM
          template t4
        WHERE
          t4.deleted_at IS NULL
          AND (t4.created_by IN (${req.body.users_array.join(',')}) OR ${req.body.users_array[0]} = -1)
      ))
    ORDER BY t2.updated_at DESC
    LIMIT 10 OFFSET ${req.body.offset};
  `;
        const templatesObject = await functions.runQuery(query)
        const tempTemplatesObject = []
        for (let i = 0; i < templatesObject.length; i++) {
          if (typeof templatesObject[i].properties === 'string') {
            templatesObject[i].properties = JSON.parse(
              templatesObject[i].properties
            )
          }
          templatesObject[i].tags = templatesObject[i].properties.tags
          templatesObject[i].hideTemplateName =
                        templatesObject[i].properties.hideTemplateName
          templatesObject[i].pdf_type =
                        templatesObject[i].properties.pdf_type

          templatesObject[i].backgroundColor =
                        templatesObject[i].properties.backgroundColor
          templatesObject[i].bgColor = templatesObject[i].properties.bgColor
          templatesObject[i].bottomUIBorder =
                        templatesObject[i].properties.bottomUIBorder
          templatesObject[i].bottomUIPadding =
                        templatesObject[i].properties.bottomUIPadding
          templatesObject[i].fontColor =
                        templatesObject[i].properties.fontColor
          templatesObject[i].fontColorCode =
                        templatesObject[i].properties.fontColorCode
          templatesObject[i].fontFamily =
                        templatesObject[i].properties.fontFamily
          templatesObject[i].fontFamilyValue =
                        templatesObject[i].properties.fontFamilyValue
          templatesObject[i].leftUIBorder =
                        templatesObject[i].properties.leftUIBorder
          templatesObject[i].leftUIPadding =
                        templatesObject[i].properties.leftUIPadding
          templatesObject[i].lineSpacing =
                        templatesObject[i].properties.lineSpacing
          templatesObject[i].lineSpacingValue =
                        templatesObject[i].properties.lineSpacingValue
          templatesObject[i].rightUIBorder =
                        templatesObject[i].properties.rightUIBorder
          templatesObject[i].rightUIPadding =
                        templatesObject[i].properties.rightUIPadding
          templatesObject[i].topUIBorder =
                        templatesObject[i].properties.topUIBorder
          templatesObject[i].topUIPadding =
                        templatesObject[i].properties.topUIPadding
          templatesObject[i].uiBorders =
                        templatesObject[i].properties.uiBorders
          templatesObject[i].uiPaddings =
                        templatesObject[i].properties.uiPaddings

          templatesObject[i].pdfMarginLeft =
                        templatesObject[i].properties.pdfMarginLeft
          templatesObject[i].pdfMarginRight =
                        templatesObject[i].properties.pdfMarginRight
          templatesObject[i].pdfMarginBottom =
                        templatesObject[i].properties.pdfMarginBottom
          templatesObject[i].pdfMarginTop =
                        templatesObject[i].properties.pdfMarginTop
          templatesObject[i].pageSize = templatesObject[i].properties.pageSize
          if (templatesObject[i].properties.uiCompIds) {
            templatesObject[i].uiCompIds =
                            templatesObject[i].properties.uiCompIds
          } else {
            templatesObject[i].uiCompIds = 0
          }
          if (templatesObject[i].properties.mappingKeyWords) {
            templatesObject[i].mappingKeyWords =
                            templatesObject[i].properties.mappingKeyWords
          } else {
            templatesObject[i].mappingKeyWords = []
          }
          if (templatesObject[i].properties.allExternalSlugs) {
            templatesObject[i].allExternalSlugs =
                            templatesObject[i].properties.allExternalSlugs
          } else {
            templatesObject[i].allExternalSlugs = []
          }
          if (templatesObject[i].properties.externalModules) {
            templatesObject[i].externalModules =
                            templatesObject[i].properties.externalModules
          } else {
            templatesObject[i].externalModules = []
          }
          if (templatesObject[i].properties.templateName) {
            templatesObject[i].template_name =
                            templatesObject[i].properties.templateName
          } else {
            templatesObject[i].template_name =
                            templatesObject[i].boundTemplateStatement
          }
          if (templatesObject[i].properties.carryOriginalDeleted) {
            templatesObject[i].carryOriginalDeleted =
                            templatesObject[i].properties.carryOriginalDeleted
          } else {
            templatesObject[i].carryOriginalDeleted = []
          }
          if (templatesObject[i].properties.carryNewDeleted) {
            templatesObject[i].carryNewDeleted = JSON.parse(
              templatesObject[i].properties.carryNewDeleted
            )
          } else {
            templatesObject[i].carryNewDeleted = []
          }
          delete templatesObject[i].properties
          tempTemplatesObject.push(templatesObject[i])
        }
        if (templatesObject.length) {
          queryResults.templates = tempTemplatesObject
        }
      }
      if (req.body.type === 'All' || req.body.type === 'section') {
        const query = `
        WITH RECURSIVE cte (id, title, template_id, properties, parent_section_id, type, linked_component) AS (
          SELECT id, title, template_id, properties, parent_section_id, type, linked_component
          FROM section
          WHERE section.title LIKE '%${req.body.searchParams}%'
             OR section.id IN (
               SELECT o.object_id AS id
               FROM object_tags o
               INNER JOIN tags t ON o.tag_id = t.id
               WHERE t.title = '${req.body.searchParams}' AND o.identifier = 's'
             )
          UNION ALL
          SELECT s.id, s.title, s.template_id, s.properties, s.parent_section_id, s.type, s.linked_component
          FROM section s
          INNER JOIN cte ON s.parent_section_id = cte.id
        )
        SELECT DISTINCT
          cte.id AS section_id,
          t.updated_at,
          cte.title AS section_title,
          cte.template_id AS section_template,
          cte.properties AS options,
          cte.parent_section_id AS parentId,
          cte.type AS section_type,
          cte.linked_component,
          t.created_by,
          t.name AS boundTemplateStatement
        FROM cte
        INNER JOIN template t ON t.id = cte.template_id
        WHERE t.created_by = ${req.body.user_id}
          AND t.deleted_at IS NULL
          AND (t.created_by IN (${req.body.users_array.join(',')}) OR ${req.body.users_array[0]} = -1)
        ORDER BY t.updated_at DESC
        LIMIT 10 OFFSET ${req.body.offset};
      `;
      

        let sectionsObject = await functions.runQuery(query)
        sectionsObject = lodash.uniqBy(sectionsObject, 'section_id')
        lodash.remove(sectionsObject, function (n) {
          return (
            functions.isNil(n.doctor_id) &&
                        functions.isNil(n.facility_id) &&
                        n.created_by !== req.body.user_id
          )
        })
        const tempSectionsObject = []
        for (let i = 0; i < sectionsObject.length; i++) {
          sectionsObject[i].options = JSON.parse(sectionsObject[i].options)

          if (
            sectionsObject[i].options.tags.includes(req.body.searchParams) ||
                        sectionsObject[i].section_title.includes(req.body.searchParams)
          ) {
            sectionsObject[i].isMatch = true
          } else {
            sectionsObject[i].isMatch = false
          }
          sectionsObject[i].horizontalThemeCheck =
                        sectionsObject[i].options.horizontalThemeCheck
          delete sectionsObject[i].options.horizontalThemeCheck
          sectionsObject[i].verticalThemeCheck =
                        sectionsObject[i].options.verticalThemeCheck
          delete sectionsObject[i].options.verticalThemeCheck
          sectionsObject[i].isCarried = sectionsObject[i].options.isCarried
          delete sectionsObject[i].options.isCarried
          sectionsObject[i].leftSectionBorder =
                        sectionsObject[i].options.leftSectionBorder
          delete sectionsObject[i].options.leftSectionBorder
          sectionsObject[i].topSectionPadding =
                        sectionsObject[i].options.topSectionPadding
          delete sectionsObject[i].options.topSectionPadding
          sectionsObject[i].rightSectionBorder =
                        sectionsObject[i].options.rightSectionBorder
          delete sectionsObject[i].options.rightSectionBorder
          sectionsObject[i].topSectionBorder =
                        sectionsObject[i].options.topSectionBorder
          delete sectionsObject[i].options.topSectionBorder
          sectionsObject[i].bottomSectionBorder =
                        sectionsObject[i].options.bottomSectionBorder
          delete sectionsObject[i].options.bottomSectionBorder

          sectionsObject[i].fontFamily = sectionsObject[i].options.fontFamily
          delete sectionsObject[i].options.fontFamily
          sectionsObject[i].fontFamilyValue =
                        sectionsObject[i].options.fontFamilyValue
          delete sectionsObject[i].options.fontFamilyValue
          sectionsObject[i].bgColor = sectionsObject[i].options.bgColor
          delete sectionsObject[i].options.bgColor
          sectionsObject[i].backgroundColor =
                        sectionsObject[i].options.backgroundColor
          delete sectionsObject[i].options.backgroundColor
          sectionsObject[i].fontColor = sectionsObject[i].options.fontColor
          delete sectionsObject[i].options.fontColor
          sectionsObject[i].fontColorCode =
                        sectionsObject[i].options.fontColorCode
          delete sectionsObject[i].options.fontColorCode
          sectionsObject[i].lineSpacing = sectionsObject[i].options.lineSpacing
          delete sectionsObject[i].options.lineSpacing
          sectionsObject[i].lineSpacingValue =
                        sectionsObject[i].options.lineSpacingValue
          delete sectionsObject[i].options.lineSpacingValue

          sectionsObject[i].leftUIPadding =
                        sectionsObject[i].options.leftUIPadding
          delete sectionsObject[i].options.leftUIPadding
          sectionsObject[i].rightUIPadding =
                        sectionsObject[i].options.rightUIPadding
          delete sectionsObject[i].options.rightUIPadding
          sectionsObject[i].topUIPadding =
                        sectionsObject[i].options.topUIPadding
          delete sectionsObject[i].options.topUIPadding
          sectionsObject[i].bottomUIPadding =
                        sectionsObject[i].options.bottomUIPadding
          delete sectionsObject[i].options.bottomUIPadding
          sectionsObject[i].leftUIBorder =
                        sectionsObject[i].options.leftUIBorder
          delete sectionsObject[i].options.leftUIBorder
          sectionsObject[i].rightUIBorder =
                        sectionsObject[i].options.rightUIBorder
          delete sectionsObject[i].options.rightUIBorder
          sectionsObject[i].topUIBorder = sectionsObject[i].options.topUIBorder
          delete sectionsObject[i].options.topUIBorder
          sectionsObject[i].bottomUIBorder =
                        sectionsObject[i].options.bottomUIBorder
          delete sectionsObject[i].options.bottomUIBorder
          sectionsObject[i].is_table = sectionsObject[i].options.is_table
          delete sectionsObject[i].options.is_table
          sectionsObject[i].theme = sectionsObject[i].options.theme
          delete sectionsObject[i].options.theme
          sectionsObject[i].isFilled = sectionsObject[i].options.isFilled
          delete sectionsObject[i].options.isFilled
          sectionsObject[i].isSelected = sectionsObject[i].options.isSelected
          delete sectionsObject[i].options.isSelected
          sectionsObject[i].ui_name_count =
                        sectionsObject[i].options.ui_name_count
          delete sectionsObject[i].options.ui_name_count
          sectionsObject[i].selected_linked_component =
                        sectionsObject[i].options.selected_linked_component
          delete sectionsObject[i].options.selected_linked_component
          sectionsObject[i].defaultColumn =
                        sectionsObject[i].options.defaultColumn
          delete sectionsObject[i].options.defaultColumn
          sectionsObject[i].carrySections =
                        sectionsObject[i].options.carrySections
          delete sectionsObject[i].options.carrySections
          sectionsObject[i].mainPdf = sectionsObject[i].options.mainPdf
          delete sectionsObject[i].options.mainPdf
          sectionsObject[i].hideInInstance =
                        sectionsObject[i].options.hideInInstance
          delete sectionsObject[i].options.hideInInstance
          sectionsObject[i].selectedModules =
                        sectionsObject[i].options.selectedModules
          delete sectionsObject[i].options.selectedModules
          sectionsObject[i].hideSectionName =
                        sectionsObject[i].options.hideSectionName
          delete sectionsObject[i].options.hideSectionName
          sectionsObject[i].sectionBorders =
                        sectionsObject[i].options.sectionBorders
          delete sectionsObject[i].options.sectionBorders
          sectionsObject[i].uiBorders = sectionsObject[i].options.uiBorders
          delete sectionsObject[i].options.uiBorders
          sectionsObject[i].uiPaddings = sectionsObject[i].options.uiPaddings
          delete sectionsObject[i].options.uiPaddings
          sectionsObject[i].completeBorder =
                        sectionsObject[i].options.completeBorder
          delete sectionsObject[i].options.completeBorder
          sectionsObject[i].UIPaddings = sectionsObject[i].options.UIPaddings
          delete sectionsObject[i].options.UIPaddings
          sectionsObject[i].errors = sectionsObject[i].options.errors
          delete sectionsObject[i].options.errors
          sectionsObject[i].seperatePdf = sectionsObject[i].options.seperatePdf
          delete sectionsObject[i].options.seperatePdf
          sectionsObject[i].printNewPage =
                        sectionsObject[i].options.printNewPage
          delete sectionsObject[i].options.printNewPage
          sectionsObject[i].carryForward =
                        sectionsObject[i].options.carryForward
          delete sectionsObject[i].options.carryForward
          sectionsObject[i].isSubSection =
                        sectionsObject[i].options.isSubSection
          delete sectionsObject[i].options.isSubSection
          sectionsObject[i].secNo = sectionsObject[i].options.secNo
          delete sectionsObject[i].options.secNo
          sectionsObject[i].subsection = sectionsObject[i].options.subsection
          delete sectionsObject[i].options.subsection
          sectionsObject[i].tags = sectionsObject[i].options.tags
          delete sectionsObject[i].options.tags
          sectionsObject[i].id = sectionsObject[i].options.frontendid
          delete sectionsObject[i].options.frontendid
          sectionsObject[i].mapper = sectionsObject[i].options.mapper
          delete sectionsObject[i].options.mapper
          sectionsObject[i].boundSectionStatement =
                        sectionsObject[i].options.boundSectionStatement
          delete sectionsObject[i].options.boundSectionStatement
          tempSectionsObject.push(sectionsObject[i])
        }
        if (sectionsObject.length) {
          queryResults.sections = tempSectionsObject
        }
      }
      res.status(200).send({ message: 'Success', data: [queryResults] })
    } else {
      res.status(406).send({ message: validated.error.message })
    }
  } catch (error) {
    res.status(406).send({ message: error.message })
  }
})

module.exports = router