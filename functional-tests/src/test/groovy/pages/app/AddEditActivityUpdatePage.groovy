package pages.app

import pages.app.base.BaseAppPage

class AddEditActivityUpdatePage extends BaseAppPage {
  static at = { pageTitle.text().startsWith("Create/Edit Activity & Update") }
  static url = "/admin/recentactivity/create"
  static content = {
    pageTitle { $(".view-title-container h1") }

    CancelBtn { $(".actions").$("button", text:"Cancel") }
    SaveBtn { $(".actions").$("button", text:"Save") }
  }
}
