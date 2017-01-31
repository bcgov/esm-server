'use strict';

var defaultEnvConfig = require('./default');

module.exports = {
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/mmti-dev',
    acluri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/esm-acl-dev',
    options: {
      user: '',
      pass: ''
    },
    // Enable mongoose debug mode
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      //stream: 'access.log'
    }
  },
  app: {
    title: defaultEnvConfig.app.title + ' - Development Environment'
  },
  token: {
    tokenQuery: process.env.TOKEN_QUERY || 'smgov_userguid',
    tokenParams: process.env.TOKEN_PARAMS || undefined,
    tokenField: process.env.TOKEN_FIELD || undefined,
    tokenHeader: process.env.TOKEN_HEADER || 'smgov_userguid',
    failedOnMissing: process.env.TOKEN_ON_MISSING || false
  },
  mailer: {
    from: process.env.MAILER_FROM || '"EAO Project DEVELOPMENT System" <dev-noreply@projects.eao.gov.bc.ca>',
    options: {
      port: 1025
    }
  },
  livereload: true,
  seedDB: process.env.MONGO_SEED || true
};
