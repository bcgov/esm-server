"use strict";
angular.module('core')
.service('MovableModalService', movableModalService)
.directive('modalMovable', ['$document', 'MovableModalService', function($document, MovableModalService) {
	return {
		restrict: 'AC',
		link: function (scope, element) {
			MovableModalService.movableModal($document, element);
		}
	};
}]);

function movableModalService() {
	var service = this;
	service.movableModal = movableModal;
	function movableModal($document, iElement) {
		var startX = 0,
			startY = 0,
			x = 0,
			y = 0;
		var dialogWrapper = iElement.parent();
		var dragHandle = iElement.children(".modal-header")[0];
		dialogWrapper.css({
			position: 'relative'
		});
		dragHandle.style.cursor = 'move';
		dragHandle.addEventListener('mousedown', function (event) {
			// Prevent default dragging of selected content
			event.preventDefault();
			startX = event.pageX - x;
			startY = event.pageY - y;
			$document.on('mousemove', mousemove);
			$document.on('mouseup', mouseup);
		});
		function mousemove(event) {
			y = event.pageY - startY;
			x = event.pageX - startX;
			dialogWrapper.css({
				top: y + 'px',
				left: x + 'px'
			});
		}

		function mouseup() {
			$document.unbind('mousemove', mousemove);
			$document.unbind('mouseup', mouseup);
		}
	}
}
