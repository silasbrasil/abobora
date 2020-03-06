import { Abobora } from "../index";

export interface ReadInterface {
  read(): Abobora,
  limit(size: number): Abobora,
  fields(...fields: string[]): Abobora,
  filter(filters: {[key: string]: any}): Abobora,
  unnest(): Abobora
}
