import base.LoggedInSpec

import pages.app.AddEditProjectPage
import pages.app.HomePage

import pages.app.modal.EditRolesModal
import pages.app.modal.EditPermissionsModal

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the AddEditProject page")
class AddEditProjectSpec extends LoggedInSpec {
  @Unroll
  def "Navigate Page from: AddEditProjectPage, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the AddEditProjectPage"
      to AddEditProjectPage
    when: "I click on the #ClickLink"
      page."$ClickLink".click()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink             || AssertPage
      "EditRolesLink"       || EditRolesModal
      "EditPermissionsLink" || EditPermissionsModal
      "HeaderCancelBtn"     || HomePage
      "FooterCancelBtn"     || HomePage
  }
}
