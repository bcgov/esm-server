package pages.app

import pages.app.base.BaseAppPage

class HomePage extends BaseAppPage {
  static at = {
    if (welcomeModalGetStartedBtn.displayed) {
      welcomeModalGetStartedBtn.click()
    }
    pageTitle.text().equals("Environmental Assessments")
  }
  static url = ""
  static content = {
    pageTitle { $(".main-panel .panel-heading h2", 0) }

    welcomeModalGetStartedBtn(wait: 2, required: false) { $(".welcome-dialog .buttons").$("button") }
  }
}
