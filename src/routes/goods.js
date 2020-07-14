const express = require('express');
const router = express.Router();

const db = require('../database');

// GOODSBOARD

router.get('/goodsboard', function(req, res) {
  console.log(req.originalUrl);
  db.query("SELECT * FROM products left join categories on categories.id=products.category", function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      let pidmassive = [];
      let costcart = 0;

      let products = [];
      let trmass = [];
      let pagessize = 5;
      let verif = result.length - 1;
      result.forEach((item, i) => {
        if (item.quantity != 0) {
          trmass.push(item);
        }
        if (trmass.length == 6 || i == verif) {
          products.push(trmass);
          trmass = [];
        }
      });
      if (products.length < 5) {
        let pagessize = products.length;
      }

      if (req.user) {
        db.query("SELECT * FROM userscart left join categories on categories.id=userscart.category where user_id='" + req.user.id + "'", function(err, cartgoods, fields) {
          if (err) {
            throw err;
          } else {
            cartgoods.forEach((item, i) => {
              pidmassive.push(item.pid);
              costcart += item.price;
            });
            req.app.locals.goodsincart = pidmassive.length;
            req.app.locals.costcart = costcart;
            res.render('generals/goodsboard', {
              title: 'Список продуктов',
              products: products[0],
              pids: pidmassive,
              straddin: 'Добавить в корзину',
              stredincart: 'Перейти в корзину',
              rouble: '₽',
              currentPage: 1,
              pageCount: products.length,
              size: pagessize
            });
          }
        });
      } else {
        if (req.cookies.node_express_ecommerce) {
          req.cookies.node_express_ecommerce.forEach((item, i) => {
            pidmassive.push(item.pid);
            costcart += item.price;
          });
          req.app.locals.goodsincart = pidmassive.length;
          req.app.locals.costcart = costcart;
          res.render('generals/goodsboard', {
            title: 'Магазин',
            products: products[0],
            pids: pidmassive,
            straddin: 'Добавить в корзину',
            stredincart: 'Перейти в корзину',
            rouble: '₽',
            currentPage: 1,
            pageCount: products.length,
            size: pagessize
          });
        } else {
          res.render('generals/goodsboard', {
            title: 'Магазин',
            products: products[0],
            pids: pidmassive,
            straddin: 'Добавить в корзину',
            stredincart: 'Перейти в корзину',
            rouble: '₽',
            currentPage: 1,
            pageCount: products.length,
            size: pagessize
          });
        }
      }
    }
  });
});

router.get('/goodsboard/:page', function(req, res) {
  console.log(req.originalUrl);
  db.query("SELECT * FROM products left join categories on categories.id=products.category", function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      let pidmassive = [];
      let costcart = 0;

      let products = [];
      let trmass = [];
      let pagessize = 5;
      let verif = result.length - 1;

      result.forEach((item, i) => {
        if (item.quantity != 0) {
          trmass.push(item);
        }
        if (trmass.length == 6 || i == verif) {
          products.push(trmass);
          trmass = [];
        }
      });
      if (products.length < 5) {
        let pagessize = products.length;
      }

      if (req.user) {
        db.query("SELECT * FROM userscart left join categories on categories.id=userscart.category where user_id='" + req.user.id + "'", function(err, cartgoods, fields) {
          if (err) {
            throw err;
          } else {
            cartgoods.forEach((item, i) => {
              pidmassive.push(item.pid);
              costcart += item.price;
            });
            req.app.locals.goodsincart = pidmassive.length;
            req.app.locals.costcart = costcart;
            res.render('generals/goodsboard', {
              title: 'Магазин',
              products: products[req.params.page - 1],
              pids: pidmassive,
              straddin: 'Добавить в корзину',
              stredincart: 'Перейти в корзину',
              rouble: '₽',
              currentPage: req.params.page,
              pageCount: products.length,
              size: pagessize
            });
          }
        });
      } else {
        if (req.cookies.node_express_ecommerce) {
          req.cookies.node_express_ecommerce.forEach((item, i) => {
            pidmassive.push(item.pid);
            costcart += item.price;
          });
          req.app.locals.goodsincart = pidmassive.length;
          req.app.locals.costcart = costcart;
          res.render('generals/goodsboard', {
            title: 'Магазин',
            products: products[req.params.page - 1],
            pids: pidmassive,
            straddin: 'Добавить в корзину',
            stredincart: 'Перейти в корзину',
            rouble: '₽',
            currentPage: req.params.page,
            pageCount: products.length,
            size: pagessize
          });
        } else {
          res.render('generals/goodsboard', {
            title: 'Магазин',
            products: products[req.params.page - 1],
            pids: pidmassive,
            straddin: 'Добавить в корзину',
            stredincart: 'Перейти в корзину',
            rouble: '₽',
            currentPage: req.params.page,
            pageCount: products.length,
            size: pagessize
          });
        }
      }
    }
  });
});

