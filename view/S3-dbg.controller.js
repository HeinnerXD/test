/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseDetailController");
jQuery.sap.require("sap.ca.ui.quickoverview.EmployeeLaunch");

sap.ca.scfld.md.controller.BaseDetailController.extend("publicservices.her.mycourses.s1.view.S3", {

	onInit : function() {
		var view = this.getView();
		this.bActClick = false;
		this.sModSetting="";
		// put the Fragment content into the document
		this.oResBundle = this.oApplicationFacade.getResourceBundle();
		if (!sap.ui.Device.system.phone){

			this.byId('panEvents').destroyContent();             
			if(sap.ui.getCore().byId('lineItemListCoreq')){
				sap.ui.getCore().byId('lineItemListCoreq').destroy();
			}
			var coreqView =new sap.ui.xmlfragment('publicservices.her.mycourses.s1.template.CoreqEvent', this);
			this.byId('panEvents').addContent(coreqView);

			var detailsPage = new sap.ui.xmlfragment('publicservices.her.mycourses.s1.template.DetailsPage', this);
			this.getPage().addContent(detailsPage);
		}else{

			this.byId('panEvents').destroyContent();
			if(sap.ui.getCore().byId('lineItemListCoreq')){
				sap.ui.getCore().byId('lineItemListCoreq').destroy();
			}
			var coreqViewMobile =new sap.ui.xmlfragment('publicservices.her.mycourses.s1.template.CoreqEventMobile', this);
			this.byId('panEvents').addContent(coreqViewMobile);                                 
			var detailsPageForMobile = new sap.ui.xmlfragment('publicservices.her.mycourses.s1.template.DetailsPageMobile', this);
			this.getPage().addContent(detailsPageForMobile);

		}

		if(sap.ui.getCore().byId('sEligId')){
			sap.ui.getCore().byId('sEligId').destroy();
		}


		this.oRouter.attachRoutePatternMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "detail") {
				var oCtxt = oEvent.getParameter("arguments").contextPath;
				oCtxt = oCtxt.substr(oCtxt.indexOf('('),oCtxt.indexOf(')'));
				oCtxt = '/CourseDetailSet'+oCtxt;

				//get the first item in the list
				var oListFirstItem = this.oApplicationImplementation.oSplitContainer.getMasterPages()[0].getController().getList().getItems()[1];

				if (this.oApplicationFacade.oDtlsInitLoad && oListFirstItem.getSelected()){ // not the initial load of app from the tile - handling of exception flow                     
					view.setModel(this.oApplicationFacade.oDtlsJSONModel);
					this.byId('tabContact').setModel(this.oApplicationFacade.getODataModel());

					view.bindElement("/result");
					if (this.oApplicationFacade.oDtlsJSONModel.getData().result){ // check if result is fetched
						var sCoreqInd =  this.oApplicationFacade.oDtlsJSONModel.getProperty("/result/CoReqIndicator");
						var sEligInd =  this.oApplicationFacade.oDtlsJSONModel.getProperty("/result/EligibilityIndicator");
						this.setDetailPageConfig(sCoreqInd,sEligInd);    
						this.getActionButton(false);       
						this.oApplicationFacade.oDtlsInitLoad = false; // only the initial load of app - otherwise use odata model for details page
					}                                                              
				}else{
					// remove the existing bind Element only if the existing model is json and then we switch to odata model - exception flow  
					if (view.getModel() instanceof sap.ui.model.json.JSONModel){
						view.unbindElement();
					}

					view.setModel(this.oApplicationFacade.getODataModel());
					view.bindElement(oCtxt,{expand : "EventDetails,EligibilityDetails,CoRequistesDetails"});

					this.attachDtlsDataReceived();
				}

				var oTabContainer = this.byId('iconTabBar');
				var oInfoTab = oTabContainer.getItems()[0];                                                                                                      
				var bPageRendered = jQuery.sap.byId(oTabContainer.getId()).length > 0 ? true : false;

				if ((!oTabContainer.getExpanded() && oTabContainer.getSelectedKey() === oInfoTab.getKey() && bPageRendered) ||  (oTabContainer.getSelectedKey() != oInfoTab.getKey() && bPageRendered )){
					oTabContainer.setSelectedItem(oInfoTab);
				}
			}
		}, this);


		var that = this;
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		this.oHeaderFooterOptions =
		{ 
				oEditBtn : {
					/*sI18nBtnTxt : oBundle.getText('REGISTER'),
                           onBtnPressed : function(evt) {
                          that.triggerAction('BookCourse');
                     },*/

				},
				buttonList : [{
					/*sId : "btnwishlist",
                          sI18nBtnTxt :  oBundle.getText('ADD_WISH_LIST'),
                                         onBtnPressed : function(evt) {
                                         that.triggerAction('AddToWishList');
                     }*/}],
                       oAddBookmarkSettings : {
                                     title : "Another test",
                                     icon:"sap-icon://Fiori2/F0004"
                                     }
		};
	},

	attachDtlsDataReceived : function(){
		var view = this.getView();
		var oBindingObject = view.getObjectBinding();
		oBindingObject.attachEvent('dataReceived', function(oEvt){
			this.getActionButton(false);                       
			var sCoreqInd = oEvt.getSource().getBoundContext().getObject().CoReqIndicator;
			var sEligInd = oEvt.getSource().getBoundContext().getObject().EligibilityIndicator;
			this.setDetailPageConfig(sCoreqInd,sEligInd);
			//this.setEligText(null,sCoreqInd,sEligInd);
		},this);

	},

	setDetailPageConfig : function(sCoreqInd,sEligInd){

		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		// if the course is conditionally booked, we have to show the appropriate message in the info tab. 
		// So getting the value for conditionalBookingIndiacator
		/* var oDetailsObj=this.oApplicationImplementation.oSplitContainer.getDetailPages()[0].getController().getView().getBindingContext().getObject();
        var oCondBookingInd = oDetailsObj.ConditionalBookingIndicator;*/
//		if the course is already booked then the eligibility text should be you can book this course, so getting the status of the course



		var oViewController = this;
		var oModel = this.getView().getModel();
		var oBindContext =  this.getView().getBindingContext();              


		var aObjEvtTypes = [];
		var oCoReqInd =   oModel.getContext(oBindContext.sPath).getProperty('CoReqIndicator');
		var oEventCtxt = oModel.getContext(oBindContext.sPath).getProperty('CoRequistesDetails');
		var aCoreqEvents = [];
		var aEvtTypes = [];
		var i;

		if(oEventCtxt.length=='0'&& oCoReqInd=='X')           {
			var length =this.getView().getBindingContext().getProperty("EligibilityDetails").length;
			if (length > 0) {
				for(i=0;i<length;i++)
				{
					var oVal = this.getView().getModel().getContext("/"+ this.getView().getBindingContext().getProperty("EligibilityDetails")[i]).getObject();
					var oCoreq = this.getView().getModel().getContext("/"+ this.getView().getBindingContext().getProperty("EligibilityDetails")[i]).getObject().Sclas;
					if(oCoreq=="CR")
					{
						if (jQuery.inArray(oVal.Sobid, aEvtTypes) === -1){
							var oObj = { "CourseId" : oVal.Sobid,
									"CourseName" : oVal.RelObjStext };
							aObjEvtTypes.push(oObj);
							aEvtTypes.push(oVal.Sobid);
						}             
						aCoreqEvents.push(oVal);

					}
				}
			}
			//var oCoReqCtxt = oModel.getData().result.EligibilityDetails;
		}
		else{
			for(i=0;i<oEventCtxt.length;i++){
				var oEvent; 
				if (oModel instanceof sap.ui.model.json.JSONModel)
					oEvent = oEventCtxt[i];
				else
					oEvent = oModel.getData('/'+oEventCtxt[i]);

				if (jQuery.inArray(oEvent.CourseId, aEvtTypes) === -1){
					var oObj = { "CourseId" : oEvent.CourseId,
							"CourseName" : oEvent.CourseName };
					aObjEvtTypes.push(oObj);
					aEvtTypes.push(oEvent.CourseId);
				}             
				aCoreqEvents.push(oEvent);
			}
		}
		var oModelCoreqEvents = new sap.ui.model.json.JSONModel();

		var oTempCoReq = jQuery.extend(true, {},{"CoRequistesDetails" : aCoreqEvents});
		oModelCoreqEvents.setData(oTempCoReq);
		var oModelCoReq = new sap.ui.model.json.JSONModel();
		oModelCoReq.setData({"Events" : aObjEvtTypes});
		var oLayout = oViewController.byId('vLayoutCoreq');
		oLayout.setModel(oModelCoReq,'CourseNos');
		oLayout.setModel(oModelCoreqEvents,'CoreqEvents');   


		var oPrimEventCtxt = oModel.getContext(oBindContext.sPath).getProperty('EventDetails');
		var aPrimEvent =[];
		var j;
		for(j=0;j<oPrimEventCtxt.length;j++){
			var oPrimEvent; 
			if (oModel instanceof sap.ui.model.json.JSONModel){
				oPrimEvent = oPrimEventCtxt[j];
			}                  
			else{
				oPrimEvent = oModel.getData('/'+oPrimEventCtxt[j]);
			}        
			aPrimEvent.push(oPrimEvent);
		}
		var oModelEvents = new sap.ui.model.json.JSONModel();
		oModelEvents.setData({"EventDetails" : aPrimEvent});
		var oPrimEvLayout = sap.ui.getCore().byId('lineItemList');
		oPrimEvLayout.setModel(oModelEvents,'PrimEvents');

	},


	setEligText: function(status,sCoreqInd,sEligInd){
		var oBindCtxt = this.getView().getBindingContext();
		if(sCoreqInd == null || sEligInd == null){
			if(oBindCtxt){
				sCoreqInd = this.getView().getBindingContext().getObject().CoReqIndicator;
				sEligInd = this.getView().getBindingContext().getObject().EligibilityIndicator;
			}                             
		}
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		var oCondBookingInd ='';
		if(oBindCtxt){
			oCondBookingInd=oBindCtxt.getObject().ConditionalBookingIndicator;
		}


		/*if(sEligInd=='X'){
			this.byId('txtElig').setText(oBundle.getText('YOU_ARE_NOT_ELIG'));

		}

		else*/ if(oCondBookingInd=="X")
		{
			this.byId('txtElig').setText(oBundle.getText('CONDN_BOOKING_TXT'));
			if(sCoreqInd=='X'){
				this.byId('coreqId').setVisible(true);
				this.byId('CoreqLink').setVisible(true);
			}
			else
			{
				this.byId('coreqId').setVisible(false);
				this.byId('CoreqLink').setVisible(false);
			}

		}
		else if(status=='Booked')
		{
			this.byId('txtElig').setText(oBundle.getText('BOOKED_TXT'));
			if(sCoreqInd=='X'){
				this.byId('coreqId').setVisible(true);
				this.byId('CoreqLink').setVisible(true);
			}
			else
			{
				this.byId('coreqId').setVisible(false);
				this.byId('CoreqLink').setVisible(false);
			}

		}
		else  if(sCoreqInd=='X'){
			this.byId('coreqId').setVisible(true);
			if(sEligInd=='X'){
				this.byId('txtElig').setText(oBundle.getText('YOU_ARE_NOT_ELIG'));
			}else{
				this.byId('txtElig').setText(oBundle.getText('COREQ_TXT'));
			}
			this.byId('CoreqLink').setVisible(true);
		}else{
			if(sEligInd=='X'){
				this.byId('txtElig').setText(oBundle.getText('YOU_ARE_NOT_ELIG'));
			}else{
				this.byId('txtElig').setText(oBundle.getText('YOU_CAN_BOOK'));
			}
			this.byId('coreqId').setVisible(false);
			this.byId('CoreqLink').setVisible(false);
		}
	},

	onTabSelect:function(oEv){
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle(); 
		this.byId('contactLbl').setVisible(false);
		var oTabContainer = this.byId('iconTabBar');
		if(oEv.getParameters().selectedKey=='Contacts'){                                           
			var oInfoTab = oTabContainer.getItems()[3];      
			var oCourseId = this.getView().getBindingContext().getObject().CourseId;
			oInfoTab.bindElement("/ModuleContactDataSet('"+oCourseId+"')");    
			if(oInfoTab.getBindingContext()){
				if(oInfoTab.getBindingContext().getObject().Name == "")
				{
					this.byId('contactLbl').setText(oBundle.getText('NO_DATA'));
					this.byId('contactLbl').setVisible(true);
				}
				else{
					this.byId('contactLbl').setVisible(false);
					this.byId('contactLbl').setText(null);
				}
			}
			var oBindingObject = oInfoTab.getObjectBinding();
			oBindingObject.attachEvent('dataReceived', function(oEvt,data){
				if(oEvt.getSource().getBoundContext().getObject().Name == "")
				{
					this.byId('contactLbl').setText(oBundle.getText('NO_DATA'));
					this.byId('contactLbl').setVisible(true);
				}
				else{
					this.byId('contactLbl').setVisible(false);
					this.byId('contactLbl').setText(null);
				}
			},this);
		}
		else if(oEv.getParameters().selectedKey=='detailsTab'){                                                                              
			var oInfoTab = oTabContainer.getItems()[2];      
			oInfoTab.setBindingContext(this.getView().getBindingContext());
		}
		else if(oEv.getParameters().selectedKey=='info'){
			var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();                
			if(this.byId('txtElig').getText()==oBundle.getText('YOU_ARE_NOT_ELIG'))
			{
				this.byId('txtElig').getDomRef().style.color='rgb(204,25,25)';
			}
		}

		var otabEv = sap.ui.getCore().byId('lineItemList');
		if(oEv.getParameters().selectedKey=='Coreq'){

			if(otabEv){
				otabEv.setVisible(false);
			}
		}else{
			if(otabEv){
				otabEv.setVisible(true);
			}
		}
	},
	pressChkElig : function(oEvt){
		var oControl = oEvt.getSource();
		if (! this.oPopover){
			this.oPopover = sap.ui.xmlfragment("publicservices.her.mycourses.s1.template.Eligibility", this);
			this.oPopover.setModel(this.oApplicationImplementation.AppI18nModel,'i18n');
			this.oPopover.setModel(this.getView().getModel());                                    
		}                                                              
		this.oPopover.setBindingContext(this.getView().getBindingContext());
		this.oPopover.openBy(oControl);
	},
	fnOpenPopup : function(oEvt) {

		var oBC = oEvt.getSource().getBindingContext();
		var oIntrID =oBC.getObject().InstrObjId;
		var oControl = oEvt.getSource();
		this.InstructorPopup(oControl,oIntrID);
	},
	fnOpenPopupCoreq : function(oEvt) {
		var oIntrID='';
		if(oEvt.getSource().getBindingContext('CoreqEvents')){//check if need data from coreq 
			oIntrID = oEvt.getSource().getBindingContext('CoreqEvents').getObject().InstrObjId;
		}
		var oControl = oEvt.getSource();
		this.InstructorPopup(oControl,oIntrID);
	},
	fnOpenPopupEventContact : function(oEvt) {
		var oIntrID='';
		if(oEvt.getSource().getBindingContext('PrimEvents')){ 
			oIntrID = oEvt.getSource().getBindingContext('PrimEvents').getObject().InstrObjId;
		}
		var oControl = oEvt.getSource();
		this.InstructorPopup(oControl,oIntrID);
	},
	InstructorPopup : function(oControl,oIntrID){
		jQuery.sap.require("sap.ca.ui.quickoverview.Quickoverview");
		var sSubViewName = "publicservices.her.mycourses.s1.template.Employee";
		if(oIntrID!=undefined){
			var fnBindContextToInstructor = jQuery.proxy(function(oQVView, oSubView){
				oQVView.bindElement("/ContactDetailSet('" + oIntrID + "')");
			},this);                   
			var oQVConfig = {
					title : this.oResBundle.getText("PROFESSOR"),
					headerTitle : "{Name}",
					headerSubTitle : "{Position}\n{Department}",
					subViewName : sSubViewName,
					headerImgURL : "{PhotoURI}",
					oModel : this.oApplicationFacade.getODataModel(), 
					afterQvConfigured : fnBindContextToInstructor,
					popoverHeight : '32em',
			}; 
			var oQuickoverview = new sap.ca.ui.quickoverview.Quickoverview(oQVConfig);
			oQuickoverview.openBy(oControl);
		}    
	},

	getHeaderFooterOptions : function() {
		return this.oHeaderFooterOptions;
	},             

	getActionButton :function(bDetPag,bAppFromContext){

		var oList=this.oApplicationImplementation.oSplitContainer.getMasterPages()[0].getController().getList().getSelectedItem();
		//check if list is loaded

		var that=this;


		if(oList==null && (bDetPag || sap.ui.Device.system.phone)){


			if(bAppFromContext || this.bActClick || sap.ui.Device.system.phone){
				this.bActClick=false;
				sap.ca.ui.utils.busydialog.requireBusyDialog();
				var sCrsId='';
				var sAcadYr='';
				var sAcadSess = '';
				var sProgType='';
				var sProgStdyId='';
				if(this.getView().getBindingContext()){
					sCrsId = this.getView().getBindingContext().getObject().CourseId;
					sAcadYr = this.getView().getBindingContext().getObject().AcademicYear;
					sAcadSess = this.getView().getBindingContext().getObject().AcademicSession;
					sProgType = this.getView().getBindingContext().getObject().ProgType;
					sProgStdyId = this.getView().getBindingContext().getObject().ProgramStudyId;
				}
				var sFltStr = "CourseId eq '" +sCrsId + "'and ProgramStudyId eq '"+sProgStdyId +"'and ProgType eq '"+sProgType +
				"' and AcademicSession eq '"+sAcadSess +"' and AcademicYear eq '"+sAcadYr +"' and ListInd eq 'NAV'";

				this.getView().getModel().read('/CourseListSet',null,{"$filter" :sFltStr},true, function(oData, oRes){
					sap.ca.ui.utils.busydialog.releaseBusyDialog();  
					var oRes = oData.results[0]; 
					if(oRes!=undefined){
						that.setActionButton(oRes.ListInd,oRes.Seats,oRes.StatusCode,oRes.RegWindInd);
						that.byId('ATTR1').setText(oRes.Status);                                                                                             
						that.setEligText(oRes.Status,null,null);
						that.setChkEligText(oRes.ListInd);
						// that.getDetailSeats(oRes.Seats,oRes.Status,oRes.RegWindInd);
						that.sModSetting = oRes.ModuleSetting;
					}

				},
				function(oError){                   
					jQuery.sap.require('sap.ca.ui.message.message');
					jQuery.sap.log.error("Internal Error", "Failed to load data item");
					// release busy dialog before showing error box 
					sap.ca.ui.utils.busydialog.releaseBusyDialog();                  

				});
			}

		}else{
			if(oList && oList.getBindingContext()){

				var sVal='';
				var sSeats ='';
				var sStatusCode ='';
				var sRegWind = '';
				var sStatus = '';
				sVal= oList.getBindingContext().getProperty('ListInd');

				sSeats = oList.getBindingContext().getProperty('Seats');
				sRegWind = oList.getBindingContext().getProperty('RegWindInd');
				sStatus = oList.getBindingContext().getProperty('Status');
				//set the status in details page
				sStatusCode = oList.getBindingContext().getProperty('StatusCode');
				this.byId('ATTR1').setText(sStatus);
				that.setEligText(sStatus,null,null);
				this.setChkEligText(sVal);
				this.setActionButton(sVal,sSeats,sStatusCode,sRegWind);
				//this.getDetailSeats(sSeats,sVal,sRegWind);
				this.sModSetting = oList.getBindingContext().getProperty('ModuleSetting');

			}

		}



	},
	setChkEligText : function(oStatus) {
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		if (oStatus == "REG") {
			this.byId('eligibilityLinkId').setText(oBundle.getText('CHK_FULL_REQ'));
		} else {
			this.byId('eligibilityLinkId').setText(oBundle.getText('CHK_ELIG'));
		}

		if (this.getView().getBindingContext()) {
			var length = "";
			var oFlag = null;
			var i=null;
			if (this.getView().getBindingContext().getObject().EligibilityDetails.length >= 0) {
				length = this.getView().getBindingContext().getObject().EligibilityDetails.length;
				if (length > 0) {
					var oVal = this.getView().getBindingContext().getObject().EligibilityDetails[0].CourseObjId;                             
					for(i=0;i<length;i++)
					{

						var oCoreq = this.getView().getBindingContext().getObject().EligibilityDetails[0].CourseObjId.Sclas;
						if(oCoreq=="PR")
						{
							// this variable is to see if there are any prereq existing in eligibility detais list
							oFlag="PR";
						}
					}
					if (oVal !=null && oFlag =="PR") {
						this.byId('eligibilityHboxId').setVisible(true);
						this.byId('eligibilityLinkLblId').setVisible(true);
						this.byId('eligibilityLinkLblId2').setVisible(true);

					} else {
						this.byId('eligibilityHboxId').setVisible(false);
						this.byId('eligibilityLinkLblId').setVisible(false);
						this.byId('eligibilityLinkLblId2').setVisible(false);
					}

				} else {
					this.byId('eligibilityHboxId').setVisible(false);
					this.byId('eligibilityLinkLblId').setVisible(false);
					this.byId('eligibilityLinkLblId2').setVisible(false);
				}
			} else {
				length = this.getView().getBindingContext().getObject().EligibilityDetails.__list.length;
				if (length > 0) {
					var oVal = this.getView().getModel().getContext("/"+ this.getView().getBindingContext().getObject().EligibilityDetails.__list[0]).getObject().CourseObjId;
					for(i=0;i<length;i++)
					{

						var oCoreq = this.getView().getModel().getContext("/"+ this.getView().getBindingContext().getObject().EligibilityDetails.__list[i]).getObject().Sclas;
						if(oCoreq=="PR")
						{
							// this variable is to see if there are any prereq existing in eligibility detais list
							oFlag="PR";
						}
					}
					if (oVal !=null && oFlag=="PR") {
						this.byId('eligibilityHboxId').setVisible(true);
						this.byId('eligibilityLinkLblId').setVisible(true);
						this.byId('eligibilityLinkLblId2').setVisible(true);

					} else {
						this.byId('eligibilityHboxId').setVisible(false);
						this.byId('eligibilityLinkLblId').setVisible(false);
						this.byId('eligibilityLinkLblId2').setVisible(false);
					}

				} else {
					this.byId('eligibilityHboxId').setVisible(false);
					this.byId('eligibilityLinkLblId').setVisible(false);
					this.byId('eligibilityLinkLblId2').setVisible(false);
				}
			}

		}

	},
	openDialog : function(oEvt) {
		var sType = 'Withdraw';
		if (!this[sType]) {
			this[sType] = sap.ui.xmlfragment("publicservices.her.mycourses.s1.template."+ sType + "Dialog", this);
			this.getView().addDependent(this[sType]);
		}                              
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this[sType]);

		this[sType].open();
	},
	onDialogCloseButton : function(oEvent) {
		var sType = oEvent.getSource().data("dialogType");
		if (oEvent.getSource().data("Key") == "btn_ok") {
			var sReasonCode = sap.ui.getCore().byId('select').getSelectedItem().getBindingContext().getObject().CancelReasonCode;                                               
			this.triggerAction('CancelBooking', sReasonCode);
		}
		this[sType].close();
	},
	getDetailSeats : function(sVal,sStatus,sRegWind){
		if ((sVal != null && sVal)) {
			var oObjStat = this.byId('objstat');
			var sSeats = sap.ca.scfld.md.app.Application.getImpl()
			.getResourceBundle().getText('SEATS');

			if(sStatus=='REG' || sRegWind ){
				oObjStat.setText('');
				return;
			}
			if (sStatus == "WAIT") {
				var sWaitText = sap.ca.scfld.md.app.Application.getImpl()
				.getResourceBundle().getText('WAIT_LIST_SEATS');
				if(this.getView().getBindingContext()){
					var oVal = this.getView().getBindingContext().getObject().WaitlistNumber;
					if ((oVal != null && oVal)) {
						if (oVal == '0') {
							oObjStat.setState('Error');
							oObjStat.setText(sap.ca.scfld.md.app.Application.getImpl()
									.getResourceBundle().getText('NO_PLACES'));
						} else {
							oObjStat.setState('Error');
							oObjStat.setText(sWaitText + oVal);
						}

					}
				}

			} else {
				if (sVal == '0') {
					oObjStat.setState('Error');
					oObjStat.setText(sap.ca.scfld.md.app.Application.getImpl()
							.getResourceBundle().getText('NO_PLACES'));
				} else {
					oObjStat.setState('Success');
					oObjStat.setText(sVal + " " + sSeats);
				}
			}
		}
	},
	setActionButton : function(sVal,sSeats,sStatus,sRegWind){
		var that=this;
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();                                
		var oCreqInd='';
		if(this.getView().getBindingContext()){
			oCreqInd = this.getView().getBindingContext().getObject().CoReqIndicator;                                      
		}
		if(sRegWind){
			if(sVal == 'ALL'){//after registration period closes
				this.oHeaderFooterOptions.buttonList =  [{
					sId : "btnwishlist",
					bDisabled : false,
					sI18nBtnTxt :  oBundle.getText('ADD_WISH_LIST'),
					onBtnPressed : function(evt) {
						that.triggerAction('AddToWishList');
					}
				}];
				this.oHeaderFooterOptions.oEditBtn=undefined;
			}else if(sVal == 'WISH'){//after registration period closes
				this.oHeaderFooterOptions.buttonList = [{
					sId : "btnRemoveWishList",
					bDisabled : false,
					sI18nBtnTxt :  oBundle.getText('REMOVE_WISH_LIST'),
					onBtnPressed : function(evt) {
						that.triggerAction('RemoveFromWishList');
					}}];
				this.oHeaderFooterOptions.oEditBtn=undefined;
			}else{
				this.oHeaderFooterOptions.buttonList = [];
				this.oHeaderFooterOptions.oEditBtn=undefined;
			}
		}else{
			if(sVal == 'REG' && (sStatus==='01')){// For registered and Waitlisted courses
				this.oHeaderFooterOptions.buttonList = [{
					sId : "btnWithDraw",
					bDisabled : false,
					sI18nBtnTxt :  oBundle.getText('WITHDRAW'),
					onBtnPressed : function(evt) {
						//that.triggerAction('CancelBooking');
						that.openDialog(evt);
					}}];
				this.oHeaderFooterOptions.oEditBtn={
						bDisabled : true,
						sI18nBtnTxt : oBundle.getText('SAVE_CHANGES'),                                           
						onBtnPressed : function(evt) {
							that.triggerAction('SaveChanges');                                                                                                          
						}
				};
			}else if(sVal == 'REG' && (sStatus==='03' || sStatus==='02')){
				this.oHeaderFooterOptions.buttonList = [];
				this.oHeaderFooterOptions.oEditBtn=undefined;
			}else if(sVal == 'ALL' && sSeats >0){// not registered courses and seats available
				var sBtnText='';
				if( oCreqInd == 'X'){
					sBtnText = oBundle.getText('REG_COREQ');
				}else{
					sBtnText = oBundle.getText('REGISTER');
				}
				this.oHeaderFooterOptions.buttonList = [{
					sId : "btnAddWishList",
					bDisabled : false,
					sI18nBtnTxt :  oBundle.getText('ADD_WISH_LIST'),
					onBtnPressed : function(evt) {
						that.triggerAction('AddToWishList');

					}}];
				this.oHeaderFooterOptions.oEditBtn={
						sI18nBtnTxt : sBtnText,
						bDisabled : true,
						onBtnPressed : function() {
							that.triggerAction('BookCourse');
						}
				};


			}else if(sVal == 'ALL' && sSeats ==0){//add to WaitList(Not registered and no seats)
				this.oHeaderFooterOptions.buttonList =  [{
					sId : "btnwishlist",
					bDisabled : false,
					sI18nBtnTxt :  oBundle.getText('ADD_WISH_LIST'),
					onBtnPressed : function(evt) {
						that.triggerAction('AddToWishList');

					} 
				}];
				this.oHeaderFooterOptions.oEditBtn={
						sI18nBtnTxt : oBundle.getText('ADD_WAITING_LIST'),
						bDisabled : true,
						onBtnPressed : function(evt) {
							that.triggerAction('AddToWaitList');
						}
				};


			}else if(sVal==='WISH' && sSeats >0){//wishlist with available seats
				var sBtnText='';
				if( oCreqInd === 'X'){
					sBtnText = oBundle.getText('REG_COREQ');
				}else{
					sBtnText = oBundle.getText('REGISTER');
				}
				this.oHeaderFooterOptions.buttonList = [{
					sId : "btnRemoveWishList",
					bDisabled : false,
					sI18nBtnTxt :  oBundle.getText('REMOVE_WISH_LIST'),
					onBtnPressed : function(evt) {
						that.triggerAction('RemoveFromWishList');


					}}];
				this.oHeaderFooterOptions.oEditBtn={
						sI18nBtnTxt : sBtnText,
						bDisabled : true,
						onBtnPressed : function(evt) {
							that.triggerAction('BookCourse');
						}
				};

			}else if(sVal=='WISH' && sSeats == 0 ){//wishlist with waitlisted seats

				this.oHeaderFooterOptions.buttonList = [{
					sId : "btnRemoveWishList",
					bDisabled : false,
					sI18nBtnTxt :  oBundle.getText('REMOVE_WISH_LIST'),
					onBtnPressed : function(evt) {
						that.triggerAction('RemoveFromWishList');


					}}];
				this.oHeaderFooterOptions.oEditBtn={
						sI18nBtnTxt : oBundle.getText('ADD_WAITING_LIST'),
						bDisabled : true,
						onBtnPressed : function(evt) {
							that.triggerAction('AddToWaitList');
						}
				};

			}else if(sVal=='WAIT'){//wait list courses( Withdraw and save changes)
				this.oHeaderFooterOptions.buttonList = [{
					sI18nBtnTxt : oBundle.getText('WITHDRAW'),
					bDisabled : false,
					onBtnPressed : function(evt) {
						//that.triggerAction('CancelBooking');
						that.openDialog(evt);
					}}];
				this.oHeaderFooterOptions.oEditBtn={
						sId : "btnSaveChanges",
						bDisabled : true,
						sI18nBtnTxt :  oBundle.getText('SAVE_CHANGES'),                                                                                          
						onBtnPressed : function(evt) {
							that.triggerAction('SaveChanges');
						}
				};
			}else{
				this.oHeaderFooterOptions.buttonList = [];
				this.oHeaderFooterOptions.oEditBtn=undefined;
			}
		}
		//reset header footer option with above changes
		this.setHeaderFooterOptions(this.oHeaderFooterOptions);

		var oTab = sap.ui.getCore().byId('lineItemList');
		oTab.attachUpdateFinished(function(a,b,c){
			this.setEnableFooterButton(sVal);
		},this);

		//to set the footer buttons in case of only list loading and not updating the table
		this.setEnableFooterButton(sVal);

	},
	setEnableFooterButton : function(sVal){
		var oTab = sap.ui.getCore().byId('lineItemList');
		if(this.oHeaderFooterOptions.oEditBtn){
			if(this.getView().getBindingContext()){
				if(this.getView().getBindingContext().getObject().EligibilityIndicator==='X'){
					this.oHeaderFooterOptions.oEditBtn.bDisabled= true;
				}
			}
			else if(sVal == 'REG' || sVal == 'WAIT'){                  
				this.oHeaderFooterOptions.oEditBtn.bDisabled= true;                                                                  
			}
			else if(oTab.getItems() && oTab.getItems().length<1){                                 
				this.oHeaderFooterOptions.oEditBtn.bDisabled= false;                                                 
			}else{
				this.oHeaderFooterOptions.oEditBtn.bDisabled= true;
			}
		}
		this.setHeaderFooterOptions(this.oHeaderFooterOptions);
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();                
		if(this.byId('txtElig').getText()==oBundle.getText('YOU_ARE_NOT_ELIG'))
		{
			this.byId('txtElig').getDomRef().style.color='rgb(204,25,25)';
		}
	},
	getEventTables : function(sActName,sReasonCode){
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		var aTables = [];
		var aTabAll=[];
		var aPrimTable=[];
		var aCoreqTables=[];
		var oTab = sap.ui.getCore().byId('lineItemList');
		aTabAll.push(oTab);
		if(oTab.getItems().length>0){
			aTables.push(oTab);
			aPrimTable.push(oTab);
		}
		//get data for coreq, if present
		var oCreqInd = '';
		if(this.getView().getBindingContext()){
			oCreqInd = this.getView().getBindingContext().getObject().CoReqIndicator;                                      
		}

		var oCoreqLayout = this.byId('vLayoutCoreq').getContent();
		//get coreq tables
		for(var i=0;i<oCoreqLayout.length;i++){

			var oCoreqLayoutTab = oCoreqLayout[i].getContent()[0];
			aTabAll.push(oCoreqLayoutTab);
			if(oCoreqLayoutTab.getItems().length>0){
				aTables.push(oCoreqLayoutTab);
				aCoreqTables.push(oCoreqLayoutTab);
			}
		}

		if(aTables.length>0){//check if the events is present

			//var Coreqflag=false;


			if(aCoreqTables.length > 0){//check if coreq is available

				var sChkcount=0;

				for(var i=0;i<aCoreqTables.length;i++){

					for(var j=1; j<aCoreqTables[i].getItems().length; j++){
						var oTabItem = aCoreqTables[i].getItems()[j];
						if(oTabItem.getTitle==undefined){
							var oRadbtn = oTabItem.getCells()[0];
							if(oRadbtn.getSelected()){
								//this.oCoreqBtn = true;
								//Coreqflag = true;
								sChkcount++;
								break;
							}
						}
					}

				}              


				if(aCoreqTables.length !== sChkcount && aCoreqTables.length > 0){// throw selection validation as coreq events are not selected
					this.getMsgToast(oBundle.getText('COREQ_EVENT_VALIDATE'));
					var aTabBar = this.byId('iconTabBar');
					aTabBar.setSelectedKey("Coreq");
					aTabBar.fireSelect({
						"selectedKey" : "Coreq"
					});
					return;
				}

			}else if(oCreqInd=='X' && aCoreqTables.length>0){//have to check this ?
				this.getMsgToast(oBundle.getText('COREQ_EVENT_VALIDATE'));
				var aiconTab = this.byId('iconTabBar');
				aiconTab.setSelectedKey("Coreq");
				aiconTab.fireSelect({
					"selectedKey" : "Coreq"
				});
				return;
			}


			if(aPrimTable.length > 0){
				//check for primary course events selection
				var flag=false;

				for(var i=1;i<aPrimTable[0].getItems().length;i++){
					var oTabItem = aPrimTable[0].getItems()[i];
					if(oTabItem.getTitle==undefined){
						var oRadbtn = oTabItem.getCells()[0];
						if(oRadbtn.getSelected()){
							flag = true;
							break;
						}
					}
				}              

				if(flag == false && aPrimTable[0].getItems().length > 0){
					this.getMsgToast(oBundle.getText('EVENT_VALIDATE'));
					var atab = this.byId('iconTabBar');
					atab.setSelectedKey("info");
					atab.fireSelect({
						"selectedKey" : "info"
					});
					return;
				}
			}


		}

		var oData =  this.getActionEvents(aTabAll,sActName,sReasonCode);

		return oData;


	},
	getMsgToast : function(sMsg){
		sap.m.MessageToast.show(sMsg, {
			duration: 5000,                  // default
			width: "30em",                   // default
			my: "center center",             // default
			at: "center center",           // default
			of: window,                      // default
			offset: "0 0",                   // default
			collision: "fit fit"           ,  // default
			onClose: null,                   // default
			autoClose: true,                 // default
			animationTimingFunction: "ease", // default
			animationDuration: 1000,         // default
			closeOnBrowserNavigation: true   // default
		});
	},
	getActionEvents :function(oTables,sActName,sReasonCode){

		//var oList=this.oApplicationImplementation.oSplitContainer.getMasterPages()[0].getController().getList().getSelectedItem();
		var sPeriodId = '';
		var Periodyear = '';
		var ProgramId = '';
		var ProgramType = '';
		var sModId = '';
		var sEvtId='';
		var sEvtPackId = '';
		var sEvtRegInd= '';
		var bCancelEvents= false;

		var oBindCtxt = this.getView().getBindingContext();
		if(oBindCtxt){
			sPeriodId = oBindCtxt.getProperty('AcademicSession');
			Periodyear = oBindCtxt.getProperty('AcademicYear');
			ProgramId =oBindCtxt.getProperty('ProgramStudyId');
			ProgramType =oBindCtxt.getProperty('ProgType');
			sModId =oBindCtxt.getProperty('CourseId');

			if(this.sModSetting==="SC"){
				ProgramType="";
			}else if(this.sModSetting==="PT"){
				ProgramId="";
			}
		}



		var oData=null;
		if(oTables.length>0){
			for(var j=0;j<oTables.length;j++){
				var oTab = oTables[j];
				if(oTab.getItems().length===0){
					if(oTab.getBindingContext('CourseNos')){
						sModId=oTab.getBindingContext('CourseNos').getObject().CourseId;
					}
					if(oData==null){

						oData = {                                                                              
								ModuleObjId : sModId,
								EventObjId : '',
								ActionName : sActName,
								Periodid : sPeriodId,
								Periodyear : Periodyear,
								ProgramId :ProgramId,
								ProgramType :ProgramType,                                                                                      
								ModuleCoreqItems: [],
								EventPckId : '',
								CancelReasonCode : sReasonCode,
								CancelEvent : bCancelEvents
						};
					}else{
						oData.ModuleCoreqItems.push({
							EventObjId : '',
							ModuleObjId : sModId,
							EventPckId : '',
							CancelEvent : bCancelEvents
						});
					}
				}else{
					for(var i=1;i<oTab.getItems().length;i++){
						bCancelEvents = false;
						var oTabItem = oTab.getItems()[i];
						if(oTabItem.getTitle===undefined){
							var oRadbtn = oTabItem.getCells()[0];   
							if(oRadbtn.getSelected() || sActName==='CancelBooking' || sActName==='SaveChanges'){//if not withdraw pick events selected

								if(oRadbtn.getBindingContext('CoreqEvents')==undefined){
									sEvtId = oRadbtn.getBindingContext('PrimEvents').getObject().EventObjectId;
									sModId = oRadbtn.getBindingContext('PrimEvents').getObject().CourseId;                             
									sEvtPackId = oRadbtn.getBindingContext('PrimEvents').getObject().EventsPackageId;
									sEvtRegInd = oRadbtn.getBindingContext('PrimEvents').getObject().RegisterIndicator;

								}else{
									sEvtId = oRadbtn.getBindingContext('CoreqEvents').getObject().EventObjectId;
									sModId = oRadbtn.getBindingContext('CoreqEvents').getObject().CourseId; 
									sEvtPackId = oRadbtn.getBindingContext('CoreqEvents').getObject().EventsPackageId;
									sEvtRegInd = oRadbtn.getBindingContext('CoreqEvents').getObject().RegisterIndicator;
								}

								var bAddEvent = true;
								//check if it is cancel and send only registered events.
								if(sActName==='CancelBooking' && sEvtRegInd===true) {
									bCancelEvents = true;
								}else if(sActName==='CancelBooking' && sEvtRegInd===false){
									bAddEvent=false;
								}

								if(sActName==='SaveChanges'){                                                                                                                                                                                                                                                                                              
									if(sEvtRegInd===true && oRadbtn.getSelected()){
										bCancelEvents = false;
										if(oData===null){
											oData = {                                                                                                                                                              
													ModuleObjId : sModId,
													EventObjId : sEvtId,
													ActionName : sActName,
													Periodid : sPeriodId,
													Periodyear : Periodyear,
													ProgramId :ProgramId,
													ProgramType :ProgramType,                                                                                  
													ModuleCoreqItems: [],
													EventPckId : sEvtPackId,
													CancelReasonCode : sReasonCode,
													CancelEvent : bCancelEvents

											};
										}else{
											oData.ModuleCoreqItems.push({
												EventObjId : sEvtId,
												ModuleObjId : sModId,
												EventPckId : sEvtPackId,
												CancelEvent : bCancelEvents
											});
										}
									}
									/*if(sEvtRegInd===true && !(oRadbtn.getSelected())){
                                            bCancelEvents = true;                                                                                                                  
                                       }else if(sEvtRegInd===false && !(oRadbtn.getSelected())){
                                            bAddEvent=false;                                                                                                                      
                                    }*/
									if(sEvtRegInd===true){
										bCancelEvents = true;
									}else if(sEvtRegInd===false && !(oRadbtn.getSelected())){
										bAddEvent=false;
									}
								}
								if(bAddEvent){
									if(oData===null){

										oData = {                                                                                                                                                              
												ModuleObjId : sModId,
												EventObjId : sEvtId,
												ActionName : sActName,
												Periodid : sPeriodId,
												Periodyear : Periodyear,
												ProgramId :ProgramId,
												ProgramType :ProgramType,                                                                                  
												ModuleCoreqItems: [],
												EventPckId : sEvtPackId,
												CancelReasonCode : sReasonCode,
												CancelEvent : bCancelEvents

										};
									}else{
										oData.ModuleCoreqItems.push({
											EventObjId : sEvtId,
											ModuleObjId : sModId,
											EventPckId : sEvtPackId,
											CancelEvent : bCancelEvents
										});
									}
								}

							}

						}
					}              
				}

			}
		}
		return oData;
	},
	triggerAction :function(sActName,sReasonCode){
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();

		// handling to not allow the studen to book a course, if not eligible.
		if((sActName==="BookCourse" || sActName==="SaveChanges" || sActName==="AddToWaitList") && this.getView().getBindingContext().getObject().EligibilityIndicator === "X"){
			this.getMsgToast(oBundle.getText("YOU_ARE_NOT_ELIG"));    
			return;
		}

		//sap.ca.ui.utils.BUSYDIALOG_TIMEOUT = 0;
		sap.ca.ui.utils.busydialog.requireBusyDialog();

		var oData= '';                                      

		if(sActName == "AddToWishList" || sActName == "RemoveFromWishList" )
		{

			var sPeriodId = '';
			var Periodyear = '';
			var ProgramId = '';
			var ProgramType = '';
			var oModId = '';


			var oBindCtxt = this.getView().getBindingContext();
			if(oBindCtxt){
				sPeriodId = oBindCtxt.getProperty('AcademicSession');
				Periodyear = oBindCtxt.getProperty('AcademicYear');
				ProgramId =oBindCtxt.getProperty('ProgramStudyId');
				ProgramType =oBindCtxt.getProperty('ProgType');
				oModId =oBindCtxt.getProperty('CourseId');
				if(this.sModSetting==="SC"){
					ProgramType="";
				}else if(this.sModSetting==="PT"){
					ProgramId="";
				}
			}

			oData = {
					ModuleObjId : oModId,
					ActionName : sActName,
					Periodid : sPeriodId,
					Periodyear : Periodyear,
					ProgramId :ProgramId,
					ProgramType :ProgramType,
					CancelReasonCode : sReasonCode

			};

		}
		else{
			oData = this.getEventTables(sActName,sReasonCode);
		}


		var model = this.oApplicationFacade.getODataModel();
		if(oData){
			if(oData.ModuleCoreqItems){
				if(oData.ModuleCoreqItems.length==0 && (sActName != "SaveChanges" && sActName != "CancelBooking")){
					delete oData.ModuleCoreqItems;
				}}
			var fnSuccess = jQuery.proxy(function(response){

				//var oListMaster=this.oApplicationImplementation.oSplitContainer.getMasterPages()[0].getController().getList().getSelectedItem();

				var sAcdSe = this.getView().getBindingContext().getProperty('Acad_Sess');
				var sAcdYrT = this.getView().getBindingContext().getProperty('Acad_Year');

				var sAcdYearNSess = sAcdYrT+" "+sAcdSe;
				var sCrseName = this.getView().getBindingContext().getProperty('CourseName');
				var sMsg='';   
				if (response.ErrorMessage!==""){//if error just return the message
					sMsg = response.ErrorMessage;
					//sap.ca.ui.utils.BUSYDIALOG_TIMEOUT = 1500;
					sap.ca.ui.utils.busydialog.releaseBusyDialog();

					this.getMsgToast(sMsg);              
					return;
				}else if(response.ActionName=='BookCourse'){
					sMsg = oBundle.getText('REG_SUCCESS',[sAcdYearNSess]);
				}else if(response.ActionName=='CancelBooking'){
					sMsg = oBundle.getText('CANCEL_SUCCESS',[sAcdYearNSess]);
				}else if(response.ActionName=='AddToWishList'){
					sMsg = oBundle.getText('WISH_SUCCESS',[sCrseName]);
				}else if(response.ActionName=='RemoveFromWishList'){
					sMsg = oBundle.getText('REMOVE_WISH_SUCCESS',[sCrseName]);
				}else if(response.ActionName=='AddToWaitList'){
					sMsg = oBundle.getText('WAIT_SUCCESS',[sCrseName]);
				}else if(response.ActionName=='SaveChanges'){
					sMsg = oBundle.getText('SAVE_SUCCESS');
				};

				var oMasterList = this.oApplicationImplementation.oSplitContainer.getMasterPages()[0].getController().getList();
				// prevent list binding in case of register action 
				if (response.ActionName !== 'BookCourse'){
					this.oApplicationImplementation.oSplitContainer.getMasterPages()[0].getController().onListerFiltering();
				}else{
					// set the attributes based on the response from backend for the action - exception for register
					var sSelItemPath='';
					//var oMasterList = this.oApplicationImplementation.oSplitContainer.getMasterPages()[0].getController().getList();
					if(oMasterList.getSelectedItem()){
						sSelItemPath = oMasterList.getSelectedItem().getBindingContext().getPath().substr(1);
					}else{
						var URLParsing = sap.ushell.Container.getService("URLParsing");
						var URLHash = URLParsing.getHash(location.href);
						var sDtlsPath = URLHash.substr(URLHash.indexOf('('),URLHash.indexOf(')'));
						sSelItemPath = 'CourseListSet'+sDtlsPath;
					}


					model.oData[sSelItemPath].ListInd = response.ListInd;
					model.oData[sSelItemPath].Seats = " "; 
					model.oData[sSelItemPath].RegWindInd = response.RegWindStatus;
					model.oData[sSelItemPath].StatusCode = response.Status;
					model.oData[sSelItemPath].Status = response.Smstatust;
					//this.getDetailSeats(" ", response.ListInd, response.RegWindStatus);

					// loop thru the co req items in the list and change their statuses accordingly
					var arrCoReqMod = response.ModuleCoreqItems.results; 
					if(arrCoReqMod != undefined){
						for (var i = 0; arrCoReqMod && i < arrCoReqMod.length; i++){
							sSelItemPath = "CourseListSet(CourseId='" +arrCoReqMod[i].ModuleObjId+ "',ProgramStudyId='" + 
							response.ProgramId + "',ProgType='"+response.ProgramType+"',AcademicYear='"+response.Periodyear+"',AcademicSession='"+response.Periodid+"')";
							if (model.oData[sSelItemPath]==undefined){
								sSelItemPath = "CourseListSet(CourseId='" +arrCoReqMod[i].ModuleObjId+ "',ProgramStudyId='" + 
								response.ProgramId + "',ProgType='"+response.ProgramType+"',AcademicSession='"+response.Periodid+"',AcademicYear='"+response.Periodyear+"')";
							}
							if (model.oData[sSelItemPath]){
								model.oData[sSelItemPath].ListInd = arrCoReqMod[i].ListInd;
								model.oData[sSelItemPath].Seats = " "; 
								model.oData[sSelItemPath].RegWindInd = arrCoReqMod[i].RegWindStatus;
								model.oData[sSelItemPath].StatusCode = arrCoReqMod[i].Status;
								model.oData[sSelItemPath].Status = arrCoReqMod[i].Smstatust;
							}
						}
					}
					this.setActionButton(response.ListInd,'',response.Status,response.RegWindStatus);
					this.byId('ATTR1').setText(response.Smstatust);
					var oPrevItem =null;

					//remove the registered course
					oMasterList.removeItem(oMasterList.getSelectedItem());
					//to remove the group header in case there is only group header after removing the course
					oMasterList.getItems().forEach(function(i){
						if(oPrevItem===null){
							oPrevItem = i;
						}
						if(i.getId()!==oPrevItem.getId() && i instanceof sap.m.GroupHeaderListItem && oPrevItem instanceof sap.m.GroupHeaderListItem){                                                                                                   
							oPrevItem.destroy();
						}
						oPrevItem = i;
					});
				}

				if (this.getView().getModel() instanceof sap.ui.model.json.JSONModel){
					// bind the detail to odata model
					var view = this.getView();
					var sDtlsPath = URLHash.substr(URLHash.indexOf('('),URLHash.indexOf(')'));
					sDtlsPath = '/CourseDetailSet'+sDtlsPath;

					view.unbindElement();
					view.setModel(this.oApplicationFacade.getODataModel());
					view.bindElement(sDtlsPath,{expand : "EventDetails,EligibilityDetails,CoRequistesDetails"});

					this.attachDtlsDataReceived();

				}
				//this.setActionButton(response.ListInd, '', response.Smstatust, true);

				//sap.ca.ui.utils.BUSYDIALOG_TIMEOUT = 1500;
				sap.ca.ui.utils.busydialog.releaseBusyDialog();

				this.getMsgToast(sMsg);              


			},this);

			var fnError = jQuery.proxy(function(response){
				//sap.ca.ui.utils.BUSYDIALOG_TIMEOUT = 1500;
				sap.ca.ui.utils.busydialog.releaseBusyDialog();
				this.getMsgToast(oBundle.getText('ERROR_MSG'));

			},this);

			this.bActClick = true;
			model.create("/ActionHdrSet",oData,{success: fnSuccess, error: fnError, async : true});

		}else{
			//sap.ca.ui.utils.BUSYDIALOG_TIMEOUT = 1500;
			sap.ca.ui.utils.busydialog.releaseBusyDialog();
		}

	},
	onRadioBtnClick : function(event){ 
		if(this.oHeaderFooterOptions.oEditBtn){
			this.oHeaderFooterOptions.oEditBtn.bDisabled= false;
			if(this.oHeaderFooterOptions.buttonList.length>0){
				this.oHeaderFooterOptions.buttonList[0].bDisabled= false;
			}                                              
			this.setHeaderFooterOptions(this.oHeaderFooterOptions);                        
		}

		if(event.getParameters().selected){                       
			var sNotEligInd = "";
			if(this.getView().getBindingContext()){
				sNotEligInd = this.getView().getBindingContext().getObject().EligibilityIndicator;
			}

			var sEvtPackageId = event.getSource().getBindingContext('PrimEvents').getObject().EventsPackageId;
			if(sEvtPackageId=="00000000" || sEvtPackageId=="" || (sEvtPackageId || null) == null){
//				return;
			}else{
				var oTab = sap.ui.getCore().byId('lineItemList');
				var sSelGrpName = event.getSource().getGroupName();
				for(var i=1;i<oTab.getItems().length;i++){                                            
					var oTabItem = oTab.getItems()[i];
					//check for group title
					if(oTabItem.getTitle==undefined){
						var oRadbtn = oTabItem.getCells()[0];
						if((oRadbtn.getBindingContext('PrimEvents').getObject().EventsPackageId==sEvtPackageId) && (sSelGrpName!=oRadbtn.getGroupName())){                                                   
							oRadbtn.setSelected(true);        
						}else if((oRadbtn.getBindingContext('PrimEvents').getObject().EventsPackageId!=sEvtPackageId) && (sSelGrpName!=oRadbtn.getGroupName())){
							oRadbtn.setSelected(false);
						}
					}
				}
			}
			if(sNotEligInd === "X"){
				this.oHeaderFooterOptions.oEditBtn.bDisabled= true;
				this.setHeaderFooterOptions(this.oHeaderFooterOptions);        
			}
			else if(event.getSource().getBindingContext('PrimEvents').getObject().RegisterIndicator === false){
				this.oHeaderFooterOptions.oEditBtn.bDisabled= false;
				this.setHeaderFooterOptions(this.oHeaderFooterOptions);        
			}else{
				var oTab = sap.ui.getCore().byId('lineItemList');
				for(var i=1;i<oTab.getItems().length;i++){                                                            
					var oTabItem = oTab.getItems()[i];
					//check for group title
					if(oTabItem.getTitle==undefined){
						var oRadbtn = oTabItem.getCells()[0];
						if((oRadbtn.getBindingContext('PrimEvents').getObject().CategoryText !== event.getSource().getBindingContext('PrimEvents').getObject().CategoryText)){
							if((oRadbtn.getBindingContext('PrimEvents').getObject().RegisterIndicator==false) &&
									oRadbtn.getSelected()){                                                              
								this.oHeaderFooterOptions.oEditBtn.bDisabled= false;
								this.setHeaderFooterOptions(this.oHeaderFooterOptions);                
								break;
							}
						}
						else if(oRadbtn.getBindingContext('PrimEvents').getObject().RegisterIndicator==true){
							this.oHeaderFooterOptions.oEditBtn.bDisabled= true;
							this.setHeaderFooterOptions(this.oHeaderFooterOptions);                
						}
					}
				}
			}
		}
	},
	onRadioBtnClickCoreq : function(event){
		if(this.oHeaderFooterOptions.oEditBtn){
			this.oHeaderFooterOptions.oEditBtn.bDisabled= false;
			if(this.oHeaderFooterOptions.buttonList.length>0){
				this.oHeaderFooterOptions.buttonList[0].bDisabled= false;
			}                                              
			this.setHeaderFooterOptions(this.oHeaderFooterOptions);                        
		}

		if(event.getParameters().selected){
			var sNotEligInd = "";
			if(this.getView().getBindingContext()){
				sNotEligInd = this.getView().getBindingContext().getObject().EligibilityIndicator;
			}

			//get table selected
			var oRadBtnCustomData=event.getSource().getCustomData()[0].getValue();
			var oLayout = this.byId('vLayoutCoreq').getContent();
			var oTab='';
			for(var i=0;i<oLayout.length;i++){
				if(oLayout[i].getCustomData()[0].getValue() == oRadBtnCustomData){
					oTab = oLayout[i].getContent()[0];
					break;
				}
			}
			//end of get table selected
			var sEvtPackageId = event.getSource().getBindingContext('CoreqEvents').getObject().EventsPackageId;
			if(sEvtPackageId=="00000000" || sEvtPackageId=="" || (sEvtPackageId || null) == null){
				return;
			}

			var sSelGrpName = event.getSource().getGroupName();
			for(var i=1;i<oTab.getItems().length;i++){                                            
				var oTabItem = oTab.getItems()[i];
				//check for group title
				if(oTabItem.getTitle==undefined){
					var oRadbtn = oTabItem.getCells()[0];
					if((oRadbtn.getBindingContext('CoreqEvents').getObject().EventsPackageId==sEvtPackageId) && (sSelGrpName!=oRadbtn.getGroupName())){                                                   
						oRadbtn.setSelected(true);        
					}else if((oRadbtn.getBindingContext('CoreqEvents').getObject().EventsPackageId!=sEvtPackageId) && (sSelGrpName!=oRadbtn.getGroupName())){
						oRadbtn.setSelected(false);
					}
				}
			}

			if(sNotEligInd === "X"){
				this.oHeaderFooterOptions.oEditBtn.bDisabled= true;
				this.setHeaderFooterOptions(this.oHeaderFooterOptions);        
			}
			else if(event.getSource().getBindingContext('CoreqEvents').getObject().RegisterIndicator === false && sNotEligInd !== "X"){
				this.oHeaderFooterOptions.oEditBtn.bDisabled= false;
				this.setHeaderFooterOptions(this.oHeaderFooterOptions);        
			}else{
				for(var i=1;i<oTab.getItems().length;i++){                                                            
					var oTabItem = oTab.getItems()[i];
					//check for group title
					if(oTabItem.getTitle==undefined){
						var oRadbtn = oTabItem.getCells()[0];
						if((oRadbtn.getBindingContext('CoreqEvents').getObject().CategoryText !== event.getSource().getBindingContext('CoreqEvents').getObject().CategoryText)){
							if((oRadbtn.getBindingContext('CoreqEvents').getObject().RegisterIndicator==false) &&
									oRadbtn.getSelected()){                                                              
								this.oHeaderFooterOptions.oEditBtn.bDisabled= false;
								this.setHeaderFooterOptions(this.oHeaderFooterOptions);                
								break;
							}
						}else if(oRadbtn.getBindingContext('CoreqEvents').getObject().RegisterIndicator==true){
							this.oHeaderFooterOptions.oEditBtn.bDisabled= true;
							this.setHeaderFooterOptions(this.oHeaderFooterOptions);                
						}
					}
				}
			}                              
		}
	},
	pressCOREQ: function(oEvent){                                
		var a=this.byId('iconTabBar');
		a.setSelectedKey("Coreq");                        
		a.fireSelect({"selectedKey" : "Coreq"});
	},
	seeAllPress:function(oEvt)
	{ 
		var modulesOffered ;
		if(this.getView().getModel().getData()){
			modulesOffered= this.getView().getModel().getData().result.ModuleOffered;
		}
		else if(this.getView().getBindingContext()){
			modulesOffered = this.getView().getBindingContext().getObject().ModuleOffered;
		}
		modulesOffered = modulesOffered.split(";");
		var oRes = [];
		var i;
		for(i=0;i<modulesOffered.length-1;i++)
		{
			var tmp ={ "modOffrd" : modulesOffered[i]};                                                                                                                                                     
			oRes.push(tmp);                              
		}
		var oModelList = new sap.ui.model.json.JSONModel();
		oModelList.setData({"ModuleOffr":oRes});
		var oControl = oEvt.getSource();
		if (! this.oPopup){
			this.oPopup = new sap.ui.xmlfragment('publicservices.her.mycourses.s1.template.ModulesOffered', this);
			this.oPopup.setModel(this.oApplicationImplementation.AppI18nModel,'i18n');

		}   
		this.oPopup.setModel(oModelList,"mod");
		this.oPopup.setBindingContext(this.getView().getBindingContext());
		this.oPopup.openBy(oControl);


	},
	handleCloseButton: function (oEvent) {
		this.oPopup.close();
	},
	onExit : function () {
		if (this.oPopup) {
			this.oPopup.destroy();
		}
	},

});