import base.LoggedInSpec

import pages.app.ActivitiesUpdatesPage
import pages.app.AddEditActivityUpdatePage

import spock.lang.Unroll
import spock.lang.Title
import spock.lang.Stepwise

@Stepwise
@Title("Functional tests for the ActivitiesUpdates page")
class ActivitiesUpdatesSpec extends LoggedInSpec {
  @Unroll
  def "Navigate Page from: ActivitiesUpdatesPage, click Link: #ClickLink, Assert Page: #AssertPage"() {
    given: "I start on the ActivitiesUpdatesPage"
      to ActivitiesUpdatesPage
    when: "I click on the #ClickLink"
      page."$ClickLink".click()
    then: "I arrive on the #AssertPage page"
      at AssertPage
    where:
      ClickLink                || AssertPage
      "AddActivitiesUpdateBtn" || AddEditActivityUpdatePage
  }
}
