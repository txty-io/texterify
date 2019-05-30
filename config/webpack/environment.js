const { environment } = require('@rails/webpacker')
const typescript =  require('./loaders/typescript')
const less = require('./loaders/less')

environment.loaders.append('typescript', typescript)
environment.loaders.append('less', less)
module.exports = environment
