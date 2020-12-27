import QueryBuilder from '../src/query-builder';

describe('filter', () => {
  test('filter term', () => {
    const result = new QueryBuilder().filter('term', 'field', 'value');

    expect(result.build()).toEqual({
      bool: {
        filter: {
          term: { field: 'value' },
        },
      },
    });
  });

  test('filter nested', () => {
    const result = new QueryBuilder().filter(
      'constant_score',
      new QueryBuilder().filter('term', 'field', 'value')
    );

    expect(result.build()).toEqual({
      bool: {
        filter: { constant_score: { filter: { term: { field: 'value' } } } },
      },
    });
  });
});

describe('query', () => {
  test('match_all', () => {
    const result = new QueryBuilder().must('match_all');

    expect(result.build()).toEqual({
      match_all: {},
    });
  });

  test('match_all with boost', () => {
    const result = new QueryBuilder().must('match_all', 'boost', 1.2);

    expect(result.build()).toEqual({
      match_all: {
        boost: 1.2,
      },
    });
  });

  test('match_none', () => {
    const result = new QueryBuilder().must('match_none');

    expect(result.build()).toEqual({
      match_none: {},
    });
  });

  test('match', () => {
    const result = new QueryBuilder().must(
      'match',
      'message',
      'this is a test'
    );

    expect(result.build()).toEqual({
      match: {
        message: 'this is a test',
      },
    });
  });

  test('match empty string', () => {
    const result = new QueryBuilder().must('match', 'message', '');

    expect(result.build()).toEqual({
      match: {
        message: '',
      },
    });
  });

  test('match with options', () => {
    const result = new QueryBuilder().must('match', 'message', {
      query: 'this is a test',
      operator: 'and',
    });

    expect(result.build()).toEqual({
      match: {
        message: {
          query: 'this is a test',
          operator: 'and',
        },
      },
    });
  });

  test('match_phrase', () => {
    const result = new QueryBuilder().must(
      'match_phrase',
      'message',
      'this is a test'
    );

    expect(result.build()).toEqual({
      match_phrase: {
        message: 'this is a test',
      },
    });
  });

  test('match_phrase with options', () => {
    const result = new QueryBuilder().must('match_phrase', 'message', {
      query: 'this is a test',
      analyzer: 'my_analyzer',
    });

    expect(result.build()).toEqual({
      match_phrase: {
        message: {
          query: 'this is a test',
          analyzer: 'my_analyzer',
        },
      },
    });
  });

  test('common', () => {
    const result = new QueryBuilder().must('common', 'body', {
      query: 'this is bonsai cool',
      cutoff_frequency: 0.001,
    });

    expect(result.build()).toEqual({
      common: {
        body: {
          query: 'this is bonsai cool',
          cutoff_frequency: 0.001,
        },
      },
    });
  });

  test('common', () => {
    const result = new QueryBuilder().must('common', 'body', {
      query: 'this is bonsai cool',
      cutoff_frequency: 0.001,
    });

    expect(result.build()).toEqual({
      common: {
        body: {
          query: 'this is bonsai cool',
          cutoff_frequency: 0.001,
        },
      },
    });
  });

  test('query_string', () => {
    const result = new QueryBuilder().must(
      'query_string',
      'query',
      'this AND that OR thus'
    );

    expect(result.build()).toEqual({
      query_string: {
        query: 'this AND that OR thus',
      },
    });
  });

  test('query_string with options', () => {
    const result = new QueryBuilder().must(
      'query_string',
      'query',
      'this AND that OR thus',
      {
        fields: ['content', 'name'],
      }
    );

    expect(result.build()).toEqual({
      query_string: {
        query: 'this AND that OR thus',
        fields: ['content', 'name'],
      },
    });
  });

  test('query_string alternative', () => {
    const result = new QueryBuilder().must('query_string', {
      query: 'this AND that OR thus',
      fields: ['content', 'name'],
    });

    expect(result.build()).toEqual({
      query_string: {
        query: 'this AND that OR thus',
        fields: ['content', 'name'],
      },
    });
  });

  test('simple_query_string', () => {
    const result = new QueryBuilder().must(
      'simple_query_string',
      'query',
      'foo bar baz'
    );

    expect(result.build()).toEqual({
      simple_query_string: {
        query: 'foo bar baz',
      },
    });
  });

  test('term', () => {
    const result = new QueryBuilder().must('term', 'user', 'kimchy');

    expect(result.build()).toEqual({
      term: {
        user: 'kimchy',
      },
    });
  });

  test('term with boost', () => {
    const result = new QueryBuilder().must('term', 'status', {
      value: 'urgent',
      boost: '2.0',
    });

    expect(result.build()).toEqual({
      term: {
        status: {
          value: 'urgent',
          boost: '2.0',
        },
      },
    });
  });

  test('term multiple', () => {
    const result = new QueryBuilder()
      .should('term', 'status', {
        value: 'urgent',
        boost: '2.0',
      })
      .should('term', 'status', 'normal');

    expect(result.build()).toEqual({
      bool: {
        should: [
          {
            term: {
              status: {
                value: 'urgent',
                boost: '2.0',
              },
            },
          },
          {
            term: {
              status: 'normal',
            },
          },
        ],
      },
    });
  });

  test('terms', () => {
    const result = new QueryBuilder().must('terms', 'user', [
      'kimchy',
      'elastic',
    ]);

    expect(result.build()).toEqual({
      terms: {
        user: ['kimchy', 'elastic'],
      },
    });
  });

  test('range', () => {
    const result = new QueryBuilder().must('range', 'age', { gte: 10 });

    expect(result.build()).toEqual({
      range: {
        age: { gte: 10 },
      },
    });
  });

  test('exists', () => {
    const result = new QueryBuilder().must('exists', 'user');

    expect(result.build()).toEqual({
      exists: {
        field: 'user',
      },
    });
  });

  test('missing', () => {
    const result = new QueryBuilder().must('missing', 'user');

    expect(result.build()).toEqual({
      missing: {
        field: 'user',
      },
    });
  });

  test('prefix', () => {
    const result = new QueryBuilder().must('prefix', 'user', 'ki');

    expect(result.build()).toEqual({
      prefix: {
        user: 'ki',
      },
    });
  });

  test('prefix with boost', () => {
    const result = new QueryBuilder().must('prefix', 'user', {
      value: 'ki',
      boost: 2,
    });

    expect(result.build()).toEqual({
      prefix: {
        user: {
          value: 'ki',
          boost: 2,
        },
      },
    });
  });

  test('wildcard', () => {
    const result = new QueryBuilder().must('wildcard', 'user', 'ki*y');

    expect(result.build()).toEqual({
      wildcard: {
        user: 'ki*y',
      },
    });
  });

  test('regexp', () => {
    const result = new QueryBuilder().must('regexp', 'name.first', 's.*y');

    expect(result.build()).toEqual({
      regexp: {
        'name.first': 's.*y',
      },
    });
  });

  test('fuzzy', () => {
    const result = new QueryBuilder().must('fuzzy', 'user', 'ki');

    expect(result.build()).toEqual({
      fuzzy: {
        user: 'ki',
      },
    });
  });

  test('type', () => {
    const result = new QueryBuilder().must('type', 'value', 'my_type');

    expect(result.build()).toEqual({
      type: {
        value: 'my_type',
      },
    });
  });

  test('ids', () => {
    const result = new QueryBuilder().must('ids', 'type', 'my_ids', {
      values: ['1', '4', '100'],
    });

    expect(result.build()).toEqual({
      ids: {
        type: 'my_ids',
        values: ['1', '4', '100'],
      },
    });
  });

  test('constant_score', () => {
    const result = new QueryBuilder().must(
      'constant_score',
      { boost: 1.2 },
      new QueryBuilder().filter('term', 'user', 'kimchy')
    );

    expect(result.build()).toEqual({
      constant_score: {
        filter: {
          term: { user: 'kimchy' },
        },
        boost: 1.2,
      },
    });
  });

  test('nested', () => {
    const result = new QueryBuilder().must(
      'nested',
      { path: 'obj1', score_mode: 'avg' },
      new QueryBuilder()
        .must('match', 'obj1.name', 'blue')
        .must('range', 'obj1.count', { gt: 5 })
    );

    expect(result.build()).toEqual({
      nested: {
        path: 'obj1',
        score_mode: 'avg',
        query: [
          {
            match: { 'obj1.name': 'blue' },
          },
          {
            range: { 'obj1.count': { gt: 5 } },
          },
        ],
      },
    });
  });

  test('has_child', () => {
    const result = new QueryBuilder().must(
      'has_child',
      'type',
      'blog_tag',
      new QueryBuilder().must('term', 'tag', 'something')
    );

    expect(result.build()).toEqual({
      has_child: {
        type: 'blog_tag',
        query: {
          term: { tag: 'something' },
        },
      },
    });
  });

  test('has_parent', () => {
    const result = new QueryBuilder().must(
      'has_parent',
      'parent_tag',
      'blog',
      new QueryBuilder().must('term', 'tag', 'something')
    );

    expect(result.build()).toEqual({
      has_parent: {
        parent_tag: 'blog',
        query: {
          term: { tag: 'something' },
        },
      },
    });
  });

  test('geo_bounding_box', () => {
    const result = new QueryBuilder().must(
      'geo_bounding_box',
      'pin.location',
      {
        top_left: { lat: 40, lon: -74 },
        bottom_right: { lat: 40, lon: -74 },
      },
      {
        relation: 'within',
      }
    );

    expect(result.build()).toEqual({
      geo_bounding_box: {
        relation: 'within',
        'pin.location': {
          top_left: { lat: 40, lon: -74 },
          bottom_right: { lat: 40, lon: -74 },
        },
      },
    });
  });

  test('geo_distance', () => {
    const result = new QueryBuilder().must(
      'geo_distance',
      'pin.location',
      {
        lat: 40,
        lon: -74,
      },
      {
        distance: '200km',
      }
    );

    expect(result.build()).toEqual({
      geo_distance: {
        distance: '200km',
        'pin.location': {
          lat: 40,
          lon: -74,
        },
      },
    });
  });

  test('geo_distance_range', () => {
    const result = new QueryBuilder().must(
      'geo_distance_range',
      'pin.location',
      {
        lat: 40,
        lon: -74,
      },
      {
        from: '100km',
        to: '200km',
      }
    );

    expect(result.build()).toEqual({
      geo_distance_range: {
        from: '100km',
        to: '200km',
        'pin.location': {
          lat: 40,
          lon: -74,
        },
      },
    });
  });

  test('geo_polygon', () => {
    const result = new QueryBuilder().must('geo_polygon', 'person.location', {
      points: [
        { lat: 40, lon: -70 },
        { lat: 30, lon: -80 },
        { lat: 20, lon: -90 },
      ],
    });

    expect(result.build()).toEqual({
      geo_polygon: {
        'person.location': {
          points: [
            { lat: 40, lon: -70 },
            { lat: 30, lon: -80 },
            { lat: 20, lon: -90 },
          ],
        },
      },
    });
  });

  test('geohash_cell', () => {
    const result = new QueryBuilder().must(
      'geohash_cell',
      'pin',
      {
        lat: 13.408,
        lon: 52.5186,
      },
      {
        precision: 3,
        neighbors: true,
      }
    );

    expect(result.build()).toEqual({
      geohash_cell: {
        pin: {
          lat: 13.408,
          lon: 52.5186,
        },
        precision: 3,
        neighbors: true,
      },
    });
  });

  test('more_like_this', () => {
    const result = new QueryBuilder().must('more_like_this', {
      fields: ['title', 'description'],
      like: 'Once upon a time',
      min_term_freq: 1,
      max_query_terms: 12,
    });

    expect(result.build()).toEqual({
      more_like_this: {
        fields: ['title', 'description'],
        like: 'Once upon a time',
        min_term_freq: 1,
        max_query_terms: 12,
      },
    });
  });

  test('template', () => {
    const result = new QueryBuilder().must('template', {
      inline: { match: { text: '{{query_string}}' } },
      params: {
        query_string: 'all about search',
      },
    });

    expect(result.build()).toEqual({
      template: {
        inline: { match: { text: '{{query_string}}' } },
        params: {
          query_string: 'all about search',
        },
      },
    });
  });

  test('script', () => {
    const result = new QueryBuilder().must('script', 'script', {
      inline: "doc['num1'].value > 1",
      lang: 'painless',
    });

    expect(result.build()).toEqual({
      script: {
        script: {
          inline: "doc['num1'].value > 1",
          lang: 'painless',
        },
      },
    });
  });

  test('or', () => {
    const result = new QueryBuilder().must('or', [
      { term: { user: 'kimchy' } },
      { term: { user: 'tony' } },
    ]);

    expect(result.build()).toEqual({
      or: [{ term: { user: 'kimchy' } }, { term: { user: 'tony' } }],
    });
  });

  test('minimum_should_match with multiple combination', () => {
    const result = new QueryBuilder()
      .should('term', 'status', 'alert')
      .should('term', 'status', 'normal')
      .minimumShouldMatch('2<-25% 9<-3');

    expect(result.build()).toEqual({
      bool: {
        should: [
          {
            term: {
              status: 'alert',
            },
          },
          {
            term: {
              status: 'normal',
            },
          },
        ],
        minimum_should_match: '2<-25% 9<-3',
      },
    });
  });

  test('minimum_should_match with multiple queries', () => {
    const result = new QueryBuilder()
      .should('term', 'status', 'alert')
      .should('term', 'status', 'normal')
      .minimumShouldMatch(2);

    expect(result.build()).toEqual({
      bool: {
        should: [
          {
            term: {
              status: 'alert',
            },
          },
          {
            term: {
              status: 'normal',
            },
          },
        ],
        minimum_should_match: 2,
      },
    });
  });
});
