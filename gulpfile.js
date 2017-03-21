const gulp = require('gulp');
const gulpIf = require('gulp-if');
const gulpWebpack = require('webpack-stream');
const gulpUglify = require('gulp-uglify');
const gulpSass  = require('gulp-sass');
const webpack = require('webpack');
const path = require('path');

const IndexConfig = {
  source: './src/*.jsx',
  output: './assets/js',
  uglify: false,
  webpack: {
    entry: './src/index.jsx',
    output: {
      filename:  'index.js'
    },
    resolve: {
      extensions: ['', '.js', '.jsx', '.es6'],
      modulesDirectories: ['node_modules']
    },
    plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.AggressiveMergingPlugin()
    ],
    module: {
      loaders: [
        {
          test: /\.jsx$/,
          exclude: ['node_modules'],
          include: [
            path.resolve(__dirname, 'src'),
          ],
          loader: 'babel-loader',
          query: {
            presets: ['es2015', 'react']
          }
        }
      ]
    },
    devtool: 'source-map'
  }
}

gulp.task('index', function () {
  const wp = gulpWebpack(IndexConfig.webpack);
  return gulp.src(IndexConfig.source)
    .pipe(wp.on('error', (e)=>{
      // console.log(e.message);
      console.log(e.codeFrame);
      wp.emit('end');
    }))
    .pipe(gulpIf(IndexConfig.uglify, gulpUglify()))
    .pipe(gulp.dest(IndexConfig.output));
});

gulp.task('scss', ()=>{
  return gulp.src('src/*.scss')
    .pipe(gulpSass().on('error', gulpSass.logError))
    .pipe(gulp.dest('assets/css'));
});

gulp.task('compile', ['index', 'scss']);
gulp.task('watch', ()=>{
  gulp.watch('src/*.jsx',  ['index']);
  gulp.watch('src/*.scss', ['scss']);
});