//Filter "categories"

router.get('/goodsboard/category/:num', function(req, res) {
  console.log(req.originalUrl);
  db.query("SELECT * FROM products left join categories on categories.id=products.category where category='" + req.params.num + "'", function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      let pidmassive = [];

      let products = [];
      let trmass = [];
      let pagessize = 5;
      let verif = result.length - 1;
      result.forEach((item, i) => {
        if (item.quantity != 0) {
          trmass.push(item);
        }
        if (trmass.length == 6 || i == verif) {
          products.push(trmass);
          trmass = [];
        }
      });
      if (products.length < 5) {
        let pagessize = products.length;
      }

      if (req.user) {
        db.query("SELECT * FROM userscart left join categories on categories.id=userscart.category where user_id='" + req.user.id + "'", function(err, cartgoods, fields) {
          if (err) {
            throw err;
          } else {
            cartgoods.forEach((item, i) => {
              pidmassive.push(item.pid);
            });

            res.render('generals/goodsboard', {
              title: 'Список продуктов',
              products: products[0],
              pids: pidmassive,
              straddin: 'Добавить в корзину',
              stredincart: 'Перейти в корзину',
              rouble: '₽',
              currentPage: 1,
              pageCount: products.length,
              size: pagessize
            });
          }
        });
      } else {
        if (req.cookies.node_express_ecommerce) {
          req.cookies.node_express_ecommerce.forEach((item, i) => {
            pidmassive.push(item.pid);
          });
          res.render('generals/goodsboard', {
            title: 'Магазин',
            products: products[0],
            pids: pidmassive,
            straddin: 'Добавить в корзину',
            stredincart: 'Перейти в корзину',
            rouble: '₽',
            currentPage: 1,
            pageCount: products.length,
            size: pagessize
          });
        } else {
          res.render('generals/goodsboard', {
            title: 'Магазин',
            products: products[0],
            pids: pidmassive,
            straddin: 'Добавить в корзину',
            stredincart: 'Перейти в корзину',
            rouble: '₽',
            currentPage: 1,
            pageCount: products.length,
            size: pagessize
          });
        }
      }
    }
  });
});

// CONCRETEGOOD

router.get('/product/:product', function(req, res) {
  db.query("SELECT * FROM products left join categories on categories.id=products.category where pid='" + req.params.product + "'", function(err, result, fields) {
    if (err) {
      throw err;
    } else {
      var str = result[0].picture.split(',');
      res.render('generals/concretegood', {
        title: result[0].title + '//ImpalaMerch',
        product: result[0],
        picture: str[0],
        pics: str
      });
    }
  });
});

