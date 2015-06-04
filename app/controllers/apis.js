var mongoose = require('mongoose')
var Application = mongoose.model('Application')
var utils = require('../../lib/utils')
var extend = require('util')._extend
var url = require("url");

exports.applications = function (req,res) {
	
}

exports.applicationByName = function (req,res,next, applicationName) {
	
}

exports.images = function (req,res,next) {
	var image;
	if(req.application.versions.length>0){
		var version = req.application.versions[req.application.versions.length-1];
		for(var i=0;i<version.firmwares.length;i++){
			if(version.firmwares[i].name==req.params.image){
				image = {};
				image.application = req.application.name;
				image.last = {
					version:version.value,
					created:version.createdAt,
					protocol:url.parse(version.firmwares[i].url).protocol,
					host:url.parse(version.firmwares[i].url).host,
					path:url.parse(version.firmwares[i].url).path
				};
				break;
			}
		}	
	}
	
	if(!image)
		return res.status(400).send({errors:["Image not found"]});
	res.status(200).send(image);
}

exports.devices = function (req,res) {
	
}
exports.device = function (req,res,deviceId) {
	
}