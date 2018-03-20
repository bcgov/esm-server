package pages.app

import pages.app.base.BaseAppPage

class FieldManagementPage extends BaseAppPage {
  static at = { pageTitle.text().equals("Field Management") }
  static url = "/admin/codelists"
  static content = {
    pageTitle { $(".view-title-container h1") }
  }
}
