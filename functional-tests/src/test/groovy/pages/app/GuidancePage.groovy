package pages.app

import pages.app.base.BaseAppPage

class GuidancePage extends BaseAppPage {
  static at = { pageTitle.text().equals("Guidance") }
  static url = "/guidance"
  static content = {
    pageTitle { $(".view-title-container h1") }
  }
}
