import {
  filterPaths,
} from './lib/utils/format';
import { changeFile } from './lib/utils';
import { getExtraDefinitions } from './lib/utils/format';
import buildService from './lib/services';
import buildInterface from './lib/interface';

const fs = require('fs');
const path = require('path');
const request = require('request')
const qoa = require('qoa');
// swagger api-docs
const api = 'https://petstore.swagger.io/v2/swagger.json';
console.log(`try to request ${api}`);
const cb = async (err: any, response: any) => {
  if (!err && response.statusCode == 200) { 
    console.log('success request!')
    const { tags, paths, definitions } = JSON.parse(response.body);
    const selectList = tags.filter((i: {name: string}) =>i.name !== 'pet');
    const selectControl = {
      type: 'interactive',
      query: 'Select your api controller:',
      handle: 'control',
      symbol: '>',
      menu: selectList.map((i: {name: string}) =>i.name),
    };
    const cRes = await qoa.prompt([selectControl]);
    const p = filterPaths(cRes.control, paths);

    const serviceDir = path.join("./example/service.ts");
    const serviceSource = fs.readFileSync(serviceDir, "utf8");
    changeFile(serviceDir, buildService(serviceSource, p), ()=>{
        console.log(`成功写入文件${serviceDir}`)
    });

    const interDir = path.join("./example/data.ts");
    const interSource = fs.readFileSync(interDir, "utf8");
    changeFile(interDir, buildInterface(interSource, getExtraDefinitions(definitions)),
    () => {
      console.log(`成功写入文件${interDir}`)
    });
  }
}

request(api, cb);

export default {
  buildService,
  buildInterface
};