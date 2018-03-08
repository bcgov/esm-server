package pages.app

import pages.app.base.BaseAppPage

class ForgotPasswordPage extends BaseAppPage {
  static at = { pageTitle.text().equals("Restore your password") }
  static url = "/password/forgot"
  static content = {
    pageTitle { $(".panel-heading h3") }

    UsernameInput { $(".panel-body #username") }

    SubmitBtn { $(".panel-body").$("button", text:"Submit") }
  }
}
