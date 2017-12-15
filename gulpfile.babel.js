'use strict';

/*---------------------------------*\
  Import Plugins
\*---------------------------------*/

import autoprefixer from 'gulp-autoprefixer';
import browsersync from 'browser-sync';
import cache from 'gulp-cache';
import changed from 'gulp-changed';
import cssnano from 'gulp-cssnano';
import del from 'del';
import gulp from 'gulp';
import gulpIf from 'gulp-if';
import imagemin from 'gulp-imagemin';
import jshint from 'gulp-jshint';
import map from 'map-stream';
import plumber from 'gulp-plumber';
import runSequence from 'run-sequence';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import stylish from 'jshint-stylish';
import uglify from 'gulp-uglify';
import useref from 'gulp-useref';

let browserSync = browsersync.create();

const paths = {
  root: './',
  source: {
    root:     'src/',
    scss:     'src/assets/scss/',
    styles:   'src/assets/css/',
    scripts:  'src/assets/js/',
    images:   'src/assets/imgs/',
    fonts:    'src/assets/fonts/',
    plugins:  'src/assets/plugins/'
  },
  build: {
    root:     'build/',
    styles:   'build/assets/css/',
    scripts:  'build/assets/js/',
    images:   'build/assets/imgs/',
    fonts:    'build/assets/fonts/',
    plugins:  'build/assets/plugins/'
  }
};


/*---------------------------------*\
  Tasks for development
\*---------------------------------*/

// Build Sass to CSS's Task
gulp.task('sass', () => {
  return gulp.src(`${paths.source.scss}**/*.scss`)
    .pipe(changed(paths.source.root, { extension: '.scss' }))
    .pipe(plumber())
    .pipe(sass())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: true
    }))
    .pipe(sourcemaps.write(paths.root))
    .pipe(gulp.dest(paths.source.styles))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// JSHint's Task
gulp.task('jshint', () => {
  return gulp.src(`${paths.source.scripts}**/*.js`)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// BrowserSync's Task
gulp.task('liveload', () => {
  browserSync.init({
    server: {
      baseDir: paths.source.root
    },
    open: 'external' // open with external mode (http://192.168.1.xxx:3000)
  });
});

// Clean CSS Directory's Task
gulp.task('clean:css', () => {
  return del.sync(paths.source.styles);
});

// Watch's Task
gulp.task('watch', ['liveload', 'sass', 'jshint'], () => {
  gulp.watch(`${paths.source.scss}**/*.scss`, ['sass']);
  gulp.watch(`${paths.source.root}**/*.html`, browserSync.reload);
  gulp.watch(`${paths.source.scripts}**/*.js`, browserSync.reload);
});

/*---------------------------------*\
  Tasks for production
\*---------------------------------*/

// Minify Javascript and CSS file's Task
gulp.task('minify', () => {
  return gulp.src(`${paths.source.root}/**/*.html`)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest(paths.build.root));
});

// Copy HTML's Task
gulp.task('build:html', () => {
  return gulp.src(`${paths.source.root}/**/*.html`)
    .pipe(gulp.dest(paths.build.root));
});

// Copy Plugins's Task
gulp.task('build:plugins', () => {
  return gulp.src(`${paths.source.plugins}**/*`)
    .pipe(gulp.dest(paths.build.plugins));
});

// Copy CSS's task
gulp.task('build:styles', () => {
  return gulp.src(`${paths.source.styles}**/*.css`)
    .pipe(sourcemaps.init())
    .pipe(cssnano({
      zindex: false
    }))
    .pipe(sourcemaps.write(paths.root))
    .pipe(gulp.dest(paths.build.styles));
});

// Copy and minify Javascript's Task
gulp.task('build:scripts', () => {
  return gulp.src(`${paths.source.scripts}**/*.js`)
    .pipe(uglify())
    .pipe(gulp.dest(paths.build.scripts));
});

// Copy and minify Images's Task
gulp.task('build:images', () => {
  return gulp.src(`${paths.source.images}**/*.+(png|jpg|jpeg|gif|svg)`)
    .pipe(cache(imagemin([], { interlaced: true })))
    .pipe(gulp.dest(paths.build.images));
});

// Copy Font's Task
gulp.task('build:fonts', () => {
  return gulp.src(`${paths.source.fonts}**/*.+(eot|tff|woff|woff2|otf)`)
    .pipe(gulp.dest(paths.build.fonts));
});

// Clean build directory's Task
gulp.task('clean:build', () => {
  return del.sync(paths.build.root);
});

// Build Task
gulp.task('build', cb => {
  runSequence('clean:build', 
    ['build:html', 'build:plugins', 'build:styles', 'build:scripts', 'build:images', 'build:fonts'],
    cb);
});

// Default Task
gulp.task('default', cb => {
  runSequence(['sass', 'jshint', 'liveload', 'watch'], cb);
});