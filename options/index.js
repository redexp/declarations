require([
	'views/declarations-stats',
	'views/unknown-auto',
	'models/declarations',
	'models/unknown-auto',
	'sendMessage',
	'sortDeclarations',
	'auto'
], function (
	DeclarationsStats,
	UnknownAutoView,
	Declarations,
	UnknownAuto,
	sendMessage,
	sortDeclarations,
	auto
) {
	var list = new Declarations();

	var view = new DeclarationsStats({
		el: '#declarations-stats',
		model: list,
	});

	view.cb.remove = function (model) {
		list.remove(model);
		sendMessage('get-declarations').then(function (list) {
			sendMessage('set-declarations', {declarations: list.filter(item => item.id !== model.id)});
		});
	};

	view.cb.removeAll = function () {
		list.reset([]);
		sendMessage('set-declarations', {declarations: []});
	};

	var unknownAuto = new UnknownAuto();

	unknownAuto.view = new UnknownAutoView({
		el: '#unknown-auto',
		model: unknownAuto
	});

	unknownAuto.view.cb.applyAuto = function (model, data) {
		model.setBrandId(data.brand_id);
		model.setModelId(data.model_id);

		auto
			.getAverage({
				brand_id: model.get('brand_id'),
				model_id: model.get('model_id'),
				year: model.get('graduationYear'),
			})
			.then(function (data) {
				list.forEach(function (declaration) {
					var auto_list = declaration.get('auto_list');
					var autos = auto_list.where({name: model.get('name')});
					auto_list.remove(autos);
					autos.forEach(function (item) {
						item.set({
							current_price: data.interQuartileMean,
							unknown: false,
							unknown_type: false,
						});
					});
					auto_list.add(autos);
				});
			})
			.catch(function (err) {
				alert('ERROR applyAuto: ' + (err && err.message || 'Unknown'));
			});
	};

	document.addEventListener('copy', function (e) {
		if (!e.clipboardData) return;

		e.preventDefault();

		var text = String(document.getSelection());
		e.clipboardData.setData('text', text.replace(/\u202F/g, ''));
	});

	Promise
		.all([
			sendMessage('get-declarations'),
			sendMessage('get-sort-list'),
		])
		.then(function ([declarations, sortList]) {
			list.reset(sortDeclarations(declarations, sortList));
			view.set('sort_list', sortList);

			var p = Promise.resolve();

			declarations.forEach(function (declaration) {
				var model = list.get(declaration.id);

				if (!model) return;

				var autos = declaration.data.step_6;
				autos = autos && Object.values(autos);

				if (!autos || autos.length === 0) return;

				autos.forEach(function (item) {
					item.name = item.brand + ' ' + item.model;

					if (item.objectType !== "Автомобіль легковий") {
						model.get('auto_list').add({
							...item,
							current_price: 0,
							unknown: true,
							unknown_type: true,
						});

						unknownAuto.add(item);

						return;
					}

					p = p
						.then(function () {
							return auto({
								type: 1,
								brandName: item.brand,
								modelName: item.model,
								year: item.graduationYear
							});
						})
						.then(function (data) {
							model.get('auto_list').add({
								...item,
								current_price: data.interQuartileMean,
							});
						}, function () {
							model.get('auto_list').add({
								...item,
								current_price: 0,
								unknown: true,
							});

							unknownAuto.add(item);
						})
						.catch(function (err) {
							console.error('auto', err);
						});
				});
			});
		});
});