sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/ui/model/json/JSONModel'
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";
        var tipo
        var numero

        return Controller.extend("estadoCuenta.dulcor.controller.Comprobantes", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("RouteComp").attachMatched(this._onRouteMatched, this);
            },

            _onRouteMatched: function (oEvent) {
                var oArgs, oView;

                oArgs = oEvent.getParameter("arguments");
                oView = this.getView();
                tipo = oArgs.tipo;
                numero = oArgs.numero;
                var docFin = this.getOwnerComponent().getModel("comprobantes").getData().results;
                docFin = docFin.filter((doc) => doc.VbtypText === tipo && doc.Vbelv === numero);
                docFin.forEach(doc => {
                    var oViewModel = new JSONModel({
                        tipo: doc.VbtypText,
                        numero: doc.Vbelv,
                        fecha: doc.Erdat,
                        estado: "entregar parcialmente",
                        observaciones: "",
                        items: doc.CantItems
                        // descripcion: doc.descripcion,
                    });
                    this.getView().setModel(oViewModel, "datosPrincipales");

                });

                // this.getView().setModel(this.getOwnerComponent().getModel("Productos"), "productos");
                // this.getView().setModel(this.getOwnerComponent().getModel("DocumentosFinancieros"), "DocumentosFinancieros");


            },

            onSubmit: async function () {
                this.getView().byId("tablaPanel").setVisible(true);
            },
            onPress: async function (oEvent) {
                var oBindingContext = oEvent.getSource().getBindingContext("documentosFinancieros");
                var operacion = oBindingContext.getProperty("operacion");
                var comprobante = oBindingContext.getProperty("comprobante");
                var fecha = oBindingContext.getProperty("fecha");
                var vencimiento = oBindingContext.getProperty("vencimiento");
                var importe = oBindingContext.getProperty("importe");
                var moneda = oBindingContext.getProperty("moneda");
                this.getOwnerComponent().getRouter().navTo("RouteDocF", {
                    operacion: operacion,
                    comprobante: comprobante
                    // fecha: fecha,
                    // vencimiento: vencimiento,
                    // importe: importe,
                    // moneda: moneda
                });
            }
        });
    });