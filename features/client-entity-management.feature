Feature: Client and Entity Management
  As an operator user
  I want to manage clients and entities in the Account Management system
  So that I can create and verify new clients and entities

  @smoke @client-management
  Scenario: Create a new client and entity with timestamp-based naming
    Given a user navigates to the application
    When the user logs in as an operator
    And the user opens the sidebar menu
    And the user accesses Account Management under the Clients tab
    And the user generates a unique client name with timestamp
    And the user checks if the client already exists in the client table
    When the client does not exist
    Then the user creates a new client with Intermediary type
    And the user verifies the newly created client appears in the client table
    When the user switches to the Entities tab
    And the user creates a new entity with Corporate type
    And the user fills all mandatory fields and submits the entity
    Then the user verifies the entity is successfully saved
    And the user verifies the entity appears in the entity table
    And the user verifies the entity status is under_review

  @negative @client-management
  Scenario: Attempt to create a client with invalid data
    Given a user navigates to the application
    When the user logs in as an operator
    And the user opens the sidebar menu
    And the user accesses Account Management under the Clients tab
    When the user attempts to create a client with empty name
    Then the user should see validation errors
    And the client should not be created

  @edge-case @entity-management
  Scenario: Create entity without selecting a client
    Given a user navigates to the application
    When the user logs in as an operator
    And the user opens the sidebar menu
    And the user accesses Account Management under the Clients tab
    And the user switches to the Entities tab
    When the user attempts to create an entity without selecting a client
    Then the user should see client selection validation error
    And the entity should not be created
