package pages.app.modal

import pages.app.base.BaseAppPage

class DayCalculatorModal extends BaseAppPage {
  static at = { pageTitle.text().startsWith("Day Calculator") }
  static content = {
    pageTitle { $(".modal-header h3.modal-title") }

    ResetBtn { $(".modal-footer").$("button", text:"Reset") }
    CloseBtn { $(".modal-footer").$("button", text:"Close") }
    CalculateBtn { $(".modal-footer").$("button", text:"Calculate") }
  }

  /**
   * Performs the actions necessary to open the modal window.
   * Does nothing if the modal window is already open.
   */
  void open() {
    if (modalModule.isClosed()) {
      headerModule.clickMenuItem([text:"TOOLS"], [text:"Day Calculator"])
    }
  }
}
