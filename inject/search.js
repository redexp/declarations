jQuery(document).ready(function ($) {
	$('.search-page__results-block > div').each(function (i ,root) {
		root = $(root);
		var btn = $(`<button class="action-icon card-actions__action">Додати</button>`);

		root
			.find('.card-actions__items-inner')
			.prepend(btn);

		btn.on('click', function () {
			var url = root.find('a[href^="/declaration/"]').prop('href');

			$.get(url, {format: 'opendata'})
				.then(function ({declaration}) {
					chrome.runtime.sendMessage({type: 'add-declaration', declaration}, function (response) {

					});
				})
				.catch(function (err) {
					alert('ERROR: ' + (err && err.message || 'Unknown'));
				});
		});
	});
});