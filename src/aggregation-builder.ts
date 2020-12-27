import {ISpec, PlainProp} from './types'

type SpecWithAggs = ISpec & {
  aggs?: AggregationBuilder | PlainProp
}

export interface Aggs {
  [x: string]: SpecWithAggs
}

type FieldOrSpec = string | ISpec;

export default class AggregationBuilder {
  private aggs: Aggs;

  constructor(init: Aggs = {}) {
    this.aggs = { ...init };
  }

  add(
    nameAndMeta: string | {name: string, meta: any},
    type: string,
    fieldOrSpec: FieldOrSpec,
    subAggs?: AggregationBuilder
  ) {
    const spec =
      typeof fieldOrSpec === 'string' ? { field: fieldOrSpec } : fieldOrSpec;

    const name = typeof nameAndMeta === 'string' ? nameAndMeta : nameAndMeta.name

    this.aggs[name] = { [type]: spec };

    if (subAggs) {
      this.aggs[name].aggs = subAggs;
    }

    if (typeof nameAndMeta === 'object' && nameAndMeta.meta) {
      this.aggs[name].meta = nameAndMeta.meta
    }

    return this;
  }

  build(): Record<string, ISpec> {
    const result: Record<string, ISpec> = {};

    for (const [name, agg] of Object.entries(this.aggs)) {
      const { aggs, ...rest } = agg;
      result[name] = rest;
      if (aggs) {
        rest.aggs = aggs instanceof AggregationBuilder ? aggs.build() : aggs;
      }
    }

    return result;
  }

  static is(someBuilder: any): someBuilder is AggregationBuilder {
    return (
      someBuilder != null &&
      typeof someBuilder.add === 'function' &&
      typeof someBuilder.build === 'function'
    );
  }
}
