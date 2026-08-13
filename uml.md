@startuml
' ======== ENUMERATIONS ========
enum TransactionType {
    STAMP_EARNED
    CARD_REDEEMED
}

enum TimerMode {
    WORK
    BREAK
}

' ======== DOMAIN ENTITIES ========
abstract class ToDoListItem {
    - id : Long
    - title : String
    - description : String
    - completed : Boolean
    - createdAt : LocalDateTime
    - updatedAt : LocalDateTime
    + markComplete()
    + markIncomplete()
}

class User {
    - id : UUID
    - username : String
    - email : String
    - password : String
    - createdAt : Instant
    - totalPoints : int
}

class HabitItem extends ToDoListItem {
    - frequency : String
    - currentStreak : Integer
    - longestStreak : Integer
    - active : Boolean
    - lastCompletedDate : LocalDate
}

class ChoreItem extends ToDoListItem {
    - rollNumber : Integer
    - category : String
    - estimatedMinutes : Integer
}

class StampCard {
    - id : UUID
    - totalStamps : int
    - redeemed : boolean
    - createdAt : Instant
}

class StampSlot {
    - id : Long
    - slotNumber : int
    - filled : boolean
    - filledAt : Instant
    + recordCompletion()
}

class RewardTransaction {
    - id : Long
    - habitName : String
    - type : TransactionType
    - points : int
    - createdAt : Instant
}

class TimerState <<singleton>> {
    - id : Long = 1
    - workDuration : int
    - workRemaining : int
    - breakDuration : int
    - breakRemaining : int
    - mode : TimerMode
    - running : boolean
    - completedSessions : int
    - lastTick : Instant
}

' ======== REPOSITORY LAYER ========
interface UserRepository {
    + findByUsername(username) : Optional<User>
    + findByEmail(email) : Optional<User>
    + existsByUsername(username) : boolean
    + existsByEmail(email) : boolean
}

interface ToDoListItemRepository {
    + findChoreItemsByUserOrderByRollNumberAsc(user) : List<ChoreItem>
}

interface StampCardRepository {
    + findByUserOrderByCreatedAtDesc(user) : List<StampCard>
    + findFirstByUserAndRedeemedFalseOrderByCreatedAtDesc(user) : Optional<StampCard>
}

interface TimerStateRepository {
}

interface RewardTransactionRepository {
    + findByUserOrderByCreatedAtDesc(user) : List<RewardTransaction>
}

' ======== SERVICE LAYER ========
class AuthService {
    + signup(request : SignUpRequest) : AuthResponse
    + login(request : LoginRequest) : AuthResponse
    + getCurrentUser(username) : AuthResponse
}

class HabitService {
    + getUserHabits(username) : List<HabitResponse>
    + createHabit(username, request) : HabitResponse
    + updateHabit(username, id, request) : HabitResponse
    + toggleComplete(username, id) : HabitResponse
    + deleteHabit(username, id)
    - updateStreak(habit : HabitItem)
}

class ChoreService {
    + getUserChores(username) : List<ChoreResponse>
    + createChore(username, request) : ChoreResponse
    + updateChore(username, choreId, request) : ChoreResponse
    + toggleComplete(username, choreId) : ChoreResponse
    + deleteChore(username, choreId)
}

class StampCardService {
    + getUserStampCards(username) : List<StampCardResponse>
    + getUserRewardTransactions(username) : List<RewardTransactionResponse>
    + getOrCreateActiveCard(username) : StampCardResponse
    + addStamp(username, cardId) : StampCardResponse
    + addStampForHabitCompletion(username, habitId)
    + redeemCard(username, cardId) : StampCardResponse
}

class TimerService {
    + getState() : TimerStateDto
    + start()
    + pause()
    + reset()
    + clearSessions()
    + editDuration(seconds)
}

' ======== CONTROLLER LAYER ========
class AuthController {
    + POST /api/auth/signup
    + POST /api/auth/login
    + GET /api/auth/me
}

