import geb.spock.GebReportingSpec

import fixtures.FixtureManager

import pages.app.LoginPage
import pages.app.HomePage
import pages.app.ForgotPasswordPage

import modules.FooterModule

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise
import spock.lang.Shared

@Stepwise
@Title("Functional tests for the Login page")
class LoginSpec extends GebReportingSpec {
  @Shared
  FixtureManager fixtureManager = new FixtureManager();

  def setupSpec() {
    fixtureManager.insertFixture("adminUser");
  }

  def setup() {
    clearCookies();
    module(FooterModule).logout();
  }

  def cleanupSpec() {
    fixtureManager.removeAll();
  }

  def "Navigate Page from: LoginPage, log in as Admin, Assert Page: HomePage"() {
    given: "I start on the LoginPage and am not logged in"
      to LoginPage
    when: "I log in as Admin"
      login("user-name", "password")
    then: "I am logged in and returned to the HomePage"
      at HomePage
  }

  @Unroll
  def "Navigate Page from: LoginPage, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the LoginPage"
      to LoginPage
    when: "I click on the #ClickLink"
      page."$ClickLink".click()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink           || AssertPage
      "ForgotPasswordBtn" || ForgotPasswordPage
  }
}
