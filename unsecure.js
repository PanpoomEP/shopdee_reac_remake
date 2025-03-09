const express = require('express')
const mysql = require('mysql2')
const cors = require('cors')
const app = express()
const port = 4000

//Database(MtSql) configulation
const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "1111",
        database: "shopdee"
        
    }
)

//Middleware (Body parser)
app.use(express.json()) // get JSON data
app.use(express.urlencoded ({extended: true})) // get HTML-FORM
app.use(cors()); // Enable CORS to be Middleware 

//Hello World API
app.get('/', function(req, res){
  res.send('Hello Norrapat')
});

// Register
app.post('/api/register', function(req, res){  
  const { username, password, firstName, lastName } = req.body;
  const sql = `INSERT INTO customer (username, password, 
              firstName, lastName) VALUES (?, ?, ?, ?)`;
  
  db.query(sql, [username, password, firstName, lastName], 
      function(err, result){
          if (err) throw err;  
          res.send({'message':'ลงทะเบียนสำเร็จแล้ว','status':true});
      }
  )
})

//Login
app.post('/api/login', function(req, res){
  const {username, password} = req.body
  let sql = "SELECT * FROM customer WHERE "
  sql += "username='" + username + "'";
  sql += " AND password = '" + password + "'";  
  console.log(sql);
  //' OR '1=1
  db.query(sql, [username, password], function(err, result){
      if(err) throw err
      
      if(result.length > 0){
          let customer = result[0]
          customer['message'] = "เข้าสู่ระบบสำเร็จ"
          customer['status'] = true

          res.send(customer)
      }else{
          res.send({"message":"กรุณาระบุรหัสผ่านใหม่อีกครั้ง", 
                    "status":false} )
      }        
  })    
} )

// Profile
app.get('/api/profile/:id',
  function(req, res){
    const custID = req.params.id;
    let sql = "SELECT custID, username, firstName, lastName FROM customer WHERE";
        sql += " custID = " + custID;
        sql += " AND isActive = 1";

    //1--
    db.query(sql, 
      function(err, result){
        if(err) throw err;
        res.send(result);
      }
    );    
  }
);

//Home
app.get('/api/home')
  

//Web server
app.listen(port, function() {
  console.log(`Example app listening on port ${port}`)
})