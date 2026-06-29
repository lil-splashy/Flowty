@startuml
' ======== ENUMERATIONS ========
enum RewardReason {
    HABIT_COMPLETION
    POMODORO_COMPLETION
    STREAK_BONUS
    OTHER
}

enum PickerCategory {
    CHORE
    STUDY
    MIXED
}

enum SessionType {
    Work
    ShortBreak
    LongBreak
}

' ======== CLASSES ========
class User {
    - id : Long
    - username : String
    - email : String
    - passwordHash : String
    - rewardBalance : Integer
    + register()
    + login()
    + adjustRewardPoints(amount)
}

class Habit {
    - id : Long
    - name : String
    - description : String
    - frequency : String
    - active : Boolean
    - currentStreak : Integer
    - longestStreak : Integer
    + markComplete() : HabitCompletion
    + calculateStreak() : Integer
}

class HabitCompletion {
    - id : Long
    - completedAt : DateTime
    - habitId : Long
    - userId : Long
    + recordCompletion()
}

class HabitProgress {
    - date : Date
    - completionCount : Integer
    - target : Integer
    - streak : Integer
    + getProgressPercent() : Double
}

class WorkspaceSettings {
    - id : Long
    - theme : String
    - layout : String
    - soundEnabled : Boolean
    - userId : Long
    + updateTheme(theme)
    + saveLayout(layout)
}

class TimerConfig {
    - id : Long
    - workMinutes : Integer
    - shortBreakMinutes : Integer
    - longBreakMinutes : Integer
    - longBreakInterval : Integer
    - autoStartBreak : Boolean
    + getDurations() : Map
}

class PomodoroSession {
    - id : Long
    - startTime : DateTime
    - endTime : DateTime
    - type : SessionType
    - completed : Boolean
    + start()
    + stop()
    + calculateReward() : Integer
}

class RewardTransaction {
    - id : Long
    - userId : Long
    - amount : Integer
    - reason : RewardReason
    - referenceId : Long
    - timestamp : DateTime
    + create()
}

class D20Picker {
    - pickerCategory : PickerCategory
    - rollResult : Integer
    + addItem(item : PickerItem)
    + removeItem(itemId : Long)
    + roll() : PickerItem
}

class PickerItem {
    - id : Long
    - label : String
    - isPredefined : Boolean
    - weight : Integer
    - ownerId : Long
    + getLabel() : String
}

' ======== RELATIONSHIPS ========
User "1" -- "0..*" Habit
User "1" -- "0..*" HabitCompletion
User "1" -- "1" WorkspaceSettings
User "1" -- "0..1" TimerConfig
User "1" -- "0..*" PomodoroSession
User "1" -- "0..*" RewardTransaction
User "1" -- "0..1" D20Picker

Habit "1" -- "0..*" HabitCompletion
Habit "1" -- "0..*" HabitProgress

HabitCompletion "1" -- "0..1" RewardTransaction
PomodoroSession "1" -- "0..1" RewardTransaction

D20Picker "1" -- "0..*" PickerItem

' ======== NOTES (purely textual) ========
note top of User
  Sign up / Login
  Holds reward balance.
end note

note right of Habit
  Manage Habits / Mark Complete
  Marking triggers HabitCompletion
  and optionally RewardTransaction.
end note

note bottom of HabitProgress
  View Progress
  Aggregated daily/weekly stats.
end note

note left of RewardTransaction
  Earn Rewards
  From habit completions,
  pomodoro sessions, streaks.
end note

note bottom of WorkspaceSettings
  Workspace Customization
  Theme, layout, sounds.
end note

note bottom of D20Picker
  Random Chore / Study picker
  Uses a D20 roll to select an item
  from a weighted pool.
end note

note right of TimerConfig
  Pomodoro Timer configuration
  Personal work/break lengths.
end note
@enduml