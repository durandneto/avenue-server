var db = require('./../db');
var slugify = require('slugify') 

var ProductTable = (function(){

  function ProductTable(){
    this.table_name = 'products';
  }
 
  ProductTable.prototype = { 
    createTable : function(_callback) {
      db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS \""+ this.table_name +"\" ("
          + "\"id\" integer PRIMARY KEY AUTOINCREMENT,"
          + "\"title\" varchar(128),"
          + "\"slug\" varchar(128),"
          + "\"description\" varchar(128),"
          + "\"parent_id\" integer(128),"
          + "\"created_at\" integer(128),"
          + "FOREIGN KEY (parent_id) REFERENCES \"products\" (id)"
          + ");"
        );

        db.run("CREATE INDEX IF NOT EXISTS IDX_SLUG ON \""+ this.table_name +"\" (\"slug\" ASC);");
        db.run("CREATE INDEX IF NOT EXISTS IDX_ID_PRODUCT ON \""+ this.table_name +"\" (\"id\" ASC);");
          
        if ( _callback ) 
          _callback()
      });
    }
    , truncate : function(_callback) {
      db.run("delete from "+ this.table_name);
      if ( _callback ) 
        _callback()
    }
    , delete : function(id, _callback) {
      db.run("delete from "+ this.table_name + " where id = $id", { $id: id} );
      if ( _callback ) 
        _callback()
    }
    , update : function(product, _callback) {

      db.run("update "+ this.table_name + " set title = $title where id = $id"
      , { $title: product.title , $id: product.id} );
      if ( _callback ) 
        _callback()
    }
    // product search by slug
    , get : function(slug, _success, _error) { 
      db.each("SELECT * FROM  "+this.table_name+" where slug = $slug"
        , { $slug: slug }
        , (error, product) => {
          // there are errors
          if ( error ) 
            error(error)
          // success
          if ( _success )
            _success( product )
        }
        , (error , rows) => {
          if ( rows === 0 ) {
            //USER NOT FOUND
            _success( null )
          } 
        } 
      ); 

    }

    // get all products
      
    , getAll : function(product_slug, parent, imagens, _success, _error) { 

      var ret = [];
      var index = 0;
      var current_product = {};
      var where = '';

      if ( product_slug ){
         where = " where parent.slug = '"+product_slug+"' ";
      }

      db.each("SELECT  " 
                + " parent.id, parent.title, parent.slug, parent.description, parent.created_at"
                + " , child.id as child_id, child.title as child_title, child.slug as child_slug, child.description child_description, child.created_at as child_created_at"
                + " , img.id as img_id, img.title as img_title , img.created_at as img_created_at  FROM  products parent"
              + " left join products child on child.id = parent.parent_id"
              + " LEFT join Products_has_image img on img.product_id = parent.id"
              + where
              + " group by parent.id, child.id, img.id",
        (error, product) => {

          if ( index !== product.id) {
            index = product.id
            current_product = {
              id: product.id
              , description: product.description
              , title: product.title
              , slug: product.slug
              , created_at: product.created_at
            }

            if ( product.child_id && parent ) {
              current_product.parent =  {
                id: product.child_id
                , description: product.child_description
                , title: product.child_title
                , slug: product.child_slug
                , created_at: product.child_created_at
              }
            }

            if ( product.img_id && imagens ) {
              current_product.images =  [{
                id: product.img_id
                , title: product.img_title
                , created_at: product.img_created_at
              }]
            }
            ret.push({product: current_product})
          } else {
            if ( imagens  ){
              current_product.images.push({
                id: product.img_id
                , title: product.img_title
                , created_at: product.img_created_at
              })
            }
          }
        }
       , (error, products) => {
          // there are errors
          if ( error ) 
            _error( error )
 
          if ( _success )
            _success( ret )

        }
      ); 
    }
    // get product by pk
    , find : function(id, _success, _error) { 
      
      db.each("SELECT * FROM  "+this.table_name+" where id = $id"
        , { $id: id}
        , (error, product) => {
          // there are errors
          if ( error ) 
            error(error)
          // success
          if ( _success )
            _success( product )
        }
        , (error , rows) => {
          if ( rows === 0 ) {
            //USER NOT FOUND
            _success( null )
          } 
        } 
      ); 
    }
      // create new product on the database
    , create: function(title, description, parent_id, _callback){ 
       var stmt = db.prepare("INSERT INTO  "+this.table_name+"  VALUES (?, ?, ?, ?, ?, ?)");
      stmt.run(null, title, slugify(title).toLowerCase(), description, new Date(), parent_id);
      stmt.finalize();
      if ( _callback ) 
        _callback()
    } 
  }
  // Expõe o construtor 
  return ProductTable;

}()); 

var object = new ProductTable;
module.exports =  object;