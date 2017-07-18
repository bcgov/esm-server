# Filename Validator

Provides a filename validation along with preserving the original file's extension

## Usage

Add `fn-filename` attribute to a text input.  Provide the file extension in `fn-extension`. Optionally, provide the ID of a DOM element to display error messages.
The `fn-filename` directive requires the input has a ng-model.

Sample HTML
```
<form name="editFileForm" novalidate>
...
<div class="form-group file-type" x-show-errors>
    <label for="documentFileName" class="control-label">File Name</label>
    <span id="fileNameError" ng-show="editFileForm.documentFileName.$invalid" class="help-block"></span>
    <input class="form-control" id="documentFileName" name="documentFileName" type="text" ng-model="documentFileName"
        fn-filename fn-extension="{{extension}}" fn-error="fileNameError">
</div>
...   
</form> 
```

Sample controller
```
    // ng-model
    $scope.documentFileName = documentFileName;
    // fn-extension
    $scope.extension = documentFileName.split('.').pop();
```





