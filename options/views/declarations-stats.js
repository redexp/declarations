define('views/declarations-stats', [
	'views/declarations',
	'round',
	'view',
	'backbone',
], function (
	Declarations,
	round,
	View,
	BB
) {
	function DeclarationsStats() {
		Declarations.apply(this, arguments);
	}

	Declarations.extend({
		constructor: DeclarationsStats,

		template: {
			'[data-list]': {
				each: {
					view: DeclarationStat,
				}
			}
		}
	});

	function DeclarationStat() {
		Declarations.Declaration.apply(this, arguments);

		var area_list = this.model.get('data').step_3;

		this.get('area_list').reset(area_list ? Object.values(area_list) : []);

		this.listenTo(this.model.get('auto_list'), 'add remove reset', function () {
			this.trigger('auto_list_change');
		});
	}

	Declarations.Declaration.extend({
		constructor: DeclarationStat,

		defaults: function () {
			return {
				area_open: false,
				auto_open: false,
				area_list: new BB.Collection(),
			};
		},
		
		toggleArea: function () {
			this.set('area_open', !this.get('area_open'));
		},

		toggleAuto: function () {
			this.set('auto_open', !this.get('auto_open'));
		},

		template: {
			'[data-area-toggle]': {
				click: 'toggleArea',

				'& i': {
					toggleClass: {
						'i-chevron-up': '@area_open',
						'i-chevron-down': '!@area_open',
					}
				}
			},

			'[data-area-list-open]': {
				visible: '@area_open'
			},

			'[data-total-area]': {
				text: function () {
					return round(getTotal(this.model.get('data').step_3, 'totalArea'));
				}
			},
			'[data-area-list]': {
				each: {
					field: 'area_list',
					view: AreaSize,
					el: '> *'
				}
			},

			'[data-total-price-first]': {
				text: function () {
					return round(getTotal(this.model.get('data').step_3, 'costAssessment', 'cost_date_assessment'));
				}
			},
			'[data-area-price-first-list]': {
				each: {
					field: 'area_list',
					view: AreaPriceFirst,
					el: '> *'
				}
			},

			'[data-total-price-last]': {
				text: function () {
					return round(getTotal(this.model.get('data').step_3, 'costDate', 'cost_date_assessment'));
				}
			},
			'[data-area-price-last-list]': {
				each: {
					field: 'area_list',
					view: AreaPriceLast,
					el: '> *'
				}
			},

			'[data-total-not-finish-area]': {
				text: function () {
					return round(getTotal(this.model.get('data').step_4, 'totalArea'));
				}
			},

			'[data-auto-count]': {
				text: function () {
					var list = this.model.get('data').step_6;

					return list ? Object.values(list).length : 0;
				}
			},
			'[data-auto-total-price]': {
				text: function () {
					return round(getTotal(this.model.get('data').step_6, 'costDate'));
				}
			},
			'[data-auto-total-current-price]': {
				text: {
					'> #auto_list_change': function () {
						var total = this.model.get('auto_list').reduce(function (sum, model) {
							return sum + model.get('current_price');
						}, 0);

						return '$' + round(total);
					}
				}
			},

			'[data-auto-unknown-block]': {
				visible: {
					'> #auto_list_change': function () {
						return this.model.get('auto_list').where({unknown: true}).length > 0;
					}
				}
			},

			'[data-auto-unknown-count]': {
				text: {
					'> #auto_list_change': function () {
						return this.model.get('auto_list').where({unknown: true}).length;
					}
				}
			},
			
			'[data-auto-toggle]': {
				click: 'toggleAuto',

				'& i': {
					toggleClass: {
						'i-chevron-up': '@auto_open',
						'i-chevron-down': '!@auto_open',
					}
				}
			},
			'[data-auto-list-open]': {
				visible: '@auto_open'
			},
			'[data-auto-list-closed]': {
				visible: '!@auto_open'
			},

			'[data-auto-name-list]': {
				each: {
					field: 'auto_list',
					view: AutoName,
					el: '> *'
				}
			},
			'[data-auto-price-list]': {
				each: {
					field: 'auto_list',
					view: AutoPrice,
					el: '> *'
				}
			},
			'[data-auto-current-price-list]': {
				each: {
					field: 'auto_list',
					view: AutoCurrentPrice,
					el: '> *'
				}
			},
			
		}
	});



	function AreaSize() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: AreaSize,

		template: {
			'root': {
				text: '=totalArea'
			}
		}
	});

	function AreaPriceFirst() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: AreaPriceFirst,

		template: {
			'root': {
				text: function () {
					return round(this.model.get('costAssessment') || Number(this.model.get('cost_date_assessment')) || 0);
				}
			}
		}
	});

	function AreaPriceLast() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: AreaPriceLast,

		template: {
			'root': {
				text: function () {
					return round(this.model.get('costDate') || Number(this.model.get('cost_date_assessment')) || 0);
				}
			}
		}
	});

	function AutoName() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: AutoName,

		template: {
			'root': {
				text: function () {
					var auto = this.model.attributes;

					return `${auto.brand} ${auto.model}`;
				}
			}
		}
	});

	function AutoPrice() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: AutoPrice,

		template: {
			'root': {
				text: '=costDate'
			}
		}
	});

	function AutoCurrentPrice() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: AutoCurrentPrice,

		template: {
			'root': {
				text: function () {
					return (
						this.model.get('unknown_type') ?
							'Невідомий тип авто'
							:
							this.model.get('unknown') ?
								'Невідома модель'
								:
								'$' + round(this.model.get('current_price'))
					);
				}
			}
		}
	});


	function getTotal(list, prop, prop2) {
		if (!list) return 0;

		if (!Array.isArray(list)) {
			list = Object.values(list);
		}

		return list.reduce(function (sum, item) {
			return sum + (item[prop] || (prop2 && Number(item[prop2])) || 0);
		}, 0);
	}

	return DeclarationsStats;
});