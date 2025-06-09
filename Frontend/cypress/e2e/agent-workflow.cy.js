describe('Agent Workflow', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/')
  })

  it('should complete the full agent workflow', () => {
    // Go to landing page
    cy.visit('/')

    // Click "Sign In"
    cy.get('[data-cy=sign-in-button]').click()

    // Select "Agent" on the version select page
    cy.get('[data-cy=agent-select]').click()

    // Now on /agent/login, fill in the login form
    cy.get('[data-cy=email-input]').type('agent@example.com')
    cy.get('[data-cy=password-input]').type('agent123')
    cy.get('[data-cy=login-button]').click()
    
    // Verify login success
    cy.url().should('include', '/agent-dashboard')
    
    // View tickets
    cy.get('[data-cy=ticket-list]').should('be.visible')
    cy.get('[data-cy=ticket-item]').first().click()
    
    // Respond to ticket
    cy.get('[data-cy=response-input]').type('Thank you for your ticket. We are working on it.')
    cy.get('[data-cy=send-response-button]').click()
    
    // Verify response was sent
    cy.get('[data-cy=response-list]').should('contain', 'Thank you for your ticket')
    
    // Close ticket
    cy.get('[data-cy=close-ticket-button]').click()
    cy.get('[data-cy=close-reason-input]').type('Issue resolved')
    cy.get('[data-cy=confirm-close-button]').click()
    
    // Verify ticket is closed
    cy.get('[data-cy=ticket-status]').should('contain', 'Closed')
  })
}) 