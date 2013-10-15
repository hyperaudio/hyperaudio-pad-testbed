/*! hyperaudio-pad-testbed v1.0.2 ~ (c) 2012-2013 Hyperaudio Inc. <hello@hyperaud.io> (http://hyperaud.io) */
var DragDrop = (function (window, document) {

	function DragDrop (handle, droppable, options) {
		this.options = {
			init: true,
			touch: true,
			mouse: true,
			timeout: 500,
			html: '',
			draggableClass: '',
			containerTag: 'article',
			blockTag: 'section'
		};

		for ( var i in options ) {
			this.options[i] = options[i];
		}

		this.droppable = typeof droppable == 'string' ? document.querySelector(droppable) : droppable;

		// Create the list and the placeholder
		this.list = this.droppable.querySelector(this.options.containerTag);
		if ( !this.list ) {
			this.list = document.createElement(this.options.containerTag);
			this.droppable.appendChild(this.list);
		}
		this.placeholder = document.createElement(this.options.blockTag);
		this.placeholder.className = 'placeholder';

		if ( this.options.init ) {
			this.handle = typeof handle == 'string' ? document.querySelector(handle) : handle;
			this.handleClassName = this.handle.className;

			// Are we reordering the list?
			this.reordering = this.handle.parentNode == this.list;

			if ( this.options.touch ) {
				this.handle.addEventListener('touchstart', this, false);
			}

			if ( this.options.mouse ) {
				this.handle.addEventListener('mousedown', this, false);
			}
		}
	}

	DragDrop.prototype.handleEvent = function (e) {
		// jshint -W086
		switch (e.type) {
			case 'mousedown':
				if ( e.which !== 1 ) {
					break;
				}
			case 'touchstart':
				this.start(e);
				break;
			case 'touchmove':
			case 'mousemove':
				this.move(e);
				break;
			case 'touchend':
			case 'mouseup':
				this.end(e);
				break;
		}
		// jshint +W086
	};

	DragDrop.prototype.start = function (e) {
		if ( /INPUT/.test(e.target.tagName) ) {
			return;
		}

		e.preventDefault();

		if ( this.options.touch ) {
			document.addEventListener('touchend', this, false);
		}

		if ( this.options.mouse ) {
			document.addEventListener('mouseup', this, false);
		}

		clearTimeout(this.dragTimeout);
		this.initiated = false;
		this.lastTarget = null;

		this.dragTimeout = setTimeout(this.init.bind(this, this.options.html || this.handle.innerHTML, e), this.options.timeout);
	};

	DragDrop.prototype.init = function (html, e) {
		if ( !this.options.init ) {
			if ( this.options.touch ) {
				document.addEventListener('touchend', this, false);
			}

			if ( this.options.mouse ) {
				document.addEventListener('mouseup', this, false);
			}
		}

		// Create draggable
		this.draggable = document.createElement('div');
		this.draggable.className = 'draggable' + ' ' + this.options.draggableClass;
		this.draggableStyle = this.draggable.style;
		this.draggableStyle.cssText = 'position:absolute;z-index:1000;pointer-events:none;left:-99999px';
		this.draggable.innerHTML = html;

		document.body.appendChild(this.draggable);

		this.draggableCenterX = Math.round(this.draggable.offsetWidth / 2);
		this.draggableCenterY = Math.round(this.draggable.offsetHeight / 2);

		this.position(e);

		if ( this.options.touch ) {
			document.addEventListener('touchmove', this, false);
		}

		if ( this.options.mouse ) {
			document.addEventListener('mousemove', this, false);
		}

		this.initiated = true;

		// If we are reordering the list, hide the current element
		if ( this.reordering ) {
			this.handle.style.display = 'none';
		}

		this.move(e);

		if ( this.options.onDragStart ) {
			this.options.onDragStart.call(this);
		}
	};

	DragDrop.prototype.position = function (e) {
		var point = e.changedTouches ? e.changedTouches[0] : e;

		this.draggableStyle.left = point.pageX - this.draggableCenterX + 'px';
		this.draggableStyle.top = point.pageY - this.draggableCenterY + 'px';
	};

	DragDrop.prototype.move = function (e) {
		e.preventDefault();
		e.stopPropagation();

		var point = e.changedTouches ? e.changedTouches[0] : e;
		var target = e.touches ? document.elementFromPoint(point.pageX, point.pageY) : point.target;

		this.position(e);

		if ( target == this.lastTarget || target == this.placeholder || target == this.list ) {
			return;
		}

		this.lastTarget = target;

		if ( target == this.droppable ) {
			this.list.appendChild(this.placeholder);
			return;
		}

		if ( /(^|\s)item(\s|$)/.test(target.className) ) {
			var items = this.list.querySelectorAll('.item'),
				i = 0, l = items.length;
			for ( ; i < l; i++ ) {
				if ( target == items[i] ) {
					this.list.insertBefore(this.placeholder, items[i]);
					break;
				}
			}
		}
	};

	DragDrop.prototype.end = function (e) {
		clearTimeout(this.dragTimeout);

		document.removeEventListener('touchend', this, false);
		document.removeEventListener('mouseup', this, false);

		if ( !this.initiated ) {
			return;
		}

		document.removeEventListener('touchmove', this, false);
		document.removeEventListener('mousemove', this, false);

		var point = e.changedTouches ? e.changedTouches[0] : e;
		var target = e.touches ? document.elementFromPoint(point.pageX, point.pageY) : point.target;

		var html = this.options.html ? this.handle.innerHTML : this.draggable.innerHTML;
		this.draggable.parentNode.removeChild(this.draggable);
		this.draggable = null;

		// we dropped outside of the draggable area, so exit
		if ( !this.list.querySelector('.placeholder') ) {
			return;
		}

		var el;

		// if we are reordering, reuse the original element
		if ( this.reordering ) {
			el = this.handle;
			this.handle.style.display = '';
		} else {
			el = document.createElement(this.options.blockTag);
			el.className = this.handleClassName || 'item';
			el.innerHTML = html;
		}

		this.list.insertBefore(el, this.placeholder);
		this.placeholder.parentNode.removeChild(this.placeholder);

		if ( this.options.onDrop ) {
			this.options.onDrop.call(this, el);
		}
	};

	DragDrop.prototype.destroy = function () {
		document.removeEventListener('touchstart', this, false);
		document.removeEventListener('touchmove', this, false);
		document.removeEventListener('touchend', this, false);

		document.removeEventListener('mousedown', this, false);
		document.removeEventListener('mousemove', this, false);
		document.removeEventListener('mouseup', this, false);
	};

	return DragDrop;
})(window, document);var WordSelect = (function (window, document) {

	function addTagHelpers (el) {
		var text = (el.innerText || el.textContent).split(' ');

		el.innerHTML = '<a>' + text.join(' </a><a>') + '</a>';
	}

	function hasClass (e, c) {
		if ( !e ) return false;

		var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
		return re.test(e.className);
	}

	function addClass (e, c) {
		if ( hasClass(e, c) ) {
			return;
		}

		var newclass = e.className.split(' ');
		newclass.push(c);
		e.className = newclass.join(' ');
	}

	function removeClass (e, c) {
		if ( !hasClass(e, c) ) {
			return;
		}

		var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
		e.className = e.className.replace(re, ' ');
	}

	function WordSelect (el, options) {
		this.element = document.querySelector(el);

		this.options = {
			addHelpers: false,
			touch: true,
			mouse: true,
			threshold: 10
		};

		for ( var i in options ) {
			this.options[i] = options[i];
		}

		if ( this.options.addHelpers ) {
			addTagHelpers(this.element);
		}

		this.words = this.element.querySelectorAll('a');
		this.wordsCount = this.words.length;

		if ( this.options.touch ) {
			this.element.addEventListener('touchstart', this, false);
		}

		if ( this.options.mouse ) {
			this.element.addEventListener('mousedown', this, false);
		}
	}

	WordSelect.prototype.handleEvent = function (e) {
		// jshint -W086
		switch (e.type) {
			case 'mousedown':
				if ( e.which !== 1 ) {
					break;
				}
			case 'touchstart':
				this.start(e);
				break;
			case 'touchmove':
			case 'mousemove':
				this.move(e);
				break;
			case 'touchend':
			case 'mouseup':
				this.end(e);
				break;
		}
		// jshint +W086
	};

	WordSelect.prototype.start = function (e) {
		e.preventDefault();

		var point = e.touches ? e.touches[0] : e;

		this.selectStarted = false;
		this.startX = e.pageX;
		this.startY = e.pageY;

		if ( this.options.mouse ) {
			this.element.addEventListener('mousemove', this, false);
			window.addEventListener('mouseup', this, false);
		}

		if ( this.options.touch ) {
			this.element.addEventListener('touchmove', this, false);
			window.addEventListener('touchend', this, false);
		}

		if ( hasClass(e.target, 'selected') ) {
			this.dragTimeout = setTimeout(this.dragStart.bind(this, e), 500);
		}
	};

	WordSelect.prototype.selectStart = function (e) {
		var target = e.target,
			tmp;

		if ( target == this.element || target.tagName != 'A' ) {
			return;
		}

		this.selectStarted = true;

		this.currentWord = target;

		removeClass(this.element.querySelector('.first'), 'first');
		removeClass(this.element.querySelector('.last'), 'last');

		if ( this.words[this.startPosition] === target ) {
			tmp = this.startPosition;
			this.startPosition = this.endPosition;
			this.endPosition = tmp;
			return;
		}

		if ( this.words[this.endPosition] === target ) {
			return;
		}

		for ( var i = 0; i < this.wordsCount; i++ ) {
			if ( this.words[i] == target ) {
				this.startPosition = i;
			}

			removeClass(this.words[i], 'selected');
		}

		this.endPosition = this.startPosition;

		addClass(target, 'selected');
	};

	WordSelect.prototype.move = function (e) {
		var point = e.changedTouches ? e.changedTouches[0] : e,
			target = e.touches ? document.elementFromPoint(point.pageX, point.pageY) : point.target,
			endPosition;

		if ( Math.abs(point.pageX - this.startX) < this.options.threshold &&
			Math.abs(point.pageY - this.startY) < this.options.threshold ) {
			return;
		}

		clearTimeout(this.dragTimeout);

		if ( !this.selectStarted ) {
			this.selectStart(e);
			return;
		}

		if ( target.tagName == 'P' ) {
			target = target.querySelector('a:last-child');
		}

		if ( target == this.element || target == this.currentWord || target.tagName != 'A' ) {
			return;
		}

		for ( var i = 0; i < this.wordsCount; i++ ) {
			if ( this.words[i] == target ) {
				endPosition = i;
			}

			if ( ( endPosition === undefined && i >= this.startPosition ) ||
				( endPosition !== undefined && i <= this.startPosition ) ||
				endPosition == i ) {
				addClass(this.words[i], 'selected');
			} else {
				removeClass(this.words[i], 'selected');
			}
		}

		this.currentWord = target;
		this.endPosition = endPosition;
	};

	WordSelect.prototype.end = function (e) {
		clearTimeout(this.dragTimeout);

		if ( this.options.touch ) {
			this.element.removeEventListener('touchmove', this, false);
			this.element.removeEventListener('touchend', this, false);
		}

		if ( this.options.mouse ) {
			this.element.removeEventListener('mousemove', this, false);
			this.element.removeEventListener('mouseup', this, false);
		}

		if ( !this.selectStarted ) {
			if ( e.target == this.element ) {
				this.clearSelection();
			}

			return;
		}

		var start = Math.min(this.startPosition, this.endPosition),
			end = Math.max(this.startPosition, this.endPosition);

		addClass(this.words[start], 'first');
		addClass(this.words[end], 'last');
	};

	WordSelect.prototype.clearSelection = function () {
		this.currentWord = null;
		this.startPosition = null;
		this.endPosition = null;

		removeClass(this.element.querySelector('.first'), 'first');
		removeClass(this.element.querySelector('.last'), 'last');

		if ( this.options.touch ) {
			this.element.removeEventListener('touchmove', this, false);
			this.element.removeEventListener('touchend', this, false);
		}

		if ( this.options.mouse ) {
			this.element.removeEventListener('mousemove', this, false);
			this.element.removeEventListener('mouseup', this, false);
		}

		var selected = this.element.querySelectorAll('.selected');
		for ( var i = 0, l = selected.length; i < l; i++ ) {
			removeClass(selected[i], 'selected');
		}
	};

	WordSelect.prototype.getSelection = function () {
		var selected = this.element.querySelectorAll('.selected');
		var prevParent;
		var html = '';
		for ( var i = 0, l = selected.length; i < l; i++ ) {
			if ( selected[i].parentNode !== prevParent ) {
				prevParent = selected[i].parentNode;
				html += ( i === 0 ? '<p>' : '</p><p>' );
			}
			html += selected[i].outerHTML.replace(/ class="[\d\w\s\-]*\s?"/gi, ' ');
		}

		if ( html ) {
			html += '</p>';
		}

		return html;
	};

	WordSelect.prototype.dragStart = function (e) {
		e.stopPropagation();

		if ( this.options.touch ) {
			this.element.removeEventListener('touchmove', this, false);
			this.element.removeEventListener('touchend', this, false);
		}

		if ( this.options.mouse ) {
			this.element.removeEventListener('mousemove', this, false);
			this.element.removeEventListener('mouseup', this, false);
		}

		var point = e.changedTouches ? e.changedTouches[0] : e;

		if ( this.options.onDragStart ) {
			this.options.onDragStart.call(this, e);
		}
	};

	WordSelect.prototype.destroy = function () {
		this.element.removeEventListener('touchstart', this, false);
		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);

		this.element.removeEventListener('mousedown', this, false);
		this.element.removeEventListener('mousemove', this, false);
		this.element.removeEventListener('mouseup', this, false);
	};

	return WordSelect;

})(window, document);
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
		}
	});
};

