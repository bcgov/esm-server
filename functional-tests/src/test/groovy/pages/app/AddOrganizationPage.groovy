package pages.app

import pages.app.base.BaseAppPage

class AddOrganizationPage extends BaseAppPage {
  static at = { pageTitle.text().startsWith("Add Organization") }
  static url = "/admin/organization/create"
  static content = {
    pageTitle { $(".view-title-container h1") }

    CancelBtn { $(".view-title-container .actions").$("button", text:"Cancel") }
    SaveBtn { $(".view-title-container .actions").$("button", text:"Save") }
  }
}
