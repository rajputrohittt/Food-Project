const express = require('express')
const upload = require("./multer.js")
const pool = require("./pool.js")
const fs = require("fs")
const router = express.Router()
var { LocalStorage } = require("node-localstorage")
var localstorage = new LocalStorage('./scratch')

router.get('/food_interface', function (req, res) {

    try {
        var admin = JSON.parse(localstorage.getItem('Admin'))

        if (admin == null)
            res.render('login', { message: '' })
        else
        res.render('foodinterface', { message: '' })
    }
    catch {
        res.render('login', { message: '' })
    }
})

router.post('/submit_food', upload.single("foodpicture"), function (req, res) {
    try {
        console.log(req.body)
        console.log(req.file)

        pool.query("insert into fooditems(categoryid, subcategoryid, foodname, ingredients, description, price, offerprice, foodtype, status, foodpicture) values(?,?,?,?,?,?,?,?,?,?)", [req.body.categoryid, req.body.subcategoryid, req.body.foodname, req.body.ingredients, req.body.description, req.body.price, req.body.offerprice, req.body.foodtype, req.body.status, req.file.filename], function (error, result) {
            if (error) {
                // console.log("Error:", error)

                res.render('foodinterface', { message: 'There is issue in database...Pls contact with data admin' })
            }
            else {
                res.render('foodinterface', { message: 'Food item Successfully submitted' })

            }
        })
    }
    catch (e) {

        res.render('foodinterface', { message: 'Server Error,' + e })

    }
})
router.get('/fillcategory', function (req, res) {
    try {
        pool.query('select * from category', function (error, result) {

            if (error) {
                res.json({ data: [], status: false, message: 'Database error...pls contact' })

            }
            else {
                res.json({ data: result, status: true, message: 'Success' })
            }
        })
    }
    catch (e) {
        res.json({ data: [], status: false, message: 'Server error...pls contact' })
    }
})


router.get('/fillsubcategory', function (req, res) {
    try {
        pool.query('select * from subcategory where categoryid=?', [req.query.categoryid], function (error, result) {

            if (error) {
                res.json({ data: [], status: false, message: 'Database error...pls contact' })

            }
            else {
                res.json({ data: result, status: true, message: 'Success' })
            }
        })
    }
    catch (e) {
        res.json({ data: [], status: false, message: 'Server error...pls contact' })
    }
})

router.get('/display_all_food', function (req, res) {
    try {
        var admin = JSON.parse(localstorage.getItem('Admin'))
        if (admin == null)
            res.render('login', { message: '' })
        else {

            try {

                pool.query("select f.* ,(select c.categoryname from category c where c.categoryid=f.categoryid) as categoryname ,(select s.subcategoryname from subcategory s where s.subcategoryid=f.subcategoryid) as subcategoryname from fooditems f", function (error, result) {

                    if (error) {
                        res.render('displayallfood', { status: false, data: [] })
                    }
                    else {
                        res.render('displayallfood', { status: true, data: result })
                    }
                })

            }
            catch (e) {

                res.render('displayallfood', { status: false, data: [] })
            }

        }
    }
    catch {
        res.render('login', { message: '' })
    }

})

router.get('/show_food', function (req, res) {

    pool.query("select f.* ,(select c.categoryname from category c where c.categoryid=f.categoryid) as categoryname ,(select s.subcategoryname from subcategory s where s.subcategoryid=f.subcategoryid) as subcategoryname from fooditems f where f.foodid=?", [req.query.foodid], function (error, result) {

        if (error) {
            res.render('showfood', { status: false, data: [] })
        }
        else {
            res.render('showfood', { status: true, data: result[0] })
        }
    })

})

router.post('/update_food_data', function (req, res) {
    if (req.body.btn == 'Edit') {


        pool.query("update fooditems set categoryid=?, subcategoryid=?, foodname=?, ingredients=?, description=?, price=?, offerprice=?, foodtype=?, status=? where foodid=? ", [req.body.categoryid, req.body.subcategoryid, req.body.foodname, req.body.ingredients, req.body.description, req.body.price, req.body.offerprice, req.body.foodtype, req.body.status, req.body.foodid], function (error, result) {

            if (error) {

                res.redirect('/food/display_all_food')
            }
            else {

                res.redirect('/food/display_all_food')
            }
        })
    }
    else {
        pool.query("delete from fooditems where foodid=? ", [req.body.foodid], function (error, result) {

            if (error) {


                res.redirect('/food/display_all_food')
            }
            else {

                fs.unlink(`D:/foodproject/public/images/${req.body.foodpicture}`, function (err) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        console.log("Deleted")
                    }
                })


                res.redirect('/food/display_all_food')
            }
        })
    }

})

router.get('/show_picture', function (req, res) {
    console.log(req.query)
    res.render("showpicture", { data: req.query })
})

router.post('/edit_picture', upload.single('foodpicture'), function (req, res) {

    pool.query("update fooditems set foodpicture=? where foodid=?", [req.file.filename, req.body.foodid], function (error, result) {
        if (error) {
            res.redirect('/food/display_all_food')
        }
        else {
            fs.unlink(`D:/foodproject/public/images/${req.body.oldfoodpicture}`, function (err) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("Deleted")
                }
            })
            res.redirect('/food/display_all_food')
        }
    })
})


module.exports = router