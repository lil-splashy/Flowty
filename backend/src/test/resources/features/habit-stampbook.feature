Feature: Habit Tracker Stampbook
  As a user
  I want to track my daily habits, earn stamps and points for completing them, and build streaks
  So that I stay motivated and consistent with my goals

  Background:
    Given I am logged into Flowty

  Scenario: Create a new habit
    When I create a habit named "Meditate" with frequency "DAILY"
    Then a habit "Meditate" with frequency "DAILY" is created
    And the habit has current streak 0 and longest streak 0
    And the habit is not completed

  Scenario: Prevent duplicate habit names
    Given a habit named "Exercise" already exists
    When I try to create another habit named "Exercise"
    Then the system rejects the duplicate habit
    And an error message "A habit with this name already exists" is returned

  Scenario: Mark a habit as complete
    Given a habit "Read" with frequency "DAILY" exists
    When I mark the habit "Read" as complete
    Then the habit "Read" is completed
    And the current streak for "Read" is set to 1
    And a stamp is added to my active stamp card
    And a reward transaction for "Read" is recorded with 10 points

  Scenario: Consecutive daily completion builds streak
    Given a habit "Exercise" with frequency "DAILY" was completed yesterday
    And the current streak is 3
    When I mark the habit "Exercise" as complete today
    Then the current streak for "Exercise" is 4
    And the longest streak is updated to 4
    And another stamp is added to my active stamp card

  Scenario: Missing a day resets daily streak
    Given a habit "Journal" with frequency "DAILY" was last completed 2 days ago
    And the current streak was 5
    And the longest streak was 7
    When I mark the habit "Journal" as complete today
    Then the current streak for "Journal" is reset to 1
    And the longest streak remains 7

  Scenario: First-time completion sets initial streak
    Given a habit "Yoga" has never been completed
    When I mark the habit "Yoga" as complete today
    Then the current streak for "Yoga" is 1
    And the longest streak for "Yoga" is 1

  Scenario: Unmarking a habit as complete
    Given a habit "Read" is currently completed
    When I unmark the habit "Read"
    Then the habit "Read" is no longer completed
    And the streak values remain unchanged
    And no stamp is removed from the stamp card

  Scenario: Weekly habit keeps streak within 7-day window
    Given a habit "Laundry" with frequency "WEEKLY" was completed 5 days ago
    And the current streak is 2
    When I mark the habit "Laundry" as complete today
    Then the current streak for "Laundry" is 3

  Scenario: Weekly streak resets after missing a week
    Given a habit "Laundry" with frequency "WEEKLY" was completed 8 days ago
    And the current streak was 4
    When I mark the habit "Laundry" as complete today
    Then the current streak for "Laundry" is reset to 1

  Scenario: Stamp card fills up after 10 habit completions
    Given my active stamp card has 9 stamps
    When I complete a habit
    Then a 10th stamp is added to my stamp card
    And the stamp card shows 10/10 stamps
    And the "Redeem Reward" button is enabled
    And my total points have increased by 10

  Scenario: Redeem a full stamp card
    Given my active stamp card has 10 filled stamps
    When I redeem the stamp card
    Then the stamp card is marked as redeemed
    And a new empty stamp card is created for future stamps
    And a reward transaction for card redemption is recorded with 50 bonus points
    And my total points have increased by 50

  Scenario: Cannot redeem a partially filled stamp card
    Given my active stamp card has 5 stamps
    When I try to redeem the stamp card
    Then the system rejects the redemption
    And an error message "Card not yet full" is returned

  Scenario: Cannot add stamp to an already redeemed card
    Given my active stamp card is already redeemed
    When I complete a habit
    Then a stamp is added to a newly created stamp card
    And a reward transaction for the completed habit is recorded

  Scenario: View habit list with streak information
    Given I have habits "Read" (streak: 5), "Meditate" (streak: 12), and "Exercise" (streak: 0)
    When I view my habits list
    Then each habit displays its current streak count
    And habits with a streak show a flame icon next to the count

  Scenario: Reward transactions are preserved when a habit is deleted
    Given I have a habit "Morning Walk" that has earned 3 stamps
    When I delete the habit "Morning Walk"
    Then the habit is removed from my habit list
    And the habit's status is set to Deleted
    And the reward transactions for "Morning Walk" are preserved in my reward history

  Scenario: View reward transaction history
    Given I have completed several habits and redeemed a stamp card
    When I view my task rewards widget
    Then I see my total points displayed
    And I see recent reward transactions listed
    And each transaction shows the points earned

  Scenario: Total points accumulate across multiple cards
    Given I have redeemed 2 stamp cards (100 bonus points total)
    And I have earned 20 individual stamps (200 points from stamps)
    When I check my total points
    Then I have 300 total points