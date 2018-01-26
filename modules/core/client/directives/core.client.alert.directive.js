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

    service.alert = function(type, message, fadeTimeout) {
      // ensure the optional timeout is valid
      fadeTimeout = fadeTimeout > 0 ? fadeTimeout : undefined;

      service.alerts.push({
        type: type,
        message: message,
        fadeTimeout: fadeTimeout
      });
    };

    service.info = function(message, fadeTimeout) {
      return service.alert('info', message, fadeTimeout);
    };

    service.warning = function(message, fadeTimeout) {
      return service.alert('warning', message, fadeTimeout);
    };

    service.error = function(message, fadeTimeout) {
      return service.alert('danger', message, fadeTimeout);
    };

    service.success = function(message, fadeTimeout) {
      return service.alert('success', message, fadeTimeout);
    };

    service.closeAlert = function(index) {
      service.alerts.splice(index, 1);
    };

    service.dismissAll = function() {
      service.alerts.splice(0);
    };
  }]);
