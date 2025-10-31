/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import { request } from '@umijs/max';

/** 获取所有用户列表 GET /api/user/list */
export async function getAllUsers(
  options?: { [key: string]: any },
) {
  return request<API.Result_UserInfoList_>('/api/user/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 添加用户 POST /api/user/register */
export async function addUser(
  body?: API.UserInfo,
  options?: { [key: string]: any },
) {
  return request<API.Result_UserInfo_>('/api/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取用户详情 GET /api/user/${param0} */
export async function getUserDetail(
  params: {
    // path
    /** userId */
    userId?: string;
  },
  options?: { [key: string]: any },
) {
  const { userId: param0 } = params;
  return request<API.Result_UserInfo_>(`/api/user/${param0}`, {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}

/** 更新用户 PUT /api/user/${param0} */
export async function modifyUser(
  params: {
    // path
    /** userId */
    userId?: string;
  },
  body?: API.UserInfo,
  options?: { [key: string]: any },
) {
  const { userId: param0 } = params;
  return request<API.Result_UserInfo_>(`/api/user/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 删除用户 DELETE /api/user/${param0} */
export async function deleteUser(
  params: {
    // path
    /** userId */
    userId?: string;
  },
  options?: { [key: string]: any },
) {
  const { userId: param0 } = params;
  return request<API.Result_string_>(`/api/user/${param0}`, {
    method: 'DELETE',
    params: { ...params },
    ...(options || {}),
  });
}

/** 根据条件分页搜索用户 GET /api/user/list */
export async function searchUsersWithPage(
  params: {
    // query
    /** 当前页码 */
    current?: number;
    /** 每页数量 */
    pageSize?: number;
    /** 用户名模糊查询 */
    username?: string;
    /** 邮箱模糊查询 */
    email?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_PageInfo_UserInfo__>('/api/user/list', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}
