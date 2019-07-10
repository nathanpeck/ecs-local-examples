
const express = require('express');
const morgan = require('morgan');
const app = express();

var AWS = require('aws-sdk');

AWS.config.httpOptions.connectTimeout = 100;
AWS.config.maxRetries = 0;

AWS.CredentialProviderChain.defaultProviders = [
  function() { return new AWS.EnvironmentCredentials('AWS'); },
  function() { return new AWS.EnvironmentCredentials('AMAZON'); },
  function() { return new AWS.ECSCredentials(); }
];

var STS = new AWS.STS();

// Log requests
app.use(morgan('tiny'));

app.get('/identity', async function(req, res) {
  var failureTimeout = setTimeout(function() {
    res.send('❌ No identity!');
  }, 1000);

  try {
    var identity = await STS.getCallerIdentity().promise();
    clearTimeout(failureTimeout);
    return res.send(`✔️ You are ${identity.Arn}`);
  } catch (e) {
    console.error(e);
  }
});

app.listen(process.env.PORT || 8081);

console.log('API up and running');

process.on('SIGINT', function() {
  process.exit();
});
