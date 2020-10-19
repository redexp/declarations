define('round', ['jquery'], function ($) {

	return function round(num, x = 2) {
		return $.number(num, x, '.', "\u202F").replace(/(\.[^0]*)0+$/, '$1').replace(/\.$/, '');
	};

	// return function round(num, x) {
	// 	if (!num && num !== 0) return '';
	//
	// 	if (typeof x === 'undefined') x = 2;
	//
	// 	var rule = new RegExp('(\\.\\d{' + x + '}).*$');
	//
	// 	return num === null || typeof num === 'undefined' ? '' : String(num)
	// 		.replace(rule, '$1')
	// 		.replace(/(\.[^0]*)0+$/, '$1')
	// 		.replace(/\.$/, '')
	// 	;
	// };
});