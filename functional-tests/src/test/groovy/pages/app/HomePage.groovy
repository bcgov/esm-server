package pages.app

import pages.app.base.BaseAppPage

class HomePage extends BaseAppPage {
  static at = {
    pageTitle.text().equals("Environmental Assessments")
  }
  static url = ""
  static content = {
    pageTitle { $(".main-panel .panel-heading h2", 0) }
  }
}
