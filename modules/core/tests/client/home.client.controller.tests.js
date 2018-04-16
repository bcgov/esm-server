'use strict';

(function () {
  describe('HomeController', function () {
    var $controller;
    var scope;

    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    beforeEach(inject(function (_$controller_, $rootScope) {
      $controller = _$controller_;
      scope = $rootScope.$new();
    }));

    it('should expose the authentication service', function () {
      $controller('HomeController', {$scope: scope, Authentication: 'someAuthValue'});
      expect(scope.authentication).toEqual('someAuthValue')
    });
  });
})();
