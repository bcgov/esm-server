'use strict';

if (process.env.MEM === 'true') {
  module.exports = {
    app: {
      title: 'BC Mine Information',
      description: 'Government of British Columbia Energy and Mines Project System',
      keywords: 'energy mines bc government',
      googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
    },
    port: process.env.PORT || 3000,
    token: {
      tokenQuery: process.env.TOKEN_QUERY || 'smgov_userguid',
      tokenParams: process.env.TOKEN_PARAMS || undefined,
      tokenField: process.env.TOKEN_FIELD || undefined,
      tokenHeader: process.env.TOKEN_HEADER || 'smgov_userguid',
      failedOnMissing: process.env.TOKEN_ON_MISSING || false
    },
    templateEngine: 'swig',
    // Session Cookie settings
    sessionCookie: {
      // session expiration is set by default to 24 hours
      maxAge: 24 * (60 * 60 * 1000),
      // httpOnly flag makes sure the cookie is only accessed
      // through the HTTP protocol and not JS/browser 
      httpOnly: true,
      // secure cookie should be turned to true to provide additional
      // layer of security so that the cookie is set only when working
      // in HTTPS mode.
      secure: false
    },
    // sessionSecret should be changed for security measures and concerns
    sessionSecret: 'MEAN',
    // sessionKey is set to the generic sessionId key used by PHP applications
    // for obsecurity reasons
    sessionKey: 'sessionId',
    sessionCollection: 'sessions',
    logo: 'modules/core/client/img/brand/mem-logo.png',
    favicon: 'modules/core/client/img/brand/favicon.ico'
  };
} else {
  module.exports = {
    app: {
      title: 'EAO Project Information and Collaboration (EPIC)',
      description: 'Government of British Columbia Environmental Assessment Office Project System',
      keywords: 'environmental assessment office bc government',
      googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    // Session Cookie settings
    sessionCookie: {
      // session expiration is set by default to 24 hours
      maxAge: 24 * (60 * 60 * 1000),
      // httpOnly flag makes sure the cookie is only accessed
      // through the HTTP protocol and not JS/browser 
      httpOnly: true,
      // secure cookie should be turned to true to provide additional
      // layer of security so that the cookie is set only when working
      // in HTTPS mode.
      secure: false
    },
    // sessionSecret should be changed for security measures and concerns
    sessionSecret: 'MEAN',
    // sessionKey is set to the generic sessionId key used by PHP applications
    // for obsecurity reasons
    sessionKey: 'sessionId',
    sessionCollection: 'sessions',
    logo: 'modules/core/client/img/brand/bc_logo_transparent.png',
    favicon: 'modules/core/client/img/brand/favicon.ico'
  };
}

console.log(module.exports.app);

