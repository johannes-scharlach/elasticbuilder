import { BodyBuilder } from '../src';

describe('BodyBuilder', () => {
  test('bodyBuilder should combine queries, filters, aggregations', () => {
    const bb = new BodyBuilder();
    bb.query
      .must('match', 'message', 'this is a test')
      .filter('term', 'user', 'kimchy')
      .filter('term', 'user', 'herald')
      .should('term', 'user', 'johnny')
      .mustNot('term', 'user', 'cassie');
    bb.aggs.add('agg_terms_user', 'terms', 'user');
    const result = bb.build();

    expect(result).toEqual({
      query: {
        bool: {
          must: {
            match: {
              message: 'this is a test',
            },
          },
          filter: {
            bool: {
              must: [
                { term: { user: 'kimchy' } },
                { term: { user: 'herald' } },
              ],
              should: [{ term: { user: 'johnny' } }],
              must_not: [{ term: { user: 'cassie' } }],
            },
          },
        },
      },
      aggs: {
        agg_terms_user: {
          terms: {
            field: 'user',
          },
        },
      },
    });
  });
});
