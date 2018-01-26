
"use strict";

angular.module('core')
  .service('DnDBackgroundBlockService', DnDBackgroundBlockService );

function DnDBackgroundBlockService() {
  var dropTargetId = 'dropzone';
  return {
    addEventListeners: addEventListeners,
    removeEventListeners: removeEventListeners
  };
  function blockEvent(e) {
    e = e || event;
    var element = angular.element(e.target);
    var cnt = 0;
    do {
      if (element.attr('id') === dropTargetId) {
        return;
      }
      element = element.parent();
      cnt++;
    } while(cnt < 10 && element && element.tagname !== 'body');
    e.preventDefault();
  }

  function addEventListeners(targetId) {
    dropTargetId = targetId || 'dropzone';
    window.addEventListener("drop", blockEvent, false);
    window.addEventListener("dragover", blockEvent, false);
  }

  function removeEventListeners() {
    window.removeEventListener("drop", blockEvent, false);
    window.removeEventListener("dragover", blockEvent, false);
  }
}
