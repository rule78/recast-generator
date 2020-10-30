import request from "@/utils/request";

//Creates list of users with given input array
export function* addUserCreateWithArray(params) {
  const res = yield request.post("/user/createWithArray", {
    params: params
  });

  return res;
}

//Creates list of users with given input array
export function* addUserCreateWithList(params) {
  const res = yield request.post("/user/createWithList", {
    params: params
  });

  return res;
}

//Get user by user name
export function* getUser(username: string) {
  const res = yield request.get(`/user/${username}`);
  return res;
}

//Updated user
export function* editUser(username: string, params) {
  const res = yield request.put(`/user/${username}`, {
    params: params
  });

  return res;
}

//Delete user
export function* deleteUser(username: string) {
  const res = yield request.delete(`/user/${username}`);
  return res;
}

//Logs user into the system
export function* getUserLogin(data) {
  const res = yield request.get("/user/login", {
    data: data
  });

  return res;
}

//Logs out current logged in user session
export function* getUserLogout() {
  const res = yield request.get("/user/logout");
  return res;
}

//Create user
export function* addUser(params) {
  const res = yield request.post("/user", {
    params: params
  });

  return res;
}