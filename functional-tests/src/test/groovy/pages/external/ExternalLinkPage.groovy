package pages.external

import geb.Page
import geb.Browser

import geb.error.GebAssertionError
import org.openqa.selenium.NoSuchWindowException

/**
 * Generic page that represents an external page.
 * Use a new instance of this class in situations where the 'at' checker of a test will execute.
 * Example:
 *   at new ExternalLinkPage("window title", "gov.bc.ca")
 */
class ExternalLinkPage extends Page {
  private def windowTitle
  private def urlPart

  /**
   * @param windowTitle the browser window title
   * @param urlPart a string that will be asserted is contained in the url. Example: "gov.bc.ca"
   */
  ExternalLinkPage(windowTitle, urlPart) {
    this.windowTitle = windowTitle.trim()
    this.urlPart = urlPart.trim()
  }

  static at = {
    browser.withWindow({ title.trim().equals(windowTitle) }, close:browser.getAvailableWindows().size() > 1) {
    assert browser.getCurrentUrl().contains(urlPart)
    }
  }
}
