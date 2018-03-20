package base

import geb.spock.GebReportingSpec

import pages.app.LoginPage
import pages.app.HomePage

import modules.FooterModule

/**
 * Extend this class if the child spec requires the user to be logged in.
 */
abstract class LoggedInSpec extends GebReportingSpec {
  /**
   * Runs once before all tests in a spec.
   */
  def setupSpec() {
    to LoginPage
    login("admin", System.getenv("ADMINPW"))
    at HomePage
  }

  /**
   * Runs once after all tests in a spec.
   */
  def cleanupSpec() {
    clearCookies()
    module(FooterModule).logout()
  }
}
