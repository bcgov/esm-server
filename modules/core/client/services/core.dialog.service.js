
"use strict";

angular.module('core')
.service('DnDBackgroundBlockService',  DnDBackgroundBlockService );

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
			var elementId = element.attr('id');
			if (element.attr('id') === dropTargetId) {
				//console.log("OK ", e.type);
				return;
			}
			element = element.parent();
			cnt++;
		} while(cnt < 10 && element && element.tagname !== 'body');
		// console.log('prevent on ' , dropTargetId);
		e.preventDefault();
	}

	function addEventListeners(targetId) {
		dropTargetId = targetId || 'dropzone';
		// console.log("Add event listeners");
		window.addEventListener("drop", blockEvent, false);
		window.addEventListener("dragover", blockEvent, false);
	}

	function removeEventListeners() {
		// console.log("remove event listeners");
		window.removeEventListener("drop", blockEvent, false);
		window.removeEventListener("dragover", blockEvent, false);
	}
}
