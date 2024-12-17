var express = require('express');
var pool = require('./pool')
var { LocalStorage } = require("node-localstorage")
var localstorage = new LocalStorage('./scratch')
var router = express.Router();

/* GET home page. */

router.get('/login', function (req, res) {
  try {
    var admin = JSON.parse(localstorage.getItem('Admin'))

    if (admin == null)
      res.render('login', { message: '' })
    else
      res.render('dashboard', { data: admin, status: true, message: 'Login Success' })
  }
  catch {
    res.render('login', { message: '' })
  }


})

router.post("/check_login", function (req, res) {
  pool.query("select * from admins where (emailid=? or mobileno=?) and password=? ", [req.body.emailid, req.body.emailid, req.body.password], function (error, result) {

    if (error) {
      res.render('login', { data: [], status: false, message: 'Database error...Pls contace with admin' })
    }
    else {
      if (result.length == 1) {
        { localstorage.setItem("Admin", JSON.stringify(result[0])) }

        res.render('dashboard', { data: result[0], status: true, message: 'Login Success' })
      }
      else {
        res.render('login', { data: result[0], status: true, message: 'Invalid Emailid/Mobile Number/Password' })
      }

    }
  })
})

router.get('/logout', function (req, res) {
localstorage.clear()
res.redirect('/admin/login')
})

module.exports = router;