APP.SideMenu = (function (document) {

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