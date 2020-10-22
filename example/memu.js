import request from "@/utils/request";

//添加预售商品接口
export function* editAdvanceSellProduct(id, params) {
  const data = yield request.put(`/mgmt/advanceSellProduct/stop/${id}`, {
    params: params
  });

  return data;
}