import queryBuilder from '../src/query-builder';

describe('filter', () => {
  test('filter term', () => {
    const result = queryBuilder().filter('term', 'field', 'value');

    expect(result.buildQuery()).toEqual({
      bool: {
        filter: {
          term: { field: 'value' },
        },
      },
    });
  });

  test('filter nested', () => {
    const result = queryBuilder().filter(
      'constant_score',
      queryBuilder().filter('term', 'field', 'value')
    );

    expect(result.buildQuery()).toEqual({
      bool: {
        filter: { constant_score: { filter: { term: { field: 'value' } } } },
      },
    });
  });
});

describe('query', () => {
  test('match_all', () => {
    const result = queryBuilder().must('match_all');

    expect(result.buildQuery()).toEqual({
      match_all: {},
    });
  });

  test('match_all with boost', () => {
    const result = queryBuilder().must('match_all', 'boost', 1.2);

    expect(result.buildQuery()).toEqual({
      match_all: {
        boost: 1.2,
      },
    });
  });

  test('match_none', () => {
    const result = queryBuilder().must('match_none');

    expect(result.buildQuery()).toEqual({
      match_none: {},
    });
  });

  test('match', () => {
    const result = queryBuilder().must('match', 'message', 'this is a test');

    expect(result.buildQuery()).toEqual({
      match: {
        message: 'this is a test',
      },
    });
  });

  test('match empty string', () => {
    const result = queryBuilder().must('match', 'message', '');

    expect(result.buildQuery()).toEqual({
      match: {
        message: '',
      },
    });
  });

  test('match with options', () => {
    const result = queryBuilder().must('match', 'message', {
      query: 'this is a test',
      operator: 'and',
    });

    expect(result.buildQuery()).toEqual({
      match: {
        message: {
          query: 'this is a test',
          operator: 'and',
        },
      },
    });
  });

  test('match_phrase', () => {
    const result = queryBuilder().must(
      'match_phrase',
      'message',
      'this is a test'
    );

    expect(result.buildQuery()).toEqual({
      match_phrase: {
        message: 'this is a test',
      },
    });
  });

  test('match_phrase with options', () => {
    const result = queryBuilder().must('match_phrase', 'message', {
      query: 'this is a test',
      analyzer: 'my_analyzer',
    });

    expect(result.buildQuery()).toEqual({
      match_phrase: {
        message: {
          query: 'this is a test',
          analyzer: 'my_analyzer',
        },
      },
    });
  });

  test('common', () => {
    const result = queryBuilder().must('common', 'body', {
      query: 'this is bonsai cool',
      cutoff_frequency: 0.001,
    });

    expect(result.buildQuery()).toEqual({
      common: {
        body: {
          query: 'this is bonsai cool',
          cutoff_frequency: 0.001,
        },
      },
    });
  });

  test('common', () => {
    const result = queryBuilder().must('common', 'body', {
      query: 'this is bonsai cool',
      cutoff_frequency: 0.001,
    });

    expect(result.buildQuery()).toEqual({
      common: {
        body: {
          query: 'this is bonsai cool',
          cutoff_frequency: 0.001,
        },
      },
    });
  });

  test('query_string', () => {
    const result = queryBuilder().must(
      'query_string',
      'query',
      'this AND that OR thus'
    );

    expect(result.buildQuery()).toEqual({
      query_string: {
        query: 'this AND that OR thus',
      },
    });
  });

  test('query_string with options', () => {
    const result = queryBuilder().must(
      'query_string',
      'query',
      'this AND that OR thus',
      {
        fields: ['content', 'name'],
      }
    );

    expect(result.buildQuery()).toEqual({
      query_string: {
        query: 'this AND that OR thus',
        fields: ['content', 'name'],
      },
    });
  });

  test('query_string alternative', () => {
    const result = queryBuilder().must('query_string', {
      query: 'this AND that OR thus',
      fields: ['content', 'name'],
    });

    expect(result.buildQuery()).toEqual({
      query_string: {
        query: 'this AND that OR thus',
        fields: ['content', 'name'],
      },
    });
  });

  test('simple_query_string', () => {
    const result = queryBuilder().must(
      'simple_query_string',
      'query',
      'foo bar baz'
    );

    expect(result.buildQuery()).toEqual({
      simple_query_string: {
        query: 'foo bar baz',
      },
    });
  });

  test('term', () => {
    const result = queryBuilder().must('term', 'user', 'kimchy');

    expect(result.buildQuery()).toEqual({
      term: {
        user: 'kimchy',
      },
    });
  });

  test('term with boost', () => {
    const result = queryBuilder().must('term', 'status', {
      value: 'urgent',
      boost: '2.0',
    });

    expect(result.buildQuery()).toEqual({
      term: {
        status: {
          value: 'urgent',
          boost: '2.0',
        },
      },
    });
  });

  test('term multiple', () => {
    const result = queryBuilder()
      .should('term', 'status', {
        value: 'urgent',
        boost: '2.0',
      })
      .should('term', 'status', 'normal');

    expect(result.buildQuery()).toEqual({
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
    const result = queryBuilder().must('terms', 'user', ['kimchy', 'elastic']);

    expect(result.buildQuery()).toEqual({
      terms: {
        user: ['kimchy', 'elastic'],
      },
    });
  });

  test('range', () => {
    const result = queryBuilder().must('range', 'age', { gte: 10 });

    expect(result.buildQuery()).toEqual({
      range: {
        age: { gte: 10 },
      },
    });
  });

  test('exists', () => {
    const result = queryBuilder().must('exists', 'user');

    expect(result.buildQuery()).toEqual({
      exists: {
        field: 'user',
      },
    });
  });

  test('missing', () => {
    const result = queryBuilder().must('missing', 'user');

    expect(result.buildQuery()).toEqual({
      missing: {
        field: 'user',
      },
    });
  });

  test('prefix', () => {
    const result = queryBuilder().must('prefix', 'user', 'ki');

    expect(result.buildQuery()).toEqual({
      prefix: {
        user: 'ki',
      },
    });
  });

  test('prefix with boost', () => {
    const result = queryBuilder().must('prefix', 'user', {
      value: 'ki',
      boost: 2,
    });

    expect(result.buildQuery()).toEqual({
      prefix: {
        user: {
          value: 'ki',
          boost: 2,
        },
      },
    });
  });

  test('wildcard', () => {
    const result = queryBuilder().must('wildcard', 'user', 'ki*y');

    expect(result.buildQuery()).toEqual({
      wildcard: {
        user: 'ki*y',
      },
    });
  });

  test('regexp', () => {
    const result = queryBuilder().must('regexp', 'name.first', 's.*y');

    expect(result.buildQuery()).toEqual({
      regexp: {
        'name.first': 's.*y',
      },
    });
  });

  test('fuzzy', () => {
    const result = queryBuilder().must('fuzzy', 'user', 'ki');

    expect(result.buildQuery()).toEqual({
      fuzzy: {
        user: 'ki',
      },
    });
  });

  test('type', () => {
    const result = queryBuilder().must('type', 'value', 'my_type');

    expect(result.buildQuery()).toEqual({
      type: {
        value: 'my_type',
      },
    });
  });

  test('ids', () => {
    const result = queryBuilder().must('ids', 'type', 'my_ids', {
      values: ['1', '4', '100'],
    });

    expect(result.buildQuery()).toEqual({
      ids: {
        type: 'my_ids',
        values: ['1', '4', '100'],
      },
    });
  });

  test('constant_score', () => {
    const result = queryBuilder().must(
      'constant_score',
      { boost: 1.2 },
      queryBuilder().filter('term', 'user', 'kimchy')
    );

    expect(result.buildQuery()).toEqual({
      constant_score: {
        filter: {
          term: { user: 'kimchy' },
        },
        boost: 1.2,
      },
    });
  });

  test('nested', () => {
    const result = queryBuilder().must(
      'nested',
      { path: 'obj1', score_mode: 'avg' },
      queryBuilder()
        .must('match', 'obj1.name', 'blue')
        .must('range', 'obj1.count', { gt: 5 })
    );

    expect(result.buildQuery()).toEqual({
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
    const result = queryBuilder().must(
      'has_child',
      'type',
      'blog_tag',
      queryBuilder().must('term', 'tag', 'something')
    );

    expect(result.buildQuery()).toEqual({
      has_child: {
        type: 'blog_tag',
        query: {
          term: { tag: 'something' },
        },
      },
    });
  });

  test('has_parent', () => {
    const result = queryBuilder().must(
      'has_parent',
      'parent_tag',
      'blog',
      queryBuilder().must('term', 'tag', 'something')
    );

    expect(result.buildQuery()).toEqual({
      has_parent: {
        parent_tag: 'blog',
        query: {
          term: { tag: 'something' },
        },
      },
    });
  });

  test('geo_bounding_box', () => {
    const result = queryBuilder().must(
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

    expect(result.buildQuery()).toEqual({
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
    const result = queryBuilder().must(
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

    expect(result.buildQuery()).toEqual({
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
    const result = queryBuilder().must(
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

    expect(result.buildQuery()).toEqual({
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
    const result = queryBuilder().must('geo_polygon', 'person.location', {
      points: [
        { lat: 40, lon: -70 },
        { lat: 30, lon: -80 },
        { lat: 20, lon: -90 },
      ],
    });

    expect(result.buildQuery()).toEqual({
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
    const result = queryBuilder().must(
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

    expect(result.buildQuery()).toEqual({
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
    const result = queryBuilder().must('more_like_this', {
      fields: ['title', 'description'],
      like: 'Once upon a time',
      min_term_freq: 1,
      max_query_terms: 12,
    });

    expect(result.buildQuery()).toEqual({
      more_like_this: {
        fields: ['title', 'description'],
        like: 'Once upon a time',
        min_term_freq: 1,
        max_query_terms: 12,
      },
    });
  });

  test('template', () => {
    const result = queryBuilder().must('template', {
      inline: { match: { text: '{{query_string}}' } },
      params: {
        query_string: 'all about search',
      },
    });

    expect(result.buildQuery()).toEqual({
      template: {
        inline: { match: { text: '{{query_string}}' } },
        params: {
          query_string: 'all about search',
        },
      },
    });
  });

  test('script', () => {
    const result = queryBuilder().must('script', 'script', {
      inline: "doc['num1'].value > 1",
      lang: 'painless',
    });

    expect(result.buildQuery()).toEqual({
      script: {
        script: {
          inline: "doc['num1'].value > 1",
          lang: 'painless',
        },
      },
    });
  });

  test('or', () => {
    const result = queryBuilder().must('or', [
      { term: { user: 'kimchy' } },
      { term: { user: 'tony' } },
    ]);

    expect(result.buildQuery()).toEqual({
      or: [{ term: { user: 'kimchy' } }, { term: { user: 'tony' } }],
    });
  });

  test('minimum_should_match with multiple combination', () => {
    const result = queryBuilder()
      .should('term', 'status', 'alert')
      .should('term', 'status', 'normal')
      .minimumShouldMatch('2<-25% 9<-3');

    expect(result.buildQuery()).toEqual({
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
    const result = queryBuilder()
      .should('term', 'status', 'alert')
      .should('term', 'status', 'normal')
      .minimumShouldMatch(2);

    expect(result.buildQuery()).toEqual({
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
