const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();
const PORT = process.env.PORT || 3000;

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
  mode: "live", //sandbox or live
  client_id:
    "AeE5um-8EvKkqm5xxvhFuGLq98hbRBD-GL73uUiNKRnJ_PIPzIOe04hT-ZPiE__qF__IfnGAOK_mVQPT",
  client_secret:
    "EH3jmZWZ_mDUJSmCwVVWt2J9-sT7i4jMXQK2u9xzu3Gouyc3iWHf0DYaY4ggFw39rKX8xbpO4_EaEiwx",
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/paypal", (req, res) => {
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `https://rialto-paypal.herokuapp.com/success?amount=${req.query.amount}`,
      cancel_url: "https://rialto-paypal.herokuapp.com/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "item",
              sku: "item",
              price: req.query.amount,
              currency: "EUR",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "EUR",
          total: req.query.amount,
        },
        description: "This is the payment description.",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      res.redirect(payment.links[1].href);
    }
  });
});

app.get("/success", (req, res) => {
  // res.send("Success");
  var PayerID = req.query.PayerID;
  var paymentId = req.query.paymentId;
  var execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency: "EUR",
          total: req.query.amount,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log("Get Payment Response");
        console.log(JSON.stringify(payment));
        res.render("success");
      }
    }
  );
});

app.get("cancel", (req, res) => {
  res.render("cancel");
});

app.listen(PORT, () => {
  console.log("Server is running at :" + PORT);
});