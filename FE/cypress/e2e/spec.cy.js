/// <reference types="cypress"/>


describe('Sanity check', () => {

  it('Loads login screen', () => {
    cy.visit('http://localhost:3000/')
  })
})



describe('Director (admin) functionality', function () {
  it('Login as admin', function () {
    cy.viewport(1419, 1206)
    cy.visit('http://localhost:3000/')
    cy.get('.pf-c-page__header > .pf-c-page__header-tools > .pf-l-split > .pf-l-split__item > .pf-c-button').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-username').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-username').type('director')
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-password').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-password').type('secretpswd')
    cy.get('.pf-c-backdrop > .pf-l-bullseye > #pf-modal-part-1 > .pf-c-modal-box__footer > .pf-m-primary').click()
  })


  it('Create and delete event', function () {
    cy.viewport(1419, 1206)
    cy.visit('http://localhost:3000/')
    cy.get('.pf-c-page__header > .pf-c-page__header-tools > .pf-l-split > .pf-l-split__item > .pf-c-button').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-username').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-username').type('director')
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-password').type('secretpswd')
    cy.get('.pf-c-backdrop > .pf-l-bullseye > #pf-modal-part-1 > .pf-c-modal-box__footer > .pf-m-primary').click()
    cy.get('li > .pf-c-alert > .pf-c-alert__action > .pf-c-button > svg').click()
    cy.get('.pf-c-card__body > #pf-random-id-5 > .pf-l-flex > div > .toolbar-create-event').click()
    cy.get('#pf-modal-part-5 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #event-name').click()
    cy.get('#pf-modal-part-5 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #event-name').type('abcdefgh')
    cy.get('.pf-l-split__item > .event-date-from > .pf-c-date-picker__input > .pf-c-input-group > .pf-c-form-control').click()
    cy.get('.event-date-from > .pf-c-date-picker__input > .pf-c-input-group > .pf-c-button > svg > path').click()
    cy.get('.pf-c-calendar-month__calendar > tbody > .pf-c-calendar-month__dates-row:nth-child(1) > .pf-c-calendar-month__dates-cell:nth-child(3) > .pf-c-calendar-month__date').click()
    cy.get('.event-date-to > .pf-c-date-picker__input > .pf-c-input-group > .pf-c-button > svg > path').click()
    cy.get('.pf-c-calendar-month__calendar > tbody > .pf-c-calendar-month__dates-row:nth-child(1) > .pf-c-calendar-month__dates-cell:nth-child(3) > .pf-c-calendar-month__date').click()
    cy.get('.event-time-to').click()
    cy.get('.event-time-to ').type('02:30')
    cy.get('.event-time-from').click()
    cy.get('.event-time-from ').type('01:30')
    cy.get('#pf-modal-part-5 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > .pf-c-tile:nth-child(3)').click()
    cy.get('.pf-c-backdrop > .pf-l-bullseye > #pf-modal-part-3 > .pf-c-modal-box__footer > .pf-m-primary').click()
    cy.wait(1000)
    cy.get('#week-split > div:nth-child(3) > div:nth-child(3) > .event').click()
    cy.get('.delete-event').click()
    cy.contains('abcdefgh').should('not.exist')
  })

  it('Create and delete user', function () {
    cy.viewport(1419, 1206)
    cy.visit('http://localhost:3000/')
    cy.get('.pf-c-page__header > .pf-c-page__header-tools > .pf-l-split > .pf-l-split__item > .pf-c-button').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-username').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-username').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-username').type('director')
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-password').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-password').type('secretpswd')
    cy.get('.pf-c-backdrop > .pf-l-bullseye > #pf-modal-part-1 > .pf-c-modal-box__footer > .pf-m-primary').click()
    cy.get('.pf-c-alert > .pf-c-alert__action > .pf-c-button > svg > path').click()
    cy.get('.pf-c-page__header-tools > .pf-l-split > .pf-l-split__item > a > .pf-c-button').click()
    cy.get('.pf-c-card > .pf-c-card__body > .pf-l-split > .pf-l-split__item > .pf-c-button').click()
    cy.get('#pf-modal-part-7 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #reg-username').click()
    cy.get('#pf-modal-part-7 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #reg-username').type('test')
    cy.get('#pf-modal-part-7 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #reg-fullname').click()
    cy.get('#pf-modal-part-7 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #reg-fullname').type('test')
    cy.get('#pf-modal-part-7 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #reg-email').click()
    cy.get('#pf-modal-part-7 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #reg-email').type('test@test.com')
    cy.get('.pf-c-form > .pf-c-form__group > .pf-c-form__group-control > .pf-c-input-group > #reg-password').click()
    cy.get('.pf-c-form > .pf-c-form__group > .pf-c-form__group-control > .pf-c-input-group > #reg-password').type('testtest')
    cy.get('.pf-c-select').click()
    cy.get('.pf-m-selected').click()
    cy.get('.pf-c-backdrop > .pf-l-bullseye > #pf-modal-part-5 > .pf-c-modal-box__footer > .pf-m-primary').click()
    cy.get('.pf-c-table > tbody > tr:nth-child(11) > td > .pf-m-danger').click()
    cy.contains('test@test.com').should('not.exist')
  })
})


describe('Assistant functionality', function () {
  it('Assistant - check assigned manager calendar.', function () {
    cy.viewport(1338, 1206)
    cy.visit('http://localhost:3000/')
    cy.get('.pf-c-page__header > .pf-c-page__header-tools > .pf-l-split > .pf-l-split__item > .pf-c-button').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-username').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-username').type('assistant3')
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-password').click()
    cy.get('#pf-modal-part-3 > .pf-c-form > .pf-c-form__group > .pf-c-form__group-control > #login-password').type('secretpswd')
    cy.get('.pf-c-backdrop > .pf-l-bullseye > #pf-modal-part-1 > .pf-c-modal-box__footer > .pf-m-primary').click()
    cy.get('.pf-c-select > .pf-c-select__toggle > #pf-select-toggle-id-8 > .pf-c-select__toggle-arrow > path').click()
    cy.get('.pf-c-select__menu-item').click()
    cy.get('#week-split > .pf-l-split__item:nth-child(4) > div:nth-child(2) > .event > b').click()
    cy.contains('email3').should('exist')

  })

})