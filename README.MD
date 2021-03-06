<h1 align="center">recast-generator</h1>

### 实现功能
- 根据swagger接口文档生成前端services、interface等ts声明代码

### Use bash
```
$ yarn

$ npm run dev

```

### Logs
```
//成功写入 service.ts！
import { ResType } from "@/types";
import request from "@/utils/request";

//Creates list of users with given input array
export function* createUsersWithArrayInput(data: Array<User>): ResType<{}> {
  const res = yield request.post("/user/createWithArray", {
    data: data
  });

  return res;
}

//Creates list of users with given input array
export function* createUsersWithListInput(data: Array<User>): ResType<{}> {
  const res = yield request.post("/user/createWithList", {
    data: data
  });

  return res;
}

//Get user by user name
export function* getUserByName(username: string): ResType<User> {
  const res = yield request.get(`/user/${username}`);
  return res;
}

// 成功写入interface
enum PetStatus {
  available = "available",
  pending = "pending",
  sold = "sold"
}

export interface Pet {
  id?: number;
  category?: Category;
  name: string;
  photoUrls: Array<string>;
  tags?: Array<Tag>;
  status?: PetStatus;
}

```
