package pages.app

import pages.app.base.BaseAppPage

class OrganizationsPage extends BaseAppPage {
  static at = { pageTitle.text().equals("Organizations") }
  static url = "/admin/organization/list"
  static content = {
    pageTitle { $(".view-title-container h1") }

    AddOrganizationBtn { $(".button-bar").$("a").has("span", text:"Add Organization") }
  }
}
