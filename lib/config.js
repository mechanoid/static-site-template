const convict = require('convict')

convict.addFormat({
  name: 'placeholder',
  validate: (val) => { },
  coerce: (val, config) =>
    val.replace(/\$\{([\w\.]+)}/g, (v, m) => config.get(m))
})

module.exports = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 0,
    env: 'PORT'
  },
  host: {
    doc: 'development host address',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST',
    arg: 'host'
  },
  distPath: {
    doc: 'development distribution path',
    format: '*',
    default: 'dist'
  },
  distGlob: {
    doc: 'dist file glob',
    format: 'placeholder',
    default: '${distPath}/**/*'
  },
  buildPath: {
    doc: 'release build path',
    format: '*',
    default: './build'
  },
  stylePath: {
    doc: 'style src path',
    format: '*',
    default: './styles'
  },
  styleGlob: {
    doc: 'style glob pattern',
    format: 'placeholder',
    default: '${stylePath}/**/[^_]*.styl'
  },
  styleDistPath: {
    doc: 'style dist path',
    format: 'placeholder',
    default: '${distPath}/css'
  },
  styleDistGlob: {
    doc: 'style glob pattern inside of dist folder',
    format: 'placeholder',
    default: '${styleDistPath}/**/*.css'
  },
  styleBuildPath: {
    doc: 'style dist path',
    format: 'placeholder',
    default: '${buildPath}/css'
  },
  templatePath: {
    doc: 'template src path',
    format: '*',
    default: './templates'
  },
  templateGlob: {
    doc: 'template glob pattern',
    format: 'placeholder',
    default: '${templatePath}/**/[^_]*.pug'
  },
  templateDistPath: {
    doc: 'template dist path',
    format: 'placeholder',
    default: '${distPath}'
  },
  templateDistGlob: {
    doc: 'template dist glob',
    format: 'placeholder',
    default: '${distPath}/**/*.html'
  },
  templateBuildPath: {
    doc: 'template build path',
    format: 'placeholder',
    default: '${buildPath}'
  }
})
