package pages.app.modal

import pages.app.base.BaseAppPage

class EditSystemRolesModal extends BaseAppPage {
  static at = { pageTitle.text().startsWith("Edit Roles") }
  static content = {
    pageTitle { $(".modal-header h3.modal-title") }

    XBtn { $(".modal-header").$("button") }

    CancelBtn { $(".modal-footer").$("button", text:"Cancel") }
    OKBtn { $(".modal-footer").$("button", text:"OK") }
  }

  /**
   * Performs the actions necessary to open the modal window.
   * Does nothing if the modal window is already open.
   */
  void open() {
    if (modalModule.isClosed()) {
      headerModule.clickMenuItem([text:"SYSTEM"], [text:"Edit System Roles"])
    }
  }
}
