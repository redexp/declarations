define('views/unknown-auto', [
	'view',
	'auto',
	'backbone',
], function (
	View,
	auto,
	BB
) {
	function UnknownAuto() {
		View.apply(this, arguments);

		this.cb = {};
	}

	View.extend({
		constructor: UnknownAuto,

		template: {
			'[data-list]': {
				each: {
					view: Auto,
					el: '> *'
				}
			}
		}
	});

	function Auto() {
		View.apply(this, arguments);

		if (this.model.get('objectType') !== "Автомобіль легковий") {
			return;
		}

		var view = this;
		var model = this.model;

		auto.getBrands(1)
			.then(function (list) {
				view.get('brands_list').reset(list);

				if (!model.get('brand_id')) {
					var brandName = model.get('brand').toLowerCase();
					var item = list.find(item => item.name.toLowerCase() === brandName);

					if (item) {
						view.set('brand_id', item.value);
					}
				}
				else {
					view.set(model.pick('brand_id'));
				}
			});

		this.bind('/brand_id', function () {
			if (!view.get('brand_id')) {
				view.get('models_list').reset([]);
				view.set('model_id', '');
				return;
			}

			auto.getModels(1, view.get('brand_id')).then(function (list) {
				view.get('models_list').reset(list);
				var model_id = model.getModelId(view.get('brand_id'), model.get('model'));

				if (!model_id) {
					var modelName = model.get('model').toLowerCase();
					var item = list.find(item => item.name.toLowerCase() === modelName);

					if (item) {
						view.set('model_id', item.value);
					}
				}
				else {
					view.set({model_id});
				}
			});
		});
	}

	View.extend({
		constructor: Auto,

		defaults: function () {
			return {
				brands_list: new BB.Collection(),
				models_list: new BB.Collection(),

				brand_id: '',
				model_id: '',
			};
		},

		applyAuto: function () {
			this.parent.cb.applyAuto(this.model, {
				brand_id: Number(this.get('brand_id')),
				model_id: Number(this.get('model_id')),
			});
		},

		template: {
			'[data-name]': {
				text: '=name'
			},

			'[data-brand]': {
				each: {
					field: 'brands_list',
					view: AutoOption,
					el: '> option:nth-child(2)'
				},
				connect: {
					'value': 'brand_id'
				}
			},

			'[data-model]': {
				each: {
					field: 'models_list',
					view: AutoOption,
					el: '> option:nth-child(2)'
				},
				connect: {
					'value': 'model_id'
				}
			},

			'[data-apply]': {
				click: 'applyAuto',
				prop: {
					'disabled': {
						'> /brand_id /model_id': function () {
							return !this.get('brand_id') || !this.get('model_id');
						}
					}
				}
			}
		}
	});

	function AutoOption() {
		View.apply(this, arguments);
	}

	View.extend({
		constructor: AutoOption,

		template: {
			'root': {
				prop: {
					'value': '=value',
					'text': '=name',
				}
			}
		}
	});

	return UnknownAuto;
});