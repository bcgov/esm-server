package modules

import geb.Module

/**
 * Contains objects and methods for interacting with the global header bar.
 */
class HeaderModule extends Module {
  static content = {
    BrandBtn { $(".navbar-brand") }

    navBar { $(".main-nav") }
  }

  /**
   * Moves to and clicks header menu items and drop down items.
   * @param [text:itemSelector] the dispalyed text of the header menu item
   * @param [text:subItemSelector] the displayed text of the header menu sub item (optional).
   *
   * If the itemSelector and subItemSelector are populated and exist, the subItemSelector will be clicked.
   * If the itemSelector is populated and exists, but the subItemSelector is null, then the itemSelector will be clicked.
   */
  void clickMenuItem(Map<String, Object> itemSelector, Map<String, Object> subItemSelector) {
    def navBarItem = navBar.$("li").has(itemSelector ,"a")
    interact {
      moveToElement(navBarItem)
    }
    if (subItemSelector == null) {
      navBarItem.click()
    } else {
      def subNavBarItem = navBarItem.$(subItemSelector, "a")
      if (subNavBarItem != null) {
        interact {
          moveToElement(subNavBarItem)
        }
        subNavBarItem.click()
      }
    }
  }
}
