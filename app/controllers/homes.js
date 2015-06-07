exports.index = function (req, res) {
	res.render('home/index', {
		title:"ESP8266 OTA firmware updating"
	});
}
