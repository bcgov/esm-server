package pages.app

import pages.app.base.BaseAppPage

class ForbiddenPage extends BaseAppPage {
  static at = { pageTitle.text().equals("Permission Denied") }
  static url = "/forbidden"
  static content = {
    pageTitle { $(".view-title-container h1") }
  }
}
