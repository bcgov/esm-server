package pages.app

import pages.app.base.BaseAppPage

class AddEditProjectPage extends BaseAppPage {
  static at = { pageTitle.text().startsWith("Edit Project") }
  static url = "/p/new/edit"
  static content = {
    pageTitle { $(".main-panel .view-title-container").$("h1") }

    EditRolesLink { $(".sidenav-group").$("a").has("span", text:"Edit Roles") }
    EditPermissionsLink { $(".sidenav-group").$("a").has("span", text:"Edit Permissions") }

    HeaderCancelBtn { $(".actions").$("button", text:"Cancel") }
    HeaderSaveBtn { $(".actions").$("button", text:"Submit Project") }

    FooterCancelBtn { $(".form-footer").$("button", text:"Cancel") }
    FooterSaveBtn { $(".form-footer").$("button", text:"Submit Project") }
  }
}
