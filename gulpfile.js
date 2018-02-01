'use strict';

const gulp = require('gulp');

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const groupMediaQueries = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-cleancss');
const autoprefixer = require('gulp-autoprefixer');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const replace = require('gulp-replace');
const del = require('del');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();

const paths =  {
  src: './src/',              // paths.src
  build: './build/'           // paths.build
};

const images = 
  paths.src + '/img/*.{gif,png,jpg,jpeg,svg,ico}'
  // paths.src + '/blocks/**/img/*.{gif,png,jpg,jpeg,svg}',
  // '!' + paths.src + '/blocks/sprite-png/png/*',
  // '!' + paths.src + '/blocks/sprite-svg/svg/*',
;

function styles() {
  return gulp.src(paths.src + 'scss/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass()) // { outputStyle: 'compressed' }
    .pipe( autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
        }))
    .pipe(groupMediaQueries())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(paths.build + 'css/'))
}

function scripts() {
  return gulp.src(paths.src + 'js/*.js')
    .pipe(plumber())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(concat('script.min.js'))
    .pipe(gulp.dest(paths.build + 'js/'))
}

function htmls() {
  return gulp.src(paths.src + '*.html')
    .pipe(plumber())
    .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
    .pipe(gulp.dest(paths.build));
}

function copyImg() {
  if(images.length) {
    return gulp.src(images)
      // .pipe(newer(dirs.build + '/img')) // потенциально опасно, к сожалению
      // .pipe(rename({dirname: ''}))
      .pipe(gulp.dest(paths.build + '/img'));
  }
  else {
    console.log('Изображения не обрабатываются.');
    callback();
  }
};

function clean() {
  return del('build/')
}

function watch() {
  gulp.watch(paths.src + 'scss/**/*.scss', styles);
  gulp.watch(paths.src + 'js/*.js', scripts);
  gulp.watch(paths.src + '*.html', htmls);
  gulp.watch(paths.src + 'img/*.{gif,png,jpg,jpeg,svg,ico}', copyImg);
}

function serve() {
  browserSync.init({
    server: {
      baseDir: paths.build
    }
  });
  browserSync.watch(paths.build + '**/*.*', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.htmls = htmls;
exports.clean = clean;
exports.watch = watch;
exports.copyImg = copyImg;

gulp.task('build', gulp.series(
  clean,
  styles,
  scripts,
  htmls,
  copyImg
  // gulp.parallel(styles, scripts, htmls)
));

gulp.task('default', gulp.series(
  clean,
  gulp.parallel(styles, scripts, htmls, copyImg),
  gulp.parallel(watch, serve)
));
