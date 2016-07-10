// external dependencies
const gulp = require('gulp')
const pug = require('gulp-pug')
const liveServer = require('live-server')
const stylus = require('gulp-stylus')
const print = require('gulp-print')
const plumber = require('gulp-plumber')
const sequence = require('gulp-sequence')
const del = require('del')

// asset addons
const autoprefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const rev = require('gulp-rev')
const revReplace = require('gulp-rev-replace')

// `gulp-watch` is able to react for new files as well as deleted files,
// in contrast to `gulp.watch`
const watch = require('gulp-watch')

// internal dependencies
const config = require('./lib/config')

const revisionFiles = () => config.get('env') === 'production'
const prefixStyles = () => true
const createSourceMaps = () => config.get('env') === 'development'

const buildStyles = (stream) => {
  const withSourceMaps = createSourceMaps()

  let s = stream
  .pipe(print((file) => `${file} changed, building styles`))
  .pipe(plumber())

  s = withSourceMaps ? s.pipe(sourcemaps.init()) : s
  s = s.pipe(stylus())
  s = prefixStyles() ? s.pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false })) : s
  s = withSourceMaps ? s.pipe(sourcemaps.write()) : s

  return s.pipe(gulp.dest(config.get('styleDistPath')))
}

const buildTemplates = (stream) => {
  return stream
  .pipe(plumber())
  .pipe(print((file) => `${file} changed, building templates`))
  .pipe(pug({ pretty: true }))
  .pipe(gulp.dest(config.get('templateDistPath')))
}

gulp.task('clean-styles', () => del(config.get('styleDistPath')))
gulp.task('styles', ['clean-styles'], () => buildStyles(gulp.src(config.get('styleGlob'))))

gulp.task('clean-templates', () => del([`!${config.get('templateDistPath')}`, config.get('templateDistGlob')]))
gulp.task('templates', ['clean-templates'], () => buildTemplates(gulp.src(config.get('templateGlob'))))

// gulp.task('prod-templates', () =>
//   buildTemplates(gulp.src(config.get('templateGlob'))))

gulp.task('prod-assets', ['styles'], function () {
  return gulp.src([config.get('styleDistGlob')], { base: config.get('distPath') })
  .pipe(print((file) => `${file}: building revved version`))
  .pipe(rev())
  .pipe(gulp.dest(config.get('buildPath')))  // write rev'd assets to build dir
  .pipe(rev.manifest())
  .pipe(gulp.dest(config.get('styleBuildPath'))) // write manifest to build dir
})

gulp.task('prod-templates', ['templates'], () => {
  let s = gulp.src(config.get('templateDistGlob'))

  if (revisionFiles()) {
    const manifest = gulp.src(`${config.get('styleBuildPath')}/rev-manifest.json`)
    s = s
    .pipe(revReplace({manifest: manifest}))
    .pipe(print((file) => `${file} replacing revision references`))
  }

  return s.pipe(gulp.dest(config.get('templateBuildPath')))
})

// local dev server
gulp.task('server', (done) => {
  const serverConfig = {
    port: config.get('port'),
    host: config.get('host'),
    open: true,
    root: './dist',
    wait: 1000
  }

  liveServer.start(serverConfig)
  done()
})

// dev build runner
gulp.task('watch-templates', () => buildTemplates(watch(config.get('templateGlob'))))
gulp.task('watch-styles', () => buildStyles(watch(config.get('styleGlob'))))
gulp.task('watch', ['watch-templates', 'watch-styles'])

// development start script
gulp.task('run', ['server', 'watch'])

gulp.task('dev-build', ['templates', 'styles'])

gulp.task('build', ['dev-build'], () => {
  gulp.src(config.get('templateGlob'))
  .pipe(gulp.dest(config.get('buildPath')))
})

gulp.task('prod-mode', (cb) => {
  config.set('env', 'production')
  cb()
})

gulp.task('dev-mode', (cb) => {
  config.set('env', 'development')
  cb()
})

gulp.task('clean-build', () => del(config.get('buildPath')))

gulp.task('prod-build', (cb) => {
  sequence('clean-build', 'prod-mode', 'prod-assets', 'prod-templates', 'dev-mode')(cb)
})

gulp.task('deploy', ['prod-build'], () => {
  gulp.src('dist/**/*')
  .pipe(gulp.dest('build'))
})
