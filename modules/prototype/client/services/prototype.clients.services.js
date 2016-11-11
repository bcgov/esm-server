'use strict';
angular.module('prototype').factory ('PrototypeModel', function (ModelBase, _) {
	//
	// build the project model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var PrototypeModel = ModelBase.extend ({
		urlName : 'prototype',
		getData: function () {
			return [{name: 'test', data: 'foo'}];
		},

		// PROJECT DETAILS PAGE 
		getProjectDetail: function () {
			//return this.get('/api/admin/prototype');
			return {	
					name: 'Mount Milligan',
					description: 'The Mount Milligan copper-gold mine is located 155 km northwest of Prince George, between the communities of Fort St. James and Mackenzie in central British Columbia. The Mount Milligan project underwent several separate phases of mine planning and feasibility assessment over a 15-year period, including two separate EA (Environmental Assessment) processes. During those reviews, and in response to concerns from First Nations, regulators and other stakeholders, the original 1993 mine design was significantly modified in several key ways to reduce the mine footprint by more than 1,300 hectares—a roughly 50% reduction from the 1,324.6 hectares of total disturbance reported in 2015.',
					ownership: 'Thompson Creek Metals Company Inc.',
					operator: 'Thompson Creek Metals Company Inc.',
					commodities: 'Gold, Copper', 
					tailingsCount: '1',
					phase: [
						{
							name: 'Design', 
							status: 'Complete'
						},
						{
							name: 'Construction', 
							status: 'Complete'},
						{
							name: 'Operation', 
							status: 'Active'
						},
						{
							name: 'Closure', 
							status: 'Inactive'
						},
						{
							name: 'Reclamation', 
							status: 'Active'
						},
						{	
							name: 'Monitoring & Reporting', 
							status: 'Active'
						}
					],
					authorizations: [
						{
							name: 'Environmental Assessment Certificate', 
							agency: 'Environmental Assessment Office (EAO)', 
							status: 'Certificate Amended', 
							lastUpdate: 'YYYY-MM-DD'
						},
						{
							name: 'Environmental Management Act Permit', 
							agency: 'Ministry of Environment (MOE)', 
							status: 'Permit Amended', 
							lastUpdate: 'YYYY-MM-DD'
						},
						{
							name: 'Mines Act Permit', 
							agency: 'Ministry of Energy & Mines (MEM)', 
							status: 'Permit Amended', 
							lastUpdate: 'YYYY-MM-DD'
						},
					]
				};
			},

		// COMPLIANCE & ENFORCEMENT PAGE
		getProjectCeDetails: function() {
			return {
				title: 'Compliance & Enforcement',
				description: 'The Ministry of Energy and Mines (MEM), Ministry of Environment (MOE), Environmental Assessment Office (EAO) and Ministry of Forests, Lands and Natural Resource Operations (FLNRO) work together to provide integrated oversight of British Columbia’s mining sector. Compliance and enforcement (C&E) activities begin after a claim is staked and continue through exploration and the life of a mine.'
			};
		},

		// PROJECT INSPECTIONS
		getProjectInspections: function() {
			return [
				{	id: 'MEM-63456', 
					date: 'YYYY-MM-DD', 
					agency: 'Ministry of Energy & Mines',
					topics: [
						{name: 'Topic 1'},
						{name: 'Topic 2'},
						{name: 'Topic 3'}
					]
				},
				{	id: 'MEM-63457', 
					date: 'YYYY-MM-DD', 
					agency: 'Ministry of Energy & Mines',
					topics: [
						{name: 'Topic 1'},
						{name: 'Topic 2'},
						{name: 'Topic 3'}
					]
				},
				{	id: 'MEM-63458', 
					date: 'YYYY-MM-DD', 
					agency: 'Ministry of Energy & Mines',
					topics: [
						{name: 'Topic 1'},
						{name: 'Topic 2'},
						{name: 'Topic 3'}
					]
				},
				{	id: 'MEM-63459', 
					date: 'YYYY-MM-DD', 
					agency: 'Ministry of Energy & Mines',
					topics: [
						{name: 'Topic 1'},
						{name: 'Topic 2'},
						{name: 'Topic 3'}
					]
				},
				{	id: 'MEM-63460', 
					date: 'YYYY-MM-DD', 
					agency: 'Ministry of Energy & Mines',
					topics: [
						{name: 'Topic 1'},
						{name: 'Topic 2'},
						{name: 'Topic 3'}
					]
				},
				{	id: 'MEM-63461', 
					date: 'YYYY-MM-DD', 
					agency: 'Ministry of Energy & Mines',
					topics: [
						{name: 'Topic 1'},
						{name: 'Topic 2'},
						{name: 'Topic 3'}
					]
				},
			];
		},

		getProjectAction: function () {
			return [
				{	id: 'MEM-63456-1', 
					typ: 'Order',
					inspectorOrder: '',
					issuedBy: '',
					issueDate: 'YYYY-MM-DD',
					inspectionUrl: '',
					response: '',
					responseDate: '',
					responseUrl: '',
					agency: 'Ministry of Energy & Mines', 
					inspectionDate: 'YYYY-MM-DD'
				}
			];
		},

		getProjectStatusList: function () {
			return [
				{name: 'Design', status: 'Complete'},
				{name: 'Construction', status: 'Complete'},
				{name: 'Operation', status: 'Active'},
				{name: 'Closure', status: 'Inactive'},
				{name: 'Reclamation', status: 'Active'},
				{name: 'Monitoring & Reporting', status: 'Active'},
			];
		},

		getRelatedDocuments: function () {
			return [
				{documentName: 'Document Name 1', url: '#'},
				{documentName: 'Document Name 2', url: '#'},
				{documentName: 'Document Name 3', url: '#'},
			];
		},
		
	});
	return new PrototypeModel ();
});
