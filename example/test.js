import { changeFile } from '../utils';
import generator from '../src/recast/services';

const fs = require('fs');
const path = require('path');

const paths = {
    '/mgmt/advanceSellProduct/status/{id}': {
      put: {
        parameters: [{
          description: "id",
          in: "path",
          name: "id",
          required: false,
          type: "integer",
        }, {
          description: "status",
          in: "body",
          name: "status",
          required: false,
          type: "string",
        }],
        summary: "更改预售商品状态接口",
        responses: {
          200: {
            description: "OK"
          }
        }
      },
    },
    '/mgmt/standProduct/': {
      post: {
        parameters: [{
          description: "name",
          in: "body",
          name: "name",
          required: false,
          type: "string",
        }],
        summary: "添加标品接口",
        responses: {
          200: {
            description: "OK"
          }
        }
      },
    },
  }

const dir = path.join("./service.js");
const source = fs.readFileSync(dir, "utf8");

changeFile(dir, generator(source, paths), ()=>{
    console.log(`成功写入文件${dir}`)
    console.log(source);
});

