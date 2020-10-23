import request from "@/utils/request";

//更改预售商品状态接口
export function* editAdvanceSellProduct(id, params) {
  const data = yield request.put(`/mgmt/advanceSellProduct/status/${id}`, {
    params: params
  });

  return data;
}

//添加标品接口
export function* addStandProduct(params) {
  const data = yield request.post("/mgmt/standProduct/", {
    params: params
  });

  return data;
}