// add to cart
router.post('/add-to-cart/:product', async (req, res) => {
  let product = req.params.product.split('-')[1];
  if (req.user) {
    let products;
    let goodtoadd;

    db.query("SELECT * FROM userscart where user_id='" + req.user.id + "'", function(err, result, fields) {
      if (err) {
        throw err;
      } else {
        products = result;
        db.query("SELECT * FROM products left join categories on categories.id=products.category where pid='" + product + "'", function(err, result, fields) {
          if (err) {
            res.render('page', {
              title: 'About'
            });
          } else {
            let flag = 0;
            products.forEach(item => {
              if (item.pid == product) {
                flag = 1;
              }
            });
            if (flag == 0) {
              req.app.locals.goodsincart = req.app.locals.goodsincart + 1;
              req.app.locals.costcart = req.app.locals.costcart + result[0].price;
              const newGood = {
                pid: result[0].pid,
                title: result[0].title,
                category: result[0].category,
                price: result[0].price,
                picture: result[0].picture,
                qnt: 1,
                user_id: req.user.id
              };
              db.query('INSERT INTO userscart set ?', [newGood]);
            }
            req.flash('success', 'Good saved successfully in the mysql cart');
            res.redirect('back');
          }
        });
      }
    });

  } else {
    let products = [];
    if (req.cookies.node_express_ecommerce) {
      products = req.cookies.node_express_ecommerce;
    }

    db.query("SELECT * FROM products left join categories on categories.id=products.category where pid='" + product + "'", function(err, result, fields) {
      if (err) {
        res.render('page', {
          title: 'About'
        });
      } else {
        let flag = 0;
        products.forEach(item => {
          if (item.pid == product) {
            flag = 1;
          }
        });
        if (flag == 0) {
          req.app.locals.goodsincart = req.app.locals.goodsincart + 1;
          req.app.locals.costcart = req.app.locals.costcart + result[0].price;
          products.push({
            pid: result[0].pid,
            title: result[0].title,
            name: result[0].name,
            price: result[0].price,
            picture: result[0].picture,
            qnt: 1
          });
        }

        res.cookie('node_express_ecommerce', products, {
          path: '/'
        });
        res.redirect('back');
      }
    });
  }
});


router.post('/concretegood/add-to-cart/:product', async (req, res) => {
  let product = req.params.product.split('-')[1];

  if (req.user) {
    let products;
    let goodtoadd;

    db.query("SELECT * FROM userscart where user_id='" + req.user.id + "'", function(err, result, fields) {
      if (err) {
        throw err;
      } else {
        products = result;
        db.query("SELECT * FROM products left join categories on categories.id=products.category where pid='" + product + "'", function(err, result, fields) {
          if (err) {
            res.render('page', {
              title: 'About'
            });
          } else {
            let flag = 0;
            products.forEach(item => {
              if (item.pid == product) {
                flag = 1;
              }
            });
            if (flag == 0) {
              req.app.locals.goodsincart = req.app.locals.goodsincart + 1;
              req.app.locals.costcart = req.app.locals.costcart + result[0].price;
              const newGood = {
                pid: result[0].pid,
                title: result[0].title,
                category: result[0].category,
                price: result[0].price,
                picture: result[0].picture,
                qnt: 1,
                user_id: req.user.id
              };
              db.query('INSERT INTO userscart set ?', [newGood]);
            }
            req.flash('success', 'Good saved successfully in the mysql cart');
            res.redirect('back');
          }
        });
      }
    });

  } else {
    let products = [];
    if (req.cookies.node_express_ecommerce) {
      products = req.cookies.node_express_ecommerce;
    }

    db.query("SELECT * FROM products left join categories on categories.id=products.category where pid='" + product + "'", function(err, result, fields) {
      if (err) {
        res.render('page', {
          title: 'About'
        });
      } else {
        let flag = 0;
        products.forEach(item => {
          if (item.pid == product) {
            flag = 1;
          }
        });
        if (flag == 0) {
          req.app.locals.goodsincart = req.app.locals.goodsincart + 1
          req.app.locals.costcart = req.app.locals.costcart + result[0].price;
          products.push({
            pid: result[0].pid,
            title: result[0].title,
            name: result[0].name,
            price: result[0].price,
            picture: result[0].picture,
            qnt: 1
          });
        }

        res.cookie('node_express_ecommerce', products, {
          path: '/'
        });
        res.redirect('back');
      }
    });
  }
});


module.exports = router;
