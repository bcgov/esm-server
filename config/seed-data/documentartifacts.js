var milestones = [{
    code: 'documents',
    name: 'Documents',
    description: 'Documents',
    artifactType: 'Documents'
}];

var artifacttypes = [{
    name: 'Documents',
    multiple: false,
    isTemplate: false,
    isDocument:true,
    code: 'documents',
    milestone: 'documents',
    versions : [
        'Final'
    ],
    stages: [{
        name: 'Edit',
        next: '',
        prev: '',
        activity: 'edit'
    }]
}];


module.exports = {
	milestones:milestones,
	artifacttypes:artifacttypes
};
