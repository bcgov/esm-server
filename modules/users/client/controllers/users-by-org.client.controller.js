'use strict';

angular.module('users').controller('controllerUsersByOrg', ['$scope', '$filter', 'OrganizationModel', '$state', 'PROVINCES', 'COMPANY_TYPES',
    function ($scope, $filter, sOrganizationModel, $state, PROVINCES, COMPANY_TYPES ) {

        var usersByOrg = this;

        usersByOrg.organizationId = $scope.organizationId;
        usersByOrg.mode = $scope.mode;

        $scope.$watch('organizationId', function(newValue) {
            if(newValue) {
                usersByOrg.organizationId = newValue;
            }
        });
        $scope.$watch('mode', function(newValue) {
            if(newValue) {
                usersByOrg.mode = newValue;
            }
        });





        // Later, we'll do this:
        /*
         Organizations.getUsersByOrganization({id: usersByOrg.organizationId}).then(
         function(res) {
         usersByOrg.users = res.data;
         }
         );
         */

        // But for now, this will suffice:
        usersByOrg.users =  [{"_id":"56a7b59d69a75d0b050fc7e9","username":"classify","provider":"local","displayName":"classify Local","__v":0,"created":"2016-01-26T18:06:21.360Z","roles":["user","classify"],"profileImageURL":"modules/users/client/img/profile/default.png","email":"classify@localhost.com","lastName":"Local","firstName":"classify"},{"_id":"56a7b59d69a75d0b050fc7e8","username":"vetting","provider":"local","displayName":"vetting Local","__v":0,"created":"2016-01-26T18:06:21.359Z","roles":["user","vetting"],"profileImageURL":"modules/users/client/img/profile/default.png","email":"vetting@localhost.com","lastName":"Local","firstName":"vetting"},{"_id":"56a7b59d69a75d0b050fc7e7","username":"admin","provider":"local","displayName":"Admin Local","__v":0,"resetPasswordExpires":"2016-01-27T20:40:41.907Z","resetPasswordToken":"017c80fe91a4c7f51c7ee5a9dc74233a93cc2798","created":"2016-01-26T18:06:21.357Z","roles":["user","admin"],"profileImageURL":"modules/users/client/img/profile/default.png","email":"admin@localhost.com","lastName":"Local","firstName":"Admin"},{"_id":"56a7b59d69a75d0b050fc7e6","username":"user","provider":"local","displayName":"User Local","__v":0,"created":"2016-01-26T18:06:21.328Z","roles":["user"],"profileImageURL":"modules/users/client/img/profile/default.png","email":"user@localhost.com","lastName":"Local","firstName":"User"}];

        usersByOrg.userClickHandler = function (id) {
            if (usersByOrg.mode === "display") $state.go('admin.user', {userId: id});
        };

        usersByOrg.removeUser = function (id) {
            alert ("This function will handle the remove user button click. Next development step is to remove user " + id + " from organization " + usersByOrg.organizationId +".");
        };

        usersByOrg.addUser = function () {
            alert ("This function will handle the add user button. Next development step us to find a way to get a user ID, then add it to organization " + usersByOrg.organizationId +".");
        };

        /*
        // console.log($scope.mode);

        displayEdit.organizationId = $scope.organizationId;
        displayEdit.mode = $scope.mode;

        displayEdit.provs = PROVINCES;
        displayEdit.companyTypes = COMPANY_TYPES;

        // Is this a new entry? If so, let's create it...
        if (displayEdit.mode === "add") {

        } else
        // If this isn't a new entry, If the ID is wrong let's go back to the list.
        {
            Organizations.getOrganization({id: displayEdit.organizationId}).then(
                function(res) {
                    displayEdit.organization = res.data;
                },
                function(data) {
                    $state.go('organization.list');
                }
            );
        }

        displayEdit.submit = function() {
            if (displayEdit.mode === "add") {
                Organizations.addOrganization(displayEdit.organization).then( function(res) {
                    // console.log(res);
                    $state.go('organization.view', { organizationId: res.data._id});
                });
            } else {
                Organizations.updateOrganization(displayEdit.organization).then( function(res) {
                    // console.log(res);
                    $state.go('organization.view', { organizationId: res.data._id});
                });
            }
        };

        displayEdit.cancel = function() {
            if (displayEdit.mode === "add") {
                $state.go('list');
            } else {
                $state.go('organization.view', {organizationId: displayEdit.organization._id});
            }
        };

        displayEdit.remove = function() {
            if (confirm('Are you sure you want to delete this organization?')) {
                Organizations.deleteOrganization({id: displayEdit.organizationId}).then(
                    function (res) {
                        $state.go('organization.list');
                    }
                );
            }
        };
        */
    }
]);
