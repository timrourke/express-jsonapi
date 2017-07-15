'use strict';

const gulp       = require('gulp');
const notify     = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const ts         = require('gulp-typescript');

const tsOptions = {
  module: "commonjs",
  target: "es6",
  sourceMap: true,
  lib: ['es6'],
};

function compileTypescript() {
  console.log('Compiling typescript');

  const tsProject = ts.createProject('tsconfig.json');
  const tsResult = gulp.src(['typings/index.d.ts', 'src/**/*.ts', '!src/.baseDir.ts'])
    .pipe(sourcemaps.init())
	.pipe(tsProject())
    .on('error', notify.onError({
      title: "Typescript compilation failed.",
      message: "<%= error.message %>",
      timeout: 20
    }));

  return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist'));
}

function copyOtherFiles() {
  console.log('Copying files');
  return gulp.src(['./src/**/!(*.ts)'])
    .pipe(gulp.dest('./dist'));
}

gulp.task('typescript', function() {
  return compileTypescript();
});

gulp.task('copy', function() {
  return copyOtherFiles();
});

gulp.task('watch', function() {
  compileTypescript();
  copyOtherFiles();
  console.log('Watching for changes');
  gulp.watch('./src/**/*.*', ['copy', 'typescript']);
});

gulp.task('default', function() {
  compileTypescript();
  copyOtherFiles();
});
