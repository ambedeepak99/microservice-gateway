/**
 * Created by deepak on 1/28/2017.
 */
var httpProxy = require('http-proxy');
var path = require('path');
var fs = require('fs');

//region variables

//endregion

var gatewayFunctions = {
    createGateway: createGateway
};
module.exports = gatewayFunctions;

function setMicroserviceFunctionScope(apiProxy,serverConfig) {
    return function (req, res) {
        req.url = (serverConfig.excludeRoutePath==true?req.url.replace("/"+serverConfig.routePath, ""):req.url);
        console.log("Request for server::"+serverConfig.name+", path::"+serverConfig.url+req.url);
        apiProxy.web(req, res, {
            target: serverConfig.url+":"+serverConfig.serverPort,
            xfwd: true
        }, function (error) {
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
        console.log(":::"+config.name);
        var credentials = null;
        var apiProxy = null;
        if (config.sslKeyPath && config.sslCertPath) {
            try {
                var privateKey = fs.readFileSync(path.join(__dirname, config.sslKeyPath), 'utf8');
                var certificate = fs.readFileSync(path.join(__dirname, config.sslCertPath), 'utf8');
                var bundleFileList = [];
                if (config.sslBundlePath && config.sslBundlePath.length > 0) {
                    for (var i = 0; i < config.sslBundlePath.length; i++) {
                        var bundleFile = fs.readFileSync(path.join(__dirname, config.sslBundlePath[i]), 'utf8');
                        bundleFileList.push(bundleFile);
                    }
                }
                credentials = {key: privateKey, cert: certificate, ca: bundleFileList};
                apiProxy = httpProxy.createProxyServer({
                    ssl: credentials, secure: (config.verifySSL == true ? true : false)
                });
            }
            catch (e) {
                console.log("SSL certificate error::" + e);
            }
        }
        else {
            apiProxy = httpProxy.createProxyServer();
        }
        if (apiProxy) {
            // apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
            //     console.log(proxyReq.);
            // });
            var microServers = {};
            if (config.serverList && config.serverList.length > 0) {
                for (var i = 0; i < config.serverList.length; i++) {
                    var serverConfig = config.serverList[i];
                    microServers[serverConfig.routePath] = setMicroserviceFunctionScope(apiProxy,serverConfig);
                }
                return microServers;
            }
            else {
                console.log("Server list not defined");
                return null;
            }
        }
        else {
            console.log("Error while creating proxy server");
            return null;
        }
    }
    catch (e) {
        console.log("Error while creating proxy server ::" + e);
        return null;
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
            serverPort:5000,
            routePath: "c1",
            excludeRoutePath:true
        }
    ]
};
// console.log(createGateway(config).c1);
