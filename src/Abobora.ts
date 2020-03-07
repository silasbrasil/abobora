import { BigQuery } from "@google-cloud/bigquery";

import { AboboraInterface, ReadInterface } from "./interfaces";


export class Abobora implements AboboraInterface {
  public dataset: string;
  public query: string = "";
  public client: BigQuery = new BigQuery();

  constructor (dataset: string) {
    this.dataset = dataset;
  }

  private get _querySplited(): string[] {
    return this.query.split(" ");
  }

  /**
   * @return this A Wrapper for abobora with "SELECT * FROM `this.dataset`;" in BigQuery SQL query.
   */
  read(): Abobora {
    this.query = `SELECT * FROM \`${this.dataset}\``;
    return this;
  }

  /**
   * @param  size Number (integer) with limit results that you want to get.
   * @return this A Wrapper for abobora with limit of results applied.
   */
  limit(size: number): Abobora {
    this.query = `${this.query} LIMIT ${size}`;
    return this;
  }

  /**
   * @param fields An Array with each field that you want to get from BigQuery.
   * @return this  A Wrapper for abobora with fields to get in BigQuery SQL query.
   */
  fields(...fields: string[]): Abobora {
    // Replace begin 'SELECT *' by a 'SELECT [fields]'
    if (this._querySplited[0] === "SELECT" && this._querySplited[1] === "*") {
      const _query = this._querySplited;
      _query[1] = fields.join();
      this.query = _query.join(" ");
    }

    // Add groupable fields with GROUP BY to query
    const _groupableFields = fields.filter(field => field.indexOf(".") !== -1);
    if (_groupableFields.length > 0) {
      this.query = `${this.query} GROUP BY ${_groupableFields.join()}`;
    }

    return this;
  }

  /**
   * @param filters A object with fields that you want to filter by values.
   * @return this   A Wrapper for abobora with filtered fields in BigQuery SQL query.
   */
  filter(filters: {[key: string]: any}): Abobora {
    const _filters = [];
    for (const _key in filters) {
      if (typeof filters[_key] === 'string') {
        _filters.push(`${_key} = '${filters[_key]}'`);
      } else if (filters[_key] === null) {
        _filters.push(`${_key} IS NULL`);
      } else {
        _filters.push(`${_key} = ${filters[_key]}`);
      }
    }
    const q = this._querySplited;
    if (this._querySplited.length === 4 || this._querySplited.length === 6) {
      q.splice(4, 0, `WHERE ${_filters.join()}`);
    }
    this.query = q.join(" ");

    return this;
  }

  /**
   * @param fields A object with fields that you want to unnest and your '"AS" names'.
   * @return this  A Wrapper for abobora with unnested fields in BigQuery SQL query.
   */
  unnest(fields: {[key: string]: any}): Abobora {
    // TODO
    return this;
  }

  /**
   * @description A simple method to execute query in BigQuery using client property.
   */
  async execute() {
    const [job] = await this.client.createQueryJob({
      query: this.query,
      location: "US",
    });
    const [rows] = await job.getQueryResults();
    return rows;
  }
}


