describe('Admin Workflow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should complete the full admin workflow', () => {
    // Click "Sign In"
    cy.get('[data-cy=sign-in-button]').click()

    // Select "Admin" on the version select page
    cy.get('[data-cy=admin-select]').click()

    // Now on /admin/login, fill in the login form
    cy.get('[data-cy=email-input]').type('admin@example.com')
    cy.get('[data-cy=password-input]').type('admin123')
    cy.get('[data-cy=login-button]').click()

    // Dashboard: Check for system overview metrics
    cy.contains('Dashboard').should('be.visible')
    cy.contains('System Overview').should('be.visible')
    cy.contains('Agent Performance').should('be.visible')
    cy.contains('Ticket Distribution').should('be.visible')

    // Navigate to Analytics (assume sidebar or nav link exists)
    cy.contains('Analytics').click()
    cy.contains('Analytics').should('be.visible')
    cy.contains('Customer Satisfaction').should('exist')
    cy.contains('Total Tickets').should('exist')

    // Navigate to Agent Management (assume sidebar or nav link exists)
    cy.contains('Agent Management').click()
    cy.contains('Support Agents').should('be.visible')
    // cy.get('[data-cy=agent-list]').should('be.visible') // Add data-cy in your code for more robust selection

    // Navigate to Ticket List (assume sidebar or nav link exists)
    cy.contains('Tickets').click()
    cy.contains('All Tickets').should('be.visible')
    // cy.get('[data-cy=admin-ticket-list]').should('be.visible') // Add data-cy in your code for more robust selection
  })
}) 