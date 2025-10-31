/*eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！
import { request } from '@umijs/max';

/** 获取商品列表 GET /api/products */
export async function getProductList(
  params?: {
    page?: number;
    size?: number;
    mainId?: number;
    subId?: number;
    brandId?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_PageInfo_Product__>('/api/products', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}

/** 获取商品列表 POST /api/products/filter */
export async function getProducts(
  body?: API.ProductFilterDTO,
  options?: { [key: string]: any },
) {
  return request<API.Result_PageInfo_Product__>('/api/products/filter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取商品详情 GET /api/products/${param0} */
export async function getProductDetail(
  params: {
    // path
    /** productId */
    productId?: string;
  },
  options?: { [key: string]: any },
) {
  const { productId: param0} = params;
  return request<API.Result_ProductDetailVO_>(`/api/products/${param0}`, {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}

/** 获取分类树形结构 GET /api/categories */
export async function getCategories(options?: { [key: string]: any }) {
  return request<API.Result_List_MainCategoryVO_>('/api/categories', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取所有品牌 GET /api/brands */
export async function getBrands(options?: { [key: string]: any }) {
  return request<API.Result_List_Brand_>('/api/brands', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 新增商品 POST /api/admin/products */
export async function addProduct(
  body?: API.Product,
  options?: { [key: string]: any },
) {
  return request<API.Result_Product_>('/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取商品详情 GET /api/admin/products/${param0} */
export async function getAdminProductDetail(
  params: {
    // path
    /** productId */
    productId?: string;
  },
  options?: { [key: string]: any },
) {
  const {productId: param0} = params;
  return request<API.Result_Product_>(`/api/admin/products/${param0}`, {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}

/** 更新商品 PUT /api/admin/products/${param0} */
export async function updateProduct(
  params: {
    // path
    /** productId */
    productId?: string;
  },
  body?: API.Product,
  options?: { [key: string]: any },
) {
  const {productId: param0} = params;
  return request<API.Result_Product_>(`/api/admin/products/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...params },
    data: body,
    ...(options || {}),
  });
}

/** 删除商品 DELETE /api/admin/products/${param0} */
export async function deleteProduct(
    params: { productId: string },
    options?: { [p: string]: any },
) {
  const {productId: param0} = params;
  return request<API.Result_string_>(`/api/admin/products/${param0}`, {
    method: 'DELETE',
    params: { ...params },
    ...(options || {}),
  });
}

/** 设置商品图片 POST /api/admin/products/${param0}/images */
export async function setProductImages(
  params: { productId: string },
  body: { imageUrls: string[] },
  options?: { [key: string]: any },
) {
  const { productId: param0 } = params;
  return request<API.Result_string_>(`/api/admin/products/${param0}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: body,
    ...(options || {}),
  });
}

/** 上传图片文件 POST /api/admin/upload */
export async function uploadImage(formData: FormData, options?: { [key: string]: any }) {
  return request<API.Result_string_>('/api/admin/upload', {
    method: 'POST',
    headers: { },
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}

/** 管端获取商品列表 GET /api/admin/products */
export async function getAdminProductList(
  params?: {
    page?: number;
    size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_PageInfo_Product__>('/api/admin/products', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
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

/** 获取商品选项（颜色、规格等） GET /api/products/${param0}/options */
export async function getProductOptions(
  params: {
    // path
    /** productId */
    productId?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.Result_Map_String_Object__>(`/api/products/${params.productId}/options`, {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}