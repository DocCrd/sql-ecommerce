const express = require('express');
const router = express.Router();
const YandexCheckout = require('yandex-checkout')({
  shopId: '601734',
  secretKey: 'live_cZL8TN-trfms9wQpUvi5vZ1Av-obz7wCFpJHMvAGGGg'
});
const {
  v4: uuidv4
} = require('uuid');

const db = require('../database');

router.get('/cart', function(req, res) {
  if (req.user) {
    db.query("SELECT * FROM userscart left join categories on categories.id=userscart.category where user_id='" + req.user.id + "'", function(err, result, fields) {
      if (err) {
        throw err;
      } else {
        req.app.locals.costcart = 0;
        req.app.locals.goodsincart = 0;
        result.forEach((item, i) => {
          req.app.locals.goodsincart = req.app.locals.goodsincart + 1;
          req.app.locals.costcart = req.app.locals.costcart + (item.price * item.qnt);
        });
        res.render('cart/cart', {
          title: 'Моя Корзина',
          products: result
        });
      }
    });
  } else {
    let products = [];

    if (req.cookies.node_express_ecommerce) {
      products = req.cookies.node_express_ecommerce;
      console.log(products);
      req.app.locals.costcart = 0;
      req.app.locals.goodsincart = 0;
      products.forEach((item, i) => {
        req.app.locals.goodsincart = req.app.locals.goodsincart + 1;
        req.app.locals.costcart = req.app.locals.costcart + (item.price * item.qnt);
      });
      res.render('cart/cart', {
        title: 'Моя Корзина',
        products: req.cookies.node_express_ecommerce
      });
    } else {
      res.render('cart/cart', {
        title: 'Моя Корзина',
        products: products
      });
    }
  }
});

router.get('/remove-from-cart/:index', function(req, res) {
  if (req.user) {
    let index = req.params.index.split('-')[2];
    db.query("DELETE FROM userscart WHERE user_id='" + req.user.id + "' and pid='" + index + "'", function(err, result, fields) {
      if (err) {
        throw err;
      } else {
        res.redirect('back')
      }
    });
  } else {
    let products = req.cookies.node_express_ecommerce;
    let index = req.params.index.split('-')[1];
    console.log(products[index].price);
    products.splice(index, 1);
    res.cookie('node_express_ecommerce', products, {
      path: '/'
    });
    res.redirect('back');
  }
});

router.get('/empty-cart', function(req, res) {
  if (req.user) {
    db.query("DELETE FROM userscart WHERE user_id='" + req.user.id + "'", function(err, result, fields) {
      if (err) {
        throw err;
      } else {
        req.app.locals.goodsincart = 0;
        req.app.locals.costcart = 0;
        res.redirect('back')
      }
    });
  } else {
    let products = [];
    res.cookie('node_express_ecommerce', products, {
      path: '/'
    });
    req.app.locals.goodsincart = 0;
    req.app.locals.costcart = 0;
    res.redirect('back');
  }
});

router.post('/update-cart', function(req, res) {
  let costcart = 0;
  if (req.user) {
    db.query("SELECT * FROM userscart where user_id='" + req.user.id + "'", function(err, result, fields) {
      if (err) {
        throw err;
      } else {
        var querystring = "";
        result.forEach((item, i) => {
          querystring += "UPDATE userscart set qnt='" + req.body.qnt[i] + "' where user_id='" + req.user.id + "' and pid='" + item.pid + "';";
          costcart += req.body.qnt[i] * item.price;
        });
        db.query(querystring, function(err, result, fields) {
          if (err) {
            throw err;
          } else {
            req.app.locals.costcart = costcart;
            res.redirect('back')
          }
        });
      }
    });
  } else {
    let products = req.cookies.node_express_ecommerce;
    products.forEach(function(product, index) {
      product.qnt = req.body.qnt[index];
      costcart += req.body.qnt[index] * product.price;
    });
    res.clearCookie('node_express_ecommerce', {
      path: '/'
    });
    req.app.locals.costcart = costcart;
    res.cookie('node_express_ecommerce', products);
    res.redirect('back');
  }
});

