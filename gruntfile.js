'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  defaultAssets = require('./config/assets/default'),
  testAssets = require('./config/assets/test'),
  fs = require('fs'),
  path = require('path'),
  childProcess = require('child_process');

module.exports = function(grunt) {
  // Project Configuration
  var LOGO = '';
  if (process.env.ENVIRONMENT === 'MEM') {
    LOGO = 'modules/core/client/img/brand/mem-logo-inverted.png'; // EAO Logo
  } else {
    LOGO = 'modules/core/client/img/brand/eao-banner-img-lg.png'; // BC Logo
  }
  var ENV = '';
  if (process.env.ENVIRONMENT) {
    ENV = process.env.ENVIRONMENT;
  } else {
    ENV = 'EAO';
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ngconstant: {
      options: {
        space: ' ',
        dest: 'public/dist/conf.js',
        name: 'conf'
      },
      dist: {
        constants: {
          ENV: ENV,
          LOGO: LOGO
        }
      }
    },
    env: {
      unit: {
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
    watch: {
      serverViews: {
        files: defaultAssets.server.views,
        options: {
          livereload: true
        }
      },
      serverJS: {
        files: _.union(
          defaultAssets.server.gruntConfig,
          defaultAssets.server.allJS
        ),
        tasks: ['eslint'],
        options: {
          livereload: true
        }
      },
      clientViews: {
        files: defaultAssets.client.views,
        options: {
          livereload: true
        }
      },
      clientJS: {
        files: defaultAssets.client.js,
        tasks: ['eslint'],
        options: {
          livereload: true
        }
      },
      clientCSS: {
        files: defaultAssets.client.css,
        tasks: ['csslint'],
        options: {
          livereload: true
        }
      },
      clientSCSS: {
        files: defaultAssets.client.sass,
        tasks: ['sass', 'csslint'],
        options: {
          livereload: true
        }
      },
      clientLESS: {
        files: defaultAssets.client.less,
        tasks: ['less', 'csslint'],
        options: {
          livereload: true
        }
      }
    },
    eslint: {
      target: 'modules/**/*.js',
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
    mochaTest: {
      src: testAssets.tests.server,
      options: {
        reporter: 'spec'
      }
    },
    mocha_istanbul: {
      coverage: {
        src: testAssets.tests.server,
        options: {
          print: 'detail',
          coverage: true,
          require: 'test.js',
          coverageFolder: 'coverage',
          reportFormats: ['cobertura', 'lcovonly'],
          check: {
            lines: 40,
            statements: 40
          }
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    protractor: {
      options: {
        configFile: 'protractor.conf.js',
        keepAlive: true,
        noColor: false
      },
      e2e: {
        options: {
          args: {} // Target-specific arguments
        }
      }
    },
    copy: {
      localConfig: {
        src: 'config/env/local.example.js',
        dest: 'config/env/local.js',
        filter: function() {
          return !fs.existsSync('config/env/local.js');
        }
      },
      tinyjson: {
        expand: true,
        cwd: 'node_modules/tiny-jsonrpc',
        src: '*',
        dest: 'node_modules/spooky/node_modules/tiny-jsonrpc'
      }
    }
  });

  grunt.event.on('coverage', function(lcovFileContents, done) {
    require('coveralls').handleInput(lcovFileContents, function(err) {
      if (err) {
        return done(err);
      }
      done();
    });
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);
  //grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-ng-constant');

  grunt.task.registerTask(
    'buildconstants',
    'Builds all the environment information and bakes it into a conf.js file.',
    function() {
      grunt.task.run('ngconstant');
    }
  );

  // Make sure upload directory exists
  grunt.task.registerTask(
    'mkdir:upload',
    'Task that makes sure upload directory exists.',
    function() {
      // Get the callback
      var done = this.async();

      grunt.file.mkdir(
        path.normalize(__dirname + '/modules/users/client/img/profile/uploads')
      );

      done();
    }
  );

  // Connect to the MongoDB instance and load the models
  grunt.task.registerTask(
    'mongoose',
    'Task that connects to the MongoDB instance and loads the application models.',
    function() {
      // Get the callback
      var done = this.async();

      // Use mongoose configuration
      var mongoose = require('./config/lib/mongoose.js');

      // Connect to database
      mongoose.connect(function(db) {
        done();
      });
    }
  );

  /**
   * Start the local functional test server.
   */
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

  /**
   * Run the functional tests against the local server/database.
   */
  grunt.task.registerTask(
    'run_e2e_tests',
    'Running functional tests.',
    function() {
      var done = this.async();

      /**
       * To run in headful mode:
       * ['chromeTest']
       *
       * To run a single test:
       * ['-DchromeTest.single=SomeSpecName', 'chromeTest']
       *
       * To increase logging (including println):
       * ['chromeHeadlessTest', '--info']
       */
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

  /**
   * Drop the local functional test database.
   */
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

  /**
   * Stop the local functional test server.
   */
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
  grunt.registerTask('default', ['sass']);

  // Lint project files and minify them into two production files.
  grunt.registerTask('build', [
    'env:dev',
    'lint',
    'ngAnnotate',
    'uglify',
    'cssmin',
    'buildconstants'
  ]);
  grunt.registerTask('buildprod', [
    'env:prod',
    'lint',
    'ngAnnotate',
    'uglify',
    'cssmin',
    'buildconstants'
  ]);
  grunt.registerTask('buildtest', [
    'env:unit',
    'lint',
    'ngAnnotate',
    'uglify',
    'cssmin',
    'buildconstants'
  ]);

  // Run the project tests - NB: These are not maintained at the moment.
  grunt.registerTask('test', 'env:unit');

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
    'cssmin',
    'buildconstants'
  ]);

  // Run project coverage
  grunt.registerTask('coverage', [
    'env:unit',
    'lint',
    'mocha_istanbul:coverage'
  ]);

  // Run the project in development mode
  grunt.registerTask('default', [
    'env:dev',
    'lint',
    'mkdir:upload',
    'copy:localConfig',
    'copy:tinyjson',
    'buildconstants'
  ]);

  // Run the project in debug mode
  grunt.registerTask('debug', [
    'env:dev',
    'lint',
    'mkdir:upload',
    'copy:localConfig',
    'copy:tinyjson',
    'buildconstants'
  ]);

  // Run the project in production mode
  grunt.registerTask('prod', [
    'buildprod',
    'env:prod',
    'mkdir:upload',
    'copy:localConfig',
    'copy:tinyjson',
    'buildconstants'
  ]);
};
