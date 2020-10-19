define('models/declarations', [
	'backbone'
], function (
	BB
) {
	function Declarations() {
		BB.Collection.apply(this, arguments);
	}

	BB.Collection.extend({
		constructor: Declarations,

		model: Declaration
	});

	function Declaration() {
		BB.Model.apply(this, arguments);
	}

	BB.Model.extend({
		constructor: Declaration,

		defaults: function () {
			return {
				auto_list: new BB.Collection(),
			};
		},
	});

	return Declarations;
});