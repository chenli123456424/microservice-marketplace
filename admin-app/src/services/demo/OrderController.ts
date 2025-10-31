import { request } from '@umijs/max';

/** 获取订单列表 GET /api/orders/admin/list */
export async function getOrderList(
  params?: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
    /** 订单号 */
    orderNo?: string;
    /** 用户名 */
    username?: string;
    /** 订单状态 */
    orderStatus?: number;
    /** 支付状态 */
    payStatus?: number;
    /** 发货状态 */
    deliveryStatus?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_List_Order__>('/api/orders/admin/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取订单详情 GET /api/orders/${param0} */
export async function getOrderDetail(
  params: {
    // path
    /** 订单ID */
    orderId: number;
  },
  options?: { [key: string]: any },
) {
  const { orderId: param0, ...queryParams } = params;
  return request<API.Result_Order_>(`/api/orders/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新订单状态 PUT /api/orders/${param0}/status */
export async function updateOrderStatus(
  params: {
    // path
    /** 订单ID */
    orderId: number;
    // query
    /** 订单状态 */
    status: number;
  },
  options?: { [key: string]: any },
) {
  const { orderId: param0, ...queryParams } = params;
  return request<API.Result_String_>(`/api/orders/${param0}/status`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新支付状态 PUT /api/orders/${param0}/pay-status */
export async function updatePayStatus(
  params: {
    // path
    /** 订单ID */
    orderId: number;
    // query
    /** 支付状态 */
    payStatus: number;
    /** 支付方式 */
    payMethod?: string;
  },
  options?: { [key: string]: any },
) {
  const { orderId: param0, ...queryParams } = params;
  return request<API.Result_String_>(`/api/orders/${param0}/pay-status`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新发货状态 PUT /api/orders/${param0}/delivery-status */
export async function updateDeliveryStatus(
  params: {
    // path
    /** 订单ID */
    orderId: number;
    // query
    /** 发货状态 */
    deliveryStatus: number;
  },
  options?: { [key: string]: any },
) {
  const { orderId: param0, ...queryParams } = params;
  return request<API.Result_String_>(`/api/orders/${param0}/delivery-status`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 取消订单 PUT /api/orders/${param0}/cancel */
export async function cancelOrder(
  params: {
    // path
    /** 订单ID */
    orderId: number;
    // query
    /** 取消原因 */
    reason?: string;
  },
  options?: { [key: string]: any },
) {
  const { orderId: param0, ...queryParams } = params;
  return request<API.Result_String_>(`/api/orders/${param0}/cancel`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}
