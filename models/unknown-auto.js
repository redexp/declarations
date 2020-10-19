define('models/unknown-auto', [
	'backbone'
], function (
	BB
) {
	function UnknownAuto() {
		BB.Collection.apply(this, arguments);
	}

	BB.Collection.extend({
		constructor: UnknownAuto,

		model: Auto,
	});

	function Auto() {
		BB.Model.apply(this, arguments);

		var brand_id = getBrands(this.get('brand')) || '';
		var model_id = getModels(brand_id, this.get('model')) || '';

		this.set({brand_id, model_id});
	}

	BB.Model.extend({
		constructor: Auto,

		idAttribute: 'name',

		defaults: {
			brand_id: '',
			model_id: '',
		},

		setBrandId: function (brand_id) {
			var brands = getBrands();
			var name = this.get('brand');

			if (brand_id && name) {
				brands[name] = brand_id;
			}

			setBrands(brands);

			this.set({brand_id});
		},

		setModelId: function (model_id) {
			var brand_id = this.get('brand_id');
			var name = this.get('model');

			if (brand_id && name) {
				var models = getModels();

				if (!models[brand_id]) {
					models[brand_id] = {};
				}

				models[brand_id][name] = model_id;

				setModels(models);
			}

			this.set({model_id});
		},

		getModelId: function (brand_id, name) {
			return getModels(brand_id, name);
		},
	});

	function getBrands(name) {
		var brands = localStorage.getItem('unknown-auto-brands');
		brands = brands ? JSON.parse(brands) : {};

		if (arguments.length === 0) return brands;
		if (arguments.length === 1) return brands[name];
	}

	function setBrands(brands) {
		localStorage.setItem('unknown-auto-brands', JSON.stringify(brands));
	}

	function getModels(brand_id, name) {
		var models = localStorage.getItem('unknown-auto-models');
		models = models ? JSON.parse(models) : {};

		if (arguments.length === 0) return models;
		if (arguments.length === 1) return models[brand_id];
		if (arguments.length === 2) return models[brand_id] && models[brand_id][name];
	}

	function setModels(models) {
		localStorage.setItem('unknown-auto-models', JSON.stringify(models));
	}

	return UnknownAuto;
});