const { environment } = require('@rails/webpacker')
const less = require('./loaders/less')

environment.loaders.append('less', less)
module.exports = environment
