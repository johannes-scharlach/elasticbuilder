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

export default class QueryBuilder {
  static is(someBuilder: any): someBuilder is QueryBuilder {
    return (
      someBuilder != null &&
      typeof someBuilder.buildBools === 'function' &&
      typeof someBuilder.build === 'function'
    );
  }

  private privateBool: PrivateBool = {
    must: [],
    filter: [],
    must_not: [],
    should: [],
  };
  constructor(init?: ISpec | ISpec[]) {
    if (init) {
      const inits = Array.isArray(init) ? init : [init]
      this.privateBool.must.push(...inits.map(Condition.clauseFromSpec));
    }
  }

  public must(type: string, value?: PlainProp | QueryBuilder): QueryBuilder;
  public must(
    type: string,
    fieldOrValue: PlainProp,
    valueOrOpts?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ): QueryBuilder;
  public must(
    type: string,
    fieldOrValue?: PlainProp | QueryBuilder,
    valueOrOpts?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ): QueryBuilder {
    this.addClause('must', type, fieldOrValue, valueOrOpts, opts);

    return this;
  }
  public filter(type: string, value?: PlainProp | QueryBuilder): QueryBuilder;
  public filter(
    type: string,
    fieldOrValue: PlainProp,
    valueOrOpts?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ): QueryBuilder;
  public filter(
    type: string,
    fieldOrValue?: PlainProp | QueryBuilder,
    valueOrOpts?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ): QueryBuilder {
    this.addClause('filter', type, fieldOrValue, valueOrOpts, opts);

    return this;
  }
  public mustNot(type: string, value?: PlainProp | QueryBuilder): QueryBuilder;
  public mustNot(
    type: string,
    fieldOrValue: PlainProp,
    valueOrOpts?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ): QueryBuilder;
  public mustNot(
    type: string,
    fieldOrValue?: PlainProp | QueryBuilder,
    valueOrOpts?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ): QueryBuilder {
    this.addClause('must_not', type, fieldOrValue, valueOrOpts, opts);

    return this;
  }
  public should(type: string, value?: PlainProp | QueryBuilder): QueryBuilder;
  public should(
    type: string,
    fieldOrValue: PlainProp,
    valueOrOpts?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ): QueryBuilder;
  public should(
    type: string,
    fieldOrValue?: PlainProp | QueryBuilder,
    valueOrOpts?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ): QueryBuilder {
    this.addClause('should', type, fieldOrValue, valueOrOpts, opts);

    return this;
  }

  minimumShouldMatch(minimumShouldMatch: number | string) {
    this.privateBool.minimum_should_match = minimumShouldMatch

    return this
  }

  build(): ISpec | ISpec[] {
    const bool = this.buildBools();

    if (Object.keys(bool).length === 1 && bool.must) return bool.must
    return { bool: bool as ISpec };
  }

  buildBools(queryKey: 'query' | 'must' = 'must'): BuiltBoolClauses {
    const bool: BuiltBoolClauses = {};
    const {
      must,
      filter,
      must_not,
      should,
      minimum_should_match,
      boost,
    } = this.privateBool;

    if (must.length) {
      bool[queryKey] = this.unnest(must.map(this.runBuild));
    }
    if (filter.length) {
      bool.filter = this.unnest(filter.map(this.runBuild));
    }
    if (must_not.length) {
      bool.must_not = this.unnest(must_not.map(this.runBuild));
    }
    if (should.length) {
      bool.should = this.unnest(should.map(this.runBuild));
    }

    if (minimum_should_match !== undefined) {
      bool.minimum_should_match = minimum_should_match;
    }

    if (boost !== undefined) {
      bool.boost = boost;
    }

    return bool;
  }

  private runBuild(qs: QuerySpec): ISpec {
    const result: ISpec = {};

    for (const [key, condition] of Object.entries(qs)) {
      result[key] = condition.build();
    }

    return result;
  }

  private unnest<T extends object>(arr: T[]): T | T[] {
    return arr.length === 1 ? arr[0] : arr;
  }

  private addClause(
    boolType: keyof BoolClauses,
    type: string,
    fieldOrValue?: PlainProp | QueryBuilder,
    value?: PlainProp | QueryBuilder,
    opts?: ISpec | QueryBuilder
  ) {
    const condition = new Condition(fieldOrValue, value, opts);
    const clause = { [type]: condition };
    this.privateBool[boolType].push(clause);
  }
}

class Condition {
  static clauseFromSpec(spec: ISpec) {
    const clause: Record<string, Condition> = {}

    for (const [type, rawCondition] of Object.entries(spec)) {
      clause[type] = new Condition(rawCondition)
    }

    return clause
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
        this.opts = value
      }
    }
  }

  build(): PlainProp {
    if (!this.field && !this.value) return {};

    const field = this.field;
    const value: PlainProp | undefined = QueryBuilder.is(this.value)
      ? this.value.buildBools('query') as ISpec
      : this.value;
    const opts: PlainProp | undefined = QueryBuilder.is(this.opts)
      ? this.opts.buildBools('query') as ISpec
      : this.opts;

    if (!field) {
      if (Array.isArray(value)) return value
      return {
        ...(typeof value === 'object' && !Array.isArray(value) && value),
        ...opts,
      };
    }

    return value !== undefined ? { [field]: value, ...opts } : { field, ...opts };
  }
}
