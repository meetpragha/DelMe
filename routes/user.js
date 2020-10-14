const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
var bodyParser = require('body-parser');



router.use(bodyParser.urlencoded({ extended: false }));




const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: "DeliverMe",
    port:'8889'
});
const { redirectLogin } = require('../config/auth');
const { redirectHome } = require('../config/auth');


router.get('/login', redirectHome, (req, res) => res.render('login'));


router.get('/register', redirectHome, (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const { name, email, phone, password, password2 } = req.body;
    let errors = []




    if (phone.length !== 10) {
        errors.push({ msg: 'Enter your 10 digit-phone number ' })
    }
    if (password !== password2) {
        errors.push({ msg: 'passwords dont match ' });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            phone,
            password,
            password2
        })
    }
    else {



        const { name, email, phone, password, password2 } = req.body;
        console.log("fsd" + phone);
        var q1 = 'select mobile_no from users where mobile_no= ?';
        db.query(q1, [phone], async (err, results) => {
            if (err) console.log(err);

            if (results.length > 0) {
                errors.push({ msg: 'This number is already registered ' })
                return res.render('register', {
                    errors,
                    name,
                    email,
                    phone,
                    password,
                    password2
                })
            }



            let hashedpassword = await bcrypt.hash(password, 8);


            var q2 = 'insert into users set ?'
            db.query(q2, { user_name: name, email: email, mobile_no: phone, password: hashedpassword }, (err, results) => {
                if (err) {
                    console.log(err);

                }
                else {
                    console.log(req.body);
                    console.log('registered');
                    return res.redirect('/users/login')
                }
            })


        })




    }


})
router.post('/login', (req, res, next) => {
    try {
        let errors = []
        const phone = req.body.phone;
        const password = req.body.password;
        const choice = req.body.choice;

        db.query('Select * from users where mobile_no = ?', [phone], async (err, results) => {
            console.log('results' + results);
            console.log(results.size);
            if (!results[0]) {
                console.log('no results');
                errors.push({ msg: 'mobile number or password incorrect' })
                return res.status(401).render('login', { errors, phone });
            }
            else {
                if (!(await bcrypt.compare(password, results[0].password))) {
                    errors.push({ msg: 'mobile number or password incorrect' })
                    return res.status(401).render('login', { errors, phone });
                }
                else {
                    req.session.userdetails = results[0];
                    if (choice == 'choice1') {
                        req.session.usertype = 'helper';
                        return res.redirect('/dashboard2');
                    }
                    else if (choice == 'choice2') {
                        req.session.usertype = 'help_seeker';
                        return res.redirect('/dashboard');
                    }

                }

            }

        })
    } catch (error) {
        console.log('error');
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard')
        }
        else {
            res.clearCookie('sid');
            return res.redirect('/users/login');
        }




    })


})

router.get('/request_buy', redirectLogin, (req, res) => {
    let user = req.session.userdetails;
    res.render('request_buy', { user })
})

router.post('/request_buy', redirectLogin, (req, res) => {


    //console.log("file " + req.files.pimage);
    var pimage_path;
    if (req.file)
        pimage_path = req.file.path;

    let user = req.session.userdetails;
    console.log(user);
    console.log(req.body);

    const { pname, pprice, pdesc, pimage, rprice, lat1, lng1, lat2, lng2 } = req.body;
    var query = "insert into buy_request set ?";
    db.query(query, { buyer: user.id, pname: pname, pprice: pprice, pdesc, rprice, lat1, lng1, lat2, lng2, pimage: pimage_path }, (err, results) => {
        if (err)
            console.log(err);
        else {
            res.send("data inserted");
        }
    });



})

router.get('/helper', (req, res) => {
    let user = req.session.userdetails;
    res.render('helper', { user })
})

router.post('/helper', redirectLogin, (req, res) => {

    let user = req.session.userdetails;
    console.log(user.phone);

    const { lat1, lng1, lat2, lng2 } = req.body;
    var query = "insert into helper_details set ?";
    var helper = { hid: user.id, lat1, lng1, lat2, lng2 }
    req.session.helper = helper;
    db.query(query, { hid: user.id, lat1, lng1, lat2, lng2 }, (err, results) => {
        if (err)
            console.log(err);
        else {
            res.redirect('/users/listrequest');
        }
    });
})

router.get('/listrequest', redirectLogin, (req, res) => {
    if (!req.session.helper)
        res.redirect('/users/helper')

    var user = req.session.userdetails;
    var helper = req.session.helper;
    var query3 = "select *, (0.7*( 6371 * acos ( cos ( radians(" + helper.lat2 + ") ) * cos( radians( lat1 ) ) * cos( radians( lng1 ) - radians(" + helper.lng2 + ") ) + sin ( radians(" + helper.lat2 + ") ) * sin( radians( lat1 ) ) ) ) + 0.3*( 6371 * acos ( cos ( radians(" + helper.lat1 + ") ) * cos( radians( lat2 ) ) * cos( radians( lng2 ) - radians(" + helper.lng1 + ") ) + sin ( radians(" + helper.lat1 + ") ) * sin( radians( lat2 ) ) ) )) AS distance FROM DeliverMe.buy_request order by distance;"
    db.query(query3, (err, results) => {
        if (err) {
            console.log(err);
            return res.redirect('/users/helper', { user });
        }
        else {

            return res.render('list_of_request', { user, helper, results })
        }

    })

})


router.get('/chat', (req, res) => {
    let user = req.session.userdetails;
    res.render('chat_main', { user })
})

router.post('/chat', redirectLogin, (req, res) => {
    res.redirect('/users/chat_part');
})


router.get('/chat_part', (req, res) => {
    let user = req.session.userdetails;
    res.render('chat_part', { user })
})

router.post('/chat_part', redirectLogin, (req, res) => {
    res.redirect('/users/chat_part');
})

module.exports = router;
