import { Base, RawBase } from 'src/core/types/Base';

// Convert "fooBar" → "foo_bar"
type SnakeCase<S extends string> = S extends `${infer Head}${infer Tail}`
  ? Head extends Lowercase<Head>
    ? `${Head}${SnakeCase<Tail>}`
    : `_${Lowercase<Head>}${SnakeCase<Tail>}`
  : S;

// Given an E that extends Base, compute the corresponding raw DB record:
//  • include RawBase fields (id, user_id, trashed, created_at, updated_at)
//  • for each additional K in E, add a snake_cased property whose type
//    is string if E[K] is Date, else E[K]
export type DbRecord<E extends Base> = RawBase & {
  [K in Exclude<keyof E, keyof Base> as SnakeCase<K & string>]: E[K] extends Date ? string : E[K];
};
