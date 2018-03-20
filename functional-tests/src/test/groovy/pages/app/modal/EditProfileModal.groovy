package pages.app.modal

import pages.app.base.BaseAppPage

class EditProfileModal extends BaseAppPage {
  static at = { pageTitle.text().startsWith("Edit Profile") }
  static content = {
    pageTitle { $(".modal-header h3.modal-title") }

    XBtn { $(".modal-header").$("button") }

    CancelBtn { $(".modal-footer").$("button", text:"Cancel") }
    SaveBtn { $(".modal-footer").$("button", text:"Save") }
  }

  /**
   * Performs the actions necessary to open the modal window.
   * Does nothing if the modal window is already open.
   */
  void open() {
    if (modalModule.isClosed()) {
      headerModule.clickMenuItem([text:"ADMIN LOCAL"], [text:"Edit Profile"])
    }
  }
}
