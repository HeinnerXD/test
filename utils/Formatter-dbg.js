/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("publicservices.her.mycourses.s1.utils.Formatter");

publicservices.her.mycourses.s1.utils.Formatter = {

       getSeats : function(sVal) {
              var oBC = this.getBindingContext();
              var sPath = '';
              if (oBC) {
                     sPath = oBC.sPath;
              }
              if (this.getModel().getProperty(sPath + "/ListInd") == "REG" || this.getModel().getProperty(sPath + "/RegWindInd")) {
                     this.setText('');
                     return '';
              }

              var sSeats = sap.ca.scfld.md.app.Application.getImpl()
                           .getResourceBundle().getText('SEATS');

              var sWaitText = sap.ca.scfld.md.app.Application.getImpl()
                           .getResourceBundle().getText('WAIT_LIST_SEATS');

              if (this.getModel().getProperty(sPath + "/ListInd") == "WAIT") {
                     var oVal = this.getModel().getProperty(sPath + "/WaitlPosition");
                     if ((oVal != null && oVal)) {
                           if (oVal == '0') {
                                  this.setState('Error');
                                  return sap.ca.scfld.md.app.Application.getImpl()
                                                .getResourceBundle().getText('NO_PLACES');
                           } else {
                                  this.setState('Error');
                                  return sWaitText + oVal;
                           }

                     }

              }
              if ((sVal != null && sVal)) {
                     if (sVal == '0') {
                           this.setState('Error');
                           return sap.ca.scfld.md.app.Application.getImpl()
                                         .getResourceBundle().getText('NO_PLACES');
                     } else {
                           this.setState('Success');
                           return sVal + " " + sSeats;
                     }

              }
       },
       getIcon:function(sVal){
              // if PRStatus is "x" then the prerequisite is not met
              if(sVal=="X")
                     {
                     return "sap-icon://decline";
                     }
              else{
                     return "sap-icon://accept";
              }
       },
       
       getIconColour:function(sVal)
       {
              // if PRStatus is "x" then the prerequisite is not met
              if(sVal=="X")
              {
            	  return "rgb(204,25,25)" ;

              }
       else{
              return "green";
       }
       },
       getEligPre : function(sVal) {
              var oBC = this.getBindingContext();
              var sPath = '';
              if (oBC) {
                     sPath = oBC.sPath;
              }
              var oM = this.getModel();
              if (sVal == 'PR') {
                     return oM.getProperty(sPath + "/RelObjStext");
                     // return oM.getProperty("Course_name",oBC);
              } else {
                     this.getParent().setVisible(false);
              }
       },
       
       getEligCoReq : function(sVal) {
              var oBC = this.getBindingContext();
              var sPath = '';
              if (oBC) {
                     sPath = oBC.sPath;
              }
              var oM = this.getModel();
              if (sVal == 'CR') {
                     return oM.getProperty(sPath + "/RelObjStext");
              } else {
                     this.getParent().setVisible(false);
              }
       },
       getEligOthers : function(sVal) {
              var oBC = this.getBindingContext();
              var sPath = '';
              if (oBC) {
                     sPath = oBC.sPath;
              }
              var oM = this.getModel();
              if (sVal == 'RC') {
                     return oM.getProperty(sPath + "/RelObjStext");
              } else {
                     this.getParent().setVisible(false);
              }
       },
       getStatus : function(sVal) {
              var oBundle = sap.ca.scfld.md.app.Application.getImpl()
                           .getResourceBundle();
              
              switch (sVal) {
              case 'REG':
                     return oBundle.getText('REGISTERED');
                     break;
              case 'WISH':
                     return oBundle.getText('WISH_LIST');
                     break;
              case 'WAIT':
                     return oBundle.getText('WAITING_LIST');
                     break;
              case 'ALL':
                     return oBundle.getText('AVAIABLE_FOR_REG');
                     break;
              }
       },
       getCredits : function(sVal) {
              if (sVal != null && sVal) {
                     return Math.round(sVal);
              }
       },
       getAcdYrSes : function(sVal) {
              var oBC = this.getBindingContext();
              var sPath = '';
              if (oBC) {
                     sPath = oBC.sPath;
              }
              var oM = this.getModel();
              var sAcdYr = oM.getProperty(sPath + "/AcademicYear");

              if (sVal != null && sVal) {
                     return sAcdYr + " " + sVal;
              }
       },
       getCoreq : function(sVal) {
              
              if(this.getBindingContext()){
                     if(this.getBindingContext().getObject().EligibilityIndicator == 'X'){
                     return false;
                     }
                     else if (sVal == 'X') {
                           return true;
                     } else
                           return false;
              }
       },
       getCoreqText: function(){
              var coreqText = sap.ca.scfld.md.app.Application.getImpl()
              .getResourceBundle().getText('COREQ');          
              return coreqText;
       },
       getCourseLocationInfo : function(sVal1, sVal2, sVal3) {              
              return sVal1 + " " + sVal2 + " " + sVal3;
       },
       getGroupName : function(sVal, sVal2) {
              return sVal + sVal2;

       },
       getState : function(sVal) {
              if ((sVal != null && sVal)) {
                     var oCid = this.getBindingContext().getObject().CourseId;
                     var oPid = this.getBindingContext().getObject().ProgramStudyId;
                     var oProp = this.getModel().getContext(
                                  "/CourseListSet(ProgramStudyId='"
                                  + oPid + "',CourseId='" + oCid + "')");
                     var sWaitText = sap.ca.scfld.md.app.Application.getImpl()
                     .getResourceBundle().getText('WAIT_LIST_SEATS');
                     var sSeats = sap.ca.scfld.md.app.Application.getImpl()
                     .getResourceBundle().getText('SEATS');          
                     if(oProp.getProperty("ListInd") == null){
                           oProp = this.getModel().getContext(
                                         "/CourseListSet(CourseId='"
                                         + oCid + "',ProgramStudyId='" + oPid + "')");
                     }
                     if (oProp.getProperty("ListInd") == "WAIT") {
                           var oVal = this.getBindingContext().getObject().WaitlistNumber;
                           if ((oVal != null && oVal)) {
                                  if (oVal == '0') {
                                         this.setState('Error');
                                         return sap.ca.scfld.md.app.Application.getImpl()
                                         .getResourceBundle().getText('NO_PLACES');
                                  } else {
                                         this.setState('Error');
                                         return sWaitText + oVal;
                                  }

                           }
                     } else {
                           if (sVal == '0') {
                                  this.setState('Error');
                                  return sap.ca.scfld.md.app.Application.getImpl()
                                  .getResourceBundle().getText('NO_PLACES');
                           }else {
                                  this.setState('Success');
                                  return sVal + " " + sSeats;
                           }
                     }
              }
       },
       getEventState : function(sVal) {
              if ((sVal != null && sVal)) {

                     if (sVal <= '0') {
                           this.setState('Error');
                           return sap.ca.scfld.md.app.Application.getImpl()
                           .getResourceBundle().getText('NO_PLACES');
                     }else {
                           var sSeats = sap.ca.scfld.md.app.Application.getImpl()
                           .getResourceBundle().getText('SEATS');   
                           this.setState('Success');
                           return sVal + " " + sSeats;
                     }
              }
       },
       getStateDetail :  function(sVal) {
              if ((sVal != null && sVal)) {
                     var oCid = this.getBindingContext().getObject().CourseId;
                     var oPid = this.getBindingContext().getObject().ProgramStudyId;
                     var oProp = this.getModel().getContext(
                                  "/CourseListSet(ProgramStudyId='"
                                  + oPid + "',CourseId='" + oCid + "')");
                     
                     var sWaitText = sap.ca.scfld.md.app.Application.getImpl()
                     .getResourceBundle().getText('WAIT_LIST_SEATS');
                     var sSeats = sap.ca.scfld.md.app.Application.getImpl()
                     .getResourceBundle().getText('SEATS');
                     if(oProp.getProperty("ListInd") == null){
                           oProp = this.getModel().getContext(
                                         "/CourseListSet(CourseId='"
                                         + oCid + "',ProgramStudyId='" + oPid + "')");
                     }
                     if(oProp.getProperty("ListInd")=='REG' || oProp.getProperty("RegWindInd") ){
                           this.setText('');
                           return '';
                     }
                     if (oProp.getProperty("ListInd") == "WAIT") {
                           var oVal = this.getBindingContext().getObject().WaitlistNumber;
                           if ((oVal != null && oVal)) {
                                  if (oVal == '0') {
                                         this.setState('Error');
                                         return sap.ca.scfld.md.app.Application.getImpl()
                                         .getResourceBundle().getText('NO_PLACES');
                                  } else {
                                         this.setState('Error');
                                         return sWaitText + oVal;
                                  }

                           }
                     } else {
                           if (sVal == '0') {
                                  this.setState('Error');
                                  return sap.ca.scfld.md.app.Application.getImpl()
                                  .getResourceBundle().getText('NO_PLACES');
                           } else {
                                  this.setState('Success');
                                  return sVal + " " + sSeats;
                           }
                     }
              }
       },
       getEligibilityText : function(sVal) {
              var oBundle = sap.ca.scfld.md.app.Application.getImpl()
              .getResourceBundle();
              if(this.getBindingContext()){
                     /*var a=this.oApplicationImplementation.oSplitContainer.getMasterPages()[0];
                     var b=a.getController();
                     var c=b.getList();
                     var d=c.getSelectedItem();
                     var status = d.getBindingContext().getObject();
                     
*/
                     var oCid = this.getBindingContext().getObject().CourseId;
                     var oPid = this.getBindingContext().getObject().ProgramStudyId;
                     var oPgmType =this.getBindingContext().getObject().ProgType;
                     var oAcdYr = this.getBindingContext().getObject().AcademicYear;
                     var oAcdSession =this.getBindingContext().getObject().AcademicSession;
                     var oCondnBooking = this.getBindingContext().getObject().ConditionalBookingIndicator;
                     /*var oProp = this.getModel().getContext(
                                  "/CourseListSet(ProgramStudyId='"
                                  + oPid + "',CourseId='" + oCid + "',ProgType='" +oPgmType+"',AcademicYear='" +oAcdYr+"',AcademicSession='"+ oAcdSession+"')");
                     if(oProp.getProperty("ListInd") == null){*/
                          var oProp = this.getModel().getContext(
                                         "/CourseListSet(CourseId='"
                                         + oCid + "',ProgramStudyId='" + oPid + "',ProgType='" +oPgmType+"',AcademicYear='" +oAcdYr+"',AcademicSession='"+ oAcdSession+"')");
                     /*}*/
                     var oStatus=oProp.getProperty("Status");

                     if(this.getBindingContext().getObject().EligibilityIndicator == 'X'){
                           this.setState('Error');
                           return oBundle.getText('YOU_ARE_NOT_ELIG');
                     }
                     else if(oCondnBooking=="X")
                     {
                     this.setState('Success');
                     return oBundle.getText('CONDN_BOOKING_TXT');
                     }
                     else if(oStatus == 'Booked')
                     {
                           this.setState('Success');
                           return oBundle.getText('YOU_ARE_REG');
                     }
                     else if (sVal == 'X') {
                           this.setState('Success');
                           return oBundle.getText('COREQ_TXT');
                     } else
                           this.setState('Success');
                     return oBundle.getText('YOU_CAN_BOOK');
              }

       },
       getContactDetails: function(sVal){
              var oBundle = sap.ca.scfld.md.app.Application.getImpl()
              .getResourceBundle();
              if (sVal == null) {
                     return oBundle.getText('NO_DATA');
              } else
                     return sVal;
       },
       
       bindTables : function(sVal){
              if ((sVal || null) !== null){
            	  if(this.getContent()[0].getItems()[0]){
                     var oFilter = new sap.ui.model.Filter('CourseId','EQ', sVal);
                     
                     this.getContent()[0].bindAggregation('items', {
                           path : 'CoreqEvents>/CoRequistesDetails',
                           sorter : new sap.ui.model.Sorter({path: 'CoreqEvents>CategoryText',descending: false,group: true}),
                           filters : [oFilter],
                           template : this.getContent()[0].getItems()[0].clone()
                     });
            	  }
                     
              }
              return true;
       },
       Visibility:function(sVal){
           if(sVal=="")
                  {
                  return false;
                  }
           else
                  return true;
           
         },

         getNoDataText: function(sVal){
        	 var oBundle = sap.ca.scfld.md.app.Application.getImpl()
        	 .getResourceBundle();

        	 if (sVal == "") {
        		 return oBundle.getText('NO_DATA');
        	 } else
        		 return sVal;
         },
         getFilterItem: function(sVal1,sVal2){
        	 return sVal1+" "+sVal2;
         },
         setEventSel: function(sVal){
        	 return sVal;
         },
         
         modOfferdFormatting:function(offeredIn){
        	 if(offeredIn)
        		 {
        		 var array = offeredIn.split(";");
        		 if(array.length>4)
        			 {
        			 offeredIn = array[0] + "\n" + array[1] + "\n" + array[2];
        			 
        			 }
        		 else{
        		 offeredIn = offeredIn.replace(/;/g,"\n");
        		 }
        		 }
        	 return offeredIn;
        		 
         },

         compModuleFormatting:function(compMod)
         {
        	 if(compMod)
        		 {
        		 compMod = compMod.replace(/,/g,", ");
        		 }
        	return compMod;
         },
        seeAll:function(offeredIn)
         {
        	 if(offeredIn)
    		 {
    		 var array = offeredIn.split(";");
    		 if(array.length>4)
    			 {
    			 //offeredIn = array[0] + "\n" + array[1];
    			 this.setVisible(true);
    			 return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('LBL_SEEALL');
    			 }
    		 else
    			 {
    			 this.setVisible(false);
    			 return;
    			 }
        	
         }
         else{
         	this.setVisible(false);
    			 return;
         }
         },
          visible:function(text)
         {
         if(text)
         {
         	return true;
         }
         else{
         	return false;
         }
         }, 	
         ModulesOffered:function(modOffered)
         {
        	 if(modOffered)
        		 {
        		 modOffered = modOffered.replace(/;/g,"\n");
        		 }
        	 return modOffered;
        	 	
         }

};