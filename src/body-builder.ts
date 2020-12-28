import { ISpec } from './types';
import aggregationBuilder, {
  Aggs,
  AggregationBuilder,
  isAggregationBuilder,
} from './aggregation-builder';
import queryBuilder, { isQueryBuilder, QueryBuilder } from './query-builder';

type NewBodyBuilder = ISpec & {
  query?: ISpec | QueryBuilder;
  aggs?: Aggs | AggregationBuilder;
};

interface BodyBuilder extends AggregationBuilder, QueryBuilder {
  build(): ISpec;
  toJson(): ISpec;
}

export default function bodyBuilder({
  query,
  aggs,
  ...rest
}: NewBodyBuilder = {}): BodyBuilder {
  const _query: QueryBuilder = queryBuilder(
    isQueryBuilder(query) ? query.buildQuery() : query
  );
  const _aggs: AggregationBuilder = aggregationBuilder(
    isAggregationBuilder(aggs) ? aggs.buildAggs() : aggs
  );
  return {
    build() {
      return {
        query: _query.buildQuery(),
        aggs: _aggs.buildAggs(),
        ...rest,
      };
    },
    toJson() {
      return this.build();
    },
    ..._aggs,
    ..._query,
  };
}
