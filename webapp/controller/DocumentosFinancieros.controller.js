sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel'
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel) {
    "use strict";
    var comprobante
    var operacion
    return Controller.extend("estadoCuenta.dulcor.controller.DocumentosFinancieros", {
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("RouteDocF").attachMatched(this._onRouteMatched, this);

      },

      _onRouteMatched: function (oEvent) {
        var oArgs, oView;

        oArgs = oEvent.getParameter("arguments");
        oView = this.getView();
        operacion = oArgs.operacion;
        comprobante = oArgs.comprobante;
        var docFin = this.getOwnerComponent().getModel("DocumentosFinancieros").getData().estados;
        docFin = docFin.filter((doc) => doc.comprobante === comprobante && doc.operacion === operacion);
        docFin.forEach(doc => {
          var oViewModel = new JSONModel({
            comprobante: doc.comprobante,
            operacion: doc.operacion,
            fecha: doc.fecha,
            vencimiento: doc.vencimiento,
            importe: doc.importe,
            moneda: doc.moneda

          });
          this.getView().setModel(oViewModel, "datosPrincipales");

        });

        this.getView().setModel(this.getOwnerComponent().getModel("Productos"), "productos");
        this.getView().setModel(this.getOwnerComponent().getModel("Comprobantes"), "comprobantes");


      },

      onSubmit: async function () {

        this.getView().byId("tablaPanel").setVisible(true);

      },
      onPress: function (oEvent) {
        // var oBindingContext = oEvent.getSource().getBindingContext();
        var oBindingContext = oEvent.getSource().getBindingContext("comprobantes");
                var tipo = oBindingContext.getProperty("tipo");
                var numero = oBindingContext.getProperty("numero");
        this.getOwnerComponent().getRouter().navTo("RouteComp" , {
          tipo: tipo,
          numero: numero
          // fecha: fecha,
          // vencimiento: vencimiento,
          // importe: importe,
          // moneda: moneda
      }
      );
        // this.getOwnerComponent().getRouter().navTo("RouteDocF");
      }
    });
  });