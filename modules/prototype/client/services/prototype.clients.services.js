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

		getProjectDetail: function () {
			return
		},

		getProjectDetailList: function () {
			return [
				{name: 'Operator', data: 'Thompson Creek Metals Company Inc.'},
				{name: 'Ownership', data: 'Thompson Creek Metals Company Inc.'},
				{name: 'Commodities', data: 'Copper, Gold'},
				{name: 'Tailings Impoundments', data: '1'}
			];
		},

		getProjectAuthorizations: function () {
			return [
				{name: 'Environmental Assessment Certificate', agency: 'Environmental Assessment Office (EAO)', state: 'Certificate Amended', lastUpdate: 'YYYY-MM-DD'},
				{name: 'Environmental Management Act Permit', agency: 'Ministry of Environment (MOE)', state: 'Permit Amended', lastUpdate: 'YYYY-MM-DD'},
				{name: 'Mines Act Permit', agency: 'Ministry of Energy & Mines (MEM)', state: 'Permit Amended', lastUpdate: 'YYYY-MM-DD'}
			];
		},

		getProjectInspections: function () {
			return [
				{	inspectionID: 'MEM-63456', inspectionDate: 'YYYY-MM-DD', agency: 'Ministry of Energy & Mines',
					inspectionTopics: [
						{topicName: 'Topic 1'},
						{topicName: 'Topic 2'},
						{topicName: 'Topic 3'}
					],
					inspectionActions: [
						{actionID: '1'},
						{actionID: '2'}, 
						{actionID: '3'}, 
						{actionID: '4'}
					]
				},
				{	inspectionID: 'MEM-63457', inspectionDate: 'YYYY-MM-DD', agency: 'Ministry of Energy & Mines',
					inspectionTopics: [
						{topicName: 'Topic 4'},
						{topicName: 'Topic 5'},
						{topicName: 'Topic 6'}
					],
					inspectionActions: [
						{actionID: '1'},
						{actionID: '2'}, 
						{actionID: '3'}, 
						{actionID: '4'}
					]
				},
				{	inspectionID: 'MEM-63458', inspectionDate: 'YYYY-MM-DD', agency: 'Ministry of Energy & Mines',
					inspectionTopics: [
						{topicName: 'Topic 4'},
						{topicName: 'Topic 5'},
						{topicName: 'Topic 6'}
					],
					inspectionActions: [
						{actionID: '1'},
						{actionID: '2'}, 
						{actionID: '3'}, 
						{actionID: '4'}
					]
				},
				{	inspectionID: 'MEM-63458', inspectionDate: 'YYYY-MM-DD', agency: 'Ministry of Energy & Mines',
					inspectionTopics: [
						{topicName: 'Topic 4'},
						{topicName: 'Topic 5'},
						{topicName: 'Topic 6'}
					],
					inspectionActions: [
						{actionID: '1'},
						{actionID: '2'}, 
						{actionID: '3'}, 
						{actionID: '4'}
					]
				},
				{	inspectionID: 'MEM-63460', inspectionDate: 'YYYY-MM-DD', agency: 'Ministry of Energy & Mines',
					inspectionTopics: [
						{topicName: 'Topic 4'},
						{topicName: 'Topic 5'},
						{topicName: 'Topic 6'}
					],
					inspectionActions: [
						{actionID: '1'},
						{actionID: '2'}, 
						{actionID: '3'}, 
						{actionID: '4'}
					]
				},
				{	inspectionID: 'MEM-63461', inspectionDate: 'YYYY-MM-DD', agency: 'Ministry of Energy & Mines',
					inspectionTopics: [
						{topicName: 'Topic 4'},
						{topicName: 'Topic 5'},
						{topicName: 'Topic 6'}
					],
					inspectionActions: [
						{actionID: '1'},
						{actionID: '2'}, 
						{actionID: '3'}, 
						{actionID: '4'}
					]
				}
			];
		},

		getProjectAction: function () {
			return [
				{	actionID: 'MEM-63456-1', 
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
