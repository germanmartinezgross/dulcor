sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/ui/model/json/JSONModel',
        'sap/ui/model/odata/v2/ODataModel'
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, ODataModel) {
        "use strict";


        return Controller.extend("estadoCuenta.dulcor.controller.Filtros", {
            onInit: async function () {
                sap.ui.core.BusyIndicator.show()
                var that = this;
                var usuario = sap.ushell.Container.getService("UserInfo").getId();
                var oModelEmpresa =  [];
                
                var aData = await this.readServiceEmp();
                aData.results.forEach(element => {
                    switch (element.to_SalesOrganization.SalesOrganization) {
                        case '1100':
                            element.to_SalesOrganization.SalesOrganization_Text = 'Dulcor S.A'
                            break;
                        case '1200':
                            element.to_SalesOrganization.SalesOrganization_Text = 'Goy Widmer y CIA'
                            break;
                        case '1300':
                            element.to_SalesOrganization.SalesOrganization_Text = 'Veneziana S.A'
                            break;
                        case '1400':
                            element.to_SalesOrganization.SalesOrganization_Text = 'Vanoli y CIA. S.A'
                            break;
                        default:
                            break;
                    }
                    oModelEmpresa.push(element.to_SalesOrganization)
                });
                oModelEmpresa.sort((a, b) => a.SalesOrganization - b.SalesOrganization);
                this.getOwnerComponent().getModel("empresasCollection").setData(oModelEmpresa);

                this.getView().setModel(this.getOwnerComponent().getModel("usuariosData"));
                
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
                            "descripcion": "TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"
                        },
                        {
                            "operacion": "Factura",
                            "comprobante": "0063A00085423",
                            "fecha": "31/07/2023",
                            "vencimiento": "29/09/2023",
                            "importe": "13.934.893,57",
                            "items": "1",
                            "descripcion": "TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"
                        },
                        {
                            "operacion": "Recibo Electronico",
                            "comprobante": "0063A00085424",
                            "fecha": "31/07/2023",
                            "vencimiento": "29/09/2023",
                            "importe": "24.969.387,08",
                            "items": "1",
                            "descripcion": "TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"
                        },
                        {
                            "operacion": "Nota de Credito",
                            "comprobante": "0063A00085425",
                            "fecha": "28/07/2023",
                            "vencimiento": "29/07/2023",
                            "importe": "-701.984,43",
                            "items": "1",
                            "descripcion": "TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"
                        },
                        {
                            "operacion": "Factura",
                            "comprobante": "0063A00085426",
                            "fecha": "28/07/2023",
                            "vencimiento": "29/07/2023",
                            "importe": "3.071.094.16",
                            "items": "1",
                            "descripcion": "TX-1A-B-350-1120-0000DES-FSC",
                            "moneda": "$"

                        },
                    ]
                })
                

                oModel2.setData({
                    "productos": [{
                        "producto": "TX-1A-B-350-1120-0000DES-FSC",
                        "cantidad": "11.081",
                    }]
                })

                

                oModel3.setData({
                    "comprobantes": [{
                            "tipo": "Pedido",
                            "numero": "0000340324",
                            "fecha": "28/07/2023",
                            "vencimiento": "",
                            "entrega": "01/08/2023",
                            "items": "1",
                            "descripcion": "TX-1A-B-350-1120-0000DES-FSC",
                        },
                        {
                            "tipo": "Remito",
                            "numero": "0032R00203911",
                            "fecha": "31/07/2023",
                            "vencimiento": "",
                            "entrega": "",
                            "items": "7",
                            "descripcion": "TX-1A-B-350-1120-0000DES-FSC",
                        }
                    ]
                })

                this.getOwnerComponent().setModel(oModel, "DocumentosFinancieros")
                this.getOwnerComponent().setModel(oModel2, "Productos")
                this.getOwnerComponent().setModel(oModel3, "Comprobantes")
                this.getView().setModel(this.getOwnerComponent().getModel("DocumentosFinancieros"), "documentosFinancieros");
                this.getView().getModel().attachRequestCompleted(function(){sap.ui.core.BusyIndicator.hide()});
            },

            readServiceEmp: function () {
                try {
                    var la_filters = new Array(); 
                    var lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Customer",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: '1100003'
                    });
                    la_filters.push(lv_pickedDateFilter);

                    return new Promise((res, rej) => {
                        this.getOwnerComponent().getModel("usuariosData").read("/CustomerOrganization", {
                            filters: la_filters,
                            urlParameters: {
                                "$expand": "to_SalesOrganization"
                            },
                            success: res,
                            error: rej
                        });
                    });
                } catch (error) {
                    if (error.responseText !== undefined) {

                        var err = JSON.parse(err.responseText).error.message.value;
                        sap.m.MessageBox.error(err);
                    } else {

                        sap.m.MessageToast.show("Error al consultar oData");
                    }
                }
                if (error.responseText !== undefined) {

                    var err = JSON.parse(err.responseText).error.message.value;
                    sap.m.MessageBox.error(err);
                } else {

                    sap.m.MessageToast.show("Error al consultar oData");
                }
            },
            onSubmit: async function () {
                sap.ui.core.BusyIndicator.show()
                var aData = await this.readServiceEstadoCuenta();
                this.getView().byId("tablaPanel").setVisible(true);
                sap.ui.core.BusyIndicator.hide()
            },
            onPress: async function (oEvent) {
                var oBindingContext = oEvent.getSource().getBindingContext("DocumentosFinancieros");
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
            },
            readServiceEstadoCuenta: function () {
                try {
                    var la_filters = new Array(); 
                    var lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Customer",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: '1100003'
                    });
                    la_filters.push(lv_pickedDateFilter);

                    return new Promise((res, rej) => {
                        this.getOwnerComponent().getModel("usuariosData").read("/CustomerOrganization", {
                            filters: la_filters,
                            urlParameters: {
                                "$expand": "to_SalesOrganization"
                            },
                            success: res,
                            error: rej
                        });
                    });
                } catch (error) {
                    if (error.responseText !== undefined) {

                        var err = JSON.parse(err.responseText).error.message.value;
                        sap.m.MessageBox.error(err);
                    } else {

                        sap.m.MessageToast.show("Error al consultar oData");
                    }
                }
                if (error.responseText !== undefined) {

                    var err = JSON.parse(err.responseText).error.message.value;
                    sap.m.MessageBox.error(err);
                } else {

                    sap.m.MessageToast.show("Error al consultar oData");
                }
            },
        });
    });