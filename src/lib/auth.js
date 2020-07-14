module.exports = {
  isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/signin');
  },
  isLoggedInAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isadmin === 'true') {
      return next();
    }
    return res.redirect('/signin');
  }
};
