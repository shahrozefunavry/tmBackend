const Joi = require('@hapi/joi')

module.exports = {
  instanceValidate (input) {
    const schema = Joi.object().keys({
      template_id: Joi.number()
        .integer()
        .required()
        .error((errors) => {
          errors.forEach((err) => {
            err.message = 'Template must be saved before adding instance'
          })
          return errors
        }),
      template_name: Joi.any().allow('').required(),
      tags: Joi.array().required(),
      public: Joi.number().integer().required().valid(0, 1),
      shared: Joi.number().integer().required().valid(0, 1),
      default_columns: Joi.number().integer().required(),
      sections: Joi.array().required(),
      user_id: Joi.number().integer(),
      user_name: Joi.string(),
      user_access: Joi.array(),
      facility_access: Joi.array(),
      uiCompIds: Joi.number().integer(),
      carryOriginalDeleted: Joi.array(),
      carryNewDeleted: Joi.array(),
      doctor_signature_id: Joi.any(),
      hideTemplateName: Joi.boolean(),
      doctorSignatureCheck: Joi.boolean(),
      patientSignatureCheck: Joi.boolean(),
      paSignatureCheck: Joi.boolean(),
      pageSize: Joi.object(),
      pdfMarginTop: Joi.number().integer(),
      pdfMarginBottom: Joi.number().integer(),
      pdfMarginLeft: Joi.number().integer(),
      pdfMarginRight: Joi.number().integer(),
      boundTemplateStatement: Joi.string().allow(''),
      is_default: [Joi.number().integer().valid(0, 1), Joi.allow(null)],
      mappingKeyWords: Joi.array(),
      uiBorders: Joi.boolean(),
      uiPaddings: Joi.boolean(),
      leftUIBorder: Joi.number().integer(),
      rightUIBorder: Joi.number().integer(),
      topUIBorder: Joi.number().integer(),
      bottomUIBorder: Joi.number().integer(),
      leftUIPadding: Joi.number().integer(),
      rightUIPadding: Joi.number().integer(),
      topUIPadding: Joi.number().integer(),
      bottomUIPadding: Joi.number().integer(),
      fontColor: Joi.boolean(),
      fontFamily: Joi.boolean(),
      fontColorCode: Joi.string(),
      fontFamilyValue: Joi.string().allow(''),
      lineSpacing: Joi.boolean(),
      lineSpacingValue: Joi.number(),
      bgColor: Joi.boolean(),
      backgroundColor: Joi.string(),
      allExternalSlugs: Joi.array(),
      templateErrors: Joi.number().integer(),
      appointment_id: Joi.number().integer(),
      visit_id: Joi.number().integer(),
      form_id: Joi.number().integer(),
      location_id: Joi.number().integer(),
      speciality_id: Joi.number().integer(),
      visit_type_id: Joi.number().integer(),
      case_id: Joi.number().integer(),
      chart_no: Joi.number().integer(),
      appointment_date: Joi.date(),
      externalModules: Joi.array(),
      pdf_type: Joi.number().integer()
    })
    const result = schema.validate(input)
    if (result.error) {
      return result
    }
    for (let i = 0; i < input.sections.length; i++) {
      const resultSec = sectionsValidate(input.sections[i])
      if (resultSec.error) return resultSec
    }
    return result
  },
}
//
//
function sectionsValidate (section) {
  const schemaSec = Joi.object().keys({
    id: Joi.number().integer().required(),
    section_title: Joi.any().allow('').required(),
    boundSectionStatement: Joi.string().allow(''),
    section_template: Joi.number().integer(),
    tags: Joi.array().required(),
    options: Joi.object().required(),
    printNewPage: Joi.boolean().required(),
    parentId: [
      Joi.number().integer().required().disallow(Joi.ref('id')),
      Joi.allow(null),
    ],
    dashboard: Joi.array().required(),
    section_type: Joi.number().integer().required(),
    defaultColumn: Joi.boolean().required(),
    mainPdf: Joi.boolean().required(),
    seperatePdf: Joi.boolean().required(),
    isSubSection: Joi.boolean().required(),
    sectionBorders: Joi.boolean().required(),
    completeBorder: Joi.boolean(),
    errors: Joi.number().integer(),
    hasError: Joi.boolean(),
    secNo: Joi.any(),
    subsection: Joi.number().integer().required(),
    section_id: Joi.number()
      .integer()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          err.message = 'Template must be saved before adding instance'
        })
        return errors
      }),
    sectionClick: Joi.boolean(),
    dashboardColCount: Joi.number().integer(),
    linked_component: Joi.number(),
    selected_linked_component: Joi.number(),
    isSelected: Joi.boolean(),
    ui_name_count: Joi.number().integer(),
    theme: Joi.any(),
    isFilled: Joi.boolean(),
    mapper: Joi.array().required(),
    hideInInstance: Joi.boolean(),
    hideSectionName: Joi.boolean(),
    carryForward: Joi.object().allow(null),
    carrySections: Joi.array(),
    isUpdated: Joi.boolean(),
    isCarried: Joi.boolean(),
    selectedModules: Joi.array(),
    is_table: Joi.boolean(),
    requiredFilled: Joi.boolean(),
    horizontalThemeCheck: Joi.boolean(),
    topSectionPadding: Joi.number().integer(),
    verticalThemeCheck: Joi.boolean(),
    leftSectionBorder: Joi.number().integer(),
    rightSectionBorder: Joi.number().integer(),
    topSectionBorder: Joi.number().integer(),
    bottomSectionBorder: Joi.number().integer(),
    uiBorders: Joi.boolean(),
    uiPaddings: Joi.boolean(),
    leftUIBorder: Joi.number().integer(),
    rightUIBorder: Joi.number().integer(),
    topUIBorder: Joi.number().integer(),
    bottomUIBorder: Joi.number().integer(),
    leftUIPadding: Joi.number().integer(),
    rightUIPadding: Joi.number().integer(),
    topUIPadding: Joi.number().integer(),
    bottomUIPadding: Joi.number().integer(),
    fontColor: Joi.boolean(),
    fontFamily: Joi.boolean(),
    fontColorCode: Joi.string(),
    fontFamilyValue: Joi.string().allow(''),
    lineSpacing: Joi.boolean(),
    lineSpacingValue: Joi.number(),
    bgColor: Joi.boolean(),
    backgroundColor: Joi.string(),
  })
  const resultSec = schemaSec.validate(section)
  if (resultSec.error) return resultSec
  for (let i = 0; i < section.dashboard.length; i++) {
    const resultUI = uiValidate(section.dashboard[i])
    if (resultUI.error) return resultUI
  }
  return resultSec
}

function uiValidate (uicomponent) {
  const schemaUI = Joi.object().keys({
    maxItemRows: Joi.number(),
    minItemRows: Joi.number(),
    maxItemCols: Joi.number(),
    minItemCols: Joi.number(),
    uicomponent_id: Joi.number()
      .integer()
      .required()
      .error((errors) => {
        errors.forEach((err) => {
          err.message = 'Template must be saved before adding instance'
        })
        return errors
      }),
    id: Joi.string().allow('').required(),
    cols: Joi.number().integer().required(),
    isClick: Joi.boolean(),
    obj: Joi.object().required(),
    rows: Joi.number().integer().required(),
    oddRow: Joi.boolean(),
    evenRow: Joi.boolean(),
    x: Joi.number().integer().required(),
    y: Joi.number().integer().required(),
    dragEnabled: Joi.boolean(),
    resizeEnabled: Joi.boolean(),
    hover: Joi.boolean(),
    data_id: Joi.number().integer(),
    // answers: Joi.array().required()
  })
  const resultUI = schemaUI.validate(uicomponent)
  return resultUI
}
