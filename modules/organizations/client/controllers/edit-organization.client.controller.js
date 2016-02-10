/*
controllerEAOProjectNew.$inject = ['Project', '$state'];
// @ngInject
function controllerEAOProjectNew(Project, $state) {
    var projectEntry = this;

    projectEntry.questions = Project.getProjectIntakeQuestions();
    projectEntry.form = {curTab:''};

    // Get blank project
    Project.getNewProject().then( function(res) {
        projectEntry.project = res.data;
    });

    projectEntry.submitProject = function() {
        projectEntry.project.status = 'Submitted';
        projectEntry.saveProject();
    };

    projectEntry.saveProject = function() {
        Project.addProject(projectEntry.project).then( function(res) {
            // go to the edit page for the same project.
            // this time provide a tab for continuty
            $state.go('eao.editproject', { id: res.data._id, tab: projectEntry.form.curTab });
        });
    };

} */

'use strict';

angular.module('organizations').controller('editOrganizationController', ['$scope', '$filter', 'Admin', 'Organizations', '$state',
    function ($scope, $filter, Admin, Organizations, $state ) {
        var editOrganization = this;

        console.log($state.params.organizationId);



       Organizations.getOrganization({id: $state.params.organizationId}).then(function(res) {
           console.log(res);
           editOrganization.organization = res.data;
           /* if (res.data.activities.length !== 1) {
                $state.go('organization', {id:organizationId});
            } else {
                $state.go('activity', {id:res.data.activities[0]._id});
            }*/
        });

        editOrganization.provs = ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK", "NT", "NU", "YT"];


        editOrganization.updateOrganization = function() {
            console.log("updateOrganization called");
            Organizations.updateOrganization(editOrganization.organization).then( function(res) {
                console.log(res);
                // go to the edit page for the same project.
                // this time provide a tab for continuty
                $state.go('view', { organizationId: res.data._id});
            });
        };
    }
]);
