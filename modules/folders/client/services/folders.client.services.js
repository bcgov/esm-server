
'use strict';

angular.module('folders').factory ('FolderModel', function (ModelBase, _) {
    var Class = ModelBase.extend ({
        urlName : 'folders',
        lookupForProjectIn: function (projectId, parentid) {
            return this.get('/api/folders/for/project/' + projectId + '/in/' + parentid);
        },
        lookup: function (projectId, folderId) {
            return this.get('/api/folders/for/project/' + projectId + '/' + folderId);
        },
        sortFolders: function (projectId, parentid, idList) {
            return this.put('/api/folders/for/project/' + projectId + '/in/' + parentid + '/sort', idList);
        },
    });
    return new Class ();
});


