package pages.app

import pages.app.base.BaseAppPage

class NewsPage extends BaseAppPage {
  static at = { pageTitle.text().equals("News & Announcements") }
  static url = "/news"
  static content = {
    pageTitle { $(".view-title-container h1") }
  }
}
