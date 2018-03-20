package modules

import geb.Module

/**
 * Contains objects and methods for interacting with the global footer bar.
 */
class FooterModule extends Module {
  static content = {
    HomeLink { $(".app-footer").$("a", text:"Home") }
    CopyrightLink { $(".app-footer").$("a", text:"Copyright") }
    DisclaimerLink { $(".app-footer").$("a", text:"Disclaimer") }
    PrivacyLink { $(".app-footer").$("a", text:"Privacy") }
    AccessibilityLink { $(".app-footer").$("a", text:"Accessibility") }
    ContactUsLink { $(".app-footer").$("a", text:"Contact Us") }
    LogInSiteminderLink(required: false) { $(".app-footer").$("a", text:"Log In (Siteminder)") }
    LogInLocalLink(required: false) { $(".app-footer").$("a", text:"Log In (Local)") }
    LogOutLink(required: false) { $(".app-footer").$("a", text:"Log Out") }
  }

  /**
   * Logs the user out, if they are logged in, by clicking the logout link in the footer.
   * Does nothing if the user is already logged in.
   */
  void logout() {
    if (isLoggedIn()) {
      LogOutLink.click()
    }
  }

  /**
   * Checks if the user is logged in based on the text of the footer login/logout links.
   * When not logged  in, the footer displays a "Log In (Local)" link.  When logged in, it displays a "Log Out" link.
   * @return true if the user is logged in, false otherwise.
   */
  boolean isLoggedIn() {
    return LogOutLink.displayed && !LogInLocalLink.displayed
  }
}
