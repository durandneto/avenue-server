var express = require('express');
var status = require('http-status');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var slugify = require('slugify'); 

module.exports = function(wagner) {
  var api = express.Router();

  api.post('/', wagner.invoke(function(Product) {
    return function(req, res) {

      Product.create(req.body.title,req.body.description, null , () => {
        res.json({
          status: 'SUCCESS'
        });
      });

    };
  }));

  api.get('/', wagner.invoke(function(Product) {
    return function(req, res) {

      var parent = (req.query.parent == 'no') ? false : true;
      var images = (req.query.images == 'no') ? false : true;

      Product.getAll(null, parent, images, ( response ) => {
        res.json({
          status: 'SUCCESS'
          , data: response
        });
      }, ( error ) => {
           res.json({
            status:'ERROR'
            , error: error
          });
      });

    };
  }));

  api.get('/:slug', wagner.invoke(function(Product) {
    return function(req, res) {
      var parent = (req.query.parent == 'no') ? false : true;
      var images = (req.query.images == 'no') ? false : true;
     Product.getAll(req.params.slug, parent, images, ( response ) => {
        res.json({
          status: 'SUCCESS'
          , data: response
        });
      }, ( error ) => {
           res.json({
            status:'ERROR'
            , error: error
          });
      });

    };
  }));
  
  api.post('/:slug/images/add', wagner.invoke(function(Product, ProductImage) {
    return function(req, res) {
      Product.get(req.params.slug
      , ( product ) => {

          var extension = path.extname(req.files.image.name).toLowerCase();
          var file_path = 'files/product/' + product.id;
          
          ProductImage.create(slugify(req.files.image.name.split(extension)[0]), product.id, extension, () => {
            save_file(res, file_path, req.files.image);
          });
      });
    };
  }));
  
  api.put('/:slug', wagner.invoke(function(Product, ProductImage) {
    return function(req, res) {
      Product.update(req.body, () => {
            res.json({
          status: 'SUCCESS'
        });

        })
    };
  }));


  api.delete('/:id', wagner.invoke(function(Product) {
    return function(req, res) {
      Product.delete( req.params.id, () => {
        res.json({status: 'SUCCESS'})
      });
    };
  }));

  api.delete('/:slug/images/remove/:image_id', wagner.invoke(function(Product, ProductImage) {
    return function(req, res) {
      ProductImage.delete( req.params.image_id, () => {
        res.json({status: 'SUCCESS'})
      });
    };
  }));

  api.get('/:slug/images', wagner.invoke(function(Product, ProductImage) {
    return function(req, res) {
      Product.get(req.params.slug
      , ( product ) => {
         ProductImage.get( product.id, ( images ) => {
            res.json({
              status: 'SUCCESS'
              , data: {
                product: product
                , images: images
              }
            });
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


function save_file(res,file_path, data){
  var extension = path.extname(data.name).toLowerCase();
  var name = slugify(data.name).toLowerCase();

  if(!fs.existsSync(file_path)){
     mkdirp(file_path, function(err){
       if(err){ 
         console.log(err);
          if (err) throw err;
       }
        fs.writeFile(file_path+'/'+name,data.data, (err) => {
          res.json({
            status: 'SUCCESS'
          });
        });
     });   
  }else{
    fs.writeFile(file_path+'/'+name,data.data, (err) => {
      res.json({
        status: 'SUCCESS'
      });
    });
  } 
}