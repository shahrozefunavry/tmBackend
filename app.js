const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const addTemplate = require('./routes/template/addTemplate')
const getTemplates = require('./routes/template/getTemplates')
const getTemplateById = require('./routes/template/getTemplateById')
const getTemplateName = require('./routes/template/getTemplateName')
const addHeaderFooter = require('./routes/headerFooter/addHeaderFooter')
const getHeaderFooter = require('./routes/headerFooter/getHeaderFooter')
const deleteHeaderFooter = require('./routes/headerFooter/deleteHeaderFooter')
const addHFPermissions = require('./routes/headerFooter/addHFPermissions')
const getHFPermissions = require('./routes/headerFooter/getHFPermissions')
const updateHFPermissions = require('./routes/headerFooter/updateHFPermissions')
const deleteHFPermissions = require('./routes/headerFooter/deleteHFPermissions')
const getHFById = require('./routes/headerFooter/getHFById')
const getUserHeaderFooters = require('./routes/headerFooter/getUserHeaderFooters')
const headerFooterFilter = require('./routes/headerFooter/headerFooterFilter')
const addUserPermissions = require('./routes/template/addUserPermissions')
const getUserPermissions = require('./routes/template/getUserPermissions')
const deleteUserPermissions = require('./routes/template/deleteUserPermissions')
const deleteUserInstance = require('./routes/template/deleteUserInstance')
const deleteTemplate = require('./routes/template/deleteTemplate')
const deleteDoctorPermissions = require('./routes/template/deleteDoctorPermissions')
const deleteFacilityPermissions = require('./routes/template/deleteFacilityPermissions')
const addTags = require('./routes/template/addTags')
const addDoctorPermissions = require('./routes/template/addDoctorPermissions')
const addFacilityPermissions = require('./routes/template/addFacilityPermissions')
const getDoctorPermissions = require('./routes/template/getDoctorPermissions')
const getFacilityPermissions = require('./routes/template/getFacilityPermissions')
const getSectionTypes = require('./routes/template/getSectionTypes')
const getTagSuggestions = require('./routes/template/getTagSuggestions')
const autoCompleteTags = require('./routes/template/autoCompleteTags')
const search = require('./routes/template/search')
const uploadImage = require('./routes/template/uploadImage')
const updateTemplatePermissions = require('./routes/template/updateTemplatePermissions')
const getSectionsByTemplate = require('./routes/template/getSectionsByTemplate')
const getCarryforwardSection = require('./routes/template/getCarryforwardSection')
const getCarryInstance = require('./routes/template/getCarryInstance')
const getUIComponentsBySection = require('./routes/template/getUIComponentsBySection')
const tokenAuthentication = require('./middleware/tokenAuthentication')
const addUserInstance = require('./routes/template/addUserInstance')
const getUserInstance = require('./routes/template/getUserInstance')
const getExternalSlugData = require('./routes/template/getExternalSlugData')
const sendExternalSlugData = require('./routes/template/sendExternalSlugData')
const generatePdf = require('./routes/template/generatePdf')
const compression = require('compression')
const cors = require('cors')
const app = express()

app.use(compression())
app.use(cors())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/addTemplate', tokenAuthentication, addTemplate)
app.use('/getTemplates', tokenAuthentication, getTemplates)
app.use('/getTemplateById', tokenAuthentication, getTemplateById)
app.use('/getTemplateName', tokenAuthentication, getTemplateName)
app.use('/addHeaderFooter', tokenAuthentication, addHeaderFooter)
app.use('/getHeaderFooter', tokenAuthentication, getHeaderFooter)
app.use('/deleteHeaderFooter', tokenAuthentication, deleteHeaderFooter)
app.use('/addHFPermissions', tokenAuthentication, addHFPermissions)
app.use('/addUserPermissions', tokenAuthentication, addUserPermissions)
app.use('/getUserPermissions', tokenAuthentication, getUserPermissions)
app.use('/deleteUserPermissions', tokenAuthentication, deleteUserPermissions)
app.use('/deleteUserInstance', tokenAuthentication, deleteUserInstance)
app.use('/getHFPermissions', tokenAuthentication, getHFPermissions)
app.use('/updateHFPermissions', tokenAuthentication, updateHFPermissions)
app.use('/deleteHFPermissions', tokenAuthentication, deleteHFPermissions)
app.use('/getHFById', tokenAuthentication, getHFById)
app.use('/getUserHeaderFooters', tokenAuthentication, getUserHeaderFooters)
app.use('/headerFooterFilter', tokenAuthentication, headerFooterFilter)
app.use('/deleteTemplate', tokenAuthentication, deleteTemplate)
app.use('/addDoctorPermissions', tokenAuthentication, addDoctorPermissions)
app.use('/addFacilityPermissions', tokenAuthentication, addFacilityPermissions)
app.use(
  '/deleteDoctorPermissions',
  tokenAuthentication,
  deleteDoctorPermissions
)
app.use(
  '/deleteFacilityPermissions',
  tokenAuthentication,
  deleteFacilityPermissions
)
app.use('/getDoctorPermissions', tokenAuthentication, getDoctorPermissions)
app.use('/getFacilityPermissions', tokenAuthentication, getFacilityPermissions)
app.use('/uploadImage', tokenAuthentication, uploadImage)
app.use(
  '/updateTemplatePermissions',
  tokenAuthentication,
  updateTemplatePermissions
)
app.use('/addTags', addTags)
app.use('/getSectionTypes', tokenAuthentication, getSectionTypes)
app.use('/search', tokenAuthentication, search)
app.use('/getSectionsByTemplate', tokenAuthentication, getSectionsByTemplate)
app.use('/getCarryforwardSection', tokenAuthentication, getCarryforwardSection)
app.use('/getCarryInstance', tokenAuthentication, getCarryInstance)
app.use('/getTagSuggestions', tokenAuthentication, getTagSuggestions)
app.use('/autoCompleteTags', tokenAuthentication, autoCompleteTags)
app.use(
  '/getUIComponentsBySection',
  tokenAuthentication,
  getUIComponentsBySection
)
app.use('/addUserInstance', tokenAuthentication, addUserInstance)
app.use('/getUserInstance', tokenAuthentication, getUserInstance)
app.use('/getExternalSlugData', tokenAuthentication, getExternalSlugData)
app.use('/sendExternalSlugData', tokenAuthentication, sendExternalSlugData)
app.use('/generatePdf', tokenAuthentication, generatePdf)
// app.use('/addTemplate', addTemplate);
// app.use('/uploadImage',  uploadImage);
// app.use('/addTags',  addTags);
// app.use('/getSectionTypes',  getSectionTypes);
// app.use('/search', search);
// app.use('/getSectionsByTemplate', getSectionsByTemplate);
// app.use('/getTagSuggestions', getTagSuggestions);
// app.use('/autoCompleteTags', autoCompleteTags);
// app.use('/getUIComponentsBySection', getUIComponentsBySection);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500).send({ message: err.message })
  // render the error page
  // res.status(err.status || 500);
  // res.render('error');
})

module.exports = app