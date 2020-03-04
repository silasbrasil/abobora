import { BigQuery } from "@google-cloud/bigquery";

import { AboboraInterface } from "./interfaces";


export default class Abobora implements AboboraInterface {
  dataset: string;
  query: string = "";
  client: BigQuery;

  constructor (dataset: string) {
    this.dataset = dataset;
    this.client = new BigQuery();
  }

  private get _querySplited(): Array<string> {
    return this.query.split(" ");
  }

  /**
   * @return this A Wrapper for abobora with "SELECT * FROM `this.dataset`;" in BigQuery SQL query.
   */
  read() {
    this.query = `SELECT * FROM \`${this.dataset}\``;
    return this;
  }

  /**
   * @param  size  Number (integer) with limit results that you want to get.
   * @return this  A Wrapper for abobora with limit of results applied.
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
      let _query = this._querySplited;
      _query[1] = fields.join();
      this.query = _query.join(" ");
    }

    // Add groupable fields with GROUP BY to query
    let _groupable_fields = fields.filter(field => field.indexOf(".") !== -1);
    if (_groupable_fields.length > 0) {
      this.query = `${this.query} GROUP BY ${_groupable_fields.join()}`;
    }
    return this;
  }

  /**
   * @param filters A object with fields that you want to filter by values.
   * @return this   A Wrapper for abobora with filtered fields in BigQuery SQL query.
   */
  filter(filters: {[key: string]: any}): Abobora {
    let _filters = [];
    for (var key in filters) {
      if (typeof filters[key] === 'string') {
        _filters.push(`${key}='${filters[key]}'`);
      } else {
        _filters.push(`${key}=${filters[key]}`);
      }
    }
    if (this._querySplited.length === 4 || this._querySplited.length === 6) {
      this._querySplited.splice(5, 0, `WHERE ${_filters.join()}`);
    }
    this.query = this._querySplited.join(" ");

    return this;
  }

  /**
   * @param fields A object with fields that you want to unnest and your '"AS" names'.
   * @return this  A Wrapper for abobora with unnested fields in BigQuery SQL query.
   */
  unnest(fields: object): Abobora {
    this._querySplited;
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

const abobora = new Abobora("analytics_222891935.*");
abobora.read().execute().then(res => console.log(res));
abobora.read().fields("user_id");
console.log(abobora.query);

// abobora.read().fields(fields)  		-> SELECT fields FROM `example-dataset` [GROUP BY groupable_fields];
// abobora.read().filter(filters) 		-> SELECT * FROM `example-dataset` WHERE filters;
// abobora.read().unnest(field=unnested_field)  -> SELECT unnested_field FROM `example-dataset`, UNNEST(field) AS unnested_field;
