import base.LoggedInSpec

import pages.app.MyProjectsPage
import pages.app.AddEditProjectPage

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the MyProjects page")
class MyProjectsSpec extends LoggedInSpec {
  @Unroll
  def "Navigate Page from: MyProjectsPage, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the MyProjectsPage"
      to MyProjectsPage
    when: "I click on the #ClickLink"
      page."$ClickLink".click()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink          || AssertPage
      "AddNewProjectBtn" || AddEditProjectPage
  }
}
