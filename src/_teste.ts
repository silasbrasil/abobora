import {Abobora} from "./Abobora";
const abobora = new Abobora("analytics_222891935.*");
abobora.read().limit(1).fields('user_id').filter({"user_id": null}).execute().then(res => console.log(res));
console.log(abobora.query);

// abobora.read().fields(fields)  		-> SELECT fields FROM `example-dataset` [GROUP BY groupable_fields];
// abobora.read().filter(filters) 		-> SELECT * FROM `example-dataset` WHERE filters;
// abobora.read().unnest(field=unnested_field)  -> SELECT unnested_field FROM `example-dataset`, UNNEST(field) AS unnested_field;
