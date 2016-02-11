'use strict';

angular.module('organizations').controller('editOrganizationController', ['$scope', '$state',
    function ($scope, $state ) {
        var editOrganization = this;
        if ($state.params.organizationId === "") {
            $state.go('list');
        } else {
            editOrganization.orgId = $state.params.organizationId;
        }

        editOrganization.options = {
            organizationId: $state.params.organizationId,
            mode: 'edit'
        };

    }
]);