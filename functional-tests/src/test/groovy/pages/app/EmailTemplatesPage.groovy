package pages.app

import pages.app.base.BaseAppPage

class EmailTemplatesPage extends BaseAppPage {
  static at = { pageTitle.text().equals("Email Templates") }
  static url = "/admin/emailtemplate/list"
  static content = {
    pageTitle { $(".view-title-container h1") }

    AddEmailTemplateBtn { $(".button-bar").$("a").has("span", text:"Add Email Template") }
  }
}
