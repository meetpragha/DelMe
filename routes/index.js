    const express = require('express');
var bodyParser = require('body-parser');



const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const { redirectLogin } = require('../config/auth');
const { redirectHome } = require('../config/auth');

router.get('/', redirectHome, (req, res) => res.render('welcome'));

router.get('/dashboard', redirectLogin, (req, res) => {
    let user = req.session.userdetails;
    res.render('dashboard', { user })
});


router.get('/dashboard2', redirectLogin, (req, res) => {
    let user = req.session.userdetails;
    res.render('dashboard2', { user })
});

module.exports = router;