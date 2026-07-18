 describe('Patient Login Page', () => {
  var url = 'https://ca-qa.seamless.md/#/'
  beforeEach(() => {
    cy.visit(url)
  })

  it('renders the login form with expected elements', () => {
    // Check for the presence of email and password input fields and the login button
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('button[type="submit"]').contains('Login').should('be.visible')
  })

  it('shows validation when submitting with empty fields', () => {
  // Submit the form without filling in any fields
  cy.submitLogin()
  cy.get('[data-slot="error-message"]').should('have.length', 2)
  // Check that the error messages are displayed for both email and password fields
  cy.contains('[data-slot="error-message"]', 'Please enter your username').should('be.visible')
  cy.contains('[data-slot="error-message"]', 'Please enter your password').should('be.visible')
  cy.url().should('eq', url) // Ensure the URL has not changed
})

  it('shows an error message on failed login', () => {
    // Attempt to login with incorrect credentials
    cy.fillLoginForm('wrong@example.com', 'wrongpassword')
    cy.submitLogin()
    // Check that the error message is displayed
    cy.get('[role="alert"]').should('be.visible').and('contain.text', 'incorrect')
    cy.url().should('eq', url) // Ensure the URL has not changed
  })

  it('renders correctly on mobile viewport', () => {
    // Set the viewport to a mobile device size
    cy.viewport('iphone-x')
    // Check that the login form is still visible and functional
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
  })
})