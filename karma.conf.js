'use strict';

var _ = require('lodash');
var defaultAssets = require('./config/assets/default');
var testAssets = require('./config/assets/test');

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-spec-reporter'),
      require('karma-ng-html2js-preprocessor'),
      require('karma-babel-preprocessor')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: _.union(
      defaultAssets.client.lib.js,
      defaultAssets.client.lib.tests,
      defaultAssets.client.js,
      defaultAssets.client.views,
      testAssets.tests.client
    ),
    preprocessors: {
      'modules/*/client/views/**/*.html': ['ng-html2js'],
      'modules/*/client/**/*.js': ['babel']
    },
    ngHtml2JsPreprocessor: {
      moduleName: 'mean',
      cacheIdFromPath: function(filepath) {
        return filepath;
      }
    },
    babelPreprocessor: {
      options: {
        sourceMap: 'inline'
      }
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: './build/coverage/client',
      combineBrowserReports: true,
      skipFilesWithNoCoverage: true,
      fixWebpackSourcePaths: true
    },
    reporters: ['spec', 'coverage-istanbul', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity
  });
};
