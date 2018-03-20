import base.LoggedInSpec

import pages.app.modal.EditSystemRolesModal
import pages.app.HomePage
import pages.app.MyProjectsPage
import pages.app.ContactsPage

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the EditSystemRoles modal page")
class EditSystemRolesSpec extends LoggedInSpec {
  @Unroll
  def "Start on Page #InitialPage, open modal: EditSystemRolesModal, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the #InitialPage and open the modal EditSystemRolesModal"
      to InitialPage
      page(EditSystemRolesModal)
      page.open()
    when: "I click on the #ClickLink"
      assert modalModule.isOpen()
      page."$ClickLink".click()
      assert modalModule.isClosed()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      InitialPage    | ClickLink || AssertPage
      HomePage       | "XBtn"    || HomePage
      MyProjectsPage | "XBtn"    || MyProjectsPage
      ContactsPage   | "XBtn"    || ContactsPage
      //TODO could add every page, but is probably redundant
  }
}
