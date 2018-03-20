import base.LoggedInSpec

import pages.app.HomePage
import pages.app.LoginPage
import pages.app.MyProjectsPage
import pages.app.EmailTemplatesPage
import pages.app.OrganizationsPage
import pages.app.ActivitiesUpdatesPage
import pages.app.ValuedComponentsPage
import pages.app.ContactsPage
import pages.app.FieldManagementPage

import pages.app.modal.DayCalculatorModal
import pages.app.modal.EditSystemRolesModal
import pages.app.modal.EditSystemPermissionsModal
import pages.app.modal.EditProfileModal

import pages.external.ExternalLinkPage

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise
import spock.lang.Ignore

@Stepwise
@Title("Functional tests for the Home page")
class HomeSpec extends LoggedInSpec {
  @Unroll
  def "Navigate Page from: HomePage, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the HomePage"
      to HomePage
    when: "I click on the link #ItemSelector -> #SubItemSelector"
      headerModule.clickMenuItem(ItemSelector, SubItemSelector)
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ItemSelector           | SubItemSelector                    || AssertPage
      [text : "CALCULATOR"]  |  null                              || DayCalculatorModal
      [text : "MY PROJECTS"] |  null                              || MyProjectsPage
      [text : "SYSTEM"]      | [text : "Email Templates"]         || EmailTemplatesPage
      [text : "SYSTEM"]      | [text : "Organizations"]           || OrganizationsPage
      [text : "SYSTEM"]      | [text : "Activities & Updates"]    || ActivitiesUpdatesPage
      [text : "SYSTEM"]      | [text : "Valued Components"]       || ValuedComponentsPage
      [text : "SYSTEM"]      | [text : "Contacts"]                || ContactsPage
      [text : "SYSTEM"]      | [text : "Field Management"]        || FieldManagementPage
      [text : "SYSTEM"]      | [text : "Edit System Roles"]       || EditSystemRolesModal
      [text : "SYSTEM"]      | [text : "Edit System Permissions"] || EditSystemPermissionsModal
      [text : "ADMIN LOCAL"] | [text : "Edit Profile"]            || EditProfileModal
      [text : "ADMIN LOCAL"] | [text : "Log Out"]                 || new ExternalLinkPage("Government of British Columbia", "logon.gov.bc.ca")
      //TODO [text : "LOG IN"]         |  null                              || LoginSiteminderPage
  }

  @Ignore("TODO BrandBtn redirects to PROD public site")
  @Unroll
  def "Navigate Page from: HomePage, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the HomePage"
      to HomePage
    when: "I click on the #ClickLink"
      page."$ClickLink".click()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink  || AssertPage
      "BrandBtn" || HomePage
  }

  @Unroll
  def "Navigate Page from: HomePage, click footer Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the HomePage"
      to HomePage
    when: "I click on the #ClickLink"
      footerModule."$ClickLink".click()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink             || AssertPage
      "CopyrightLink"       || new ExternalLinkPage("Copyright - Province of British Columbia", "gov.bc.ca")
      "DisclaimerLink"      || new ExternalLinkPage("Disclaimer - Province of British Columbia", "gov.bc.ca")
      "PrivacyLink"         || new ExternalLinkPage("B.C. Government Website Privacy Statement - Province of British Columbia", "gov.bc.ca")
      "AccessibilityLink"   || new ExternalLinkPage("Web Accessibility - Province of British Columbia", "gov.bc.ca")
      //TODO redirects to PROD public site "ContactUsLink"       || ContactUsPage
      //TODO "LogInSiteminderLink" || LoginSiteminderPage
      //"LogInLocalLink"      || LoginPage
  }
}
