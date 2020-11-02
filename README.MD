<h1 align="center">recast-generator</h1>

### 实现功能
- 根据yapi、swagger接口生成前端services、interface声明代码

### Use bash
```
$ yarn

$ node cli

```

### Logs
```
//成功写入 service.ts！
import { ResType } from "@/types";
import request from "@/utils/request";

//Place an order for a pet
export function* placeOrder(data: Order): ResType<T> {
  const res = yield request.post("/store/order", {
    data: data
  });

  return res;
}

//Find purchase order by ID
export function* getOrderById(orderId: number): ResType<T> {
  const res = yield request.get(`/store/order/${orderId}`);
  return res;
}

//Delete purchase order by ID
export function* deleteOrder(orderId: number): ResType<T> {
  const res = yield request.delete(`/store/order/${orderId}`);
  return res;
}

//Returns pet inventories by status
export function* getInventory(): ResType<T> {
  const res = yield request.get("/store/inventory");
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
