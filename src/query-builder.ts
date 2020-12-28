import { ISpec, PlainProp } from './types';

interface BoolClauses {
  must: ISpec[];
  filter: ISpec[];
  must_not: ISpec[];
  should: ISpec[];
}

interface BuiltBoolClauses {
  must?: ISpec | ISpec[];
  query?: ISpec | ISpec[];
  filter?: ISpec | ISpec[];
  must_not?: ISpec | ISpec[];
  should?: ISpec | ISpec[];
  minimum_should_match?: number | string;
  boost?: number;
}

interface QuerySpec {
  [x: string]: Condition;
}

interface PrivateBool {
  must: QuerySpec[];
  filter: QuerySpec[];
  must_not: QuerySpec[];
  should: QuerySpec[];
  minimum_should_match?: number | string;
  boost?: number;
}

export function isQueryBuilder(someBuilder: any): someBuilder is QueryBuilder {
  return (
    someBuilder != null &&
    typeof someBuilder.buildBools === 'function' &&
    typeof someBuilder.buildQuery === 'function'
  );
}

declare function queryFn<B extends QueryBuilder>(
  this: B,
  type: string,
  value?: PlainProp | QueryBuilder
): B;
declare function queryFn<B extends QueryBuilder>(
  this: B,
  type: string,
  fieldOrValue: PlainProp,
  valueOrOpts?: PlainProp | QueryBuilder,
  opts?: ISpec | QueryBuilder
): B;
declare function queryFn<B extends QueryBuilder>(
  this: B,
  type: string,
  fieldOrValue?: PlainProp | QueryBuilder,
  valueOrOpts?: PlainProp | QueryBuilder,
  opts?: ISpec | QueryBuilder
): B;

export interface QueryBuilder {
  must: typeof queryFn;
  filter: typeof queryFn;
  mustNot: typeof queryFn;
  should: typeof queryFn;
  buildBools(queryKey?: 'query' | 'must'): BuiltBoolClauses;
  minimumShouldMatch<B extends QueryBuilder>(
    this: B,
    minimumShouldMatch: number | string
  ): B;
  buildQuery(): ISpec | ISpec[];
}

function unnest<T extends object>(arr: T[]): T | T[] {
  return arr.length === 1 ? arr[0] : arr;
}

function runBuild(qs: QuerySpec): ISpec {
  const result: ISpec = {};

  for (const [key, condition] of Object.entries(qs)) {
    result[key] = condition.build();
  }

  return result;
}

export default function queryBuilder(init?: ISpec | ISpec[]): QueryBuilder {
  const privateBool: PrivateBool = {
    must: [],
    filter: [],
    must_not: [],
    should: [],
  };

  if (init) {
    const inits = Array.isArray(init) ? init : [init];
    privateBool.must.push(...inits.map(Condition.clauseFromSpec));
  }

  function addClause(
    boolType: keyof BoolClauses,
    type: string,
    fieldOrValue?: PlainProp | QueryBuilder,
    value?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ) {
    const condition = new Condition(fieldOrValue, value, opts);
    const clause = { [type]: condition };
    privateBool[boolType].push(clause);
  }

  return {
    must(
      type: string,
      fieldOrValue?: PlainProp | QueryBuilder,
      valueOrOpts?: PlainProp | QueryBuilder,
      opts?: ISpec | QueryBuilder
    ): QueryBuilder {
      addClause('must', type, fieldOrValue, valueOrOpts, opts);

      return this;
    },
    filter(
      type: string,
      fieldOrValue?: PlainProp | QueryBuilder,
      valueOrOpts?: PlainProp | QueryBuilder,
      opts?: ISpec | QueryBuilder
    ): QueryBuilder {
      addClause('filter', type, fieldOrValue, valueOrOpts, opts);

      return this;
    },
    mustNot(
      type: string,
      fieldOrValue?: PlainProp | QueryBuilder,
      valueOrOpts?: PlainProp | QueryBuilder,
      opts?: ISpec | QueryBuilder
    ): QueryBuilder {
      addClause('must_not', type, fieldOrValue, valueOrOpts, opts);

      return this;
    },
    should(
      type: string,
      fieldOrValue?: PlainProp | QueryBuilder,
      valueOrOpts?: PlainProp | QueryBuilder,
      opts?: ISpec | QueryBuilder
    ): QueryBuilder {
      addClause('should', type, fieldOrValue, valueOrOpts, opts);

      return this;
    },

    minimumShouldMatch(minimumShouldMatch: number | string) {
      privateBool.minimum_should_match = minimumShouldMatch;

      return this;
    },

    buildQuery(): ISpec | ISpec[] {
      const bool = this.buildBools();

      if (Object.keys(bool).length === 1 && bool.must) return bool.must;
      return { bool: bool as ISpec };
    },

    buildBools(queryKey: 'query' | 'must' = 'must'): BuiltBoolClauses {
      const bool: BuiltBoolClauses = {};
      const {
        must,
        filter,
        must_not,
        should,
        minimum_should_match,
        boost,
      } = privateBool;

      if (must.length) {
        bool[queryKey] = unnest(must.map(runBuild));
      }
      if (filter.length) {
        bool.filter = unnest(filter.map(runBuild));
      }
      if (must_not.length) {
        bool.must_not = unnest(must_not.map(runBuild));
      }
      if (should.length) {
        bool.should = unnest(should.map(runBuild));
      }

      if (minimum_should_match !== undefined) {
        bool.minimum_should_match = minimum_should_match;
      }

      if (boost !== undefined) {
        bool.boost = boost;
      }

      return bool;
    },
  };
}

class Condition {
  static clauseFromSpec(spec: ISpec) {
    const clause: Record<string, Condition> = {};

    for (const [type, rawCondition] of Object.entries(spec)) {
      clause[type] = new Condition(rawCondition);
    }

    return clause;
  }
  private field?: string;
  private value?: PlainProp | QueryBuilder;
  private opts?: ISpec | QueryBuilder;

  constructor(
    fieldOrValue?: PlainProp | QueryBuilder,
    value?: PlainProp | QueryBuilder,
    opts: ISpec | QueryBuilder = {}
  ) {
    this.value = value;
    this.opts = opts;
    if (typeof fieldOrValue === 'string') {
      this.field = fieldOrValue;
    } else {
      this.value = fieldOrValue;
      if (typeof value === 'object' && !Array.isArray(value)) {
        this.opts = value;
      }
    }
  }

  build(): PlainProp {
    if (!this.field && !this.value) return {};

    const field = this.field;
    const value: PlainProp | undefined = isQueryBuilder(this.value)
      ? (this.value.buildBools('query') as ISpec)
      : this.value;
    const opts: PlainProp | undefined = isQueryBuilder(this.opts)
      ? (this.opts.buildBools('query') as ISpec)
      : this.opts;

    if (!field) {
      if (Array.isArray(value)) return value;
      return {
        ...(typeof value === 'object' && !Array.isArray(value) && value),
        ...opts,
      };
    }

    return value !== undefined
      ? { [field]: value, ...opts }
      : { field, ...opts };
  }
}
