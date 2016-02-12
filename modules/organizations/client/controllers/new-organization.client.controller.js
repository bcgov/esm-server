'use strict';

angular.module('organizations').controller('NewOrganizationController', ['$scope', '$filter', 'Admin', 'Organizations', '$state',
    function ($scope, $filter, Admin, Organizations, $state) {
        var addOrganization = this;
        addOrganization.options = {
            organizationId: $state.params.organizationId,
            mode: 'add'
        };
    }
]);
