'use strict';

angular.module('core')
  .directive('alertDialog', ['AlertService', function (AlertService) {
    return {
      restrict: 'E',
      templateUrl: 'modules/core/client/views/dialogs/alert.html',
      controllerAs: 'alertDlg',
      controller: function () {
        var self = this;
        self.alertService = AlertService;

        self.alerts = self.alertService.alerts;

        self.closeAlert = function (index) {
          self.alertService.closeAlert(index);
        };
      }
    };
  }])
  .service('AlertService', [function () {
    var service = this;
    service.alerts = [];
    service.persistOnRouteChange = false;

    service.alert = function(type, message, fadeTimeout, persistOnRouteChange) {
      // ensure the optional timeout is valid
      fadeTimeout = fadeTimeout > 0 ? fadeTimeout : undefined;
      service.persistOnRouteChange = persistOnRouteChange ? true : false;

      service.alerts.push({
        type: type,
        message: message,
        fadeTimeout: fadeTimeout
      });

    };

    service.info = function(message, fadeTimeout, persistOnRouteChange) {
      return service.alert('info', message, fadeTimeout, persistOnRouteChange);
    };

    service.warning = function(message, fadeTimeout, persistOnRouteChange) {
      return service.alert('warning', message, fadeTimeout, persistOnRouteChange);
    };

    service.error = function(message, fadeTimeout, persistOnRouteChange) {
      return service.alert('danger', message, fadeTimeout, persistOnRouteChange);
    };

    service.success = function(message, fadeTimeout, persistOnRouteChange) {
      return service.alert('success', message, fadeTimeout, persistOnRouteChange);
    };

    service.closeAlert = function(index) {
      service.alerts.splice(index, 1);
    };

    service.dismissAll = function() {
      service.alerts.splice(0);
    };
  }]);
