import {
  filterPaths,
} from '../lib/utils/format';
import { changeFile } from '../lib/utils';
import { getExtraDefinitions } from '../lib/utils/format';
import buildService from '../lib/Service';
import buildInterface from '../lib/Interface';

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

    const serviceDir = path.join("./service.ts");
    const serviceSource = fs.readFileSync(serviceDir, "utf8");
    const buildServiceInst = new buildService();
    changeFile(serviceDir, buildServiceInst.generator(serviceSource, p), ()=>{
        console.log(`成功写入文件${serviceDir}`)
    });

    const interDir = path.join("./data.ts");
    const interSource = fs.readFileSync(interDir, "utf8");
    const buildInterfaceInst = new buildInterface();
    changeFile(interDir, buildInterfaceInst.generator(interSource, getExtraDefinitions(definitions)),
    () => {
      console.log(`成功写入文件${interDir}`)
    });
  }
}

request(api, cb);
