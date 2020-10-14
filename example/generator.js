import generator from '../src/generator';

const paths = {
  '/mgmt/advanceSellProduct': {
    get: {
      parameters: [{
        description: "status",
        format: "int32",
        in: "query",
        name: "status",
        required: false,
        type: "integer",
      }, {
        description: "skuCode",
        format: "int64",
        in: "query",
        name: "skuCode",
        required: false,
        type: "integer",
      }],
      summary: "预售商品查找接口",
      responses: {
        200: {
          description: "OK"
        }
      }
    },
    post: {
      parameters: [{
        description: "advanceSellProductVo",
        in: "body",
        name: "advanceSellProductVo",
        required: true,
      }, {
        default: true,
        description: "validate",
        in: "query",
        name: "validate",
        required: false,
        type: "boolean",
      }],
      summary: "预售商品创建接口",
      responses: {
        200: {
          description: "OK"
        }
      }
    }
  },
}

// test 
generator(paths);