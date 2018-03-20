package pages.app

import pages.app.base.BaseAppPage

class EditOrganizationPage extends BaseAppPage {
  static at = { pageTitle.text().startsWith("Edit Organization") }
  //TODO this url is dynamic depending on the project beign edited static url = "/admin/organization/*/edit" //TODO url contains org hash, can we assert on this with a * ?
  static content = {
    pageTitle { $(".view-title-container h1") }

    CancelBtn { $(".view-title-container .actions").$("button", text:"Cancel") }
    DeleteBtn { $(".view-title-container .actions").$("button").has("span", text:"Delete") }
    SaveBtn { $(".view-title-container .actions").$("button", text:"Save") }
  }
}
