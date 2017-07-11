var db = require('./../db');
var slugify = require('slugify') 

var ProductImageTable = (function(){

  function ProductImageTable(){
    this.table_name = 'products_has_image';
  }
 
  ProductImageTable.prototype = { 
    createTable : function(_callback) {
      db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS \""+ this.table_name +"\" ("
          + "\"id\" integer PRIMARY KEY AUTOINCREMENT,"
          + "\"title\" varchar(128),"
          + "\"product_id\" integer(128),"
          + "\"ext\" varchar(5),"
          + "\"created_at\" integer(128),"
          + "FOREIGN KEY (product_id) REFERENCES \"products\" (id)"
          + ");"
        );

        db.run("CREATE INDEX IF NOT EXISTS IDX_ID_PRODUCT_IMAGE ON \""+ this.table_name +"\" (\"id\" ASC);");
          
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
    // get product image by pk
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
    // get product image by pk
    , get : function(product_id, _success, _error) { 
      
      db.all("SELECT * FROM  "+this.table_name+" where product_id = $id"
        , { $id: product_id}
        , (error, images) => {
          // there are errors
          if ( error ) 
            error(error)
          // success
          if ( _success )
            _success( images )
        }
      ); 
    }
      // create new product on the database
    , create : function(title, product_id, ext,_callback){ 
       var stmt = db.prepare("INSERT INTO  "+this.table_name+"  VALUES (?, ?, ?, ?, ?)");
      stmt.run(null, title, product_id, ext, new Date());
      stmt.finalize();
      if ( _callback ) 
        _callback()
    } 
  }
  // Expõe o construtor 
  return ProductImageTable;

}()); 

var object = new ProductImageTable;
module.exports =  object;