APP.init = (function (window, document) {

	var textselect;
	var sidemenu;
	var stage;
	var fade;
	var pause;

	var videoSource;
	var videoStage;

	function loaded () {
		stage = document.getElementById('stage');
		videoSource = document.querySelector('#video-source video');

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
		sidemenu = new APP.SideMenu('#sidemenu', mediaSelect);

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

	function mediaSelect (el) {
		var source = el.getAttribute('data-source');

		document.getElementById('source-mp4').src = 'videos/' + source + '.mp4';
		document.getElementById('source-webm').src = 'videos/' + source + '.webm';
		videoSource.load();
	}

	window.addEventListener('load', loaded, false);
	document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

	return init;

})(window, document);APP.Tap = (function () {
	function hasClass (e, c) {
		if ( !e ) return false;

		var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
		return re.test(e.className);
	}

	function addClass (e, c) {
		if ( hasClass(e, c) ) {
			return;
		}

		var newclass = e.className.split(' ');
		newclass.push(c);
		e.className = newclass.join(' ');
	}

	function removeClass (e, c) {
		if ( !hasClass(e, c) ) {
			return;
		}

		var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
		e.className = e.className.replace(re, ' ');
	}


	function Tap (el) {
		this.el = typeof el == 'string' ? document.querySelector(el) : el;

		this.el.addEventListener('touchstart', this, false);
		this.el.addEventListener('mousedown', this, false);
	}

	Tap.prototype = {
		handleEvent: function (e) {
			// jshint -W086
			switch (e.type) {
				case 'mousedown':
					if ( e.which !== 1 ) {
						break;
					}
				case 'touchstart':
					this._start(e);
					break;
				case 'touchmove':
				case 'mousemove':
					this._move(e);
					break;
				case 'touchend':
				case 'mouseup':
				case 'touchcancel':
				case 'mousecancel':
					this._end(e);
					break;
			}
			// jshint +W086
		},

		_start: function (e) {
			if ( e.touches && e.touches.length > 1 ) return;

			var point = e.touches ? e.touches[0] : e;
			
			this.moved = false;
			this.startX = point.pageX;
			this.startY = point.pageY;
			this.target = e.target;

			addClass(this.target, 'tapPressed');

			this.el.addEventListener('touchmove', this, false);
			this.el.addEventListener('touchend', this, false);
			this.el.addEventListener('touchcancel', this, false);
			this.el.addEventListener('mousemove', this, false);
			this.el.addEventListener('mouseup', this, false);
			this.el.addEventListener('mousecancel', this, false);
		},

		_move: function (e) {
			var point = e.changedTouches ? e.changedTouches[0] : e,
				x = point.pageX,
				y = point.pageY;

			if ( Math.abs( x - this.startX ) > 10 || Math.abs( y - this.startY ) > 10 ) {
				removeClass(this.target, 'tapPressed');
				this.moved = true;
			}
		},

		_end: function (e) {
			removeClass(this.target, 'tapPressed');

			if ( !this.moved ) {
				var ev = document.createEvent('Event'),
					point = e.changedTouches ? e.changedTouches[0] : e;

				ev.initEvent('tap', true, true);
				ev.pageX = point.pageX;
				ev.pageY = point.pageY;
				this.target.dispatchEvent(ev);
			}

			this.el.removeEventListener('touchmove', this, false);
			this.el.removeEventListener('touchend', this, false);
			this.el.removeEventListener('touchcancel', this, false);
			this.el.removeEventListener('mousemove', this, false);
			this.el.removeEventListener('mouseup', this, false);
			this.el.removeEventListener('mousecancel', this, false);
		},
		
		destroy: function () {
			this.el.removeEventListener('touchstart', this, false);
			this.el.removeEventListener('touchmove', this, false);
			this.el.removeEventListener('touchend', this, false);
			this.el.removeEventListener('touchcancel', this, false);
			this.el.removeEventListener('mousedown', this, false);
			this.el.removeEventListener('mousemove', this, false);
			this.el.removeEventListener('mouseup', this, false);
			this.el.removeEventListener('mousecancel', this, false);
		}
	};
	
	return Tap;
})();APP.EditBlock = (function () {

	function EditBlock (el) {
		this.el = typeof el == 'string' ? document.querySelector(el) : el;
		this.words = this.el.querySelectorAll('a');

		this.el.className += ' edit';
		this.el._tap = new APP.Tap(el);
		this.el.addEventListener('tap', this, false);
	}

	EditBlock.prototype.handleEvent = function (e) {
		switch (e.type) {
			case 'tap':
				this.edit(e);
				break;
		}
	};

	EditBlock.prototype.edit = function (e) {
		var theCut = e.target;
		var cutPointReached;
		var wordCount = this.words.length;

		if ( theCut.tagName != 'A' || theCut == this.words[wordCount-1] ) {
			return;
		}

		// Create a new block
		var newBlock = document.createElement('section');
		var newParagraph, prevContainer;

		newBlock.className = 'item';

		for ( var i = 0; i < wordCount; i++ ) {
			if ( this.words[i].parentNode != prevContainer ) {
				if ( newParagraph && cutPointReached ) {
					newBlock.appendChild(newParagraph);
				}

				newParagraph = document.createElement('p');
				prevContainer = this.words[i].parentNode;
			}

			if ( cutPointReached ) {
				newParagraph.appendChild(this.words[i]);

				if ( !prevContainer.querySelector('a') ) {
					prevContainer.parentNode.removeChild(prevContainer);
				}
			}

			if ( !cutPointReached && this.words[i] == theCut ) {
				cutPointReached = true;
			}
		}

		newBlock.appendChild(newParagraph);

		var action = document.createElement('div');
		action.className = 'actions';
		newBlock.appendChild(action);

		this.el.parentNode.insertBefore(newBlock, this.el.nextSibling);
		this.el.handleHTML = this.el.innerHTML;

		APP.dropped(newBlock);

		// Remove edit status
		this.el.className = this.el.className.replace(/(^|\s)edit(\s|$)/g, ' ');

		this.destroy();
	};

	EditBlock.prototype.destroy = function () {
		this.el.removeEventListener('tap', this, false);
		this.el._editBlock = null;

		this.el._tap.destroy();
		this.el._tap = null;
	};

	return EditBlock;
})();APP.SideMenu = (function (document) {

	function SideMenu (el, fn) {
		this.el = document.querySelector(el);
		this.mediaCallback = fn;

		var handle = document.querySelector('#sidemenu-handle');
		handle._tap = new APP.Tap(handle);
		handle.addEventListener('tap', this.toggleMenu.bind(this), false);

		this.updateStatus();

		// handle the tab bar
		var tabs = document.querySelectorAll('#sidemenu .tabbar li');
		for ( var i = tabs.length-1; i >= 0; i-- ) {
			tabs[i]._tap = new APP.Tap(tabs[i]);
			tabs[i].addEventListener('tap', this.selectPanel.bind(this), false);
		}

		// handle the items list
		var items = document.querySelectorAll('#sidemenu .panel');
		for ( i = items.length-1; i >= 0; i-- ) {
			items[i]._tap = new APP.Tap(items[i]);
			items[i].addEventListener('tap', this.selectMedia.bind(this), false);
		}
	}

	SideMenu.prototype.updateStatus = function () {
		this.opened = /(^|\s)opened(\s|$)/.test(this.el.className);
	};

	SideMenu.prototype.toggleMenu = function () {
		if ( this.opened ) {
			this.close();
		} else {
			this.open();
		}
	};

	SideMenu.prototype.open = function () {
		if ( this.opened ) {
			return;
		}

		this.el.className += ' opened';
		this.opened = true;
	};

	SideMenu.prototype.close = function () {
		if ( !this.opened ) {
			return;
		}

		this.el.className = this.el.className.replace(/(^|\s)opened(\s|$)/, ' ');
		this.opened = false;
	};

	SideMenu.prototype.selectPanel = function (e) {
		var current = document.querySelector('#sidemenu .tabbar li.selected');
		var incoming = e.currentTarget;
		current.className = current.className.replace(/(^|\s)selected($|\s)/, '');
		incoming.className += ' selected';

		var panelID = 'panel' + incoming.id.replace('sidemenu', '');
		current = document.querySelector('#sidemenu .panel.selected');
		current.className = current.className.replace(/(^|\s)selected($|\s)/, '');
		incoming = document.querySelector('#' + panelID);
		incoming.className += ' selected';
	};

	SideMenu.prototype.selectMedia = function (e) {
		e.stopPropagation();	// just in case

		var starter = e.target;

		if ( !e.target.getAttribute('data-source') || !this.mediaCallback ) {
			return;
		}

		this.mediaCallback(starter);
	};

	return SideMenu;
})(document);