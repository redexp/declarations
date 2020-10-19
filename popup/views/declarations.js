define('views/declarations', [
	'view'
], function (
	View
) {
	function Declarations() {
		View.apply(this, arguments);

		this.cb = {};
	}

	View.extend({
		constructor: Declarations,

		defaults: function () {
			return {
				sort_list: [],
			};
		},

		switchSort: function (field, sort) {
			sort = (
				sort === 'none' ?
					'asc'
					:
					sort === 'asc' ?
						'desc'
						:
						'none'
			);

			var list = this.get('sort_list').filter(item => item.field !== field);

			if (sort !== 'none') {
				list.push({field, sort});
			}

			this.set('sort_list', list);
			this.cb.sort(list);
		},

		removeAll: function () {
			this.cb.removeAll();
		},

		template: {
			'[data-sort-name]': {
				toggleClass: {
					'hidden': {
						'@sort_list': function (list) {
							var item = list.find(item => item.field === 'name');
							var sort = item && item.sort || 'none';

							return function (i, node) {
								return node.getAttribute('data-sort-name') !== sort;
							};
						}
					}
				},
				click: function (e) {
					this.switchSort('name', e.currentTarget.getAttribute('data-sort-name'));
				}
			},
			'[data-sort-year]': {
				toggleClass: {
					'hidden': {
						'@sort_list': function (list) {
							var item = list.find(item => item.field === 'year');
							var sort = item && item.sort || 'none';

							return function (i, node) {
								return node.getAttribute('data-sort-year') !== sort;
							};
						}
					}
				},
				click: function (e) {
					this.switchSort('year', e.currentTarget.getAttribute('data-sort-year'));
				}
			},
			'[data-remove-all]': {
				click: 'removeAll'
			},
			'[data-list]': {
				each: {
					view: Declaration,
					el: '> *'
				}
			}
		}
	});

	function Declaration() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: Declaration,

		removeDeclaration: function () {
			this.parent.cb.remove(this.model);
		},

		template: {
			'[data-name]': {
				text: function () {
					var i = this.model.get('info');

					return `${i.last_name} ${i.first_name} ${i.patronymic}`;
				},
				attr: {
					'href': function () {
						var i = this.model.get('info');

						return i.url;
					}
				}
			},
			'[data-year]': {
				text: function () {
					var i = this.model.get('info');

					return i.declaration_year;
				}
			},
			'[data-type]': {
				text: function () {
					var i = this.model.get('info');

					return i.document_type;
				}
			},
			'[data-remove]': {
				click: 'removeDeclaration'
			},
		}
	});

	Declarations.Declaration = Declaration;

	return Declarations;
});