class HabitController {
    + GET /api/habits
    + POST /api/habits
    + PUT /api/habits/{id}
    + PATCH /api/habits/{id}/toggle
    + DELETE /api/habits/{id}
}

class ChoreController {
    + GET /api/chores
    + POST /api/chores
    + PATCH /api/chores/{id}/complete
    + PUT /api/chores/{id}
    + DELETE /api/chores/{id}
}

class StampCardController {
    + GET /api/stampcards
    + GET /api/stampcards/active
    + GET /api/stampcards/transactions
    + POST /api/stampcards/{cardId}/stamp
    + POST /api/stampcards/{cardId}/redeem
}

class TimerController {
    + GET /api/timer/state
    + POST /api/timer/start
    + POST /api/timer/pause
    + POST /api/timer/reset
    + POST /api/timer/clear
    + POST /api/timer/edit
}

' ======== SECURITY LAYER ========
class JwtTokenProvider {
    + generateToken(username) : String
    + validateToken(token) : boolean
    + getUsernameFromToken(token) : String
}

class JwtAuthenticationFilter {
}

class UserDetailsServiceImpl {
    + loadUserByUsername(username) : UserDetails
}

' ======== DTOs ========
class SignUpRequest {
    + username : String
    + email : String
    + password : String
}

class LoginRequest {
    + username : String
    + password : String
}

class AuthResponse {
    + token : String
    + username : String
    + email : String
    + totalPoints : int
}

class HabitRequest {
    + name : String
    + description : String
    + frequency : String
}

class HabitResponse {
    + id : Long
    + name : String
    + description : String
    + frequency : String
    + completed : Boolean
    + currentStreak : Integer
    + longestStreak : Integer
}

class ChoreRequest {
    + rollNumber : Integer
    + description : String
    + category : String
}

class ChoreResponse {
    + id : Long
    + rollNumber : Integer
    + description : String
    + category : String
    + completed : Boolean
}

class StampCardResponse {
    + id : UUID
    + totalStamps : int
    + redeemed : boolean
    + slots : List<StampSlotResponse>
}

class StampSlotResponse {
    + slotNumber : int
    + filled : boolean
}

class RewardTransactionResponse {
    + id : Long
    + type : TransactionType
    + points : int
    + habitName : String
    + createdAt : Instant
}

class TimerStateDto {
    + workDuration : int
    + workRemaining : int
    + breakDuration : int
    + breakRemaining : int
    + mode : TimerMode
    + running : boolean
    + completedSessions : int
    + timerDisplay : String
    + progress : double
    + isBreak : boolean
    + from(state : TimerState) : TimerStateDto
}

' ======== ENTITY RELATIONSHIPS ========
User "1" -- "0..*" ToDoListItem : owns
User "1" -- "0..*" StampCard : earns
User "1" -- "0..*" RewardTransaction : history

ToDoListItem "1" <|-- "0..*" HabitItem : discriminator "HABIT"
ToDoListItem "1" <|-- "0..*" ChoreItem : discriminator "CHORE"

StampCard "1" *-- "0..*" StampSlot : slots
StampSlot "0..*" --> "0..1" HabitItem : completed habit

RewardTransaction "0..*" --> "0..1" HabitItem : references
RewardTransaction "0..*" --> "0..1" StampCard : card
RewardTransaction "0..*" --> "0..1" StampSlot : slot

HabitItem "1" -- "0..*" StampSlot : fills

' ======== SERVICE DEPENDENCIES ========
AuthService --> UserRepository
AuthService --> JwtTokenProvider
HabitService --> ToDoListItemRepository
HabitService --> StampCardService
ChoreService --> ToDoListItemRepository
StampCardService --> StampCardRepository
StampCardService --> RewardTransactionRepository
TimerService --> TimerStateRepository

HabitService --> HabitRequest
HabitService --> HabitResponse
ChoreService --> ChoreRequest
ChoreService --> ChoreResponse
AuthService --> SignUpRequest
AuthService --> LoginRequest
AuthService --> AuthResponse
StampCardService --> StampCardResponse
StampCardService --> StampSlotResponse
StampCardService --> RewardTransactionResponse

