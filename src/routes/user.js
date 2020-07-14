const express = require('express');
const router = express.Router();

const db = require('../database');

const YandexCheckout = require('yandex-checkout')({
  shopId: '601734',
  secretKey: 'live_cZL8TN-trfms9wQpUvi5vZ1Av-obz7wCFpJHMvAGGGg'
});

// Helper for Checking Admin status
const {
  isLoggedIn
} = require('../lib/auth');

// SHOP

router.get('/profile', isLoggedIn, async (req, res) => {
  await db.query("select * from orders where customer_id='" + req.user.id + "'", function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      res.render('user/orders', {
        title:'Мои заказы',
        orders: result
      });
    }
  });
});

router.get('/myorder/:id', isLoggedIn, async (req, res) => {
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
