const Joi = require('@hapi/joi')

module.exports = {
  headerFooterValidate (section) {
    const schemaSec = Joi.object().keys({
      user_id: Joi.number().integer(),
      section_title: Joi.string().allow('').required(),
      options: Joi.object().required(),
      dashboard: Joi.array().required(),
      defaultColumn: Joi.boolean().required(),
      default_columns: Joi.number().integer().required(),
      section_id: Joi.number().integer(),
      isSelected: Joi.boolean(),
      uiCompIds: Joi.number().integer().required(),
      is_header: Joi.number().integer().required().valid(0, 1),
      is_first_page: Joi.number().integer().valid(0, 1),
      is_default_header: Joi.number().integer().valid(0, 1),
      headerMarginLeft: Joi.number().integer(),
      headerMarginRight: Joi.number().integer(),
      mapper: Joi.array().required(),
      mappingKeyWords: Joi.array(),
      created_at: Joi.string().allow(null),
      created_by: Joi.number().integer().allow(null),
      updated_at: Joi.string().allow(null),
      updated_by: Joi.number().integer().allow(null)

    })
    const resultSec = schemaSec.validate(section)
    if (resultSec.error) return resultSec
    for (let i = 0; i < section.dashboard.length; i++) {
      const resultUI = uiValidate(section.dashboard[i])
      if (resultUI.error) return resultUI
    }
    return resultSec
  }
}

function uiValidate (uicomponent) {
  const schemaUI = Joi.object().keys({
    maxItemRows: Joi.number(),
    minItemRows: Joi.number(),
    maxItemCols: Joi.number(),
    minItemCols: Joi.number(),
    uicomponent_id: Joi.number().integer(),
    id: Joi.string().allow('').required(),
    cols:Joi.number().integer().required(),
    isClick: Joi.boolean(),
    obj: Joi.object().required(),
    rows: Joi.number().integer().required(),
    x: Joi.number().integer().required(),
    y: Joi.number().integer().required(),
    hover: Joi.boolean(),
  })
  const resultUI = schemaUI.validate(uicomponent)
  return resultUI
}
