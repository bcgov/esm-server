'use strict';

module.exports = {
  secure: {
    ssl: false
  },
  port: process.env.PORT || 3000,
  db: {
    uri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/esm',
    acluri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/esm-acl',
    options: {
      user: '',
      pass: ''
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
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/facebook/callback'
  },
  twitter: {
    clientID: process.env.TWITTER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_SECRET || 'CONSUMER_SECRET',
    callbackURL: '/api/auth/twitter/callback'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/google/callback'
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: '/api/auth/github/callback'
  },
  paypal: {
    clientID: process.env.PAYPAL_ID || 'CLIENT_ID',
    clientSecret: process.env.PAYPAL_SECRET || 'CLIENT_SECRET',
    callbackURL: '/api/auth/paypal/callback',
    sandbox: false
  },
  token: {
    tokenQuery: process.env.TOKEN_QUERY || undefined,
    tokenParams: process.env.TOKEN_PARAMS || undefined,
    tokenField: process.env.TOKEN_FIELD || undefined,
    tokenHeader: process.env.TOKEN_HEADER || 'smgov_userguid',
    failedOnMissing: process.env.TOKEN_ON_MISSING || false
  },
  mailer: {
    from: process.env.MAILER_FROM || '"BC Environmental Assessment Office" <noreply@projects.eao.gov.bc.ca>',
    options: {
      name: 'projects.eao.gov.bc.ca',
      host: 'apps.smtp.gov.bc.ca',
      tls: {
        rejectUnauthorized: false
      }
    }
  },
  seedDB: process.env.MONGO_SEED || true
};
