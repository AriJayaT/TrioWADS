describe('User Workflow', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/')
  })

  it('should complete the full user workflow', () => {
    // Registration
    cy.get('[data-cy=register-link]').click()
    cy.get('[data-cy=email-input]').type('test@example.com')
    cy.get('[data-cy=password-input]').type('password123')
    cy.get('[data-cy=confirm-password-input]').type('password123')
    cy.get('[data-cy=register-button]').click()
    
    // Verify registration success
    cy.url().should('include', '/login')
    
    // Login
    cy.get('[data-cy=email-input]').type('test@example.com')
    cy.get('[data-cy=password-input]').type('password123')
    cy.get('[data-cy=login-button]').click()
    
    // Verify login success
    cy.url().should('include', '/dashboard')
    
    // Create and submit ticket
    cy.get('[data-cy=create-ticket-button]').click()
    cy.get('[data-cy=ticket-subject]').type('Test Ticket')
    cy.get('[data-cy=ticket-description]').type('This is a test ticket description')
    cy.get('[data-cy=submit-ticket-button]').click()
    
    // Verify ticket submission
    cy.get('[data-cy=success-message]').should('be.visible')
    cy.get('[data-cy=ticket-list]').should('contain', 'Test Ticket')
  })
}) 