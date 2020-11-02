import {
  filterPaths,
} from './utils/format';
import { changeFile } from './utils';
import generator from './src/recast/services';

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
    const { tags, paths } = JSON.parse(response.body);
    //const kRes = await qoa.prompt([keyword]);
    const selectList = tags.filter(i =>i.name !== 'pet');
    const selectControl = {
      type: 'interactive',
      query: 'Select your api controller:',
      handle: 'control',
      symbol: '>',
      menu: selectList.map(i =>i.name),
    };
    const cRes = await qoa.prompt([selectControl]);
    const p = filterPaths(cRes.control, paths);

    const dir = path.join("./example/service.ts");
    const source = fs.readFileSync(dir, "utf8");
    
    changeFile(dir, generator(source, p), ()=>{
        console.log(`成功写入文件${dir}`)
    });
  }
}

request(api, cb);

export default generator;