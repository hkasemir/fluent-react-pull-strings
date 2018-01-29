var gulp = require('gulp');
var path = require('path');
var intercept = require('gulp-intercept');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var parseForFtl = require('./index.js');


gulp.task('pullStrings', function() {
  const sourceFile = './en-us.ftl';
  let ftlRules = '';

  gulp.src('./src/**/*.{js,jsx}')
    .pipe(intercept(function(file) {
      var fileContent = file.contents.toString();
      ftlRules += parseForFtl(fileContent);
      return ftlRules;
    }))
    .pipe(intercept(function(fileContents) {
      var stream = source(sourceFile);
      stream.end(fileContents);
      stream.pipe(gulp.dest('./'));
    }));
});
