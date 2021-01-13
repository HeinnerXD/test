/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("publicservices.her.mycourses.s1.utils.Formatter");publicservices.her.mycourses.s1.utils.Formatter={getSeats:function(v){var b=this.getBindingContext();var p='';if(b){p=b.sPath;}if(this.getModel().getProperty(p+"/ListInd")=="REG"||this.getModel().getProperty(p+"/RegWindInd")){this.setText('');return'';}var s=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('SEATS');var w=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('WAIT_LIST_SEATS');if(this.getModel().getProperty(p+"/ListInd")=="WAIT"){var V=this.getModel().getProperty(p+"/WaitlPosition");if((V!=null&&V)){if(V=='0'){this.setState('Error');return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('NO_PLACES');}else{this.setState('Error');return w+V;}}}if((v!=null&&v)){if(v=='0'){this.setState('Error');return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('NO_PLACES');}else{this.setState('Success');return v+" "+s;}}},getIcon:function(v){if(v=="X"){return"sap-icon://decline";}else{return"sap-icon://accept";}},getIconColour:function(v){if(v=="X"){return"rgb(204,25,25)";}else{return"green";}},getEligPre:function(v){var b=this.getBindingContext();var p='';if(b){p=b.sPath;}var m=this.getModel();if(v=='PR'){return m.getProperty(p+"/RelObjStext");}else{this.getParent().setVisible(false);}},getEligCoReq:function(v){var b=this.getBindingContext();var p='';if(b){p=b.sPath;}var m=this.getModel();if(v=='CR'){return m.getProperty(p+"/RelObjStext");}else{this.getParent().setVisible(false);}},getEligOthers:function(v){var b=this.getBindingContext();var p='';if(b){p=b.sPath;}var m=this.getModel();if(v=='RC'){return m.getProperty(p+"/RelObjStext");}else{this.getParent().setVisible(false);}},getStatus:function(v){var b=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();switch(v){case'REG':return b.getText('REGISTERED');break;case'WISH':return b.getText('WISH_LIST');break;case'WAIT':return b.getText('WAITING_LIST');break;case'ALL':return b.getText('AVAIABLE_FOR_REG');break;}},getCredits:function(v){if(v!=null&&v){return Math.round(v);}},getAcdYrSes:function(v){var b=this.getBindingContext();var p='';if(b){p=b.sPath;}var m=this.getModel();var a=m.getProperty(p+"/AcademicYear");if(v!=null&&v){return a+" "+v;}},getCoreq:function(v){if(this.getBindingContext()){if(this.getBindingContext().getObject().EligibilityIndicator=='X'){return false;}else if(v=='X'){return true;}else return false;}},getCoreqText:function(){var c=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('COREQ');return c;},getCourseLocationInfo:function(v,V,s){return v+" "+V+" "+s;},getGroupName:function(v,V){return v+V;},getState:function(v){if((v!=null&&v)){var c=this.getBindingContext().getObject().CourseId;var p=this.getBindingContext().getObject().ProgramStudyId;var P=this.getModel().getContext("/CourseListSet(ProgramStudyId='"+p+"',CourseId='"+c+"')");var w=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('WAIT_LIST_SEATS');var s=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('SEATS');if(P.getProperty("ListInd")==null){P=this.getModel().getContext("/CourseListSet(CourseId='"+c+"',ProgramStudyId='"+p+"')");}if(P.getProperty("ListInd")=="WAIT"){var V=this.getBindingContext().getObject().WaitlistNumber;if((V!=null&&V)){if(V=='0'){this.setState('Error');return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('NO_PLACES');}else{this.setState('Error');return w+V;}}}else{if(v=='0'){this.setState('Error');return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('NO_PLACES');}else{this.setState('Success');return v+" "+s;}}}},getEventState:function(v){if((v!=null&&v)){if(v<='0'){this.setState('Error');return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('NO_PLACES');}else{var s=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('SEATS');this.setState('Success');return v+" "+s;}}},getStateDetail:function(v){if((v!=null&&v)){var c=this.getBindingContext().getObject().CourseId;var p=this.getBindingContext().getObject().ProgramStudyId;var P=this.getModel().getContext("/CourseListSet(ProgramStudyId='"+p+"',CourseId='"+c+"')");var w=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('WAIT_LIST_SEATS');var s=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('SEATS');if(P.getProperty("ListInd")==null){P=this.getModel().getContext("/CourseListSet(CourseId='"+c+"',ProgramStudyId='"+p+"')");}if(P.getProperty("ListInd")=='REG'||P.getProperty("RegWindInd")){this.setText('');return'';}if(P.getProperty("ListInd")=="WAIT"){var V=this.getBindingContext().getObject().WaitlistNumber;if((V!=null&&V)){if(V=='0'){this.setState('Error');return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('NO_PLACES');}else{this.setState('Error');return w+V;}}}else{if(v=='0'){this.setState('Error');return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('NO_PLACES');}else{this.setState('Success');return v+" "+s;}}}},getEligibilityText:function(v){var b=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();if(this.getBindingContext()){var c=this.getBindingContext().getObject().CourseId;var p=this.getBindingContext().getObject().ProgramStudyId;var P=this.getBindingContext().getObject().ProgType;var a=this.getBindingContext().getObject().AcademicYear;var A=this.getBindingContext().getObject().AcademicSession;var C=this.getBindingContext().getObject().ConditionalBookingIndicator;var o=this.getModel().getContext("/CourseListSet(CourseId='"+c+"',ProgramStudyId='"+p+"',ProgType='"+P+"',AcademicYear='"+a+"',AcademicSession='"+A+"')");var s=o.getProperty("Status");if(this.getBindingContext().getObject().EligibilityIndicator=='X'){this.setState('Error');return b.getText('YOU_ARE_NOT_ELIG');}else if(C=="X"){this.setState('Success');return b.getText('CONDN_BOOKING_TXT');}else if(s=='Booked'){this.setState('Success');return b.getText('YOU_ARE_REG');}else if(v=='X'){this.setState('Success');return b.getText('COREQ_TXT');}else this.setState('Success');return b.getText('YOU_CAN_BOOK');}},getContactDetails:function(v){var b=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();if(v==null){return b.getText('NO_DATA');}else return v;},bindTables:function(v){if((v||null)!==null){if(this.getContent()[0].getItems()[0]){var f=new sap.ui.model.Filter('CourseId','EQ',v);this.getContent()[0].bindAggregation('items',{path:'CoreqEvents>/CoRequistesDetails',sorter:new sap.ui.model.Sorter({path:'CoreqEvents>CategoryText',descending:false,group:true}),filters:[f],template:this.getContent()[0].getItems()[0].clone()});}}return true;},Visibility:function(v){if(v==""){return false;}else return true;},getNoDataText:function(v){var b=sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();if(v==""){return b.getText('NO_DATA');}else return v;},getFilterItem:function(v,V){return v+" "+V;},setEventSel:function(v){return v;},modOfferdFormatting:function(o){if(o){var a=o.split(";");if(a.length>4){o=a[0]+"\n"+a[1]+"\n"+a[2];}else{o=o.replace(/;/g,"\n");}}return o;},compModuleFormatting:function(c){if(c){c=c.replace(/,/g,", ");}return c;},seeAll:function(o){if(o){var a=o.split(";");if(a.length>4){this.setVisible(true);return sap.ca.scfld.md.app.Application.getImpl().getResourceBundle().getText('LBL_SEEALL');}else{this.setVisible(false);return;}}else{this.setVisible(false);return;}},visible:function(t){if(t){return true;}else{return false;}},ModulesOffered:function(m){if(m){m=m.replace(/;/g,"\n");}return m;}};