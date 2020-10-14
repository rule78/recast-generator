<h1 align="center">babel-insert</h1>

### 实现功能
- 整合到Cli里，用于智能修改配置文件,生成接口相关文件
- 在cli pages指令创建页面代码时，通过该插件智能修改router.js、memu.js等配置文件，提高工作效率

### Use bash
```
$ yarn

$ cd example

$ babel-node generator

```

### Logs
```
//成功写入！
import request from "@/utils/request";
export async function getAdvanceSellProduct(data) {
  return request.get("/mgmt/advanceSellProduct", {
    data
  });
}
export async function addAdvanceSellProduct(data, params) {
  return request.post("/mgmt/advanceSellProduct", {
    data,
    params
  });
}

```
