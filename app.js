const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const addTemplate = require('./routes/template/addTemplate')
const getTemplates = require('./routes/template/getTemplates')
const getTemplateById = require('./routes/template/getTemplateById')
const getTemplateName = require('./routes/template/getTemplateName')
const deleteUserInstance = require('./routes/template/deleteUserInstance')
const deleteTemplate = require('./routes/template/deleteTemplate')

const addTags = require('./routes/template/addTags')
const getSectionTypes = require('./routes/template/getSectionTypes')
const getTagSuggestions = require('./routes/template/getTagSuggestions')
const autoCompleteTags = require('./routes/template/autoCompleteTags')
const search = require('./routes/template/search')
const uploadImage = require('./routes/template/uploadImage')
const updateTemplatePermissions = require('./routes/template/updateTemplatePermissions')
const getSectionsByTemplate = require('./routes/template/getSectionsByTemplate')

const getUIComponentsBySection = require('./routes/template/getUIComponentsBySection')
const tokenAuthentication = require('./middleware/tokenAuthentication')
const addUserInstance = require('./routes/template/addUserInstance')
const getUserInstance = require('./routes/template/getUserInstance')
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

app.use('/addTemplate', addTemplate)
app.use('/getTemplates',  getTemplates)
app.use('/getTemplateById',  getTemplateById)
app.use('/getTemplateName',  getTemplateName)
app.use('/deleteUserInstance',  deleteUserInstance)
app.use('/deleteTemplate',  deleteTemplate)

app.use('/uploadImage',  uploadImage)
app.use(
  '/updateTemplatePermissions',
  
  updateTemplatePermissions
)
app.use('/addTags', addTags)
app.use('/getSectionTypes', getSectionTypes)
app.use('/search',  search)
app.use('/getSectionsByTemplate',  getSectionsByTemplate)
app.use('/getTagSuggestions',  getTagSuggestions)
app.use('/autoCompleteTags',  autoCompleteTags)
app.use(
  '/getUIComponentsBySection',
  
  getUIComponentsBySection
)
app.use('/addUserInstance',  addUserInstance)
app.use('/getUserInstance',  getUserInstance)
app.use('/', (req, res) => {
	return res.send('Hello from Tm server');
});
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