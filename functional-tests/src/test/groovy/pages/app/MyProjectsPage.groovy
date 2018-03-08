package pages.app

import pages.app.base.BaseAppPage

class MyProjectsPage extends BaseAppPage {
  static at = { pageTitle.text().equals("My Projects") }
  static url = "/dashboard"
  static content = {
    pageTitle { $(".view-title-container h1") }

    AddNewProjectBtn { $(".actions").$("a").has("span", text:"Add New Project") }
  }
}
