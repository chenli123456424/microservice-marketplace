// 确保导出所有必要的类型
export interface Result_List_MainCategoryVO_ {
    id: number;
    name: string;
    parentId: number;
}
/** 管理端搜索商品 GET /api/admin/products/search */
export async function searchAdminProducts(
  params?: {
    page?: number;
    size?: number;
    name?: string;
    price?: number;
    marketPrice?: number;
    stock?: number;
    status?: number;
    mainId?: number;
    subId?: number;
    brandId?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_PageInfo_Product__>('/api/admin/products/search', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}
