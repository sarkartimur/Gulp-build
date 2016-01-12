/**
 ** Requires.
 **/

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    plumber = require('gulp-plumber'),
    jade = require('gulp-jade'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    nano = require('gulp-cssnano'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    v_source = require('vinyl-source-stream'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

/**
 ** Browser sync task.
 **/

gulp.task('sync', function() {
    browserSync({
        server: {
            baseDir: 'dist/'
        }
    });
});

/**
 ** Jade task.
 **/

gulp.task('jade', function() {
    return gulp.src('_dev/_jade/**/*.jade')
    .pipe(plumber())
    .pipe(jade({
        pretty: true,
        onError: browserSync.notify
    }))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.reload({stream: true}));
});

/**
 ** Sass task.
 **/

gulp.task('sass', function() {
    return gulp.src('_dev/_sass/*.+(sass|scss)')
    .pipe(plumber())
    .pipe(sass({
        indentedSyntax: true,
        onError: browserSync.notify
    }))
    .pipe(autoprefixer({
        browsers: ['last 15 versions'],
        cascade: false
    }))
    .pipe(nano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/css/'))
    .pipe(browserSync.reload({stream: true}));
});

/**
 ** Scripts task.
 **/

gulp.task('scripts', bundle);

var customOpts = {
  entries: ['_dev/_scripts/main.js'],
  debug: true
};

var b = watchify(browserify(customOpts)); 

b.on('update', bundle);

function bundle() {
  return b.bundle()
    .on('error', function (err) {
        console.log(err.toString());
        this.emit("end");
    })
    .pipe(v_source('main.js'))
    .pipe(plumber())
    .pipe(streamify(uglify()))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(browserSync.reload({stream: true}));
}

/**
 ** Watch task.
 **/

gulp.task('watch', function() {
    gulp.watch('_dev/_sass/**', ['sass']);
    gulp.watch('_dev/_jade/**/*.jade', ['jade']);
});

/**
 ** Default task.
 **/

 gulp.task('default', ['jade', 'sass', 'scripts', 'sync', 'watch']);