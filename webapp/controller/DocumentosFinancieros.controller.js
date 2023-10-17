sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    'sap/ui/model/json/JSONModel'
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, PDFViewer, JSONModel) {
    "use strict";
    var comprobante
    var operacion
    return Controller.extend("estadoCuenta.dulcor.controller.DocumentosFinancieros", {
      onInit: function () {

        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("RouteDocF").attachMatched(this._onRouteMatched, this);

      },

      _onRouteMatched: async function (oEvent) {
        this._pdfViewer = new PDFViewer();
        var oArgs, oView, oData

        var that = this;

        oArgs = oEvent.getParameter("arguments");
        oView = this.getView();
        operacion = oArgs.operacion;
        comprobante = oArgs.comprobante;
        var docFin = this.getOwnerComponent().getModel("DocumentosFinancieros").getData().results;
        docFin = docFin.filter((doc) => doc.DocNo === comprobante && doc.DocType === operacion);
        docFin.forEach(doc => {
          var oViewModel = new JSONModel({
            comprobanteSAP: doc.DocNo,
            comprobante: doc.RefDocNo,
            operacion: doc.DocTypeText,
            fecha: doc.PstngDate,
            vencimiento: doc.BlineDate,
            importe: doc.Amount,
            moneda: doc.Currency,
            customer: doc.Customer,
            companyCode: doc.Companycode,
            fiscYear: doc.FiscYear
          });
          this.getView().setModel(oViewModel, "datosPrincipales");

          // this.getView().setModel(this.getOwnerComponent().getModel("Productos"), "productos");
          // this.getView().getModel("productos").setData(oData)
          // oData = await that._getDatosDocFin(doc.DocNo);
        });
        // this.getView().setModel(this.getOwnerComponent().getModel("Comprobantes"), "comprobantes");
        sap.ui.core.BusyIndicator.hide()

      },


      onSubmit: async function () {

        this.getView().byId("tablaPanel").setVisible(true);

      },
      onPress: async function (oEvent) {
        sap.ui.core.BusyIndicator.show()
        // var oBindingContext = oEvent.getSource().getBindingContext();
        var oBindingContext = oEvent.getSource().getBindingContext("comprobantes");
        var tipo = oBindingContext.getProperty("VbtypText");
        var vbelv = oBindingContext.getProperty("Vbelv");
        var vbeln = oBindingContext.getProperty("Vbeln");
        var oData = await this._getDatosDocFin( "149", "1200", "1100003");
        this.getOwnerComponent().setModel(new JSONModel(oData), "comps");
        oData = await this._getCompXDoc(vbelv);
        this.getOwnerComponent().setModel(new JSONModel(oData), "documentos");
        sap.ui.core.BusyIndicator.hide()

        this.getOwnerComponent().getRouter().navTo("RouteComp", {
          tipo: tipo,
          numero: vbelv
          // fecha: fecha,
          // vencimiento: vencimiento,
          // importe: importe,
          // moneda: moneda
        });
        // this.getOwnerComponent().getRouter().navTo("RouteDocF");
      },
      onPdf: async function (oEvent){
        var datos = this.getView().getModel("datosPrincipales").getData();
        var titulo = datos.operacion + ' - ' + datos.comprobante
        var ebeln = datos.comprobanteSAP;
        var vkorg = datos.companyCode;
        var fiscYear = datos.fiscYear;
            this._pdfViewer.setSource("/sap/opu/odata/sap/Z_FI0010_ESTADO_CUENTA_SRV/FacturaPDFSet(Ebeln='" + ebeln + "',CompanyCode='" + vkorg + "',FiscYear='" + fiscYear + "')/$value");
			        this._pdfViewer.setTitle(titulo);
			        this._pdfViewer.open();
      

      },
      _getDatosDocFin: function (vbeln, vkorg, kunnr) {
        try {
          var la_filters = new Array();
          var lv_pickedDateFilter = new sap.ui.model.Filter({
            path: "Vbeln",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: vbeln
          });
          la_filters.push(lv_pickedDateFilter);

          var lv_pickedDateFilter = new sap.ui.model.Filter({
            path: "Vkorg",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: vkorg
          });
          la_filters.push(lv_pickedDateFilter);

          var lv_pickedDateFilter = new sap.ui.model.Filter({
            path: "Kunnr",
            operator: sap.ui.model.FilterOperator.EQ,
            value1: kunnr
          });
          la_filters.push(lv_pickedDateFilter);

          return new Promise((res, rej) => {
            this.getOwnerComponent().getModel("estadoCuenta").read("/SDDocItemsSet", {
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
            path: "Vbelv",
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
      }
    });
  });