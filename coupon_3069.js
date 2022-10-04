const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require('path'); 
const connect = require("./db/db") 
dotenv.config(); 

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')))

require('./model/Users');
require('./model/Admins');
require('./model/Coupons');
require('./model/TcPp');
require('./model/ClaimedCoupons');
require('./model/Notification');
require('./model/ManageCategory');
require('./model/ManageCard');

const user = require('./routes/user')
const admin = require('./routes/admin')
const business = require('./routes/business') 
const claimedCoupon = require('./routes/claimedCoupon')
app.use(user)
app.use(admin)
app.use(business) 
app.use(claimedCoupon) 

const PORT = 3069 || process.env.PORT
connect() 

app.listen(PORT, () => {
    console.log("server running at " + PORT)
})