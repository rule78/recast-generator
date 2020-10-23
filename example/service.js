import request from "@/utils/request";

//更改预售商品状态接口
export function* editAdvanceSellProduct(id, params) {
  const res = yield request.put(`/mgmt/advanceSellProduct/status/${id}`, {
    params: params
  });

  return res;
}

//添加标品接口
export function* addStandProduct(params) {
  const res = yield request.post("/mgmt/standProduct/", {
    params: params
  });

  return res;
}