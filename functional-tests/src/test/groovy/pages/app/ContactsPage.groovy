package pages.app

import pages.app.base.BaseAppPage

class ContactsPage extends BaseAppPage {
  static at = { pageTitle.text().equals("Contacts") }
  static url = "/admin/user/list"
  static content = {
    pageTitle { $(".view-title-container h1") }

    AddNewContactBtn { $(".button-bar").$("a").has("span", text:"Add New Contact") }
  }
}
