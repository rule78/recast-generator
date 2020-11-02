import generator from '../lib/interface';
import { changeFile,  } from '../lib/utils';
import { getExtraDefinitions } from '../lib/utils/format';

const fs = require('fs');
const path = require('path');
const request = require('request');
// swagger api-docs
const api = 'https://petstore.swagger.io/v2/swagger.json';
const dir = path.join("./data.ts");
const source = fs.readFileSync(dir, "utf8");

request(api, (err, res) => {
  if (!err && res.statusCode == 200) { 
    const { definitions } = JSON.parse(res.body);
    changeFile(dir, generator(source, getExtraDefinitions(definitions)),
    () => {
      console.log(`成功写入文件${dir}`)
    });
  }
});