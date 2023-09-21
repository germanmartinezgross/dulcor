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
        var docFin = this.getOwnerComponent().getModel("DocumentosFinancieros").getData().results;
        docFin = docFin.filter((doc) => doc.DocNo === comprobante && doc.DocType === operacion);
        docFin.forEach(doc => {
          var oViewModel = new JSONModel({
            comprobante: doc.DocNo,
            operacion: doc.DocType,
            fecha: doc.PstngDate,
            vencimiento: doc.BlineDate,
            importe: doc.Amount,
            moneda: doc.Currency

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