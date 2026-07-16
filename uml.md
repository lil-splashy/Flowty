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

' ======== ABSTRACT SUPERCLASS ========
abstract class ToDoListItem {
    # id : Long
    # label : String
    # description : String
    # createdAt : DateTime
    # completed : Boolean
    # ownerId : Long
    + markComplete()
    + isDone() : Boolean
    + getContextMenu() : ContextMenu
}

' ======== SUBCLASSES ========
class Habit extends ToDoListItem {
    - frequency : String
    - active : Boolean
    - currentStreak : Integer
    - longestStreak : Integer
    + markComplete() : HabitCompletion
    + calculateStreak() : Integer
}

class PickerItem extends ToDoListItem {
    - isPredefined : Boolean
    - weight : Integer
    - pickerCategory : PickerCategory
    + getLabel() : String
}

' ======== UI COMPONENT ========
interface ContextMenu {
    + menuId : String
    + items : List<ContextMenuItem>
    + triggerElement : String
    + position : String
    + show(x : Integer, y : Integer)
    + hide()
    + addItem(item : ContextMenuItem)
    + removeItem(itemId : String)
    + setEnabled(itemId : String, enabled : Boolean)
    + isVisible() : Boolean
}

class ContextMenuItem {
    + id : String
    + label : String
    + icon : String
    + shortcut : String
    + enabled : Boolean
    + separator : Boolean
    + action() : void
    + render() : void
}

' ======== DOMAIN CLASSES ========
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
    + getContextMenu() : ContextMenu
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
    + getContextMenu() : ContextMenu
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
    + getContextMenu() : ContextMenu
}

' ======== RELATIONSHIPS ========
User "1" -- "0..*" ToDoListItem : owns
User "1" -- "0..*" HabitCompletion : records
User "1" -- "1" WorkspaceSettings : configures
User "1" -- "0..1" TimerConfig : personal
User "1" -- "0..*" PomodoroSession : history
User "1" -- "0..*" RewardTransaction : earns
User "1" -- "0..1" D20Picker : has default picker

Habit "1" -- "0..*" HabitCompletion : completions
Habit "1" -- "0..*" HabitProgress : progress history

HabitCompletion "1" -- "0..1" RewardTransaction : triggers (optional)
PomodoroSession "1" -- "0..1" RewardTransaction : triggers (optional)

D20Picker "1" -- "0..*" PickerItem : uses pool

' ======== CONTEXT MENU BINDINGS ========
ToDoListItem ..> ContextMenu : uses (inherited by subclasses)
HabitProgress ..> ContextMenu : uses
PomodoroSession ..> ContextMenu : uses
D20Picker ..> ContextMenu : uses
ContextMenu "1" *-- "0..*" ContextMenuItem

' ======== NOTES ========
note top of User
  Sign up / Login
  Holds reward balance.
end note

note right of ToDoListItem
  Common base for Habits & Chores
  Shared fields: label, description,
  completed, markComplete(), etc.
  Both Habit and PickerItem inherit
  from this class.
end note

note right of Habit
  Manage Habits / Mark Complete
  Extends ToDoListItem with
  frequency, streaks, and progress.
end note

note bottom of PickerItem
  Random Chore / Study item
  Extends ToDoListItem with
  weight (D20 slot) and category.
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
  Rolls a D20 and returns the
  PickerItem mapped to that number.
end note

note right of TimerConfig
  Pomodoro Timer configuration
  Personal work/break lengths.
end note

note top of ContextMenu
  Reusable UI component
  Right-click menus available on
  any ToDoListItem, PomodoroSession,
  HabitProgress, and D20Picker.
end note
@enduml