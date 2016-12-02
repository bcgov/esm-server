var artifacttypes = [
	//{name: 'Inspection Report Template',milestone: 'inspection-report',code: 'inspection-report',multiple: true,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Project Description Template',code: 'project-description-template',milestone: 'project-description-template',multiple: false,versions: ['Submission','Draft','Final','Draft for Draft AIR','Final for Draft AIR','Draft for AIR','Final for AIR','Draft for Application','Certified (Schedule A)'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	/*{name: 'Project Description',multiple: false,isTemplate: false,code: 'project-description',versions: ['Submission','Draft','Final','Draft for Draft AIR','Final for Draft AIR','Draft for AIR','Final for AIR','Draft for Application','Certified (Schedule A)'],phase: ''},*/
	//{name: 'Section 10(1)(a) Order Template',milestone: 'section-10-1-a-order',code: 'section-10-1-a-order',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Section 10(1)(b) Order Template',milestone: 'section-10-1-b-order',code: 'section-10-1-b-order',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Section 10(1)(c) Order Template',milestone: 'section-10-1-c-order',code: 'section-10-1-c-order',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Section 11 Order Template',milestone: 'section-11-order',code: 'section-11-order',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Section 11 Schedule A Template',milestone: 'section-11-schedule-a',code: 'section-11-schedule-a',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Section 34 Order Template',milestone: 'section-34-order',code: 'section-34-order',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Section 36 Order Template',milestone: 'section-36-order',code: 'section-36-order',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Section 36 Schedule A Template',milestone: 'section-36-schedule-a',code: 'section-36-schedule-a',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Section 36 Schedule B Template',milestone: 'section-36-schedule-b',code: 'section-36-schedule-b',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	//{name: 'Section 7(3) Order Template',milestone: 'section-7-3-order',code: 'section-7-3-order',multiple: false,versions: ['Draft','Final'],phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	{name: 'Valued Component Package',multiple: true,isTemplate: false,isArtifactCollection: true,isDocument: false,code: 'valued-component-package',milestone: 'valued-component-package',versions: ['Final'], phase: '', stages: [{name: 'Edit', next: 'publish', prev: '', activity: 'edit'}, {name: 'Publish', next: '', prev: 'edit', activity: 'publish', role: 'assessment-admin'}]},
	{name: 'Valued Component',isTemplate: false,multiple: false,code: 'valued-component',milestone: 'valued-component',versions: ['Submission','Draft for Public Comment Period','Draft VC (DAIR)','Final Draft (DAIR)','Final (AIR)'],phase: ''}
];

var stages = [{
	name: 'Edit',
	next: 'Review',
	prev: '',
	activity: 'edit'
}, {
	name: 'Review',
	next: 'Approval',
	prev: 'Edit',
	activity: 'review'
}, {
	name: 'Approval',
	next: 'Executive Approval',
	prev: 'Review',
	activity: 'approve'
}, {
	name: 'Executive Approval',
	next: 'Publish',
	prev: 'Approval',
	activity: 'executive'
}, {
	name: 'Publish',
	next: 'Notification',
	prev: 'Executive Approval',
	activity: 'publish'
}];


module.exports = {
	templates: require('./jtemplates.json'),
	stages: stages,
	artifacttypes: artifacttypes
};
