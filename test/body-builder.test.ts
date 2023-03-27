import bodyBuilder from '../src/body-builder';

describe('BodyBuilder', () => {
  test('bodyBuilder should combine queries, filters, aggregations', () => {
    const bb = bodyBuilder();
    bb.must('match', 'message', 'this is a test')
      .filter('term', 'user', 'kimchy')
      .filter('term', 'user', 'herald')
      .should('term', 'user', 'johnny')
      .mustNot('term', 'user', 'cassie')
      .aggregation('agg_terms_user', 'terms', 'user')
      .aggregation(
        'agg_diversified_sampler_user.id',
        'diversified_sampler',
        {
          field: 'user.id',
          shard_size: 200,
        },
        bodyBuilder({
          aggs: {
            keywords: {
              significant_terms: {
                field: 'text',
              },
            },
          },
        })
      );
    const result = bb.build();

    expect(result).toEqual({
      query: {
        bool: {
          filter: [{ term: { user: 'kimchy' } }, { term: { user: 'herald' } }],
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
        'agg_diversified_sampler_user.id': {
          diversified_sampler: {
            field: 'user.id',
            shard_size: 200,
          },
          aggs: {
            keywords: {
              significant_terms: {
                field: 'text',
              },
            },
          },
        },
      },
    });
  });
});
