sap.ui.define([
        "sap/ui/core/mvc/Controller",
        'sap/ui/model/json/JSONModel',
        'sap/ui/model/odata/v2/ODataModel',
        "sap/ui/model/FilterOperator",
        "sap/ui/core/Fragment",
        "sap/m/MessageBox",
        "sap/ui/core/BusyIndicator",

    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, ODataModel, FilterOperator, Fragment, MessageBox, BusyIndicator) {
        "use strict";


        return Controller.extend("estadoCuenta.dulcor.controller.Filtros", {
            onInit: async function () {
                sap.ui.core.BusyIndicator.show()
                var that = this;
                var usuario = sap.ushell.Container.getService("UserInfo").getId();
                var oModelEmpresa = [];

                // let oData = await that._getPortalClient("graciela.jara@protechcompany.com");

                let oData = await that._getPortalClient("fabian.robins@dulcor.com.ar");

                this.getOwnerComponent().setModel(new JSONModel(oData), "PortalModel");

                let oPortal = this.getOwnerComponent().getModel("PortalModel"),
                    sName = "",
                    bEnabled = true;

                if (oData.tipoUser === "1") {
                    sName = `${oPortal.getProperty("/to_Customer/Customer")} - ${oPortal.getProperty("/to_Customer/CustomerFullName")}`
                    bEnabled = false
                }
                oPortal.setProperty("/clientName", sName)
                oPortal.setProperty("/clientEnabled", bEnabled)
                //Recupera todos los clientes
                let oClient = oData.to_CustomerSales.results
                this.getOwnerComponent().setModel(new JSONModel({
                    results: oClient
                }), "ClientModel");

                //LLAMAR CustomerOganizationType
                let oEmpresa = await this.readServiceEmp(oPortal.getProperty("/to_Customer/Customer"));

                this.getOwnerComponent().setModel(new JSONModel(oEmpresa), "EmpresaModel");

                // oEmpresa = this.getOwnerComponent().getModel("EmpresaModel").getData().results.sort((a,b) => (a.SalesOrganization > b.SalesOrganization) ? 1 : ((b.SalesOrganization > a.SalesOrganization) ? -1 : 0))

                // this.getOwnerComponent().setModel(new JSONModel(oEmpresa), "EmpresaModel");

                // this.getView().getModel().attachRequestCompleted(function () {
                sap.ui.core.BusyIndicator.hide()
                // });
            },

            _getPortalClient: function (user) {
                try {
                    var la_filters = new Array();
                    var lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Customer",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: user
                    });
                    la_filters.push(lv_pickedDateFilter);

                    return new Promise((res, rej) => {
                        this.getOwnerComponent().getModel("usuariosData").read(`/usuPortal('${user}')`, {
                            filters: la_filters,
                            urlParameters: {
                                "$expand": "to_Customer,to_CustomerOrganization,to_CustomerSales",
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



            readServiceEmp: function (Customer) {
                try {
                    var la_filters = new Array();
                    var lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Customer",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: Customer
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

            ///// Dialog Proveedor /////
            onValueHelpRequest: function () {
                let oView = this.getView();

                if (!this._DialogProveedor) {
                    this._DialogProveedor = Fragment.load({
                        id: oView.getId(),
                        name: "estadoCuenta.dulcor.fragment.DialogClient",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._DialogProveedor.then(function (oDialog) {
                    oDialog.open();
                    oDialog.getAggregation("_dialog").getSubHeader().getContentMiddle()[0].setPlaceholder("Buscar Cliente")
                }.bind(this));
            },

            onSearchClient: function (oEvent) {
                let sValue = oEvent.getParameter("value");
                let oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.Contains, sValue);
                let oFilter2 = new sap.ui.model.Filter("CustomerFullName", sap.ui.model.FilterOperator.Contains, sValue);
                let oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter(new sap.ui.model.Filter([oFilter, oFilter2]));
            },

            handleCloseProveedor: async function (oEvent) {
                BusyIndicator.show();
                try {
                    let oDataModel = this.getOwnerComponent().getModel("PortalModel");
                    if (oEvent.getParameter("selectedItem")) {
                        let oObject = oEvent.getParameter("selectedItem").getBindingContext("ClientModel").getObject(),
                            sName = `${oObject.Customer} - ${oObject.CustomerFullName}`;
                        oDataModel.setProperty("/clientName", sName);

                        let oBinding = oEvent.getSource().getBinding("items");
                        oBinding.filter("");

                        let oEmpresa = await this.readServiceEmp(oObject.Customer);
                        this.getOwnerComponent().setModel(new JSONModel(oEmpresa), "EmpresaModel");

                        // this.getOwnerComponent().getModel("ToolsModel").setProperty("/sKeyCustomer", oObject.Customer);
                    }
                    BusyIndicator.hide();
                } catch (error) {
                    BusyIndicator.hide();
                    MessageBox.information("Hubo un problema al enviar la solicitud");
                }
            },

            onSubmit: async function () {
                sap.ui.core.BusyIndicator.show(2)
                var error = this.verificarIngresos();
                if (error) {

                } else {
                    var aData = await this.readServiceEstadoCuenta();
                    this.getView().getModel("DocumentosFinancieros").setData(aData)
                    aData = await this.readServiceSaldo();
                    this.getView().getModel("Saldo").setData(aData.results[0].ActualBalance)
                    this.getView().setModel(this.getOwnerComponent().getModel("Saldo"), "Saldo");
                    this.getView().byId("tablaPanel").setVisible(true);
                    sap.ui.core.BusyIndicator.hide()
                }

            },
            onPress: async function (oEvent) {
                sap.ui.core.BusyIndicator.show(2)
                
                var oBindingContext = oEvent.getSource().getBindingContext("DocumentosFinancieros");
                var operacion = oBindingContext.getProperty("DocType");
                var comprobante = oBindingContext.getProperty("DocNo");
                var vbeln = oBindingContext.getProperty("BillDoc");
                var oData = await this._getDatosDocFin(comprobante)
                this.getOwnerComponent().setModel(new JSONModel(oData), "productos");
                oData = await this._getCompXDoc(vbeln);
                this.getOwnerComponent().setModel(new JSONModel(oData), "comprobantes");
                sap.ui.core.BusyIndicator.hide()
                this.getOwnerComponent().getRouter().navTo("RouteDocF", {
                    operacion: operacion,
                    comprobante: comprobante
                });
            },

            _getDatosDocFin: function (belnr) {
                try {
                    var la_filters = new Array();
                    var lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Belnr",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: belnr
                    });
                    la_filters.push(lv_pickedDateFilter);

                    return new Promise((res, rej) => {
                        this.getOwnerComponent().getModel("estadoCuenta").read("/BillingDocItemsSet", {
                            filters: la_filters,
                            // urlParameters: {
                            //     "$expand": "to_SalesOrganization"
                            // },
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

            _getCompXDoc: function (vbeln) {
                try {
                    var la_filters = new Array();
                    var lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Vbeln",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: vbeln
                    });
                    la_filters.push(lv_pickedDateFilter);

                    return new Promise((res, rej) => {
                        this.getOwnerComponent().getModel("estadoCuenta").read("/RelatedDocsSet", {
                            filters: la_filters,
                            // urlParameters: {
                            //     "$expand": "to_SalesOrganization"
                            // },
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

            verificarIngresos: function () {
                var customer = this.byId("clientName").getValue()
                var companyCode = this.byId("idCBoxEmpresa").getValue()
                var fecha1 = this.byId("DP1").getValue()
                var fecha2 = this.byId("DP2").getValue()
                var anio, anio2;
                if (customer === "" || companyCode === "" || fecha1 === "" || fecha2 === "") {
                    return true;
                }
                var fechas = fecha1.split("/")
                anio = "20" + fechas[2];
                var fechas2 = fecha2.split("/")
                anio2 = "20" + fechas2[2];
                if (anio2 <= anio && fechas2[0] <= fechas[0] && fechas2[1] < fechas[1]) {
                    return true
                }
                return false;

            },

            readServiceEstadoCuenta: function () {
                var customer = this.byId("clientName").getValue().split(" - ")[0]
                var companyCode = this.byId("idCBoxEmpresa").getValue().split(" - ")[0]
                var fecha1 = this.byId("DP1").getValue()
                var fecha2 = this.byId("DP2").getValue()
                try {
                    var la_filters = new Array();
                    var lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Customer",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: customer
                    });
                    la_filters.push(lv_pickedDateFilter);

                    lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Companycode",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: companyCode
                    });
                    la_filters.push(lv_pickedDateFilter);

                    // var fecha = `datetime'${anio}-${fechas[0]}-${fechas[1]}T00:00:0'`
                    lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "DateFrom",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: fecha1
                    });
                    la_filters.push(lv_pickedDateFilter);

                    // fecha = `datetime'${anio2}-${fechas2[0]}-${fechas2[1]}T00:00:0'`
                    lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "DateTo",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: fecha2
                    });
                    la_filters.push(lv_pickedDateFilter);

                    return new Promise((res, rej) => {
                        this.getOwnerComponent().getModel("estadoCuenta").read("/GetStatementSet", {
                            filters: la_filters,
                            // urlParameters: {
                            //     "$expand": "to_SalesOrganization"
                            // },
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

            readServiceSaldo: function () {
                var customer = this.byId("clientName").getValue().split(" - ")[0]
                var companyCode = this.byId("idCBoxEmpresa").getValue().split(" - ")[0]
                // var fecha1 = this.byId("DP1").getValue()
                // var fecha2 = this.byId("DP2").getValue()
                try {
                    var la_filters = new Array();
                    var lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Customer",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: customer
                    });
                    la_filters.push(lv_pickedDateFilter);

                    lv_pickedDateFilter = new sap.ui.model.Filter({
                        path: "Companycode",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: companyCode
                    });
                    la_filters.push(lv_pickedDateFilter);

                    return new Promise((res, rej) => {
                        this.getOwnerComponent().getModel("estadoCuenta").read("/GetCurrentBalanceSet", {
                            filters: la_filters,
                            // urlParameters: {
                            //     "$expand": "to_SalesOrganization"
                            // },
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