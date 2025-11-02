// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前有效的公告列表 GET /api/announcement/active */
export async function getActiveAnnouncements(options?: { [key: string]: any }) {
  return request<API.Result<API.Announcement[]>>('/api/announcement/active', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取所有公告列表 GET /api/announcement/list */
export async function getAnnouncements(options?: { [key: string]: any }) {
  return request<API.Result<API.Announcement[]>>('/api/announcement/list', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 根据ID获取公告详情 GET /api/announcement/${param0} */
export async function getAnnouncementById(
  params: {
    // path
    /** 公告ID */
    id: number;
  },
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Result<API.Announcement>>(`/api/announcement/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 创建公告 POST /api/announcement */
export async function createAnnouncement(
  body?: API.Announcement,
  options?: { [key: string]: any },
) {
  return request<API.Result<API.Announcement>>('/api/announcement', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新公告 PUT /api/announcement/${param0} */
export async function updateAnnouncement(
  params: {
    // path
    /** 公告ID */
    id: number;
  },
  body?: API.Announcement,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Result<API.Announcement>>(`/api/announcement/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除公告 DELETE /api/announcement/${param0} */
export async function deleteAnnouncement(
  params: {
    // path
    /** 公告ID */
    id: number;
  },
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Result<string>>(`/api/announcement/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新公告状态 PUT /api/announcement/${param0}/status */
export async function updateAnnouncementStatus(
  params: {
    // path
    /** 公告ID */
    id: number;
    // query
    /** 状态：0-未发布，1-已发布 */
    status: number;
  },
  options?: { [key: string]: any },
) {
  const { id: param0, status, ...queryParams } = params;
  return request<API.Result<API.Announcement>>(`/api/announcement/${param0}/status`, {
    method: 'PUT',
    params: {
      ...queryParams,
      status,
    },
    ...(options || {}),
  });
}

