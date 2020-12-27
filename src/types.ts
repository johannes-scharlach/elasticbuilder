export interface ISpec {
  [k: string]: PlainProp
}
export type PlainProp = string | number | boolean | string[] | number[] | boolean[] | ISpec | ISpec[]
export type PlainScalar = string | number | boolean | ISpec
