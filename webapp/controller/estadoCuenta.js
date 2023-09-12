sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/ui/model/json/JSONModel'
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";


        return Controller.extend("estadoCuenta.dulcor.controller.Filtros", {
            onInit: function () {
                var oModel = new JSONModel
                var oModel2 = new JSONModel
                var oModel3 = new JSONModel
                oModel.setData({
                    "saldo": "65.852.739,38",
                    "estados": [{
                            "operacion": "Nota de Credito",
                            "comprobante": "0063A00085422",
                            "fecha": "31/07/2023",
                            "vencimiento": "29/09/2023",
                            "importe": "-3.185.364,39",
                            "items": "1",
                            "descripcion":"TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"
                        },
                        {
                            "operacion": "Factura",
                            "comprobante": "0063A00085423",
                            "fecha": "31/07/2023",
                            "vencimiento": "29/09/2023",
                            "importe": "13.934.893,57",
                            "items": "1",
                            "descripcion":"TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"
                        },
                        {
                            "operacion": "Recibo Electronico",
                            "comprobante": "0063A00085424",
                            "fecha": "31/07/2023",
                            "vencimiento": "29/09/2023",
                            "importe": "24.969.387,08",
                            "items": "1",
                            "descripcion":"TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"
                        },
                        {
                            "operacion": "Nota de Credito",
                            "comprobante": "0063A00085425",
                            "fecha": "28/07/2023",
                            "vencimiento": "29/07/2023",
                            "importe": "-701.984,43",
                            "items": "1",
                            "descripcion":"TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"
                        },
                        {
                            "operacion": "Factura",
                            "comprobante": "0063A00085426",
                            "fecha": "28/07/2023",
                            "vencimiento": "29/07/2023",
                            "importe": "3.071.094.16",
                            "items": "1",
                            "descripcion":"TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"
                            
                        },
                    ]
                })
                this.getOwnerComponent().setModel(oModel, "DocumentosFinancieros")

                oModel2.setData({
                    "productos": [{
                            "producto" : "TX-1A-B-350-1120-0000DES-FSC",
                            "cantidad": "11.081",
                        }
                    ]})

                this.getOwnerComponent().setModel(oModel2, "Productos")

                oModel3.setData({
                    "comprobantes": [{
                            "tipo" : "Pedido",
                            "numero": "0000340324",
                            "fecha": "28/07/2023",
                            "vencimiento": "",
                            "entrega": "01/08/2023",
                            "items": "1",
                            "descripcion": "TX-1A-B-350-1120-0000DES-FSC",
                        },
                        {
                            "tipo" : "Remito",
                            "numero": "0032R00203911",
                            "fecha": "31/07/2023",
                            "vencimiento": "",
                            "entrega": "",
                            "items": "7",
                            "descripcion": "TX-1A-B-350-1120-0000DES-FSC",
                        }
                    ]})

                this.getOwnerComponent().setModel(oModel3, "Comprobantes")


                this.getView().setModel(this.getOwnerComponent().getModel("DocumentosFinancieros"),"documentosFinancieros");
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