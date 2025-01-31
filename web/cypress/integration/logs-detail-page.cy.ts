import { TestIds } from '../../src/test-ids';
import { queryRangeStreamsValidResponse } from '../fixtures/query-range-fixtures';

const LOGS_DETAIL_PAGE_URL = '/k8s/ns/my-namespace/pods/test-pod-name';
const LOGS_DETAIL_PAGE_URL_OPENSHIFT_NS = '/k8s/ns/openshift-api/pods/test-pod-name';
const QUERY_RANGE_STREAMS_URL_MATCH =
  '/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/application/loki/api/v1/query_range?query=%7B*';
const QUERY_RANGE_STREAMS_INFRASTRUCTURE_URL_MATCH =
  '/api/proxy/plugin/logging-view-plugin/backend/api/logs/v1/infrastructure/loki/api/v1/query_range?query=%7B*';
const TEST_MESSAGE = "loki_1 | level=info msg='test log'";

describe('Logs Detail Page', () => {
  it('executes a query when "run query" is pressed', () => {
    cy.intercept(
      QUERY_RANGE_STREAMS_URL_MATCH,
      queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
    ).as('queryRangeStreams');

    cy.visit(LOGS_DETAIL_PAGE_URL);

    cy.getByTestId(TestIds.LogsTable)
      .should('exist')
      .within(() => {
        cy.contains(TEST_MESSAGE);
      });

    cy.getByTestId(TestIds.ExecuteQueryButton).click();

    cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  });

  it('executes a query with a new value when "Enter" is pressed on the query input field', () => {
    cy.intercept(
      QUERY_RANGE_STREAMS_URL_MATCH,
      queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
    ).as('queryRangeStreams');

    cy.visit(LOGS_DETAIL_PAGE_URL);

    cy.getByTestId(TestIds.LogsTable)
      .should('exist')
      .within(() => {
        cy.contains(TEST_MESSAGE);
      });

    cy.getByTestId(TestIds.ShowQueryToggle).click();

    cy.getByTestId(TestIds.LogsQueryInput).within(() => {
      cy.get('textarea')
        .type('{selectAll}')
        .type('{ job = "some_job" }', {
          parseSpecialCharSequences: false,
          delay: 1,
        })
        .type('{enter}');
    });

    cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  });

  it('executes a query when severity is changed', () => {
    cy.intercept(
      QUERY_RANGE_STREAMS_URL_MATCH,
      queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
    ).as('queryRangeStreams');

    cy.visit(LOGS_DETAIL_PAGE_URL);

    cy.getByTestId(TestIds.LogsTable)
      .should('exist')
      .within(() => {
        cy.contains(TEST_MESSAGE);
      });

    cy.getByTestId(TestIds.SeverityDropdown)
      .click()
      .within(() => {
        cy.contains('warning').click();
      });

    cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  });

  it('disables query executors when the query is empty', () => {
    cy.intercept(
      QUERY_RANGE_STREAMS_URL_MATCH,
      queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
    ).as('queryRangeStreams');

    cy.visit(LOGS_DETAIL_PAGE_URL);

    cy.getByTestId(TestIds.ShowQueryToggle).click();

    cy.getByTestId(TestIds.LogsQueryInput).within(() => {
      cy.get('textarea').clear();
    });

    cy.getByTestId(TestIds.ExecuteQueryButton).should('be.disabled');

    cy.getByTestId(TestIds.ToogleStreamingButton).should('be.disabled');

    cy.getByTestId(TestIds.SeverityDropdown).within(() => {
      cy.get('button').should('be.disabled');
    });
  });

  it('executes a query for the applications tenant based on the namespace', () => {
    cy.intercept(
      QUERY_RANGE_STREAMS_URL_MATCH,
      queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
    ).as('queryRangeStreams');

    cy.visit(LOGS_DETAIL_PAGE_URL);

    cy.getByTestId(TestIds.LogsTable)
      .should('exist')
      .within(() => {
        cy.contains(TEST_MESSAGE);
      });

    cy.get('@queryRangeStreams.all').should('have.length.at.least', 1);
  });

  it('executes a query for the infrastructure tenant based on the namespace', () => {
    cy.intercept(
      QUERY_RANGE_STREAMS_INFRASTRUCTURE_URL_MATCH,
      queryRangeStreamsValidResponse({ message: TEST_MESSAGE }),
    ).as('queryRangeStreamsInfrastructure');

    cy.visit(LOGS_DETAIL_PAGE_URL_OPENSHIFT_NS);

    cy.getByTestId(TestIds.LogsTable)
      .should('exist')
      .within(() => {
        cy.contains(TEST_MESSAGE);
      });

    cy.get('@queryRangeStreamsInfrastructure.all').should('have.length.at.least', 1);
  });
});
