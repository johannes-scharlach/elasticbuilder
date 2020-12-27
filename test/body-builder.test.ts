import BodyBuilder from '../src/body-builder';

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
          filter: [
            { term: { user: 'kimchy' } },
            { term: { user: 'herald' } },
          ],
          must: {
            match: {
              message: 'this is a test',
            },
          },
          must_not: { term: { user: 'cassie' } },
          should: { term: { user: 'johnny' } },
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
