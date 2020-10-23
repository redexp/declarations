define('views/declarations-stats', [
	'views/declarations',
	'round',
	'view',
	'backbone',
	'bootstrap'
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

		this.find('[title]').tooltip();

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

		this.get('income_list').reset(Object.values(data.step_11 || {}));
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

			incomeRoot: 'root',
			incomeName: '[data-income-name-list]',
			incomePrice: '[data-income-price-list]',
		},

		defaults: function () {
			return {
				area_open: false,
				auto_open: false,
				income_open: false,
				area_list: new BB.Collection(),
				income_list: new BB.Collection(),
			};
		},
		
		toggleArea: function () {
			this.set('area_open', !this.get('area_open'));
		},

		toggleAuto: function () {
			this.set('auto_open', !this.get('auto_open'));
		},

		toggleIncome: function () {
			this.set('income_open', !this.get('income_open'));
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

			'incomeRoot': {
				each: {
					field: 'income_list',
					el: '[data-income-name-list] > *, [data-income-price-list] > *',
					view: Income,
					addHandler: function (root, view) {
						this.ui.incomeName.append(view.ui.name);
						this.ui.incomePrice.append(view.ui.price);
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
					return countStep(this.model, 'step_6');
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

			'[data-income-count]': {
				text: function () {
					return countStep(this.model, 'step_11');
				}
			},
			'[data-income-total-price]': {
				text: function () {
					return round(getTotal(this.model.get('data').step_11, 'sizeIncome'));
				}
			},
			'[data-income-zero-price-block]': {
				visible: {
					'> #income_list_change': function () {
						return this.get('income_list').filter(item => !item.get('sizeIncome')).length > 0;
					}
				},

				'& [data-income-zero-price-count]': {
					text: {
						'> #income_list_change': function () {
							return this.get('income_list').filter(item => !item.get('sizeIncome')).length;
						}
					}
				},
			},
			'[data-income-toggle]': {
				click: 'toggleIncome',

				'& i': {
					toggleClass: {
						'i-chevron-up': '@income_open',
						'i-chevron-down': '!@income_open',
					}
				}
			},
			'[data-income-list-open]': {
				visible: '@income_open'
			},
		}
	});

	function Area() {
		View.apply(this, arguments);

		this.ui.type.tooltip();
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
				},
				attr: {
					'title': function () {
						return this.model.get('ua_cityType') || null;
					}
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

	function Income() {
		View.apply(this, arguments);

		this.ui.name.tooltip();
		this.ui.price.tooltip();
	}

	View.extend({
		constructor: Income,

		setElement: function () {
			View.prototype.setElement.apply(this, arguments);

			this.ui.name = this.$el.eq(0);
			this.ui.price = this.$el.eq(1);

			return this;
		},

		template: {
			'name': {
				text: function () {
					var person_id = this.model.get('person');
					var step_1 = this.parent.model.get('data').step_1;
					var step_2 = this.parent.model.get('data').step_2;
					var person = person_id === '1' ? step_1 : person_id && step_2 && step_2[person_id];

					return person && `${person.lastname} ${person.firstname} ${person.middlename}` || '';
				},
				attr: {
					'title': function () {
						var person_id = this.model.get('person');
						var step_2 = this.parent.model.get('data').step_2;

						if (person_id === '1') return null;

						var person = person_id && step_2 && step_2[person_id];

						return person && person.subjectRelation || null;
					}
				}
			},
			'price': {
				text: function () {
					return round(this.model.get('sizeIncome'));
				},
				attr: {
					'title': function () {
						var desc = this.model.get('otherObjectType');
						desc = desc ? ': ' + desc : '';

						return this.model.get('objectType') + desc;
					}
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

	function countStep(model, name) {
		var list = model.get('data')[name];

		return list ? Object.values(list).length : 0;
	}

	return DeclarationsStats;
});