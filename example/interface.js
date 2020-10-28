import generator from '../src/recast/interface';
import { changeFile,  } from '../utils';
import { getExtraDefinitions } from '../utils/format';

const fs = require('fs');
const path = require('path');
const request = require('request');
// swagger api-docs
const api = 'https://petstore.swagger.io/v2/swagger.json';
const dir = path.join("./d.ts");
const source = fs.readFileSync(dir, "utf8");

// const OrderData = {
//     properties: {
//       id: { type: "integer", format: "int64" },
//       complete: { type: "boolean" },
//       status: {
//         description: "Order Status",
//         enum: ["placed", "approved", "delivered"],
//         type: "string",
//       }
//     }
//   }

request(api, (err, res) => {
  if (!err && res.statusCode == 200) { 
    const { definitions } = JSON.parse(res.body);
    console.log(generator(source, getExtraDefinitions(definitions)))
  }
});
// changeFile(dir, generator(source, OrderData), ()=>{
//     console.log(`成功写入文件${dir}`)
// });