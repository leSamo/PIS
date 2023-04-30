/// <reference types="cypress"/>


import Chance from 'chance';
const chance = new Chance() ;

describe('template spec', () => {

  const adminUsername = 'johnko';
  const adminPswd = 'pswd';

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  })

  it('Loads login screen', () => {
    cy.visit('http://localhost:3000/')
  })

  it('Login admin user', () => {
    //cy.get('#pf-c-button').click();
    cy.contains('Log in').click();

    cy.get('input[name=login-username]').type(adminUsername);
    cy.get('input[name=login-password]').type(adminPswd);

    cy.contains('Log in').click();

    cy.contains(adminUsername);

  })

})