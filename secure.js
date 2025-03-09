const express = require('express');
const mysql = require('mysql2');
const app = express();
const path = require('path');
const cors = require('cors');
const port = 4000;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // Import multer
const SECRET_KEY = 'UX23Y24%@&2aMb';

//Database(MySql) configulation
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "shopdee"
});

db.connect();

//Middleware (Body parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS to be Middleware 

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets/profile');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

//Helper Function
// Function to execute a query with a promise-based approach
function query(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}

//Hello World API
app.get('/', function (req, res) {
    res.send('Hello World!');
});

// Register
app.post('/api/register', async function (req, res) {
    const { username, password, firstName, lastName } = req.body;

    //check existing username
    let sql = "SELECT * FROM customer WHERE username=?";
    try {
        const results = await query(sql, [username]);

        if (results.length === 0) {
            //password and salt are encrypted by hash function (bcrypt)
            const salt = await bcrypt.genSalt(10); //generate salte
            const password_hash = await bcrypt.hash(password, salt);

            //insert customer data into the database
            sql = 'INSERT INTO customer (username, password, firstName, lastName) VALUES (?, ?, ?, ?)';
            await query(sql, [username, password_hash, firstName, lastName]);

            res.send({ 'message': 'ลงทะเบียนสำเร็จแล้ว', 'status': true });
        } else {
            res.send({ 'message': 'ชื่อผู้ใช้ซ้ำ', 'status': false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการลงทะเบียน', 'status': false });
    }
});

//Login
app.post('/api/login', async function (req, res) {
    //Validate username
    const { username, password } = req.body;
    let sql = "SELECT * FROM customer WHERE username=? AND isActive = 1";
    let customer;
    try {
        customer = await query(sql, [username]);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'status': false });
    }

    if (customer.length <= 0) {
        return res.send({ 'message': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'status': false });
    } else {
        customer = customer[0];
        custID = customer['custID'];
        password_hash = customer['password'];
    }

    //validate a number of attempts 
    let loginAttempt = 0;
    sql = "SELECT loginAttempt FROM customer WHERE username=? AND isActive = 1 ";
    sql += "AND lastAttemptTime >= CURRENT_TIMESTAMP - INTERVAL 24 HOUR ";

    let row;
    try {
        row = await query(sql, [username]);
    } catch (err) {
        console.error(err);
        return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'status': false });
    }

    if (row.length > 0) {
        loginAttempt = row[0]['loginAttempt'];

        if (loginAttempt >= 3) {
            return res.send({ 'message': 'บัญชีคุณถูกล๊อก เนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด', 'status': false });
        }
    } else {
        //reset login attempt                
        sql = "UPDATE customer SET loginAttempt = 0, lastAttemptTime=NULL WHERE username=? AND isActive = 1";
        try {
            await query(sql, [username]);
        } catch (err) {
            console.error(err);
            return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'status': false });
        }
    }

    //validate password       
    if (bcrypt.compareSync(password, password_hash)) {
        //reset login attempt                
        sql = "UPDATE customer SET loginAttempt = 0, lastAttemptTime=NULL WHERE username=? AND isActive = 1";
        try {
            await query(sql, [username]);
        } catch (err) {
            console.error(err);
            return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'status': false });
        }
        //get token
        const token = jwt.sign({ custID: custID, username: username }, SECRET_KEY, { expiresIn: '1h' });

        customer['token'] = token;
        customer['message'] = 'เข้าสู่ระบบสำเร็จ';
        customer['status'] = true;

        res.send(customer);
    } else {
        //update login attempt
        const lastAttemptTime = new Date();
        sql = "UPDATE customer SET loginAttempt = loginAttempt + 1, lastAttemptTime=? ";
        sql += "WHERE username=? AND isActive = 1";
        try {
            await query(sql, [lastAttemptTime, username]);
        } catch (err) {
            console.error(err);
            return res.status(500).send({ 'message': 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'status': false });
        }

        if (loginAttempt >= 2) {
            res.send({ 'message': 'บัญชีคุณถูกล๊อก เนื่องจากมีการพยายามเข้าสู่ระบบเกินกำหนด', 'status': false });
        } else {
            res.send({ 'message': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'status': false });
        }
    }
});

// Profile
app.get('/api/profile/:id', async function (req, res) {
    const custID = req.params.id;
    const token = req.headers["authorization"]?.replace("Bearer ", ""); // Optional chaining

    if (!token) {
        return res.status(401).send({ 'message': 'ไม่พบ Token', 'status': false }); // Unauthorized
    }
    try {
        let decode = jwt.verify(token, SECRET_KEY);
        if (custID != decode.custID) {
            return res.status(403).send({ 'message': 'Id is not matched', 'status': false }); // Forbidden
        }

        let sql = "SELECT * FROM customer WHERE custID = ? AND isActive = 1";
        let customer = await query(sql, [custID]);

        customer = customer[0];
        customer['message'] = 'success';
        customer['status'] = true;
        res.send(customer);

    } catch (error) {
        console.error(error);
        res.status(401).send({ 'message': 'Token is invalid', 'status': false }); // Unauthorized
    }
});

// Get all products
app.get('/api/products', async function (req, res) {
    try {
        let sql = "SELECT * FROM product";
        let products = await query(sql);

        res.send({
            message: 'Product list retrieved successfully',
            status: true,
            products: products
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Error retrieving products',
            status: false,
            error: error.message
        });
    }
});

// Serve a product image
app.get('/api/product/image/:imageFile', async function (req, res) {
    try {
        const imageFile = req.params.imageFile;
        const imagePath = path.join(__dirname, 'public/assets/product', imageFile);
        res.sendFile(imagePath);

    } catch (error) {
        console.error(error);
        res.status(500).send({
            message: 'Error retrieving product image',
            status: false,
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`HTTPS Server running on port ${port}`);
});

// Get a single product by ID
app.get('/api/products/:id', async function (req, res) {
    const productID = req.params.id;
    try {
      let sql = "SELECT * FROM product WHERE productID = ?";
      let product = await query(sql, [productID]);
  
      if (product.length > 0) {
        res.send({
          message: 'Product retrieved successfully',
          status: true,
          product: product[0]
        });
      } else {
          res.status(404).send({
              message: 'Product not found',
              status: false
            });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: 'Error retrieving product',
        status: false,
        error: error.message
      });
    }
  });