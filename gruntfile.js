'use strict';

var defaultAssets = require('./config/assets/default');
var testAssets = require('./config/assets/test');
var path = require('path');
var childProcess = require('child_process');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      test: {
        NODE_ENV: 'test'
      },
      functional: {
        NODE_ENV: 'functional'
      },
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    eslint: {
      target: ['gruntfile.js', 'modules/**/*.js'],
      options: {
        configFile: '.eslintrc'
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc',
        'outline-none': false,
        'fallback-colors': false,
        'bulletproof-font-face': false,
        shorthand: false
      },
      all: {
        src: defaultAssets.client.css
      }
    },
    ngAnnotate: {
      production: {
        files: {
          'public/dist/application.js': defaultAssets.client.js
        }
      }
    },
    uglify: {
      production: {
        options: {
          mangle: false
        },
        files: {
          'public/dist/application.min.js': 'public/dist/application.js'
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/dist/application.min.css': defaultAssets.client.css
        }
      }
    },
    sass: {
      dist: {
        files: [
          {
            expand: true,
            src: defaultAssets.client.sass,
            ext: '.css',
            rename: function(base, src) {
              return src.replace('/scss/', '/css/');
            }
          }
        ]
      }
    },
    less: {
      dist: {
        files: [
          {
            expand: true,
            src: defaultAssets.client.less,
            ext: '.css',
            rename: function(base, src) {
              return src.replace('/less/', '/css/');
            }
          }
        ]
      }
    },
    'node-inspector': {
      custom: {
        options: {
          'web-port': 1337,
          'web-host': 'localhost',
          'debug-port': 5858,
          'save-live-edit': true,
          'no-preload': true,
          'stack-trace-limit': 50,
          hidden: []
        }
      }
    },
    mocha_istanbul: {
      coverage: {
        src: testAssets.tests.server,
        options: {
          require: ['test.js'],
          coverageFolder: 'build/coverage/server',
          reportFormats: ['html', 'cobertura', 'lcovonly'],
          mochaOptions: ['--exit']
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    clean: {
      'test-client': ['build/coverage/client'],
      'test-server': ['build/coverage/server']
    }
  });

  require('load-grunt-tasks')(grunt);

  // Start the local functional test server.
  var e2e_server_process;
  grunt.task.registerTask(
    'start_e2e_server',
    'Starting functional test server.',
    function() {
      var done = this.async();

      e2e_server_process = childProcess.spawn('node', ['server.js'], {
        env: process.env,
        detached: true,
        shell: false,
        stdio: 'ignore'
      });

      done();
    }
  );

  // Run the functional tests against the local functional test server/database.
  grunt.task.registerTask(
    'run_e2e_tests',
    'Running functional tests.',
    function() {
      var done = this.async();

      var test_process = childProcess.spawn(
        process.platform == 'win32' ? 'gradlew.bat' : './gradlew',
        ['chromeHeadlessTest'],
        {
          env: process.env,
          cwd: path.join(process.cwd(), 'functional-tests'),
          stdio: 'inherit'
        }
      );

      test_process.on('exit', done);
    }
  );

  // Drop the local functional test database.
  grunt.task.registerTask(
    'drop_e2e_database',
    'Dropping functional test database.',
    function() {
      var done = this.async();

      var mongoose = require('./config/lib/mongoose.js');
      mongoose.dropDatabase(function() {
        done();
      });
    }
  );

  // Stop the local functional test server.
  grunt.task.registerTask(
    'shutdown_e2e_server',
    'Stopping functional test server.',
    function() {
      if (e2e_server_process) {
        e2e_server_process.kill('SIGINT');
      }
    }
  );

  // Lint CSS and JavaScript files.
  grunt.registerTask('lint', ['sass', 'less', 'eslint', 'csslint']);

  // Package application files
  grunt.registerTask('build', [
    'env:dev',
    'lint',
    'ngAnnotate',
    'uglify',
    'cssmin'
  ]);
  grunt.registerTask('buildprod', [
    'env:prod',
    'lint',
    'ngAnnotate',
    'uglify',
    'cssmin'
  ]);
  grunt.registerTask('buildtest', [
    'env:test',
    'lint',
    'ngAnnotate',
    'uglify',
    'cssmin'
  ]);

  // Run the client unit tests
  grunt.registerTask('test-client', [
    'clean:test-client',
    'env:test',
    'lint',
    'ngAnnotate',
    'karma:unit'
  ]);
  // Run the server unit tests
  grunt.registerTask('test-server', [
    'clean:test-server',
    'env:test',
    'lint',
    'ngAnnotate',
    'mocha_istanbul:coverage'
  ]);

  // Run the end-to-end functional tests
  grunt.registerTask('e2e', [
    'build-e2e',
    'start_e2e_server',
    'run_e2e_tests',
    'drop_e2e_database',
    'shutdown_e2e_server'
  ]);
  grunt.registerTask('build-e2e', [
    'env:functional',
    'lint',
    'ngAnnotate',
    'uglify',
    'cssmin'
  ]);
};
