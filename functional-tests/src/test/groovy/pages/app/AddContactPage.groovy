package pages.app

import pages.app.base.BaseAppPage

class AddContactPage extends BaseAppPage {
  static at = { pageTitle.text().startsWith("Add Contact") }
  static url = "/admin/user/create"
  static content = {
    pageTitle { $(".view-title-container h1") }

    CancelBtn { $(".actions").$("button", text:"Cancel") }
    SaveBtn { $(".actions").$("button", text:"Save") }
  }
}
