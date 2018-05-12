const gulp = require('gulp')
const sass = require('gulp-sass')

gulp.task('sass', () => {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('./public/css'))
})

gulp.task('dev', () => {
  gulp.watch('./src/scss/**/*.scss', ['sass'])
})

gulp.task('build', ['sass'])
