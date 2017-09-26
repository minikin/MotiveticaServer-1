const os = require('os');
const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const app = express();
const currentOS = os.type();
let config = '';

if (currentOS == 'Darwin') {
   config = require('./local.dev.config.json');
   console.log('In production generate real secure keys!');
} else {
   config = require('./app.config.json');
}

const api = new ParseServer({
  databaseURI:  config.PARSE_SERVER_DATABASE_URI,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId:  config.PARSE_SERVER_APPLICATION_ID,
  masterKey:  config.PARSE_SERVER_MASTER_KEY,
  restAPIKey: config.PARSE_SERVER_REST_API_KEY,
  javascriptKey: config.PARSE_SERVER_JS_KEY,
  serverURL:  config.PARSE_SERVER_URL
});

// Parse Dashboard settings
const dashboardConfig = {
	"allowInsecureHTTP": true,
	"apps": [{
      "serverURL": config.PARSE_SERVER_URL,
      "appId": config.PARSE_SERVER_APPLICATION_ID,
      "masterKey": config.PARSE_SERVER_MASTER_KEY,
      "appName": "Motivetica Dashboard"
    }
  ],
  "users": [{
      "user":config.PARSE_SERVER_ADMIN,
      "pass":config.PARSE_SERVER_ADMIN_PASSWORD
    }
  ]
};

const dashboard = new ParseDashboard(dashboardConfig, dashboardConfig.allowInsecureHTTP);

// Parse Server available at /parse
app.use('/parse', api);

// Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/motivetica', function(req, res) {
  res.sendFile(path.join(__dirname+'/motivetica.png'));
});

const port = process.env.PORT || 4040;
const httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('Parse server running on:  http://localhost:' + port + '/parse');
    console.log('Visit dashboard: ' + 'http://localhost:' + port + '/dashboard');
});
