require([
	'views/declarations',
	'backbone',
	'sendMessage',
	'sortDeclarations',
	'jquery',
], function (
	Declarations,
	BB,
	sendMessage,
	sortDeclarations,
	$
) {
	var list = new BB.Collection();
	
	var view = new Declarations({
		el: '#declarations',
		model: list
	});

	view.cb.sort = function (sortList) {
		sendMessage('set-sort-list', {sortList});

		sendMessage('get-declarations').then(function (declarations) {
			list.reset(sortDeclarations(declarations, sortList));
		});
	};

	view.cb.remove = function (model) {
		list.remove(model);
		sendMessage('set-declarations', {declarations: list.toJSON()});
	};

	view.cb.removeAll = function () {
		list.reset([]);
		sendMessage('set-declarations', {declarations: []});
	};

	Promise
		.all([
			sendMessage('get-declarations'),
			sendMessage('get-sort-list'),
		])
		.then(function ([declarations, sortList]) {
			list.reset(sortDeclarations(declarations, sortList));
			view.set('sort_list', sortList);
		});

	$('#compare').on('click', function () {
		chrome.runtime.openOptionsPage();
	});
});