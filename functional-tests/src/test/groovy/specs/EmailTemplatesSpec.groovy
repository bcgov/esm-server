import base.LoggedInSpec

import pages.app.EmailTemplatesPage
import pages.app.AddEditEmailTemplatePage

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the EmailTemplates page")
class EmailTemplatesSpec extends LoggedInSpec {
  @Unroll
  def "Navigate Page from: EmailTemplatesPage, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the EmailTemplatesPage"
      to EmailTemplatesPage
    when: "I click on the #ClickLink"
      page."$ClickLink".click()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink             || AssertPage
      "AddEmailTemplateBtn" || AddEditEmailTemplatePage
  }
}
