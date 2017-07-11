var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('lodash');

module.exports = function(wagner) {
  var api = express.Router();

  api.use(bodyparser.json());

  api.get('/:email', wagner.invoke(function(User) {
    return function(req, res) {
      User.get(req.params.email
      , ( user) => {
        res.json({
          status: 'SUCCESS'
          , data: user
        });
      }, ( error ) => {
           res.json({
            status:'ERROR'
            , error: error
          });
      });

    };
  }));

  return api;
};