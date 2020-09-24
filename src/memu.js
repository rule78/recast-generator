const config = {
  b: 2,
  c: 888
};
export default config;
export async function fetchList(data) {
  return request.get("/api/", {
    data
  });
}
export async function addList(data) {
  return request.post("/api/", {
    data
  });
}