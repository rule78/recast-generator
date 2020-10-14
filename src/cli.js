import {
  filterPaths,
  getFileNameByPaths,
} from '../utils/format'
import generator from './generator';

const request = require('request')
const qoa = require('qoa');
// swagger api-docs
const api = 'http://promo-service-v2.dev.jianke.com/v2/api-docs';
const keyword = {
    type: 'input',
    query: 'Enter your interface keyword:',
    handle: 'key'
  };
console.log(`try to request ${api}`);
const cb = async (err, response) => {
  if (!err && response.statusCode == 200) { 
    console.log('success request!')
    const { tags, paths } = JSON.parse(response.body);
    const kRes = await qoa.prompt([keyword]);
    const selectList = tags.filter(i=>i.name.indexOf(kRes.key) !== -1);
    const selectControl = {
      type: 'interactive',
      query: 'Select your api control:',
      handle: 'control',
      symbol: '>',
      menu: selectList.map(i=>i.name),
    };
    const cRes = await qoa.prompt([selectControl]);
    const p = filterPaths(cRes.control, paths);
    generator(p);
  }
}
request(api, cb);
