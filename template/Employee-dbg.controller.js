/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.controller("publicservices.her.mycourses.s1.template.Employee", {
	handleTelPress: function (oEvt) {
	    sap.m.URLHelper.triggerTel(oEvt.getSource().getText());
	  },
	  handleEmailPress : function(oEvt){
		  sap.m.URLHelper.triggerEmail(oEvt.getSource().getText());
	  }
});