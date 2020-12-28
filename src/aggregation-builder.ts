import { ISpec, PlainProp } from './types';

type SpecWithAggs = ISpec & {
  aggs?: AggregationBuilder | PlainProp;
};

export interface Aggs {
  [x: string]: SpecWithAggs;
}

type FieldOrSpec = string | ISpec;

export interface AggregationBuilder {
  buildAggs(): Record<string, ISpec>;
  aggregation<A extends AggregationBuilder>(
    this: A,
    nameAndMeta: string | { name: string; meta: any },
    type: string,
    fieldOrSpec: FieldOrSpec,
    subAggs?: AggregationBuilder
  ): A;
}

export default function aggregationBuilder(
  init: Aggs = {}
): AggregationBuilder {
  const aggs: Aggs = { ...init };

  return {
    aggregation(
      nameAndMeta: string | { name: string; meta: any },
      type: string,
      fieldOrSpec: FieldOrSpec,
      subAggs?: AggregationBuilder
    ) {
      const spec =
        typeof fieldOrSpec === 'string' ? { field: fieldOrSpec } : fieldOrSpec;

      const name =
        typeof nameAndMeta === 'string' ? nameAndMeta : nameAndMeta.name;

      aggs[name] = { [type]: spec };

      if (subAggs) {
        aggs[name].aggs = subAggs;
      }

      if (typeof nameAndMeta === 'object' && nameAndMeta.meta) {
        aggs[name].meta = nameAndMeta.meta;
      }

      return this;
    },

    buildAggs(): Record<string, ISpec> {
      const result: Record<string, ISpec> = {};

      for (const [name, agg] of Object.entries(aggs)) {
        const { aggs: nestedAggs, ...rest } = agg;
        result[name] = rest;

        if (nestedAggs) {
          rest.aggs = isAggregationBuilder(nestedAggs)
            ? nestedAggs.buildAggs()
            : nestedAggs;
        }
      }

      return result;
    },
  };
}

export function isAggregationBuilder(
  someBuilder: any
): someBuilder is AggregationBuilder {
  return (
    someBuilder != null &&
    typeof someBuilder.aggregation === 'function' &&
    typeof someBuilder.buildAggs === 'function'
  );
}
