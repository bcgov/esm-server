import geb.spock.GebReportingSpec

import pages.app.ForbiddenPage
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

import modules.FooterModule

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the Forbidden (no permissions) page")
class ForbiddenSpec extends GebReportingSpec {
  def setupSpec() {
    module(FooterModule).logout()
  }

  @Unroll
  def "Navigate to secure page: #SecurePage, Assert redirected to ForbiddenPage"() {
    given: "I am not logged in"
    when: "I navigate to a secure page url"
      go SecurePage.url
    then: "I am redirected to the ForbiddenPage"
      at ForbiddenPage
    where:
      SecurePage            | _
      //TODO Does not redirect to forbidden or not found page MyProjectsPage        | _
      EmailTemplatesPage    | _
      OrganizationsPage     | _
      ActivitiesUpdatesPage | _
      ValuedComponentsPage  | _
      ContactsPage          | _
      //TODO Redirects to "Page not Found" page FieldManagementPage   | _
  }
}
