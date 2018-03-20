package modules

import geb.Module
import geb.Page

import modules.HeaderModule

/**
 * Contains objects and methods for interacting with the modal pages.
 */
class ModalModule extends Module {
  static content = {
    modalWindow(wait: 2, required: false) { $(".modal-content") }
  }

  boolean isOpen() {
    return waitFor { modalWindow.displayed }
  }

  boolean isClosed() {
    return waitFor { modalWindow.displayed == false }
  }
}
