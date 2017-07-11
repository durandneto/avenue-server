var assert = require('assert');
var wagner = require('wagner-core');
var CRC32 = require('crc-32'); 

var URL_ROOT = 'http://localhost:7001/api/v1';

describe('Should be able to create users with Sqlite3', function() {

  var db
  , User
  , Models;

  before(function() {

    Models = require('./../models')(wagner);
    dependencies = require('./../dependencies')(wagner);

    // Make models available in tests
    var deps = wagner.invoke(function(DB, User) {
      return {
        DB: DB,
        User: User
      };
    });

      db = deps.DB;
      User = deps.User;

      User.createTable()
  }); 

  it('Make sure users are empty before each test', function(done) {
    
    User.truncate()
    done();

  });

  it('Insert user Durand', (done) => {

    User.create("durand.test@gmail.com","senha", () => {
      User.create("durand.neto@gmail.com","password", () => {
        done();
      });
    });

  });

  it('Checking if user was created', (done) => {

    User.get('durand.test@gmail.com'
      , ( user) => {
        assert.notDeepEqual(user,null);
        assert.equal(user.email,"durand.test@gmail.com");
        assert.equal(user.password,CRC32.str("senha"));
        done();
    }, ( error ) => {
        assert.ifError(error);
        done();
    });

  });

  it('Should be able to update my password', (done) => {

    User.get('durand.test@gmail.com'
      , ( user) => {
        user.password = 'password';
        User.update(user, () => {
           User.get(user.email
            , ( user) => {
              assert.equal(user.password,CRC32.str("password"));
              done();
          }, ( error ) => {
              assert.ifError(error);
              done();
          });

        })
    }, ( error ) => {
        assert.ifError(error);
        done();
    });

  });

  it('Should be able to remove user Durand Teste', (done) => {

    User.get('durand.test@gmail.com'
      , ( user) => {
        User.delete(user.id, () => {
           User.get(user.email
            , ( user) => {
              assert.ifError(user);
              done();
          }, ( error ) => {
              assert.ifError(error);
              done();
          });

        })
    }, ( error ) => {
        assert.ifError(error);
        done();
    });

  });

});

describe('Should be able to create products with Sqlite3', function() {

  var db
  , Product
  , Models;

  before(function() {

    Models = require('./../models')(wagner);
    dependencies = require('./../dependencies')(wagner);

    var deps = wagner.invoke(function(DB, Product) {
      return {
        DB: DB,
        Product: Product
      };
    });

      db = deps.DB;
      Product = deps.Product;

      Product.createTable()
  }); 

  it('Make sure products are empty before each test', function(done) {
    
    Product.truncate()
    done();

  });

  it('Insert to products', (done) => {

    Product.create("Product One","Description of Product One", null, () => {
       Product.create("Product Durand","Description of Product Durand", null, () => {
            done();
        });
    });

  });

  it('Insert to products with product parent', (done) => {

    Product.get('product-durand'
      , ( product ) => {
        assert.notDeepEqual(product,null);
        assert.equal(product.title,"Product Durand");
        assert.equal(product.slug,"product-durand");
        Product.create("Product child of Product Durand","Description of child of Product Durand", product.id, () => {
            done();
        });
    }, ( error ) => {
        assert.ifError(error);
        done();
    });
  });

  it('Checking if Product One was created', (done) => {

    Product.get('product-one'
      , ( product ) => {
        assert.notDeepEqual(product,null);
        assert.equal(product.title,"Product One");
        assert.equal(product.slug,"product-one");
        done();
    }, ( error ) => {
        assert.ifError(error);
        done();
    });

  });

  it('Should be able to update Product Title', (done) => {

    Product.get('product-one'
      , ( product ) => {
        product.title = 'Product Three';
        Product.update(product, () => {
           Product.get(product.slug
            , ( product) => {
              assert.equal(product.title, "Product Three");
              done();
          }, ( error ) => {
              assert.ifError(error);
              done();
          });

        })
    }, ( error ) => {
        assert.ifError(error);
        done();
    });

  });

  it('Should be able to remove Product Three', (done) => {

    Product.get('product-one'
      , ( product ) => {
        Product.delete(product.id, () => {
           Product.get(product.slug
            , ( product) => {
              assert.ifError(product);
              done();
          }, ( error ) => {
              assert.ifError(error);
              done();
          });

        })
    }, ( error ) => {
        assert.ifError(error);
        done();
    });

  });

});

describe('Should be able to create products Images with Sqlite3', function() {

  var db
  , Product
  , Models;

  before(function() {

    Models = require('./../models')(wagner);
    dependencies = require('./../dependencies')(wagner);

    var deps = wagner.invoke(function(DB, Product, ProductImage) {
      return {
        DB: DB,
        Product: Product,
        ProductImage: ProductImage
      };
    });

      db = deps.DB;
      Product = deps.Product;
      ProductImage = deps.ProductImage;

      ProductImage.createTable()
  }); 

  it('Make sure products images are empty before each test', function(done) {
    
    ProductImage.truncate()
    done();

  });

  it('Insert image in  product durand', (done) => {

    Product.get('product-durand'
      , ( product) => {
        assert.notDeepEqual(product,null);
        if ( product ) {
          ProductImage.create("Image One", product.id, '.png', () => {
            ProductImage.create("Image Two", product.id, '.png', () => {
              ProductImage.create("Image Three", product.id, '.png', () => {
                done();
              });
            });
          });
        }else {
          done()
        }
    });

  });

  it('Remove first image from product durand', (done) => {

    Product.get('product-durand'
      , ( product) => {
        assert.notDeepEqual(product,null);
        if ( product ) {
          ProductImage.get( product.id, ( images ) => {
            assert.equal(images.length, 3)
            ProductImage.delete( images[0].id, ( images ) => {
              done();
            });
          });
        }else {
          done()
        }
    });

  });
  after(function(done) {
    db.close();
    done();
  });

});