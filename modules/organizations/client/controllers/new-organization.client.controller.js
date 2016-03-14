'use strict';

angular.module('organizations').controller('NewOrganizationController', ['$scope', '$filter', 'Admin', 'OrganizationModel', '$state',
    function ($scope, $filter, Admin, sOrganizationModel, $state) {
        var addOrganization = this;
        addOrganization.options = {
            organizationId: $state.params.organizationId,
            mode: 'add'
        };
    }
]);
