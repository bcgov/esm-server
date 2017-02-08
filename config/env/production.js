'use strict';

module.exports = {
  secure: {
    ssl: false
  },
  port: process.env.PORT || 3000,
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/' + (process.env.MONGODB_DATABASE || 'esm'),
    acluri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/esm-acl',
    options: {
      user: process.env.MONGODB_USER || '',
      pass: process.env.MONGODB_PASSWORD || ''
    },
    // Enable mongoose debug module
    debug: process.env.MONGODB_DEBUG || false
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    // Stream defaults to process.stdout
    // Uncomment to enable logging to a log on the file system
    options: {
      stream: 'access.log'
    }
  },
  token: {
    tokenQuery: process.env.TOKEN_QUERY || undefined,
    tokenParams: process.env.TOKEN_PARAMS || undefined,
    tokenField: process.env.TOKEN_FIELD || undefined,
    tokenHeader: process.env.TOKEN_HEADER || 'smgov_userguid',
    failedOnMissing: process.env.TOKEN_ON_MISSING || false
  },
  mailer: {
    from: process.env.MAILER_FROM || '"BC MMTI" <noreply@gov.bc.ca>',
    options: {
      name: 'mines.nrs.gov.bc.ca',
      host: 'apps.smtp.gov.bc.ca',
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  seedDB: process.env.MONGO_SEED || true
};
