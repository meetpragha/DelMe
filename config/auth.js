exports.redirectLogin = (req, res, next) => {
    if (!req.session.userdetails) {
        res.redirect('/users/login')

    }
    else {
        next()
    }
}


exports.redirectHome = (req, res, next) => {
    if (req.session.userdetails) {
        if (req.session.usertype != 'helper')
            res.redirect('/dashboard2');
        else
            res.redirect('/dashboard');
    }


    else {
        next()
    }
}