define('auto', [
	'jquery'
], function (
	$
) {
	const HOST = 'https://developers.ria.com';
	const api_key = 'Rt4Y0cbwuLnmBz9jB20ghNbNEbmtHPb5hcNcwYUj';

	const CACHE_TIMEOUT = 60 * 60 * 24 * 1000;

	var types = [
		{ name: "Легковые", value: 1 },
		{ name: "Мото", value: 2 },
		{ name: "Водный транспорт", value: 3 },
		{ name: "Спецтехника", value: 4 },
		{ name: "Прицеп", value: 5 },
		{ name: "Грузовик", value: 6 },
		{ name: "Автобус", value: 7 },
		{ name: "Автодом", value: 8 },
		{ name: "Воздушный транспорт", value: 9 }
	];

	var brands = {};
	var brandsMap = {};
	var modelsMap = {};
	var cache = {};

	function auto({type, brandName, modelName, year}) {
		type = type ? Number(type) : 1;
		brandName = brandName ? brandName.toLowerCase() : '';
		modelName = modelName ? modelName.toLowerCase() : '';
		year = year ? Number(year) : '';

		if (!brands[type]) {
			brands[type] = auto.getBrands(type);
		}

		var brandId = brands[type].then(function (brands) {
			if (brandsMap[brandName]) return brandsMap[brandName];

			var item = brands.find(item => item.name.toLowerCase() === brandName);
			var id = item && item.value;

			if (!id) {
				throw new Error('Brand not found');
			}

			brandsMap[brandName] = id;

			return id;
		});

		var modelId = brandId.then(function (id) {
			if (modelsMap[modelName]) return modelsMap[modelName];

			return auto.getModels(type, id).then(function (list) {
				var item = list.find(item => item.name.toLowerCase() === modelName);
				var id = item && item.value;

				if (!id) {
					throw new Error('Model not found');
				}

				modelsMap[modelName] = id;

				return id;
			});
		});

		return Promise
			.all([
				brandId,
				modelId,
			])
			.then(function ([brand_id, model_id]) {
				return auto.getAverage({brand_id, model_id, year});
			});
	}

	auto.getBrands = function (type) {
		return get(`/auto/categories/${type}/marks`);
	};

	auto.getModels = function (type, brand_id) {
		return get(`/auto/categories/${type}/marks/${brand_id}/models`);
	};

	auto.getAverage = function ({brand_id, model_id, year}) {
		return get(`/auto/average_price`, {marka_id: brand_id, model_id, year});
	};
	
	function get(url, data = {}) {
		var key = url + '?' + JSON.stringify(data);
		var cache = localStorage.getItem(key);
		cache = cache && JSON.parse(cache);

		if (cache && Date.now() - cache.time < CACHE_TIMEOUT) {
			return cache.data;
		}

		return $.get(HOST + url, Object.assign({api_key}, data || {})).then(function (res) {
			localStorage.setItem(key, JSON.stringify(res));
			return res;
		});
	}

	return auto;
});