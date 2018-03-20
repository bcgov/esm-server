package pages.app

import pages.app.base.BaseAppPage

class ActivitiesUpdatesPage extends BaseAppPage {
  static at = { pageTitle.text().equals("Activities & Updates") }
  static url = "/admin/recentactivity/list"
  static content = {
    pageTitle { $(".view-title-container h1") }

    AddActivitiesUpdateBtn { $(".button-bar").$("a").has("span", text:"Add Activity or Update") }
  }
}
