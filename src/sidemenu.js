APP.SideMenu = (function (document) {

	function SideMenu (el) {
		this.el = document.querySelector(el);

		var handle = document.querySelector('#sidemenu-handle');
		handle._tap = new APP.Tap(handle);
		handle.addEventListener('tap', this.toggleMenu.bind(this), false);

		this.updateStatus();
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

	return SideMenu;
})(document);