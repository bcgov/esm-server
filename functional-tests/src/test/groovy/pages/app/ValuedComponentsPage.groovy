package pages.app

import pages.app.base.BaseAppPage

class ValuedComponentsPage extends BaseAppPage {
  static at = { pageTitle.text().equals("Valued Components Library") }
  static url = "/admin/topic/list"
  static content = {
    pageTitle { $(".view-title-container h1") }

    AddValuedComponentBtn { $(".button-bar").$("a").has("span", text:"Add Valued Component") }
  }
}
