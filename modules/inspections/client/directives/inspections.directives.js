/**
 * Created by bryangilbert on 2017/02/02.
 * All rights reserved © Copyright 2016 - MemSharp Technologies Inc.
 */
"use strict";



angular.module('project')
	.controller('controllerComplianceBrowser', controllerComplianceBrowser)
	.directive('tmplProjectCompliance', directiveProjectComplianceOversight);
// -----------------------------------------------------------------------------------
//
// DIRECTIVE:  Project Compliance Oversight
//
// -----------------------------------------------------------------------------------
directiveProjectComplianceOversight.$inject = [];
/* @ngInject */
function directiveProjectComplianceOversight() {
	var directive = {
		restrict: 'E',
		templateUrl: 'modules/inspections/client/views/project-inspections.html',
		scope: {
		},
		controller: controllerComplianceBrowser,
		controllerAs: 'complianceList'
	};
	return directive;
}


controllerComplianceBrowser.$inject = ['$scope'];
/* @ngInject */
function controllerComplianceBrowser($scope) {
	var complianceList = this;
	complianceList.data = loadData();
}

function loadData() {
	return [
		{
			_id: "1",
			name: 'MEM-61307 (Ministry of Energy and Mines)',
			date: '2016-01-12',
			summary: 'On January 12, 2016, Rory Cumming, Inspector of Mines, Electrical visited the Mount Milligan mine site to conduct an electrical inspection.'
		},
		{
			_id: "2",
			name: 'ENV-24765 (Ministry of Environment)',
			date: '2016-02-02',
			summary: "File review of reports submitted by the Permittee for the Thompson Creek Metals Company Inc. gold-copper mill and mine complex Environmental Management Act 104777 permit. This file review was for the time period from 2013-09-01 to 2016-01-07. The following reports were reviewed in completing this file review; 2013 Annual Report,2013 Q3 and Q4 reports, 2015 Q1 report, 2015 Q2 Report, 2015 Q3 report and 2015 Q4 Report. No non-compliances were noted during this file review."
		},
		{
			_id: "3",
			name: 'MEM-62156 (Ministry of Energy and Mines)',
			date: '2016-03-03',
			summary: "On March 3, 2016, Laurie Meade and Kris Bailey, Inspectors of Mines, Health and Safety conducted an inspection at the Mount Milligan mine. The inspectors reviewed the mine's first aid records, training records and mine rescue training records and inspected the warehouse and shops."
		},
		{
			_id: "4",
			name: 'MEM-63456 (Ministry of Energy and Mines)',
			date: '2016-04-26',
			summary: "On April 26, 2016, James Robinson and Laurie Meade, Inspectors of Mines, Health and Safety, and Aaron Unger, Inspector of Mines, Ergonomics, visited the Mount Milligan mine to conduct a comprehensive inspection.",
			related: [
				{
					ref: "https://mines.empr.gov.bc.ca/api/document/582294086d6ad30017ce0b36/fetch",
					name: "Inspection Report - MEM-63456"
				},
				{
					ref: "https://mines.empr.gov.bc.ca/api/document/582294086d6ad30017ce0b36/fetch",
					name: "Mine Managers Response - MEM-63456"
				}
			]
		}
	];
}