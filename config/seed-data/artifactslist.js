var milestonebases = [{
    code: 'project-description',
    name: 'Project Description',
    description: 'Project Description',
    artifactType: 'Project Description'
},{
    code: 'section-10-1-a-order',
    name: 'Section 10(1)(a) Order',
    description: 'Section 10(1)(a) Order',
    artifactType: 'Section 10(1)(a) Order'
},{
    code: 'section-10-1-b-order',
    name: 'Section 10(1)(b) Order',
    description: 'Section 10(1)(b) Order',
    artifactType: 'Section 10(1)(b) Order'
},{
    code: 'section-10-1-c-order',
    name: 'Section 10(1)(c) Order',
    description: 'Section 10(1)(c) Order',
    artifactType: 'Section 10(1)(c) Order'
},{
    code: 'section-11-order',
    name: 'Section 11 Order',
    description: 'Section 11 Order',
    artifactType: 'Section 11 Order'
},{
    code: 'section-7-3-order',
    name: 'Section 7(3) Order',
    description: 'Section 7(3) Order',
    artifactType: 'Section 7(3) Order'
},{
    code: 'valued-component',
    name: 'Valued Component',
    description: 'Valued Component',
    artifactType: 'Valued Component'
},{
	code: 'schedule-a',
	name: 'Schedule A',
	description: 'Schedule A',
	artifactType: 'Schedule A'
}];

var activitybases = [{
	code: 'edit',
	name: 'Edit Document',
	description: 'Edit Document',
	state: 'p.artifact.edit',
    read: ['project:eao:admin'],
    write: ['project:pro:member'],
    submit: ['project:pro:admin']
},{
	code: 'review',
	name: 'Review Document',
	description: 'Review Document',
	state: 'p.artifact.review',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
},{
	code: 'approve',
	name: 'Approve Document',
	description: 'Approve Document',
	state: 'p.artifact.approve',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
},{
	code: 'executive',
	name: 'Executive Approve Document',
	description: 'Executive Approve Document',
	state: 'p.artifact.executive',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
},{
	code: 'publish',
	name: 'Publish Document',
	description: 'Publish Document',
	state: 'p.artifact.publish',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
},{
	code: 'notify',
	name: 'Notify Document',
	description: 'Notify Document',
	state: 'p.artifact.notify',
    read: ['project:pro:admin','project:pro:member'],
    write: ['project:eao:member'],
    submit: ['project.eao.admin']
}];

var artifacttypes = [{
    type: 'Valued Component',
    milestone: 'valued-component',
    versions : [
        'Submission',
        'Draft for Public Comment Period',
        'Draft VC (DAIR)',
        'Final Draft (DAIR)',
        'Final (AIR)'
    ]
},{
	type: 'Valued Component',
	milestone: 'project-description',
    versions : [
        'Submission',
        'Draft',
        'Final',
        'Draft for Draft AIR',
        'Final for Draft AIR',
        'Draft for AIR',
        'Final for AIR',
        'Draft for Application',
        'Certified (Schedule A)'
    ]
},{
    type: 'Section 10(1)(a) Order',
    milestone: 'section-10-1-a-order',
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Section 10(1)(b) Order',
    milestone: 'section-10-1-b-order',
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Section 10(1)(c) Order',
    milestone: 'section-10-1-c-order',
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Section 7(3) Order',
    milestone: 'section-7-3-order',
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Section 11 Order',
    milestone: 'section-11-order',
    versions : [
        'Draft',
        'Final'
    ]
},{
    type: 'Schedule A',
    milestone: 'schedule-a',
    versions : [
        'Draft',
        'Final'
    ]
}];
var stages = [{
		name: 'Edit',
        next: 'Review',
        prev: '',
		activity: 'edit'
	},{
		name: 'Review',
        next: 'Approval',
        prev: 'Edit',
		activity: 'review'
	},{
		name: 'Approval',
        next: 'Executive Approval',
        prev: 'Review',
		activity: 'approve'
	},{
		name: 'Executive Approval',
        next: 'Publishing',
        prev: 'Approval',
		activity: 'executive'
	},{
		name: 'Publishing',
        next: 'Notification',
        prev: 'Executive Approval',
		activity: 'publish'
	},{
		name: 'Notification',
        next: '',
        prev: 'Publishing',
		activity: 'notify'
	}];


module.exports = {
	templates:require('./jtemplates.json'),
	milestonebases:milestonebases,
    activitybases:activitybases,
	stages:stages,
	artifacttypes:artifacttypes
};
