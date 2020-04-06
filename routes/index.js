var express = require("express");
var router = express.Router();
const Helper = require("../helper");

/* GET home page. */

router.get("/", function (req, res, next) {
  console.log("Entre en index")
  //Si la organizacion no existe reenvio a no autorizado

  console.log("el body en index router vale: " + JSON.stringify(req.body));
  console.log(req.isAuthenticated());
  if (!req.isAuthenticated()) {
    res.status(301).redirect("/login");
  } else {
    res.status(301).redirect("/auth_pending");
    //res.redirect(301, "/auth_pending");
  }



  if (
    req.body.organization === true &&
    req.body.user_status === "usuario_creado_pendiente_autorizacion"
  ) {
    res.status(301).redirect("/auth_send");
    //res.redirect(301, "/auth_send");
  }

  if (
    req.body.organization === true &&
    req.body.user_status === "pendiente_autorizacion"
  ) {

    res.status(301).redirect("/auth_pending");
    //res.redirect(301, "/auth_pending");
  }


  if (
    req.body.organization === true &&
    req.body.user_status === "rechazado"
  ) {
    res.status(301).redirect("/auth_rejected_for_user");
    //res.redirect(301, "/auth_rejected_for_user");
  }

  if (
    req.body.organization === true &&
    req.body.user_status === "aprobado"
  ) {

    //Hacer la busqueda en mongo para armar el nav
    //Armar URL dinamica de redirect
    res.status(301).redirect("/dash/1");
    //res.redirect(301, "/dash/1");
  }

});





router.get("/dash/:id", function (req, res, next) {
  if (!req.isAuthenticated()) {
    // Redirect unauthenticated requests to home page
    res.status(301).redirect("/login");
    //res.redirect(301, "/login");
  }

  let config_view;

  config_view = {
    view: "dash",
    name: req.session.displayName,
    nav: [
      {
        name: "Telemetría",
        link: "/dash/1",
        active: false,
        url_iframe:
          "https://telemetry.newtech.com.ar/d/oku-WeXWk/red-link-sbc-monitoring?orgId=1&refresh=5m&kiosk"
      },
      {
        name: "VM",
        link: "/dash/2",
        active: false,
        url_iframe:
          "https://telemetry.newtech.com.ar/d/lD0m4J9Zz/vm-newcos-telemetry-status?orgId=1&refresh=1m&from=now-6h&to=now&kiosk"
      }
    ]
  };

  //res.render("index", { config_view });
});

router.get("/auth_approved", function (req, res, next) {
  if (!req.isAuthenticated()) {
    // Redirect unauthenticated requests to home page
    res.status(301).redirect("/login");
    //res.redirect(301, "/login");
  }

  let config_view = {
    view: "auth_approved",
    name: req.session.displayName,
    nav: [
      { link: "index", title: "boton 1" },
      { link: "index2", title: "boton 2" }
    ],
    parametro: "texto parametro",
    mi_otro_parametro: "blablablabla"
  };
  console.log(config_view);
  res.render("index", { config_view });
});

router.get("/auth_rejected", function (req, res, next) {
  console.log("session vale: " + JSON.stringify(req.user))
  console.log("session vale: " + JSON.stringify(req.session))
  if (!req.isAuthenticated()) {
    // Redirect unauthenticated requests to home page
    res.status(301).redirect("/login");
    // res.redirect(301, "/login");
  }

  let config_view = {
    view: "auth_rejected",
    name: req.session.displayName,
    nav: [
      { link: "index", title: "boton 1" },
      { link: "index2", title: "boton 2" }
    ],
    parametro: "texto parametro",
    mi_otro_parametro: "blablablabla"
  };
  //console.log(config_view);
  res.render("index", { config_view });
});

router.get("/auth_rejected_for_user", function (req, res, next) {
  if (!req.isAuthenticated()) {
    // Redirect unauthenticated requests to home page
    res.status(301).redirect("/login");
    //res.redirect(301, "/login");
  }
  let config_view = {
    view: "auth_rejected_for_user",
    name: req.session.displayName,
    nav: [
      { link: "index", title: "boton 1" },
      { link: "index2", title: "boton 2" }
    ],
    parametro: "texto parametro",
    mi_otro_parametro: "blablablabla"
  };
  console.log(config_view);
  res.render("index", { config_view });
});

router.get("/no_authorized", function (req, res, next) {
  if (!req.isAuthenticated()) {
    // Redirect unauthenticated requests to home page
    res.status(301).redirect("/login");
    //res.redirect(301, "/login");
  }

  let config_view = {
    view: "no_authorized",
    name: req.session.displayName,
    nav: [
      { link: "index", title: "boton 1" },
      { link: "index2", title: "boton 2" }
    ],
    parametro: "texto parametro",
    mi_otro_parametro: "blablablabla"
  };
  console.log(config_view);
  res.render("index", { config_view });
});

router.get("/auth_send", function (req, res, next) {
  if (!req.isAuthenticated()) {
    // Redirect unauthenticated requests to home page
    res.status(301).redirect("/login");
    //res.redirect(301, "/");
  }

  let config_view = {
    view: "auth_send",
    name: req.session.displayName
  };
  console.log(config_view);
  res.render("index", { config_view });
});

router.get("/auth_pending", function (req, res, next) {
  /*
  if (!req.isAuthenticated()) {
    // Redirect unauthenticated requests to home page
    res.status(301).redirect("/login");
    //res.redirect(301, "/");
  }
*/
  let config_view = {
    view: "auth_pending",
    name: req.session.displayName
  };
  console.log(config_view);
  res.render("index", { config_view });
});

router.get("/login", function (req, res, next) {
  let config_view = {
    view: "login"
  };
  res.render("index", { config_view });
});

router.get("/salir", function (req, res) {
  req.session.destroy(function (err) {
    console.log("entre en signout");
    req.logout();
    delete req.session;
    res.redirect(301, "/");
  });
});


module.exports = router;
