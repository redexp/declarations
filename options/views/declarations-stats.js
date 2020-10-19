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

		this.listenTo(this.get('area_list'), 'add remove reset', function () {
			this.trigger('area_list_change');
		});

		this.listenTo(this.model.get('auto_list'), 'add remove reset', function () {
			this.trigger('auto_list_change');
		});

		var data = this.model.get('data');

		this.get('area_list').reset([].concat(
			Object.values(data.step_3 || {}).map(function (item) {
				item.type = item.objectType === 'Земельна ділянка' ? 'land' : 'house';
				return item;
			}),
			Object.values(data.step_4 || {}).map(function (item) {
				item.type = 'not-finished';
				return item;
			})
		));
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
				text: {
					'> #area_list_change': function () {
						return round(this.get('area_list').reduce(function (sum, item) {
							return sum + (item.get('totalArea') || 0);
						}, 0));
					}
				}
			},
			'[data-area-list]': {
				each: {
					field: 'area_list',
					view: AreaSize,
					el: '> *'
				}
			},

			'[data-total-price]': {
				text: {
					'> #area_list_change': function () {
						return round(
							this.get('area_list').reduce(function (sum, item) {
								var val = (
									Number(item.get('cost_date_assessment')) ||
									Number(item.get('costDate')) ||
									Number(item.get('costAssessment')) ||
									0
								);

								return sum + val;
							}, 0)
						);
					}
				}
			},
			'[data-area-price-list]': {
				each: {
					field: 'area_list',
					view: AreaPrice,
					el: '> *'
				}
			},

			'[data-area-unknown-price-block]': {
				visible: {
					'> #area_list_change': function () {
						return this.get('area_list').some(function (item) {
							return !(
								Number(item.get('cost_date_assessment')) ||
								Number(item.get('costDate')) ||
								Number(item.get('costAssessment')) ||
								0
							);
						});
					}
				},

				template: {
					'[data-area-unknown-price]': {
						text: {
							'> #area_list_change': function () {
								return this.get('area_list').reduce(function (sum, item) {
									var val = (
										Number(item.get('cost_date_assessment')) ||
										Number(item.get('costDate')) ||
										Number(item.get('costAssessment')) ||
										0
									);

									return sum + (val === 0 ? 1 : 0);
								}, 0);
							}
						}
					}
				}
			},

			'[data-area-total-type]': {
				text: {
					'> #area_list_change': function () {
						return this.get('area_list')
							.reduce(function (list, item) {
								var type = getType(item.get('type'));

								if (!list.includes(type)) {
									list.push(type);
								}

								return list;
							}, [])
							.join(', ');
					}
				}
			},
			'[data-area-type-list]': {
				each: {
					field: 'area_list',
					view: AreaType,
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

	function AreaPrice() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: AreaPrice,

		template: {
			'root': {
				text: function () {
					var item = this.model;

					return round(
						Number(item.get('cost_date_assessment')) ||
						Number(item.get('costDate')) ||
						Number(item.get('costAssessment')) ||
						0
					);
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

	function AreaType() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: AreaType,

		template: {
			'root': {
				text: function () {
					return getType(this.model.get('type'));
				}
			}
		}
	});

	function getList(data, prop) {
		return Object.values(data[prop] || {}).map(function (item) {
			item.parent = prop;
			return item;
		});
	}

	function getTotal(list, prop, prop2) {
		if (!list) return 0;

		if (!Array.isArray(list)) {
			list = Object.values(list);
		}

		return list.reduce(function (sum, item) {
			return sum + (item[prop] || (prop2 && Number(item[prop2])) || 0);
		}, 0);
	}

	function getType(type) {
		return (
			type === 'not-finished' ?
				'Незавершене будівництво'
				:
				type === 'land' ?
					'Земельна ділянка'
					:
					'Нерухомість'
		);
	}

	return DeclarationsStats;
});