import base.LoggedInSpec

import pages.app.ContactsPage
import pages.app.AddContactPage

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the Contacts page")
class ContactsSpec extends LoggedInSpec {
  @Unroll
  def "Navigate Page from: ContactsPage, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the ContactsPage"
      to ContactsPage
    when: "I click on the #ClickLink"
      page."$ClickLink".click()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink          || AssertPage
      "AddNewContactBtn" || AddContactPage
  }
}