router.get('/checkout', function(req, res) {
  let thissescart = [];
  if (req.user) {
    db.query("SELECT * FROM userscart where user_id='" + req.user.id + "'", function(err, result, fields) {
      if (err) {
        throw err;
      } else {
        result.forEach((item, i) => {
          thissescart.push({
            goodid: item.pid,
            qnt: item.qnt
          });
        });

        req.app.locals.orderscart = thissescart;

        res.render('cart/checkout', {
          title: 'Заполнение формы заказа',
          phone: req.user.phone,
          email: req.user.email,
          fullname: req.user.fullname
        });
      }
    });
  } else {
    let products = req.cookies.node_express_ecommerce;

    products.forEach((item, i) => {
      thissescart.push({
        goodid: item.pid,
        qnt: item.qnt
      });
    });

    req.app.locals.orderscart = thissescart;

    res.render('cart/checkout', {
      title: 'Checkout',
      phone: '',
      email: '',
      fullname: ''
    });
  }
});


router.post('/payment', async (req, res) => {

  const idempotenceKey = uuidv4();

  YandexCheckout.createPayment({
      'amount': {
        'value': `${req.app.locals.costcart}`,
        'currency': 'RUB'
      },
      'confirmation': {
        'type': 'redirect',
        'return_url': 'http://localhost:4000/goodsboard'
      },
      'capture': 'true',
      'description': `${idempotenceKey}`
    }, idempotenceKey)
    .then(function(result) {
      const payment_id = result.id;
      const ordersdate = new Date();
      const products = [];



      if (req.user) {
        const querystring = "INSERT INTO orders (orddate, amount, customer_id, fullname, phone, email, idempotencekey, payment_id) VALUES ('" + ordersdate.toLocaleDateString() + "', '" + req.app.locals.costcart + "', '" + req.user.id + "', '" + req.body.fullname + "', '" + req.body.phone + "', '" + req.body.email + "', '" + idempotenceKey + "', '" + payment_id + "');DELETE FROM userscart WHERE user_id='" + req.user.id + "'";
        db.query(querystring, function(err, resl, fields) {
          if (err) {
            throw err;
          } else {
            const ordercart = req.app.locals.orderscart;
            let qstrordcart = '';
            ordercart.forEach((item, i) => {
              qstrordcart += "INSERT INTO payedcarts (product_id, order_id, quantity) VALUES ('" + item.goodid + "', '" + resl[0].insertId + "', '" + item.qnt + "');UPDATE products set quantity = quantity - '" + item.qnt + "' where pid='" + item.goodid + "';";
            });
            req.app.locals.orderscart = 0;
            db.query(qstrordcart, function(error, relt, fieldss) {
              if (error) {
                throw error;
              } else {
                res.redirect(result.confirmation.confirmation_url);
              }
            });
          }
        });
      } else {
        const querystring = "INSERT INTO orders (orddate, amount, fullname, phone, email, idempotencekey, payment_id) VALUES ('" + ordersdate.toLocaleDateString() + "', '" + req.app.locals.costcart + "', '" + req.body.fullname + "', '" + req.body.phone + "', '" + req.body.email + "', '" + idempotenceKey + "', '" + payment_id + "');";

        res.cookie('node_express_ecommerce', products, {
          path: '/'
        });

        db.query(querystring, function(err, resl, fields) {
          if (err) {
            throw err;
          } else {
            const ordercart = req.app.locals.orderscart;
            let qstrordcart = '';
            ordercart.forEach((item, i) => {
              qstrordcart += "INSERT INTO payedcarts (product_id, order_id, quantity) VALUES ('" + item.goodid + "', '" + resl[0].insertId + "', '" + item.qnt + "');UPDATE products set quantity = quantity - '" + item.qnt + "' where pid='" + item.goodid + "';";
            });
            req.app.locals.orderscart = 0;
            db.query(qstrordcart, function(error, relt, fieldss) {
              if (error) {
                throw error;
              } else {
                res.redirect(result.confirmation.confirmation_url);
              }
            });
          }
        });
      }
    })
    .catch(function(err) {
      console.error(err);
    });
});

module.exports = router;
