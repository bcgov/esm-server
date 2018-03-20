package pages.app.modal

import pages.app.base.BaseAppPage

class EditPermissionsModal extends BaseAppPage {
  static at = { pageTitle.text().startsWith("Edit Permissions") }
  static content = {
    pageTitle { $(".modal-header h3.modal-title") }

    XBtn { $(".modal-header").$("button") }

    CancelBtn { $(".modal-footer").$("button", text:"Cancel") }
    OKBtn { $(".modal-footer").$("button", text:"OK") }
  }
}
