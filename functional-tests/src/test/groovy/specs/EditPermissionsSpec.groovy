import base.LoggedInSpec

import pages.app.AddEditProjectPage

import pages.app.modal.EditPermissionsModal

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the EditPermissions modal page")
class EditPermissionsSpec extends LoggedInSpec {
  @Unroll
  def "Start on Page AddEditProjectPage, open modal: EditPermissionsModal, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the AddEditProjectPage and open the modal EditPermissionsModal"
      to AddEditProjectPage
      page.EditPermissionsLink.click()
      page(EditPermissionsModal)
    when: "I click on the #ClickLink"
      assert modalModule.isOpen()
      page."$ClickLink".click()
      assert modalModule.isClosed()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink || AssertPage
      "XBtn"    || AddEditProjectPage
  }
}
