var _ = require('lodash');

module.exports = function(wagner) {

  var User = require('./models/user');
  var Product = require('./models/product');
  var ProductImage = require('./models/productImage');
  var DB = require('./db');

  var models = {
    User: User
    , Product: Product
    , ProductImage: ProductImage
    , DB: DB
  };

  // To ensure DRY-ness, register factories in a loop
  _.each(models, function(value, key) {
    wagner.factory(key, function() {
      return value;
    });
  });

  return models;
};
