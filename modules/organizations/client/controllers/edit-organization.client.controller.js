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

angular.module('organizations').controller('NewOrganizationController', ['$scope', '$filter', 'Admin', 'Organizations',
    function ($scope, $filter, Admin, Organizations) {
        var addOrganization = this;

        addOrganization.provs = ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK", "NT", "NU", "YT"];

        addOrganization.submitOrganization = function() {
            console.log("submitOrganization called");
            Organizations.addOrganization(addOrganization.organization).then( function(res) {
                console.log(res);
                // go to the edit page for the same project.
                // this time provide a tab for continuty
                // $state.go('eao.editproject', { id: res.data._id, tab: projectEntry.form.curTab });
            });
        };

    }
]);
