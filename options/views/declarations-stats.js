define('views/declarations-stats', [
	'views/declarations',
	'round',
	'view',
	'backbone'
], function (
	Declarations,
	round,
	View,
	BB
) {
	const AREA_ORDER = {
		'house': 1,
		'land': 2,
		'not-finished': 3,
	};

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
		).sort(function (a, b) {
			return AREA_ORDER[a.type] - AREA_ORDER[b.type];
		}));
	}

	Declarations.Declaration.extend({
		constructor: DeclarationStat,

		ui: {
			areaRoot: 'root',
			areaSize: '[data-area-size-list]',
			areaPrice: '[data-area-price-list]',
			areaType: '[data-area-type-list]',

			autoRoot: 'root',
			autoName: '[data-auto-name-list]',
			autoPrice: '[data-auto-price-list]',
			autoCurrentPrice: '[data-auto-current-price-list]',
		},

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

			'areaRoot': {
				each: {
					field: 'area_list',
					el: '[data-area-size-list] > *, [data-area-price-list] > *, [data-area-type-list] > *',
					view: Area,
					addHandler: function (root, view) {
						this.ui.areaSize.append(view.ui.size);
						this.ui.areaPrice.append(view.ui.price);
						this.ui.areaType.append(view.ui.type);
					}
				}
			},

			'autoRoot': {
				each: {
					field: 'auto_list',
					el: '[data-auto-name-list] > *, [data-auto-price-list] > *, [data-auto-current-price-list] > *',
					view: Auto,
					addHandler: function (root, view) {
						this.ui.autoName.append(view.ui.name);
						this.ui.autoPrice.append(view.ui.price);
						this.ui.autoCurrentPrice.append(view.ui.currentPrice);
					}
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

			'[data-auto-zero-price-block]': {
				visible: {
					'> #auto_list_change': function () {
						return this.model.get('auto_list').filter(item => !item.get('costDate')).length > 0;
					}
				},

				'& [data-auto-zero-price-count]': {
					text: {
						'> #auto_list_change': function () {
							return this.model.get('auto_list').filter(item => !item.get('costDate')).length;
						}
					}
				},
			},

			'[data-auto-unknown-block]': {
				visible: {
					'> #auto_list_change': function () {
						return this.model.get('auto_list').where({unknown: true}).length > 0;
					}
				},

				'& [data-auto-unknown-count]': {
					text: {
						'> #auto_list_change': function () {
							return this.model.get('auto_list').where({unknown: true}).length;
						}
					}
				},
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
		}
	});

	function Area() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: Area,

		setElement: function () {
			View.prototype.setElement.apply(this, arguments);

			this.ui.size = this.$el.eq(0);
			this.ui.price = this.$el.eq(1);
			this.ui.type = this.$el.eq(2);

			return this;
		},

		template: {
			'size': {
				text: '=totalArea'
			},
			'price': {
				text: function () {
					var item = this.model;

					return round(
						Number(item.get('cost_date_assessment')) ||
						Number(item.get('costDate')) ||
						Number(item.get('costAssessment')) ||
						0
					);
				}
			},
			'type': {
				text: function () {
					return getType(this.model.get('type'));
				}
			}
		}
	});

	function Auto() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: Auto,

		setElement: function () {
			View.prototype.setElement.apply(this, arguments);

			this.ui.name = this.$el.eq(0);
			this.ui.price = this.$el.eq(1);
			this.ui.currentPrice = this.$el.eq(2);

			return this;
		},

		template: {
			'name': {
				text: function () {
					var auto = this.model.attributes;

					return `${auto.brand} ${auto.model}`;
				}
			},
			'price': {
				text: function () {
					return round(this.model.get('costDate'));
				}
			},
			'currentPrice': {
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