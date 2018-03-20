package pages.app

import pages.app.base.BaseAppPage

class AddEditEmailTemplatePage extends BaseAppPage {
  static at = { pageTitle.text().equals("Add/Edit Email Template") }
  static url = "/admin/emailtemplate/create"
  static content = {
    pageTitle { $(".view-title-container h1") }

    CancelBtn { $(".actions").$("button", text:"Cancel") }
    SaveBtn { $(".actions").$("button", text:"Save") }
  }
}
