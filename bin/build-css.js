var less = require('less');
var fs = require('fs');
var p = require('path');
var glob = require('glob');

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
	prefixPlugin = new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

var LessPluginCleanCSS = require('less-plugin-clean-css'),
	cleanCSSPlugin = new LessPluginCleanCSS();

var cwd = process.cwd();

Promise
	.all(glob
		.sync(process.argv[2], {cwd: cwd, root: cwd})
		.map(convert)
	)
	.catch(function (err) {
		console.error(err);
	})
	.then(exit);

function convert(lessPath) {
    return new Promise(function (done, fail) {
		var lessDir = p.dirname(lessPath),
			cssPath = lessPath.replace('/less/', '/css/').replace(/\.less$/, '.css'),
			cssDir = p.dirname(cssPath);

		mkdir(cssDir);

		less.render(
			fs.readFileSync(lessPath).toString(),
			{
				paths: [cwd + '/' + lessDir],
				plugins: [prefixPlugin, cleanCSSPlugin]
			},
			function (err, out) {
				if (err) {
					fail(err);
					return;
				}


				fs.writeFile(cssPath, out.css, function (err) {
				    if (err) fail(err);
					else done(cssPath);
				});
			}
		);
    });
}

function mkdir(root) {
	var path = '.';
	root.split('/').forEach(function (dir) {
		path += '/' + dir;

		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	});
}

function exit() {
    process.exit();
}