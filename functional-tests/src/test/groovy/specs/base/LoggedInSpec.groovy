package base

import geb.spock.GebReportingSpec

import fixtures.FixtureManager

import pages.app.LoginPage
import pages.app.HomePage

import modules.FooterModule

import spock.lang.Shared

/**
 * Extend this class if the child spec requires the user to be logged in.
 */
abstract class LoggedInSpec extends GebReportingSpec {
  @Shared
  FixtureManager fixtureManager = new FixtureManager();

  /**
   * Runs once before all tests in a spec.
   */
  def setupSpec() {
    setupFixtures();

    to LoginPage
    login("user-name", "password");
    at HomePage
  }

  def setupFixtures() {
    fixtureManager.insertFixture("adminUser");
  }

  /**
   * Runs once after all tests in a spec.
   */
  def cleanupSpec() {
    clearCookies();
    module(FooterModule).logout();
    fixtureManager.removeAll();
  }
}
