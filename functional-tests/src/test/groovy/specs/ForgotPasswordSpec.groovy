import base.LoggedInSpec

import pages.app.ForgotPasswordPage
import pages.app.HomePage

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise
import spock.lang.Ignore

@Stepwise
@Title("Functional tests for the Forgot Password page")
class ForgotPasswordSpec extends LoggedInSpec {
  @Ignore("TODO: no tests yet")
  @Unroll
  def "Navigate Page from: ForgotPasswordPage, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the ForgotPasswordPage"
      to ForgotPasswordPage
    when: "I click on the #ClickLink"
      page."$ClickLink".click()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink           || AssertPage
  }
}
