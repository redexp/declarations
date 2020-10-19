const store = {
	get: function (key, cb) {
		chrome.storage.local.get([key], function (data) {
			cb(data[key]);
		});
	},

	set: function (key, cb) {
		chrome.storage.local.set(key, cb);
	},
};

chrome.runtime.onInstalled.addListener(function () {
	store.set({declarations: [], sortList: []});
});

setTimeout(function () {
	store.get('declarations', (declarations) => setBadge(declarations && declarations.length > 0 ? declarations.length : ''));
}, 2000);

const dispatcher = {};

dispatcher['add-declaration'] = function (e, send) {
	var declaration = {
		id: e.declaration.guid,
		info: e.declaration.infocard,
		data: e.declaration.unified_source,
	};

	getDeclarations().then(function (declarations) {
		if (!declarations.find(item => item.id === declaration.id)) {
			declarations.push(declaration);
		}

		return setDeclarations(declarations).then(send);
	}).catch(function (err) {
		send({error: true, message: err && err.message});
	});

	return true;
};

dispatcher['get-declarations'] = function (e, send) {
	getDeclarations().then(send);

	return true;
};

dispatcher['set-declarations'] = function (e, send) {
	var {declarations} = e;

	setDeclarations(declarations).then(send);

	return true;
};

dispatcher['set-sort-list'] = function (e, send) {
	var {sortList} = e;

	store.set({sortList}, () => send({success: true}));

	return true;
};

dispatcher['get-sort-list'] = function (e, send) {
	store.get('sortList', send);

	return true;
};

chrome.runtime.onMessage.addListener(function (e, sender, send) {
	if (dispatcher[e.type]) {
		return dispatcher[e.type](e, send, sender);
	}

	send({error: true, message: 'Unknown event'});
});

function setBadge(text) {
	chrome.browserAction.setBadgeText({text: String(text)});
}

function getDeclarations() {
	return new Promise(function (done) {
		store.get('declarations', function (declarations) {
			done(declarations || []);
		});
	});
}

function setDeclarations(declarations) {
	return new Promise(function (done) {
		store.set({declarations}, function () {
			setBadge(declarations.length > 0 ? declarations.length : '');
			done({success: true});
		});
	});
}