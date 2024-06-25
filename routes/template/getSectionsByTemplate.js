const express = require('express')
const router = express.Router()
const lodash = require('lodash')
const Joi = require('@hapi/joi')
const clone = require('clone')
const functions = require('../../middleware/functions.js')

const schema = Joi.object().keys({
  template_id: Joi.number().integer().required(),
})
router.post('/', async function (req, res) {
  try {
    const validated = await schema.validate(req.body)
    if (!validated.error) {
      const templateDetails =
                await functions.runQuery(`Select t1.id as template_id, t1.name as boundTemplateStatement, t1.public, shared, t1.default_columns, t1.properties, t1.created_by from template t1
      where t1.id = ${req.body.template_id} &&t1.deleted_at is null`)
      if (templateDetails[0]) {
        if (typeof templateDetails[0].properties === 'string') {
          templateDetails[0].properties = JSON.parse(
            templateDetails[0].properties
          )
        }

        templateDetails[0].tags = templateDetails[0].properties.tags
        templateDetails[0].hideTemplateName =
                    templateDetails[0].properties.hideTemplateName
        templateDetails[0].pdf_type =
                    templateDetails[0].properties.pdf_type

        templateDetails[0].pdfMarginLeft =
                    templateDetails[0].properties.pdfMarginLeft
        templateDetails[0].pdfMarginRight =
                    templateDetails[0].properties.pdfMarginRight
        templateDetails[0].pdfMarginBottom =
                    templateDetails[0].properties.pdfMarginBottom
        templateDetails[0].pdfMarginTop =
                    templateDetails[0].properties.pdfMarginTop
        templateDetails[0].pageSize = templateDetails[0].properties.pageSize
        templateDetails[0].backgroundColor =
                    templateDetails[0].properties.backgroundColor
        templateDetails[0].bgColor = templateDetails[0].properties.bgColor
        templateDetails[0].bottomUIBorder =
                    templateDetails[0].properties.bottomUIBorder
        templateDetails[0].bottomUIPadding =
                    templateDetails[0].properties.bottomUIPadding
        templateDetails[0].fontColor = templateDetails[0].properties.fontColor
        templateDetails[0].fontColorCode =
                    templateDetails[0].properties.fontColorCode
        templateDetails[0].fontFamily =
                    templateDetails[0].properties.fontFamily
        templateDetails[0].fontFamilyValue =
                    templateDetails[0].properties.fontFamilyValue
        templateDetails[0].leftUIBorder =
                    templateDetails[0].properties.leftUIBorder
        templateDetails[0].leftUIPadding =
                    templateDetails[0].properties.leftUIPadding
        templateDetails[0].lineSpacing =
                    templateDetails[0].properties.lineSpacing
        templateDetails[0].lineSpacingValue =
                    templateDetails[0].properties.lineSpacingValue
        templateDetails[0].rightUIBorder =
                    templateDetails[0].properties.rightUIBorder
        templateDetails[0].rightUIPadding =
                    templateDetails[0].properties.rightUIPadding
        templateDetails[0].topUIBorder =
                    templateDetails[0].properties.topUIBorder
        templateDetails[0].topUIPadding =
                    templateDetails[0].properties.topUIPadding
        templateDetails[0].uiBorders = templateDetails[0].properties.uiBorders
        templateDetails[0].uiPaddings =
                    templateDetails[0].properties.uiPaddings

        if (templateDetails[0].properties.uiCompIds) {
          templateDetails[0].uiCompIds =
                        templateDetails[0].properties.uiCompIds
        } else {
          templateDetails[0].uiCompIds = 0
        }
        if (templateDetails[0].properties.mappingKeyWords) {
          templateDetails[0].mappingKeyWords =
                        templateDetails[0].properties.mappingKeyWords
        } else {
          templateDetails[0].mappingKeyWords = []
        }

        if (templateDetails[0].properties.allExternalSlugs) {
          templateDetails[0].allExternalSlugs =
                        templateDetails[0].properties.allExternalSlugs
        } else {
          templateDetails[0].allExternalSlugs = []
        }
        if (templateDetails[0].properties.externalModules) {
          templateDetails[0].externalModules =
                        templateDetails[0].properties.externalModules
        } else {
          templateDetails[0].externalModules = []
        }

        if (templateDetails[0].properties.templateName) {
          templateDetails[0].template_name =
                        templateDetails[0].properties.templateName
        } else {
          templateDetails[0].template_name =
                        templateDetails[0].boundTemplateStatement
        }
        delete templateDetails[0].properties
      }
      const query = `Select s.id as section_id, s.title as section_title, s.template_id as section_template, s.properties as properties,
      s.parent_section_id as parentId, s.type as section_type, s.linked_component as linked_component, u.id as uicomponent_id, u.name as uicomponent_name,
      u.statement as statement,
      u.type as uicomponent_type, u.properties as uicomponent_properties, u.section_id as ui_component_section_id from
      section s left join ui_component u on s.id = u.section_id where s.template_id = ${req.body.template_id} &&s.deleted_at is null`
      const queryResults = await functions.runQuery(query)
      let sectionsObject = []
      let uiComponentsObject = []
      sectionsObject = lodash.uniqBy(queryResults, 'section_id')
      if (sectionsObject.length) {
        sectionsObject = functions.sortSections(sectionsObject)
      }
      uiComponentsObject = lodash.uniqBy(queryResults, 'uicomponent_id')
      lodash.remove(uiComponentsObject, function (n) {
        return functions.isNil(n.uicomponent_id)
      })
      for (let i = 0; i < queryResults.length; i++) {
        if (sectionsObject.length > i) {
          if (functions.isNil(sectionsObject[i].parentId))
            sectionsObject[i].parentId = 0
          sectionsObject[i].dashboard = []
          sectionsObject[i] = lodash.pick(sectionsObject[i], [
            'section_id',
            'section_title',
            'properties',
            'parentId',
            'section_type',
            'section_template',
            'linked_component',
            'dashboard',
          ])
          sectionsObject[i].options = clone(sectionsObject[i].properties)
          delete sectionsObject[i].properties
          // sectionsObject[i].options = JSON.parse(sectionsObject[i].options);
          functions.setSectionProperty(sectionsObject[i], 'ui_name_count')
          functions.setSectionProperty(sectionsObject[i], 'isSelected')
          functions.setSectionProperty(sectionsObject[i], 'defaultColumn')
          functions.setSectionProperty(sectionsObject[i], 'mainPdf')
          functions.setSectionProperty(sectionsObject[i], 'hideInInstance')
          functions.setSectionProperty(sectionsObject[i], 'selectedModules')
          functions.setSectionProperty(
            sectionsObject[i],
            'horizontalThemeCheck'
          )
          functions.setSectionProperty(sectionsObject[i], 'verticalThemeCheck')
          functions.setSectionProperty(sectionsObject[i], 'isCarried')
          functions.setSectionProperty(sectionsObject[i], 'hideSectionName')
          functions.setSectionProperty(sectionsObject[i], 'sectionBorders')
          functions.setSectionProperty(sectionsObject[i], 'leftSectionBorder')
          functions.setSectionProperty(sectionsObject[i], 'rightSectionBorder')
          functions.setSectionProperty(sectionsObject[i], 'topSectionBorder')
          functions.setSectionProperty(
            sectionsObject[i],
            'bottomSectionBorder'
          )
          functions.setSectionProperty(sectionsObject[i], 'topSectionPadding')

          functions.setSectionProperty(sectionsObject[i], 'completeBorder')
          functions.setSectionProperty(sectionsObject[i], 'leftUIBorder')
          functions.setSectionProperty(sectionsObject[i], 'leftUIPadding')
          functions.setSectionProperty(sectionsObject[i], 'rightUIBorder')
          functions.setSectionProperty(sectionsObject[i], 'rightUIPadding')
          functions.setSectionProperty(sectionsObject[i], 'topUIBorder')
          functions.setSectionProperty(sectionsObject[i], 'topUIPadding')
          functions.setSectionProperty(sectionsObject[i], 'bottomUIBorder')
          functions.setSectionProperty(sectionsObject[i], 'bottomUIPadding')
          functions.setSectionProperty(sectionsObject[i], 'backgroundColor')
          functions.setSectionProperty(sectionsObject[i], 'bgColor')
          functions.setSectionProperty(sectionsObject[i], 'fontColor')
          functions.setSectionProperty(sectionsObject[i], 'fontColorCode')
          functions.setSectionProperty(sectionsObject[i], 'fontFamily')
          functions.setSectionProperty(sectionsObject[i], 'fontFamilyValue')
          functions.setSectionProperty(sectionsObject[i], 'lineSpacing')
          functions.setSectionProperty(sectionsObject[i], 'lineSpacingValue')
          functions.setSectionProperty(sectionsObject[i], 'uiPaddings')
          functions.setSectionProperty(sectionsObject[i], 'uiBorders')
          functions.setSectionProperty(sectionsObject[i], 'is_table')
          functions.setSectionProperty(sectionsObject[i], 'errors')
          functions.setSectionProperty(sectionsObject[i], 'sectionClick')
          functions.setSectionProperty(sectionsObject[i], 'seperatePdf')
          functions.setSectionProperty(sectionsObject[i], 'printNewPage')
          functions.setSectionProperty(sectionsObject[i], 'requiredFilled')
          functions.setSectionProperty(
            sectionsObject[i],
            'selected_linked_component'
          )
          functions.setSectionProperty(sectionsObject[i], 'isSubSection')
          functions.setSectionProperty(sectionsObject[i], 'carryForward')
          functions.setSectionProperty(sectionsObject[i], 'secNo')
          functions.setSectionProperty(sectionsObject[i], 'subsection')
          functions.setSectionProperty(sectionsObject[i], 'theme')
          functions.setSectionProperty(sectionsObject[i], 'isFilled')
          functions.setSectionProperty(sectionsObject[i], 'tags')
          functions.setSectionProperty(sectionsObject[i], 'mapper')
          functions.setSectionProperty(sectionsObject[i], 'carrySections')
          functions.setSectionProperty(
            sectionsObject[i],
            'boundSectionStatement'
          )
          sectionsObject[i].id = sectionsObject[i].section_id
          delete sectionsObject[i].options.frontendid
        }
        if (uiComponentsObject.length > i) {
          if (!functions.isNil(uiComponentsObject[i].uicomponent_id)) {
            uiComponentsObject[i] = lodash.pick(uiComponentsObject[i], [
              'uicomponent_id',
              'uicomponent_name',
              'statement',
              'uicomponent_type',
              'ui_component_section_id',
              'uicomponent_properties',
            ])
            uiComponentsObject[i].uicomponent_properties = JSON.parse(
              uiComponentsObject[i].uicomponent_properties
            )
            uiComponentsObject[i].obj =
                            uiComponentsObject[i].uicomponent_properties
            delete uiComponentsObject[i].uicomponent_properties
            uiComponentsObject[i].isClick = uiComponentsObject[i].obj.isClick
            delete uiComponentsObject[i].obj.isClick
            uiComponentsObject[i].cols = uiComponentsObject[i].obj.cols
            delete uiComponentsObject[i].obj.cols
            uiComponentsObject[i].rows = uiComponentsObject[i].obj.rows
            delete uiComponentsObject[i].obj.rows
            uiComponentsObject[i].oddRow = uiComponentsObject[i].obj.oddRow
            delete uiComponentsObject[i].obj.oddRow
            uiComponentsObject[i].evenRow = uiComponentsObject[i].obj.evenRow
            delete uiComponentsObject[i].obj.evenRow
            uiComponentsObject[i].x = uiComponentsObject[i].obj.x
            delete uiComponentsObject[i].obj.x
            uiComponentsObject[i].y = uiComponentsObject[i].obj.y
            delete uiComponentsObject[i].obj.y
            uiComponentsObject[i].id = uiComponentsObject[i].obj.frontendid
            delete uiComponentsObject[i].obj.frontendid
            uiComponentsObject[i].obj.statement =
                            uiComponentsObject[i].statement
            delete uiComponentsObject[i].statement
            uiComponentsObject[i].obj.type =
                            uiComponentsObject[i].uicomponent_type
            delete uiComponentsObject[i].uicomponent_type
            uiComponentsObject[i].obj.uicomponent_name =
                            uiComponentsObject[i].uicomponent_name
            delete uiComponentsObject[i].uicomponent_name
          }
        }
      }
      for (let i = 0; i < sectionsObject.length; i++) {
        for (let j = 0; j < uiComponentsObject.length; j++) {
          if (
            uiComponentsObject[j].ui_component_section_id ===
                        sectionsObject[i].section_id
          ) {
            delete uiComponentsObject[j].ui_component_section_id
            sectionsObject[i].dashboard.push(uiComponentsObject[j])
          }
        }
      }
      res.status(200).send({
        message: 'Success',
        data: sectionsObject,
        template: templateDetails,
      })
    } else {
      res.status(406).send({ message: validated.error.message })
    }
  } catch (error) {
    res.status(406).send({ message: error.message })
  }
})

module.exports = router