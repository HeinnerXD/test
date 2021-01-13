/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.scfld.md.controller.ScfldMasterController");
jQuery.sap.require("publicservices.her.mycourses.s1.utils.Formatter");
jQuery.sap.require("sap.ushell.services.URLParsing");

sap.ca.scfld.md.controller.ScfldMasterController.extend("publicservices.her.mycourses.s1.view.S2", {
	
	
	onInit : function(){
		
		var TileType = ""; 
		var sCrsId = '';
		var sProgStdyId = '';
		
		this.oNavFilter=null;
		this.acadYear= null;
		this.acadSess= null;
		this.filterByYearAndSession = null;
		this.aFilterItems = this.getFilterItems();
		if (sap.ushell.Container){
    		var oComponent = this.oApplicationFacade.oApplicationImplementation.getComponent();
    		var oStartupParameters = oComponent.getComponentData().startupParameters;
    		if(oStartupParameters){
    			if(oStartupParameters.TileType && oStartupParameters.TileType.length>0){
        			TileType = oStartupParameters.TileType[0].split("'")[1];
        			if(TileType===undefined){
        				TileType=oStartupParameters.TileType[0];
        			}
        		}
    			if(oStartupParameters.CourseId && oStartupParameters.CourseId.length>0){
    				sCrsId = oStartupParameters.CourseId[0];
    			}
    			if(oStartupParameters.ProgramStudyId  && oStartupParameters.ProgramStudyId.length>0){
    				sProgStdyId = oStartupParameters.ProgramStudyId[0];
    			}
    			var sProgType='';
    			var sAcadYr='';
    			var sAcadSess='';
    			if(oStartupParameters.ProgType && oStartupParameters.ProgType.length>0){
    				sProgType = oStartupParameters.ProgType[0];
    			}
    			if(oStartupParameters.AcademicYear && oStartupParameters.AcademicYear.length>0){
    				sAcadYr = oStartupParameters.AcademicYear[0];
    			}
    			if(oStartupParameters.AcademicSession && oStartupParameters.AcademicSession.length>0){
    				sAcadSess = oStartupParameters.AcademicSession[0];
    			}
    			
    			
    			 var oFilCrsId = new sap.ui.model.Filter('CourseId', 'EQ',sCrsId);
    			 var oFilPrgStdyId = new sap.ui.model.Filter('ProgramStudyId', 'EQ',sProgStdyId);
    			 var oFilProgType = new sap.ui.model.Filter('ProgType', 'EQ',sProgType);
    			 var oFilAcadYr = new sap.ui.model.Filter('AcademicYear', 'EQ',sAcadYr);
    			 var oFilAcadSess = new sap.ui.model.Filter('AcademicSession', 'EQ',sAcadSess);
    			 this.oNavFilter = new sap.ui.model.Filter([oFilCrsId,oFilPrgStdyId,oFilProgType,oFilAcadYr,oFilAcadSess], true);  
    		}
    		
    		
		}
		
	    switch(TileType){
		case 'Waitlist' : this.filterBy = "WAITING_LIST";break;
		case 'Register' : this.filterBy = "KEY_REGISTERED";break;
		case 'Wishlist' : this.filterBy = "WISH_LIST";break;
		case 'All' : this.filterBy = "KEY_ALL";break;
		case 'NAV' : this.filterBy = "NAV";break;
		case 'SPEC' : this.filterBy = "KEY_SPEC";break;
		default : this.filterBy = "KEY_ALL";break;
		}
		this.groupBy = 'grp_by_module';
		//this.filterBy = "KEY_ALL";
    	this.aGroupBySorter = [];
    	this.aFilter =[];
    	this.createGroupBySorter();
    	this.createFilters();
    	this.oList = this.byId('list');	
    	this.oListItem = this.byId('MAIN_LIST_ITEM').clone();	
    	this.searchFilters = null;

    	// fetch the detail page info only on initial load of the app from the launchpad 
    	// or without the detail page hash param 
    	//location.hash.indexOf("detail")
		var URLParsing = sap.ushell.Container.getService("URLParsing");
    	if (URLParsing.getHash(location.href) < 0 && this.filterBy === "KEY_ALL"){ // exception flow of control - required only in inital load of app from tile
        	this.oApplicationFacade.oDtlsJSONModel = new sap.ui.model.json.JSONModel();
           	this.oApplicationFacade.oDtlsInitLoad = true;
           	var oFilter; 
        	if(this.oNavFilter!=null){
    			oFilter = new sap.ui.model.Filter([this.aFilter[this.filterBy], this.oNavFilter], true);  
    		}
    		else{
    			oFilter = this.aFilter[this.filterBy];
    		}
        	
        	var oMainModel = this.getView().getModel();
        	oMainModel.read("/CourseDetailSet", {
        		async : true,
        		urlParameters : {"$top" : 1, "$skip" : 0, "$expand" : "EventDetails,EligibilityDetails,CoRequistesDetails"},
//        		filters : [oFilter],
        		sorters :  [this.aGroupBySorter[this.groupBy]],
        		success : jQuery.proxy(function(response, msg){
        		        var data = response.results[0];
    					// format the data as required....
    					var aCoReqDtls = data.CoRequistesDetails.results;
    					var aEvnts = data.EventDetails.results;
    					var aEligibilityDtls = data.EligibilityDetails.results;
    					
    					data.CoRequistesDetails = aCoReqDtls;
    					data.EventDetails = aEvnts;
    					data.EligibilityDetails = aEligibilityDtls;
    					
    					this.oApplicationFacade.oDtlsJSONModel.setData({result : data});
    					
    					// call the method setDetails config of S3 controller to enable setting of details page initail setup
    					if (this.oApplicationFacade.oApplicationImplementation.oSplitContainer.getDetailPages().length > 0){
    						var oDtlPage = this.oApplicationFacade.oApplicationImplementation.oSplitContainer.getDetailPages()[0];
    						var sCoreqInd =  this.oApplicationFacade.oDtlsJSONModel.getProperty("/result/CoReqIndicator");
    						var sEligInd =  this.oApplicationFacade.oDtlsJSONModel.getProperty("/result/EligibilityIndicator");
    						oDtlPage.getController().setDetailPageConfig.call(oDtlPage.getController(),sCoreqInd,sEligInd);
    						this.getSplitContainer().getCurrentDetailPage().getController().getActionButton(false);
    						this.oApplicationFacade.oDtlsInitLoad = false; // only the initial load of app - otherwise use odata model for details page
    					}
        		       			
        		},this),
        		error : function(data, msg){
        			// TODO: throw error msg
        		}
        	});
    	}
   	
    	this.ListBinding();
    		
    	this.oContMaster = this;
    	this.oList.attachUpdateFinished(function(a,b,c){
    		
    		this.oApplicationFacade.oApplicationImplementation.oMHFHelper.defineMasterHeaderFooter(this);    			    		
    		var oBindCtxt = a.getSource().getSelectedContexts()[0];
    		if(oBindCtxt!=undefined	&& this.getSplitContainer().getCurrentDetailPage()){
    			if (this.getSplitContainer().getCurrentDetailPage().getModel() instanceof sap.ui.model.odata.ODataModel)
    				this.getSplitContainer().getCurrentDetailPage().getController().getActionButton(false);
    		}else if(oBindCtxt==undefined && this.getSplitContainer().getCurrentDetailPage() && !sap.ui.Device.system.phone){
    			if (this.getSplitContainer().getCurrentDetailPage().getModel() instanceof sap.ui.model.odata.ODataModel
    					&& this.getSplitContainer().getCurrentDetailPage().getController().getActionButton){
    				this.getSplitContainer().getCurrentDetailPage().getController().getActionButton(true);
    			}
    		}
    	},this);
    	
    	this.onFilterSelected(this.filterBy);
    	
	},

	/*onDataLoaded : function(){
	       // after every search/groupby to select the first item by default.
	      // this._firstSelection = false; 
	},*/
	ListBinding: function(){
		var oFilter = null;  
		
		if(this.oNavFilter!=null){
			oFilter = new sap.ui.model.Filter([this.aFilter[this.filterBy], this.oNavFilter], true);  
		}
		else{
			oFilter = this.aFilter[this.filterBy];
		}
		
		
		if(this.searchFilters!=null){
			var oFilSer = new sap.ui.model.Filter([this.searchFilters, oFilter], true); 
			this.oList.bindAggregation("items",{	
	    		path : '/CourseListSet',	
	    		template : this.oListItem,	
	    		sorter : this.aGroupBySorter[this.groupBy],
	    		filters :oFilSer

	    	}); 
		}else{
			this.oList.bindAggregation("items",{	
	    		path : '/CourseListSet',	
	    		template : this.oListItem,	
	    		sorter : this.aGroupBySorter[this.groupBy],
	    		filters :oFilter

	    	}); 
		}
		
		this.registerMasterListBind(this.oList);
		  
		
	},
	createGroupBySorter : function() {
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		this.oSorterPrgOfStdy = new sap.ui.model.Sorter(
				"ProgramStudyId",
				false,
				function(oCtxt) {
                    var sPrgOfStdy = oCtxt.getProperty('ProgOfStudyTxt');
                    var sPrgOfStID = oCtxt.getProperty('ProgramStudyId');
					
					if (sPrgOfStdy !== "") {
						return {
							key : sPrgOfStID + "_start",
							text : sPrgOfStdy
						};
					} else{
						return {
							key : sPrgOfStID,
							text : oBundle.getText('OTHERS')
						};
					}
				});
		
		this.aGroupBySorter['grp_by_prog_study'] = [this.oSorterPrgOfStdy ];		
		
		this.oSorterModule = new sap.ui.model.Sorter(
				"ModuleGroupId", false, function(oContext) {
                    var sModID = oContext.getProperty("ModuleGroupId");
					var sMod = oContext.getProperty("ModuleGrpTxt");
					if (sMod !== '') {
						return {
							key : sModID,
							text : sMod
						};
					}else{
						return {
							key : sModID,
							text : oBundle.getText('OTHERS')
						};
					}
					
				});
		
		this.aGroupBySorter['grp_by_module'] = [this.oSorterModule];
		
		this.oSorterPrgType = new sap.ui.model.Sorter(
				"ProgType", false, function(oContext) {
                    var sProgType = oContext.getProperty("ProgType");
					var sProgTxt = oContext.getProperty("ProgTypet");
					if (sProgTxt !== '') {
						return {
							key : sProgType,
							text : sProgTxt
						};
					}else{
						return {
							key : sProgType,
							text : oBundle.getText('OTHERS')
						};
					}
					
				});
		
		this.aGroupBySorter['grp_by_prog_Type'] = [this.oSorterPrgType];
		
	},
	getFilterItems : function(){
		var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();	
		var aFilterItems = 
		[{
			text : oBundle.getText('OPEN_FOR_FILTER'),	
			key : "KEY_ALL"	                            
		},{	
			text : oBundle.getText('STUDY_PLAN'),
			key : "STUDY_PLAN"
		},{	
			text : oBundle.getText('REGISTERED'),
			key : "KEY_REGISTERED"
		},{
			text : oBundle.getText('WAITING_LIST'),	
			key : "WAITING_LIST"	                            
		},{	
			text : oBundle.getText('WISH_LIST'),	
			key : "WISH_LIST"	
		},{	
			text : oBundle.getText('ADVISOR_LIST'),
			key : "ADVISOR_LIST"
		},{	
			text : oBundle.getText('SPECIALIZATION'),
			key : "KEY_SPEC"
		}];
		
		return aFilterItems;
	},
	 
	createFilters : function(){
        var oFilReg = new sap.ui.model.Filter('ListInd', 'EQ','REG');
        this.aFilter['KEY_REGISTERED'] = oFilReg;
        
        var oFilWaitList = new sap.ui.model.Filter('ListInd', 'EQ','WAIT');
        this.aFilter['WAITING_LIST'] = oFilWaitList;
        
        var oFilNav = new sap.ui.model.Filter('ListInd', 'EQ','NAV');
        this.aFilter['NAV'] = oFilNav;
        
        var oFilWishList = new sap.ui.model.Filter('ListInd', 'EQ','WISH');
        this.aFilter['WISH_LIST'] = oFilWishList;
        
        var oFilAll = new sap.ui.model.Filter('ListInd', 'EQ','ALL');
        this.aFilter['KEY_ALL'] = oFilAll;
        
        var oFilStdyPln = new sap.ui.model.Filter('ListInd', 'EQ','SPLN');
        this.aFilter['STUDY_PLAN'] = oFilStdyPln;
        
        var oFilAdvList = new sap.ui.model.Filter('ListInd', 'EQ','ADV');
        this.aFilter['ADVISOR_LIST'] = oFilAdvList;   
        
        var oFilSpecList = new sap.ui.model.Filter('ListInd', 'EQ','SPEC');
        this.aFilter['KEY_SPEC'] = oFilSpecList;   
	},
	isBackendSearch : function(){
    	return true;
    },
   
    applyBackendSearchPattern  : function(sFilterPattern, oBinding){
        var searchQuery = sFilterPattern.toLowerCase();
        var oFilter = null;
        var oFilteredFilter =this.aFilter[this.filterBy];
        var oFilacadYear=null;
        var oFilacadSess=null;
        if(this.acadYear!=="" || this.acadYear!==null){
        	oFilacadYear = new sap.ui.model.Filter('AcademicYear', 'EQ',this.acadYear);	        	
           
        }
        if(this.acadSess!=="" || this.acadSess!==null){	        	
        	
            oFilacadSess = new sap.ui.model.Filter('AcademicSession', 'EQ',this.acadSess);
        }
        
        
        if (searchQuery && searchQuery !== ""){

	          // search impl
	        var oFilterCourseName = new sap.ui.model.Filter('CourseText', sap.ui.model.FilterOperator.Contains,searchQuery);
	       
	      // var oFilterCourseNum= new sap.ui.model.Filter('CourseNumber', sap.ui.model.FilterOperator.Contains,searchQuery);
	        this.searchFilters = new sap.ui.model.Filter([oFilterCourseName],true);
	        
	        
        	if (oFilteredFilter)
	        	oFilter = new sap.ui.model.Filter([oFilteredFilter, this.searchFilters,oFilacadSess,oFilacadYear], true);          
	        else{
	        	oFilter =  new sap.ui.model.Filter([this.searchFilters,oFilacadSess,oFilacadYear], true); 
	        }
        }
        else{
        	this.searchFilters=null;
        	if(oFilteredFilter){
        		oFilter = new sap.ui.model.Filter([oFilteredFilter,oFilacadSess,oFilacadYear], true);
	        }			
		}
         
        oBinding.aApplicationFilters = [];       
        oBinding.filter(oFilter);
        
	},
	getList : function() {
		return this.byId("list");
	},
	_handleGroupingChanged : function(sKey){	                 
        
        if (sKey === this.groupBy){
                       return ;
        }
        else{
       	 	 this.groupBy = sKey;
			 var oList = this.getList();
			 var oBindings = oList.getBinding("items");			 
			 oBindings.sort(this.aGroupBySorter[this.groupBy]);	
		 }				         
	},
	handleFilterChanged:function(sKey,acadYear,acadSess){
		if(sKey===this.filterBy && this.acadYear == acadYear && this.acadSess == acadSess){
			return;
		}
		else{
			this.filterBy=sKey;
			this.onFilterSelected(sKey);
			var oList = this.getList();	       
			var oBindings = oList.getBinding("items");	    
			oBindings.aApplicationFilters=[];
			var oFilter=[];
			if(this.searchFilters!=null){
				var oFil = new sap.ui.model.Filter([this.aFilter[this.filterBy],this.searchFilters],true);
				oFilter.push(oFil);

			}
			else{
				var oFil = this.aFilter[this.filterBy];
				oFilter.push(oFil);

			}
			if(acadYear || acadSess){
				var oFilacadYear = new sap.ui.model.Filter('AcademicYear', 'EQ',acadYear);
				oFilter.push(oFilacadYear);
				var oFilacadSess = new sap.ui.model.Filter('AcademicSession', 'EQ',acadSess);
				oFilter.push(oFilacadSess);
			} 
			this.acadYear = acadYear;
			this.acadSess = acadSess;
	        oBindings.filter(oFilter);
		}
	},
	navBackOnError : function(){
		// navigate back to previous screen
		window.history.go(-1);
	},
    onFilterSelected : function(sFilKey){
    	var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
    	var that = this.getList();
    	var oInfoBar = that.getInfoToolbar();
    	var oInfoToolLbl =  this.byId('ListInfoTool');
    	var oInfoToolIcon = this.byId('ListInfoToolIcon');
    	//var b = this.getHeaderFooterOptions();
    	var f = this.aFilterItems;
    	if(sFilKey=='KEY_ALL'){
    		oInfoToolLbl.setText(oBundle.getText('FILTERED_BY',[f[0].text]));
    		//oInfoBar.setVisible(false);
    	}
    	else if(sFilKey=='NAV'){
    		oInfoBar.setVisible(false);
    	}
    	else{    		
    		oInfoBar.setVisible(true);
	    	
	    	
	    	//var c = b.oFilterOptions.f;
	    	
	    	var aFilIcon =[];
	    	aFilIcon['KEY_REGISTERED'] = "sap-icon://course-book";
	    	aFilIcon['WAITING_LIST'] = "sap-icon://time-entry-request";
	    	aFilIcon['ADVISOR_LIST'] = "";
	    	aFilIcon['WISH_LIST'] = "sap-icon://favorite-list";
	    	aFilIcon['KEY_ALL'] = "";
	
	       
	        $.each(f, function(sKey,values){ 
	               if(sFilKey == values.key){
	            	     oInfoToolLbl.setText(oBundle.getText('FILTERED_BY',[values.text]));                     
	            	     oInfoToolIcon.setSrc(aFilIcon[values.key]);                    
	               }               
	        });
    	}
    },
    applyFilterFromContext : function(sHash){
        // do a publish on the event bus with the key unique to our component that's loaded. 
        var sComponentId = this.oApplicationFacade.oApplicationImplementation.getComponent().getId(); 
        sap.ui.getCore().getEventBus().publish(sComponentId,'deepLinking',{
               path : sHash
        });
        
        if(this.getSplitContainer().getCurrentDetailPage()){
			
    		this.getSplitContainer().getCurrentDetailPage().getController().getActionButton(true,true);
		}
    },
	getHeaderFooterOptions : function(oModSetting) {
		var that = this;
		 var oBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		 var oGrpItems = [];
		 var oModSetting=this.oModSetting;
	      if(this.oList.getSelectedItem()){
	         oModSetting = this.oList.getSelectedItem().getBindingContext().getObject().ModuleSetting; 
	         this.oModSetting = oModSetting;
	        }

		 if(oModSetting == 'XX'){
				oGrpItems = [{	
					text : oBundle.getText('GRP_PROG_STUDY'),	
					key : "grp_by_prog_study"
				}, {	
					text : oBundle.getText('GRP_MODULE'),	
					key : "grp_by_module"							
				},{
					text : oBundle.getText('GRP_PROG_TYPE'),
					key : "grp_by_prog_Type"
				}];
		 }
		else if(oModSetting == 'SC'){
					oGrpItems = [{
						text : oBundle.getText('GRP_PROG_STUDY'),	
						key : "grp_by_prog_study"
					}, {	
						text : oBundle.getText('GRP_MODULE'),	
						key : "grp_by_module"							
					}];
		}else if(oModSetting == 'PT'){
					oGrpItems = [{
						text : oBundle.getText('GRP_MODULE'),	
						key : "grp_by_module"							
					},{
						text : oBundle.getText('GRP_PROG_TYPE'),
						key : "grp_by_prog_Type"
					}];
			}
		else if(oModSetting == null){
					oGrpItems = [{
						text : oBundle.getText('GRP_PROG_STUDY'),	
						key : "grp_by_prog_study"
					}, {	
						text : oBundle.getText('GRP_MODULE'),	
						key : "grp_by_module"							
					},{
						text : oBundle.getText('GRP_PROG_TYPE'),
						key : "grp_by_prog_Type"
					}];
			
		}
		 
		 return{
				sI18NMasterTitle : "MASTER_TITLE",				
				oGroupOptions : {	
					aGroupItems : oGrpItems,
					sSelectedItemKey:that.groupBy,
					onGroupSelected : function(sKey) {	
						that.getHeaderFooterOptions().oFilterOptions.sSelectedItemKey=sKey;	
						that._handleGroupingChanged(sKey);
						that.oApplicationFacade.oApplicationImplementation.oMHFHelper.setHeaderFooter(that.getHeaderFooterOptions());
					}	
				},
				oFilterOptions : {
					sBtnTxt: "",
					bDisabled: false,
					onFilterPressed: jQuery.proxy(function(oEvt){				
						that.handleOpenDialog(oEvt);
					},this)
				},
				aAdditionalSettingButtons :{
					
				}
		 };
	},
	
	handleOpenDialog: function (oEvent) {

        if (! this._oDialog) {
               this._oDialog = sap.ui.xmlfragment("publicservices.her.mycourses.s1.template.FilterDialog", this);
        }
        this._oDialog._updateFilterCounters=function(){}; // to remove the filter counters
  		this._oDialog.setModel(this.oApplicationFacade.oApplicationImplementation.AppI18nModel,'i18n');
        this._oDialog.setModel(this.getView().getModel());
        // toggle compact style
        jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
        this._oDialog.open();
        var filterindex = 0;
        switch(this.filterBy)
        {
        case "KEY_ALL": filterindex = 0;
        break;
        case "STUDY_PLAN": filterindex = 1;
        break;
        case "KEY_REGISTERED": filterindex = 2;
        break;
        case "WAITING_LIST": filterindex = 3;
        break;
        case "WISH_LIST": filterindex = 4;
        break;
        case "ADVISOR_LIST": filterindex = 5;
        break;
        case "KEY_SPEC": filterindex = 6;
        break;
        }
        this._oDialog.getFilterItems()[0].getItems()[filterindex].setSelected(true);
        var that = this;
        window.setTimeout(function() {   
               if(that._oDialog.getFilterItems()[1].getItems()){
                that._oDialog.getFilterItems()[1].getItems()[0].setSelected(true);
               }
               },1000);
 },



 handleConfirm: function (oEvent) {
        var acadYear="";
        var acadSess="";
        var acadYearTxt="";
        var acadSessTxt="";
        if(oEvent.getSource().getSelectedFilterItems()[0]){
               
               if(oEvent.getSource().getSelectedFilterItems()[0].getKey()==""){
                     acadYear = oEvent.getSource().getSelectedFilterItems()[0].getBindingContext().getObject().AcademicYear; 
                     acadYearTxt = oEvent.getSource().getSelectedFilterItems()[0].getBindingContext().getObject().AcademicYearText;    
                     acadSess = oEvent.getSource().getSelectedFilterItems()[0].getBindingContext().getObject().AcademicSession;     
                     acadSessTxt = oEvent.getSource().getSelectedFilterItems()[0].getBindingContext().getObject().AcademicSessText;    
                     this.filterByYearAndSession = acadYearTxt+" "+acadSessTxt;
                      this.handleFilterChanged(this.filterBy,acadYear,acadSess,acadYearTxt,acadSessTxt);
               }else{
                     var skey = oEvent.getSource().getSelectedFilterItems()[0].getKey();
                     if(oEvent.getSource().getSelectedFilterItems()[1]){
                     acadYear = oEvent.getSource().getSelectedFilterItems()[1].getBindingContext().getObject().AcademicYear; 
                     acadYearTxt = oEvent.getSource().getSelectedFilterItems()[1].getBindingContext().getObject().AcademicYearText;    
                     acadSess = oEvent.getSource().getSelectedFilterItems()[1].getBindingContext().getObject().AcademicSession;
                     acadSessTxt = oEvent.getSource().getSelectedFilterItems()[1].getBindingContext().getObject().AcademicSessText;    
                     }else{
                            acadYear = null;
                            acadSess = null;
                            acadYearTxt= null;
                            acadSessTxt= null;
                     }
                     this.filterByYearAndSession = acadYearTxt+" "+acadSessTxt;
                     this.handleFilterChanged(skey,acadYear,acadSess,acadYearTxt,acadSessTxt);
               }
        }

 },


handleCancel:function(oEvent)
 {
        // this function is to set the filter to the previously selected radio button 
        if(this._oDialog.getFilterItems()[1].getItems()){
        var array = this._oDialog.getFilterItems()[1].getItems();
      for(var i=0,ind=0 ;i<array.length; i++)
         {
         if(this._oDialog.getFilterItems()[1].getItems()[i].getText()== this.filterByYearAndSession)
                {
                ind =i;
                }
         }
                 this._oDialog.getFilterItems()[1].getItems()[ind].setSelected(true);
        }
 },

	onExit : function () {
		if (this._oDialog) {
			this._oDialog.destroy();
		}
	},
	onListerFiltering: function(){

		   
		var oList = this.getList();	       
		var oBindings = oList.getBinding("items");	    
		oBindings.aApplicationFilters=[];
		var oFilter=[];
		if(this.searchFilters!=null){
			var oFil = new sap.ui.model.Filter([this.aFilter[this.filterBy],this.searchFilters],true);
			oFilter.push(oFil);

		}
		else{
			var oFil = this.aFilter[this.filterBy];
			oFilter.push(oFil);

		}
		if(this.acadYear || this.acadSess){
			var oFilacadYear = new sap.ui.model.Filter('AcademicYear', 'EQ',this.acadYear);
			oFilter.push(oFilacadYear);
			var oFilacadSess = new sap.ui.model.Filter('AcademicSession', 'EQ',this.acadSess);
			oFilter.push(oFilacadSess);
		} 
        oBindings.filter(oFilter);
	
	}
});