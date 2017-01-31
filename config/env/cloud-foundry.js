'use strict';

var cfenv = require('cfenv'),
  appEnv = cfenv.getAppEnv(),
  cfMongoUrl = appEnv.getService('mean-mongo') ?
  appEnv.getService('mean-mongo').credentials.uri : undefined;

var getCred = function (serviceName, credProp) {
  return appEnv.getService(serviceName) ?
    appEnv.getService(serviceName).credentials[credProp] : undefined;
};

module.exports = {
  port: appEnv.port,
  db: {
    uri: cfMongoUrl,
    options: {
      user: '',
      pass: ''
    }
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    // Stream defaults to process.stdout
    // By default we want logs to go to process.out so the Cloud Foundry Loggregator will collect them
    options: {}
  },
  mailer: {
    from: getCred('mean-mail', 'from') || 'MAILER_FROM',
    options: {
      service: getCred('mean-mail', 'service') || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: getCred('mean-mail', 'username') || 'MAILER_EMAIL_ID',
        pass: getCred('mean-mail', 'password') || 'MAILER_PASSWORD'
      }
    }
  }
};
