var db = require('./../db');
var CRC32 = require('crc-32'); 

var UserTable = (function(){

  function UserTable(){
    this.table_name = 'users';
  }
 
  UserTable.prototype = { 
    // user search by user_id and current session
    createTable : function(_callback) {
      db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS \""+ this.table_name +"\" ("
          + "\"id\" integer PRIMARY KEY AUTOINCREMENT,"
          + "\"email\" varchar(128),"
          + "\"password\" char(10),"
          + "\"created_at\" integer(128)"
          + ");"
        );
        db.run("CREATE INDEX IF NOT EXISTS IDX_EMAIL ON \""+ this.table_name +"\" (\"email\" ASC);");
        db.run("CREATE INDEX IF NOT EXISTS IDX_ID ON \""+ this.table_name +"\" (\"id\" ASC);");
      }); 
      if ( _callback ) 
        _callback()
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
    , update : function(user, _callback) {

      db.run("update "+ this.table_name + " set password = $password where id = $id"
      , { $password: CRC32.str(user.password) , $id: user.id} );
      if ( _callback ) 
        _callback()
    }
    // user search by email
    , get : function(email, _success, _error) { 

      
      db.each("SELECT * FROM  "+this.table_name+" where email = $email"
        , { $email: email }
        , (error, user) => {
          // there are errors
          if ( error ) 
            error(error)
          // success
          if ( _success )
            _success( user )
        }
        , (error , rows) => {
          if ( rows === 0 ) {
            //USER NOT FOUND
            _success( null )
          } 
        } 
      ); 

    }
    // get user by pk
    , find : function(id, _success, _error) { 
      
      db.each("SELECT * FROM  "+this.table_name+" where id = $id"
        , { $id: id}
        , (error, user) => {
          // there are errors
          if ( error ) 
            error(error)
          // success
          if ( _success )
            _success( user )
        }
        , (error , rows) => {
          if ( rows === 0 ) {
            //USER NOT FOUND
            _success( null )
          } 
        } 
      ); 
    }
      // create new user on the database
    , create : function(email, password,_callback){ 
       var stmt = db.prepare("INSERT INTO  "+this.table_name+"  VALUES (?,?,?,?)");
      stmt.run(null,email,CRC32.str(password), new Date());
      stmt.finalize();
      if ( _callback ) 
        _callback()
    } 
  }
  // Expõe o construtor 
  return UserTable;

}()); 

var object = new UserTable;
module.exports =  object;