import { BigQuery } from "@google-cloud/bigquery";


export interface AboboraInterface { 
  dataset: string,
  client: BigQuery,
  query: string,
}
