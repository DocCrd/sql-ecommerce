const express = require('express');
const router = express.Router();

const db = require('../database');

const YandexCheckout = require('yandex-checkout')({
  shopId: '601734',
  secretKey: 'live_cZL8TN-trfms9wQpUvi5vZ1Av-obz7wCFpJHMvAGGGg'
});

// Helper for Checking Admin status
const {
  isLoggedInAdmin
} = require('../lib/auth');

// SHOP
router.get('/allglist', isLoggedInAdmin, async (req, res) => {
  const admingoods = await db.query('select * from products');
  res.render('admin/allglist', {
    title: 'Просмотр магазинных продуктов админом',
    admingoods
  });
});

router.post('/remove-from-allglist/:index', isLoggedInAdmin, async (req, res) => {
  const pidof = req.params.index.split('-')[1];
  await db.query("DELETE FROM products WHERE pid='" + pidof + "'", function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      res.redirect('../allglist');
    }
  });
});

router.get('/admproduct/:index', isLoggedInAdmin, async (req, res) => {
  await db.query("select * from products where pid='" + req.params.index + "'", function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      res.render('admin/concretegood', {
        title: result[0].title + '//ImpalaMerch',
        product: result[0]
      });
    }
  });
});

router.post('/update-good/:index', isLoggedInAdmin, async (req, res) => {
  var querystring = "";
  let massofquery = [
    "UPDATE products set category='" + req.body.category + "' where pid='" + req.params.index + "';",
    "UPDATE products set title='" + req.body.title + "' where pid='" + req.params.index + "';",
    "UPDATE products set details='" + req.body.details + "' where pid='" + req.params.index + "';",
    "UPDATE products set price='" + req.body.price + "' where pid='" + req.params.index + "';",
    "UPDATE products set picture='" + req.body.picture + "' where pid='" + req.params.index + "';",
    "UPDATE products set quantity='" + req.body.quantity + "' where pid='" + req.params.index + "';",
  ];
  massofquery.forEach((item, i) => {
    querystring += item;
  });
  await db.query(querystring, function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      res.redirect('../allglist')
    }
  });
});

router.get('/add-to-allglist', isLoggedInAdmin, async (req, res) => {
  res.render('admin/creategood', {
    title: 'Добавить товар'
  });
});

router.post('/add-to-allglist', isLoggedInAdmin, async (req, res) => {
  await db.query("INSERT INTO products (category, title, details, price, picture, quantity) VALUES (" + req.body.category + ", '" + req.body.title + "', '" + req.body.details + "', '" + req.body.price + "', '" + req.body.picture + "', '" + req.body.quantity + "');", function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      res.redirect('../allglist')
    }
  });
});

router.get('/orders', isLoggedInAdmin, async (req, res) => {
  await db.query("select * from orders", function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      res.render('admin/orders', {
        title:'Лист заказов',
        orders: result
      });
    }
  });
});

router.get('/order/:id', isLoggedInAdmin, async (req, res) => {
  await db.query("select * from orders where id='" + req.params.id + "'", function(errore, order, fields) {
    if (errore) {
      throw errore;
    } else {
      const paymentId = order.payment_id;
      const idempotenceKey = order.idempotenceKey;
      db.query("select * from payedcarts where order_id='" + order.id + "'", function(error, orderscart, fieldss) {
        if (error) {
          throw error;
        } else {
          YandexCheckout.getPayment(paymentId, idempotenceKey)
            .then((result) => {
              res.render('admin/concreteorder', {
                title: 'Заказ номер ' + order.id,
                products: orderscart,
                payment: result
              });
            })
            .catch(function(err) {
              console.error(err);
            });
        }
      });
    }
  });
});

module.exports = router;
