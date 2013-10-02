
var APP = {};

APP.editBlock = function (e) {
	e.stopPropagation();
	this.parentNode._editBlock = new APP.EditBlock(this.parentNode);
};

// Used to reorder already dropped excerpt
APP.dropped = function (el, html) {
	var actions;
	var draggableClass = '';
	var stage = document.getElementById('stage');

	stage.className = '';

	// add edit action if needed
	if ( !(/(^|\s)effect($|\s)/.test(el.className)) ) {
		actions = el.querySelector('.actions');
		actions._tap = new APP.Tap(actions);
		actions.addEventListener('tap', APP.editBlock, false);
	} else {
		draggableClass = 'draggableEffect';
	}

	el._dragInstance = new DragDrop(el, stage, {
		html: html,
		draggableClass: draggableClass,
		onDragStart: function () {
			stage.className = 'dragdrop';
			el.style.display = 'none';
			if ( actions ) {
				actions._tap.destroy();
			}
		},
		onDrop: function (el) {
			APP.dropped(el, html);
		}
	});
};

APP.init = (function (window, document) {

	var textselect;
	var sidemenu;
	var stage;
	var fade;
	var pause;

	function loaded () {
		stage = document.getElementById('stage');

		// Init the main text selection
		textselect = new WordSelect('#transcript', {
			addHelpers: false,
			onDragStart: function (e) {
				stage.className = 'dragdrop';

				var dragdrop = new DragDrop(null, stage, {
					init: false,
					onDrop: function (el) {
						textselect.clearSelection();
						this.destroy();
						APP.dropped(el);
					}
				});

				var html = this.getSelection().replace(/ class="[\d\w\s\-]*\s?"/gi, '') + '<div class="actions"></div>';
				dragdrop.init(html, e);
			}
		});

		// Init the side menu
		sidemenu = new APP.SideMenu('#sidemenu');

		// Init special fx
		fade = new DragDrop('#fadeFX', stage, {
			draggableClass: 'draggableEffect',
			onDragStart: function (e) {
				stage.className = 'dragdrop';
			},
			onDrop: function (el) {
				el.className += ' effect';
				el.innerHTML = '<form><label>Fade Effect: <span class="value">1</span>s</label><input type="range" value="1" min="0.5" max="5" step="0.1" onchange="this.parentNode.querySelector(\'span\').innerHTML = this.value"></form>';
				APP.dropped(el, 'Fade');
			}
		});

		pause = new DragDrop('#pauseFX', stage, {
			draggableClass: 'draggableEffect',
			onDragStart: function (e) {
				stage.className = 'dragdrop';
			},
			onDrop: function (el) {
				el.className += ' effect';
				el.innerHTML = '<form><label>Pause: <span class="value">1</span>s</label><input type="range" value="1" min="0.5" max="5" step="0.1" onchange="this.parentNode.querySelector(\'span\').innerHTML = this.value"></form>';
				APP.dropped(el, 'Pause');
			}
		});
	}

	// kickstart
	function init () {
		// nothing to do
	}

	window.addEventListener('load', loaded, false);
	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

	return init;

})(window, document);