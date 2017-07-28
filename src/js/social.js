// twitter intent links should open in a popout if possible
document.on('click', 'a[href^="https://twitter.com/intent"][target="_blank"]', function(e) {

	open(this.href, null, 'width=750,height=450');

	e.preventDefault();

});

// facebook share links should open in a popout if possible
document.on('click', 'a[href^="https://www.facebook.com/sharer"][target="_blank"]', function(e) {

	open(this.href, null, 'width=750,height=250');

	e.preventDefault();

});

// internal links should use ajax loading
document.on('click', 'a:not([target])', function(e) {

	// not an internal link
	if (this.protocol !== location.protocol || this.host !== location.host) return;

	window.location = this.href;

	e.preventDefault();

});