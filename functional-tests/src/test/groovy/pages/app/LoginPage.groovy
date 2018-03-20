package pages.app

import pages.app.base.BaseAppPage

class LoginPage extends BaseAppPage {
  static at = { pageTitle.text().equals("Login") }
  static url = "/authentication/local/signin"
  static content = {
    pageTitle { $(".panel-title") }

    UsernameInput { $(".panel-body #username") }
    PasswordInput { $(".panel-body #password") }

    LogInBtn { $(".panel-body").$("button", text:"Login") }
    ForgotPasswordBtn { $(".panel-body").$("a", text:"Forgot your password?") }
  }

  /**
   * Logs the user in by populating the login page fields and clicking the login button.
   * Does nothing if the user is already logged in: @see FooterModule#isLoggedIn.
   * @param username the log in username
   * @param password the log in password
   */
  void login(String username, String password) {
    if(!footerModule.isLoggedIn()) {
      UsernameInput.value(username)
      PasswordInput.value(password)
      LogInBtn.click()
    }
  }

  /**
   * Convenience method that calls FooterModule#logout
   */
  void logout() {
    footerModule.logout()
  }
}
