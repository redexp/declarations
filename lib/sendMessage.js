define('sendMessage', [], function () {
	return function sendMessage(type, data = {}) {
		return new Promise(function (done) {
			chrome.runtime.sendMessage(Object.assign({type}, data), done);
		});
	};
});