' ======== CONTROLLER DEPENDENCIES ========
AuthController ..> AuthService : delegates
HabitController ..> HabitService : delegates
ChoreController ..> ChoreService : delegates
StampCardController ..> StampCardService : delegates
TimerController ..> TimerService : delegates

' ======== SECURITY DEPENDENCIES ========
JwtAuthenticationFilter --> JwtTokenProvider
JwtAuthenticationFilter --> UserDetailsServiceImpl
UserDetailsServiceImpl --> UserRepository

' ======== NOTES ========
note top of User
  Core identity entity.
  Holds reward point balance (totalPoints).
  UUID primary key generated server-side.
end note

note top of ToDoListItem
  Abstract base entity using SINGLE_TABLE
  inheritance. Discriminator column: item_type.
  HabitItem and ChoreItem share the 
  todo_list_items table.
end note

note right of HabitItem
  DiscriminatorValue = "HABIT".
  Supports DAILY / WEEKLY / CUSTOM frequency.
  Soft-delete via active = false.
  Streak tracking: currentStreak, longestStreak,
  lastCompletedDate.
end note

note right of ChoreItem
  DiscriminatorValue = "CHORE".
  Category values: CHORE, STUDY, LEGENDARY.
  rollNumber maps to a D20 slot (1–20).
  20 predefined items seeded by DataInitializer.
end note

note bottom of StampCard
  Gamification: 10 slots per card.
  Each habit completion fills one slot
  (10 pts per stamp).
  Full card (10/10) can be redeemed for
  bonus 50 pts.
end note

note right of RewardTransaction
  TransactionType enum:
  - STAMP_EARNED: 10 points per stamp
  - CARD_REDEEMED: 50 bonus points
  Denormalized habitName for display.
end note

note bottom of TimerState
  Singleton row (id=1).
  Not user-scoped — server-wide timer.
  Frontend PomodoroTimer runs independently
  (no server-sync for ticks).
end note

note right of JwtAuthenticationFilter
  Stateless JWT auth via Bearer token.
  Filter runs before UsernamePasswordAuthenticationFilter.
  Sets SecurityContext from validated token.
end note

note right of HabitService
  toggleComplete() also triggers
  StampCardService.addStampForHabitCompletion()
  for automatic stamp-card gamification.
end note

' ======== FRONTEND ARCHITECTURE ========
component AuthContext [
    AuthProvider (React Context)
    --
    user / token / isLoading
    login() / signup() / logout()
]

component Dashboard [
    Dashboard Page (/)
    --
    PomodoroTimer
    ToDoList (chores)
    HabitList
    Stampbook
    ChoreTable (static)
    WhiteNoisePlayer
    ProfileSettings
    Journal
]

package "Frontend Widgets" {
    component PomodoroTimer [
        PomodoroTimer
        --
        Client-side only (no API)
        workRemaining / breakRemaining
        isRunning / completedSessions
        SVG progress ring
    ]

    component HabitList [
        HabitList
        --
        GET /api/habits
        POST /api/habits
        PATCH /api/habits/{id}/toggle
        DELETE /api/habits/{id}
        Streak indicators
    ]

    component ToDoList [
        ToDoList (Chores)
        --
        GET /api/chores
        PATCH /api/chores/{id}/complete
        D20 roll animation
    ]

    component Stampbook [
        Stampbook
        --
        GET /api/stampcards/active
        POST /api/stampcards/{cardId}/redeem
        2x5 slot grid + progress bar
    ]

    component WhiteNoisePlayer [
        WhiteNoisePlayer
        --
        Local audio playback
        5 sounds via localStorage
    ]
}

AuthContext --> ToDoList : API calls
AuthContext --> HabitList : API calls
AuthContext --> Stampbook : API calls
Dashboard *-- PomodoroTimer
Dashboard *-- ToDoList
Dashboard *-- HabitList
Dashboard *-- Stampbook
Dashboard *-- WhiteNoisePlayer

@enduml