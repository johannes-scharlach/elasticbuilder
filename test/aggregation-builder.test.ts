import AggregationBuilder from '../src/aggregation-builder';

describe('aggregationBuilder', () => {
  it('supports avg aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_avg_grade',
      'avg',
      'grade'
    );

    expect(result.build()).toEqual({
      agg_avg_grade: {
        avg: {
          field: 'grade',
        },
      },
    });
  });

  it('supports cardinality aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_cardinality_author',
      'cardinality',
      'author'
    );

    expect(result.build()).toEqual({
      agg_cardinality_author: {
        cardinality: {
          field: 'author',
        },
      },
    });
  });

  test('supports extended_stats aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_extended_stats_grade',
      'extended_stats',
      'grade'
    );

    expect(result.build()).toEqual({
      agg_extended_stats_grade: {
        extended_stats: {
          field: 'grade',
        },
      },
    });
  });

  test('supports geo_bounds aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_geo_bounds_location',
      'geo_bounds',
      'location'
    );

    expect(result.build()).toEqual({
      agg_geo_bounds_location: {
        geo_bounds: {
          field: 'location',
        },
      },
    });
  });

  test('supports geo_centroid aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_geo_centroid_location',
      'geo_centroid',
      'location'
    );

    expect(result.build()).toEqual({
      agg_geo_centroid_location: {
        geo_centroid: {
          field: 'location',
        },
      },
    });
  });

  test('supports max aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_max_price',
      'max',
      'price'
    );

    expect(result.build()).toEqual({
      agg_max_price: {
        max: {
          field: 'price',
        },
      },
    });
  });

  test('supports min aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_min_price',
      'min',
      'price'
    );

    expect(result.build()).toEqual({
      agg_min_price: {
        min: {
          field: 'price',
        },
      },
    });
  });

  test('supports percentiles aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_percentiles_load_time',
      'percentiles',
      {
        field: 'load_time',
        percents: [95, 99, 99.9],
      }
    );

    expect(result.build()).toEqual({
      agg_percentiles_load_time: {
        percentiles: {
          field: 'load_time',
          percents: [95, 99, 99.9],
        },
      },
    });
  });

  // Skipping, first need a way to handle aggregations with no `field`
  test.skip('supports percentiles script aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_percentiles_load_time',
      'percentiles',
      {
        field: 'load_time',
        script: {
          inline: "doc['load_time'].value / timeUnit",
          params: {
            timeUnit: 100,
          },
        },
      }
    );

    expect(result.build()).toEqual({
      agg_percentiles_load_time: {
        percentiles: {
          script: {
            inline: "doc['load_time'].value / timeUnit",
            params: {
              timeUnit: 100,
            },
          },
        },
      },
    });
  });

  test('supports percentile_ranks aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_percentile_ranks_load_time',
      'percentile_ranks',
      {
        field: 'load_time',
        values: [15, 30],
      }
    );

    expect(result.build()).toEqual({
      agg_percentile_ranks_load_time: {
        percentile_ranks: {
          field: 'load_time',
          values: [15, 30],
        },
      },
    });
  });

  test('supports scripted_metric aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_scripted_metric',
      'scripted_metric',
      {
        init_script: 'params._agg.transactions = []',
        map_script:
          "params._agg.transactions.add(doc.type.value == 'sale' ? doc.amount.value : -1 * doc.amount.value)",
        combine_script:
          'double profit = 0; for (t in params._agg.transactions) { profit += t } return profit',
        reduce_script:
          'double profit = 0; for (a in params._aggs) { profit += a } return profit',
      }
    );

    expect(result.build()).toEqual({
      agg_scripted_metric: {
        scripted_metric: {
          init_script: 'params._agg.transactions = []',
          map_script:
            "params._agg.transactions.add(doc.type.value == 'sale' ? doc.amount.value : -1 * doc.amount.value)",
          combine_script:
            'double profit = 0; for (t in params._agg.transactions) { profit += t } return profit',
          reduce_script:
            'double profit = 0; for (a in params._aggs) { profit += a } return profit',
        },
      },
    });
  });

  test('supports stats aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_stats_grade',
      'stats',
      'grade'
    );

    expect(result.build()).toEqual({
      agg_stats_grade: {
        stats: {
          field: 'grade',
        },
      },
    });
  });

  test('supports sum aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_sum_change',
      'sum',
      'change'
    );

    expect(result.build()).toEqual({
      agg_sum_change: {
        sum: {
          field: 'change',
        },
      },
    });
  });

  test('supports value_count aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_value_count_grade',
      'value_count',
      'grade'
    );

    expect(result.build()).toEqual({
      agg_value_count_grade: {
        value_count: {
          field: 'grade',
        },
      },
    });
  });

  test('supports children aggregation', () => {
    const inner = new AggregationBuilder().add('top-names', 'terms', {
      field: 'owner.display_name.keyword',
      size: 10,
    });
    const nested = new AggregationBuilder().add(
      'to-answers',
      'children',
      { type: 'answer' },
      inner
    );

    const result = new AggregationBuilder().add(
      'top-tags',
      'terms',
      { field: 'tags.keyword', size: 10 },
      nested
    );

    expect(result.build()).toEqual({
      'top-tags': {
        terms: {
          field: 'tags.keyword',
          size: 10,
        },
        aggs: {
          'to-answers': {
            children: {
              type: 'answer',
            },
            aggs: {
              'top-names': {
                terms: {
                  field: 'owner.display_name.keyword',
                  size: 10,
                },
              },
            },
          },
        },
      },
    });
  });

  test('supports date_histogram aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_date_histogram_grade',
      'date_histogram',
      'grade'
    );

    expect(result.build()).toEqual({
      agg_date_histogram_grade: {
        date_histogram: {
          field: 'grade',
        },
      },
    });
  });

  test('supports date_range aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_date_range_date',
      'date_range',
      {
        field: 'date',
        format: 'MM-yyy',
        ranges: [{ to: 'now-10M/M' }, { from: 'now-10M/M' }],
      }
    );

    expect(result.build()).toEqual({
      agg_date_range_date: {
        date_range: {
          field: 'date',
          format: 'MM-yyy',
          ranges: [{ to: 'now-10M/M' }, { from: 'now-10M/M' }],
        },
      },
    });
  });

  test('supports diversified_sampler aggregation', () => {
    const result = new AggregationBuilder().add(
      'agg_diversified_sampler_user.id',
      'diversified_sampler',
      {
        field: 'user.id',
        shard_size: 200,
      },
      new AggregationBuilder({
        keywords: {
          significant_terms: {
            field: 'text',
          },
        },
      })
    );

    expect(result.build()).toEqual({
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
    });
  });

  /*
  test('supports filter aggregation', () => {
  
    const result = new AggregationBuilder().add('filter', 'red_products', (a) => {
      return a.filter('term', 'color', 'red')
        .aggregation('avg', 'price', 'avg_price')
    })
  
    expect(result.build()).toEqual({
      agg_filter_red_products: {
        filter: { term: { color: 'red' } },
        aggs: {
          avg_price: { avg: { field: 'price' } }
        }
      }
    })
  })
  
  test('supports filters aggregation', () => {
  
    const f1 = filterBuilder().filter('term', 'user', 'John').getFilter()
    const f2 = filterBuilder().filter('term', 'status', 'failure').getFilter()
  
    const result = new AggregationBuilder().add('filters', {
      filters: {
        users: f1,
        errors: f2
      }
    }, 'agg_name')
  
    expect(result.build()).toEqual({
      'agg_name': {
        filters: {
          filters: {
            users: { term: { user: 'John' } },
            errors: { term: { status: 'failure' } }
          }
        }
      }
    })
  })*/

  test('supports pipeline aggregation', () => {
    const nested = new AggregationBuilder({
      sales: {
        sum: {
          field: 'price',
        },
      },
    });

    const result = new AggregationBuilder()
      .add(
        'sales_per_month',
        'date_histogram',
        { field: 'date', interval: 'month' },
        nested
      )
      .add('max_monthly_sales', 'max_bucket', {
        buckets_path: 'sales_per_month>sales',
      });

    expect(result.build()).toEqual({
      sales_per_month: {
        date_histogram: {
          field: 'date',
          interval: 'month',
        },
        aggs: {
          sales: {
            sum: {
              field: 'price',
            },
          },
        },
      },
      max_monthly_sales: {
        max_bucket: {
          buckets_path: 'sales_per_month>sales',
        },
      },
    });
  });

  test('supports matrix stats', () => {
    const result = new AggregationBuilder().add('matrixstats', 'matrix_stats', {
      fields: ['poverty', 'income'],
    });

    expect(result.build()).toEqual({
      matrixstats: {
        matrix_stats: {
          fields: ['poverty', 'income'],
        },
      },
    });
  });

  test('supports metadata', () => {
    const result = new AggregationBuilder().add(
      { name: 'titles', meta: { color: 'blue' } },
      'terms',
      {
        field: 'title',
      }
    );

    expect(result.build()).toEqual({
      titles: {
        terms: {
          field: 'title',
        },
        meta: {
          color: 'blue',
        },
      },
    });
  });

  test('supports nested metadata', () => {
    const nested = new AggregationBuilder().add(
      { name: 'sales', meta: { discount: 1.99 } },
      'sum',
      { field: 'price' }
    );
    const result = new AggregationBuilder().add(
      { name: 'titles', meta: { color: 'blue' } },
      'terms',
      'title',
      nested
    );

    expect(result.build()).toEqual({
      titles: {
        terms: {
          field: 'title',
        },
        meta: {
          color: 'blue',
        },
        aggs: {
          sales: {
            sum: {
              field: 'price',
            },
            meta: {
              discount: 1.99,
            },
          },
        },
      },
    });
  });
});
