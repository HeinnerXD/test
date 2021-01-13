/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("publicservices.her.mycourses.s1.Configuration");
jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");
jQuery.sap.require("sap.ca.scfld.md.app.Application");

sap.ca.scfld.md.ConfigurationBase.extend("publicservices.her.mycourses.s1.Configuration", {
	oServiceParams: {
		serviceList: [{
			name: "Master_course",
			masterCollection: "CourseListSet",
			serviceUrl: publicservices.her.mycourses.s1.Component.getMetadata().getManifestEntry("sap.app").dataSources["Master_course"].uri,
			isDefault: true,
			mockedDataSource: jQuery.sap.getModulePath("publicservices.her.mycourses.s1") + "/" + publicservices.her.mycourses.s1.Component.getMetadata().getManifestEntry("sap.app").dataSources["Master_course"].settings.localUri
		}]
	},

	getServiceParams : function() {
		return this.oServiceParams;
	},

	/**
	 * @inherit
	 */
	getServiceList : function() {
		return this.getServiceParams().serviceList;
	},

	getMasterKeyAttributes : function() {
		//return the key attribute of your master list item
		return ["CourseId","ProgramStudyId"];
	}
});