import base.LoggedInSpec

import pages.app.modal.EditProfileModal
import pages.app.HomePage
import pages.app.OrganizationsPage
import pages.app.ContactsPage

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the EditProfile modal page")
class EditProfileSpec extends LoggedInSpec {
  @Unroll
  def "Start on Page #InitialPage, open modal: EditProfileModal, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the #InitialPage and open the modal EditProfileModal"
      to InitialPage
      page(EditProfileModal)
      page.open()
    when: "I click on the #ClickLink"
      assert modalModule.isOpen()
      page."$ClickLink".click()
      assert modalModule.isClosed()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      InitialPage       | ClickLink || AssertPage
      HomePage          | "XBtn"    || HomePage
      OrganizationsPage | "XBtn"    || OrganizationsPage
      ContactsPage      | "XBtn"    || ContactsPage
      //TODO could add every page, but is probably redundant
  }
}
