/**
 * Created by deepak on 1/28/2017.
 */
var httpProxy = require('http-proxy');
var path = require('path');
var fs = require('fs');

//region variables
var specialCharPattern = /[`~!@#$%^&*()|+\-=?;:'",.<>\{\}\[\]\\\/]/gi;
var emptyStringPattern = / /g;
var numberPattern = /^\d+$/;
var errMsg = "Error!!! ";
var warnMsg = "Warning!!! ";
var msErrorMsg = "micro-services not created. ";
var invalidConfigMsg = "Invalid configuration. ";
var msEmptyListMsg = "micro-service list are empty. ";
var sslErrorMsg = "Configuring SSL certificate problem. ";
//endregion

var gatewayFunctions = {
    createGateway: createGateway
};
module.exports = gatewayFunctions;

function customException(name, errMsg) {
    this.message = errMsg ? errMsg : name;
    this.name = name;
}
function routePathRegex(routePath) {
    if (routePath != undefined && routePath != null && routePath != '') {
        return !(specialCharPattern.test(routePath) || emptyStringPattern.test(routePath));
    }
    else
        return null;
}
function isNumber(txt) {
    if (txt != undefined && txt != null && txt != '') {
        return numberPattern.test(txt.toString());
    }
    else
        return false;
}
function isEmptyObject(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }
    return (JSON.stringify(obj) === "{}");
}
function setMicroserviceFunctionScope(apiProxy, serverConfig) {
    return function (req, res) {
        var targetURL = serverConfig.url + ":" + serverConfig.serverPort;
        req.url = (serverConfig.excludeRoutePath == true ? req.url.replace("/" + serverConfig.routePath, "") : req.url);
        console.log("micro-service '" + serverConfig.name + "' called, request url::" + targetURL + req.url + ", [Time:" + new Date() + "]");
        apiProxy.web(req, res, {
            target: targetURL
        }, function (error) {
            console.log(errMsg + "request url::" + targetURL + req.url + "");
            console.log(error);
            if (error) {
                return res.json({
                    "code": 1,
                    "errorMsg": "Something went wrong in server " + serverConfig.name,
                    "error": error
                });
            }
        });
    };
}

function createGateway(config) {
    try {
        var credentials = null;
        var apiProxy = null;
        if (config.sslKeyPath && config.sslCertPath) {
            try {
                var privateKey = fs.readFileSync(path.join(__dirname, '../../', config.sslKeyPath), 'utf8');
                var certificate = fs.readFileSync(path.join(__dirname, '../../', config.sslCertPath), 'utf8');
                var bundleFileList = [];
                if (config.sslBundlePath && config.sslBundlePath.length > 0) {
                    for (var i = 0; i < config.sslBundlePath.length; i++) {
                        var bundleFile = fs.readFileSync(path.join(__dirname, '../../', config.sslBundlePath[i]), 'utf8');
                        bundleFileList.push(bundleFile);
                    }
                }
                credentials = {key: privateKey, cert: certificate, ca: bundleFileList};
                apiProxy = httpProxy.createProxyServer({
                    ssl: credentials, secure: (config.verifySSL == true ? true : false)
                });
            }
            catch (e) {
                throw new customException(errMsg + sslErrorMsg, e.message);
            }
        }
        else {
            apiProxy = httpProxy.createProxyServer();
        }
        if (apiProxy) {
            var microServers = {};
            if (config.serverList && config.serverList.length > 0) {
                var microServerStringList = [];
                var invalidMicroServerStringList = [];
                for (var i = 0; i < config.serverList.length; i++) {
                    var serverConfig = config.serverList[i];
                    var verifyRoutePath = routePathRegex(serverConfig.routePath);
                    if (!isNumber(serverConfig.serverPort)) {
                        invalidMicroServerStringList.push(serverConfig.name);
                        console.log(warnMsg + "micro-service '" + serverConfig.name + "' not created, 'serverPort' is not defined correctly.");
                    }
                    else if (verifyRoutePath == true) {
                        microServerStringList.push(serverConfig.name);
                        microServers[serverConfig.routePath] = setMicroserviceFunctionScope(apiProxy, serverConfig);
                    }
                    else if (verifyRoutePath == null) {
                        invalidMicroServerStringList.push(serverConfig.name);
                        console.log(warnMsg + "micro-service '" + serverConfig.name + "' not created, 'routePath' is not defined.");
                    } else {
                        invalidMicroServerStringList.push(serverConfig.name);
                        console.log(warnMsg + "micro-service '" + serverConfig.name + "' not created,'routePath' have special characters.");
                    }
                }
                if (invalidMicroServerStringList.length >= 1) {
                    console.log("micro-services '" + invalidMicroServerStringList.toString() + "' are not created for gateway '" + config.name + "'");
                    throw new customException(errMsg + msErrorMsg, invalidMicroServerStringList.toString());
                }
                else if (!isEmptyObject(microServers)) {
                    console.log("micro-services '" + microServerStringList.toString() + "' are created for gateway '" + config.name + "'");
                    return microServers;
                }
                else {
                    // console.log(errMsg + msErrorMsg);
                    throw new customException(errMsg + msErrorMsg);
                }
            }
            else {
                // console.log(errMsg + msEmptyListMsg);
                throw new customException(errMsg + msEmptyListMsg);
            }
        }
    }
    catch (ex) {
        throw ex;
    }
}


// var express = require('express');
// var app = express();
var config = {
    name: "microservice-gateway",
    sslKeyPath: "",
    sslCertPath: "",
    sslBundlePath: [""],
    verifySSL: false,
    serverList: [
        {
            name: "server1",
            url: "http://api.done.to",
            serverPort: 5000,
            routePath: "c1",
            excludeRoutePath: true
        }
    ]
};
//console.log(createGateway(config));
