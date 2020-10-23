import request from "@/utils/request";

//Place an order for a pet
export function* addOrder(params) {
  const res = yield request.post("/store/order", {
    params: params
  });

  return res;
}

//Find purchase order by ID
export function* getOrder(orderId) {
  const res = yield request.get(`/store/order/${orderId}`);
  return res;
}

//Delete purchase order by ID
export function* deleteOrder(orderId) {
  const res = yield request.delete(`/store/order/${orderId}`);
  return res;
}

//Returns pet inventories by status
export function* getInventory() {
  const res = yield request.get("/store/inventory");
  return res;
}