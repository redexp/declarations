define('sortDeclarations', [], function () {
	return function sortDeclarations(declarations, sortList) {
		var getDirection = function (a, b, i) {
			if (!sortList[i]) return 0;

			var {field, sort} = sortList[i];

			sort = sort === 'asc' ? 1 : -1;

			var x = a.info;
			var y = b.info;

			if (field === 'name') {
				x = `${x.last_name} ${x.first_name} ${x.patronymic}`;
				y = `${y.last_name} ${y.first_name} ${y.patronymic}`;
			}
			else if (field === 'year') {
				x = x.declaration_year;
				y = y.declaration_year;
			}

			return x < y ? -1 * sort : x > y ? sort : getDirection(a, b, i + 1);
		};

		declarations.sort(function (a, b) {
			return getDirection(a, b, 0);
		});

		return declarations;
	};
});