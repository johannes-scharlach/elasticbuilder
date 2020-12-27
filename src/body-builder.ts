import {ISpec} from './types'
import AggregationBuilder, { Aggs } from "./aggregation-builder";
import QueryBuilder from "./query-builder";

type NewBodyBuilder = ISpec & {
  query?: ISpec | QueryBuilder,
  aggs?: Aggs | AggregationBuilder
}

export default class BodyBuilder {
  private _query: QueryBuilder
  private _aggs: AggregationBuilder
  constructor({query, aggs, ...rest}: NewBodyBuilder = {}) {
    this._query = new QueryBuilder(QueryBuilder.is(query) ? query.build(): query)
    this._aggs = new AggregationBuilder(AggregationBuilder.is(aggs) ? aggs.build() : aggs)
  }
  build() {
    return {
      query: this._query.build(),
      aggs: this._aggs.build()
    }
  }

  get query() {
    return this._query
  }

  get aggs() {
    return this._aggs
  }
}
