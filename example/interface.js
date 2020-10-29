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

request(api, (err, res) => {
  if (!err && res.statusCode == 200) { 
    const { definitions } = JSON.parse(res.body);
    changeFile(dir, generator(source, getExtraDefinitions(definitions)),
    ()=>{
      console.log(`成功写入文件${dir}`)
    });
  }
});