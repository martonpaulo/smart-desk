import { BaseType } from '@/core/types/BaseType';
import { RawBaseType } from '@/core/types/RawBaseType';

// Convert "fooBar" → "foo_bar"
type SnakeCase<S extends string> = S extends `${infer Head}${infer Tail}`
  ? Head extends Lowercase<Head>
    ? `${Head}${SnakeCase<Tail>}`
    : `_${Lowercase<Head>}${SnakeCase<Tail>}`
  : S;

// Given an E that extends BaseType, compute the corresponding raw DB record:
//  • include RawBaseType fields (id, user_id, trashed, created_at, updated_at)
//  • for each additional K in E, add a snake_cased property whose type
//    is string if E[K] is Date, else E[K]
export type DbRecord<E extends BaseType> = RawBaseType & {
  [K in Exclude<keyof E, keyof BaseType> as SnakeCase<K & string>]: E[K] extends Date
    ? string
    : E[K];
};
