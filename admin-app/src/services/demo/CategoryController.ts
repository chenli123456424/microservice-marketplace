import { request } from '@umijs/max';

// 分类管理相关接口

// 主分类管理
export async function getMainCategoryList(params: {
  page?: number;
  size?: number;
  name?: string;
}) {
  return request<API.Result_Page_MainCategory__>('/api/admin/category/main/list', {
    method: 'GET',
    params,
  });
}

export async function addMainCategory(data: API.MainCategory) {
  return request<API.Result_String_>('/api/admin/category/main/add', {
    method: 'POST',
    data,
  });
}

export async function updateMainCategory(data: API.MainCategory) {
  return request<API.Result_String_>('/api/admin/category/main/update', {
    method: 'PUT',
    data,
  });
}

export async function deleteMainCategory(id: number) {
  return request<API.Result_String_>(`/api/admin/category/main/delete/${id}`, {
    method: 'DELETE',
  });
}

export async function getAllMainCategories() {
  return request<API.Result_List_MainCategory__>('/api/admin/category/main/all', {
    method: 'GET',
  });
}

// 子分类管理
export async function getSubCategoryList(params: {
  page?: number;
  size?: number;
  name?: string;
  mainId?: number;
}) {
  return request<API.Result_Page_SubCategory__>('/api/admin/category/sub/list', {
    method: 'GET',
    params,
  });
}

export async function addSubCategory(data: API.SubCategory) {
  return request<API.Result_String_>('/api/admin/category/sub/add', {
    method: 'POST',
    data,
  });
}

export async function updateSubCategory(data: API.SubCategory) {
  return request<API.Result_String_>('/api/admin/category/sub/update', {
    method: 'PUT',
    data,
  });
}

export async function deleteSubCategory(id: number) {
  return request<API.Result_String_>(`/api/admin/category/sub/delete/${id}`, {
    method: 'DELETE',
  });
}

export async function getAllSubCategories(mainId?: number) {
  return request<API.Result_List_SubCategory__>('/api/admin/category/sub/all', {
    method: 'GET',
    params: { mainId },
  });
}

export async function uploadSubCategoryImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<API.Result_String_>('/api/admin/category/sub/upload-image', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 品牌管理
export async function getBrandList(params: {
  page?: number;
  size?: number;
  name?: string;
}) {
  return request<API.Result_Page_Brand__>('/api/admin/category/brand/list', {
    method: 'GET',
    params,
  });
}

export async function addBrand(data: API.Brand) {
  return request<API.Result_String_>('/api/admin/category/brand/add', {
    method: 'POST',
    data,
  });
}

export async function updateBrand(data: API.Brand) {
  return request<API.Result_String_>('/api/admin/category/brand/update', {
    method: 'PUT',
    data,
  });
}

export async function deleteBrand(id: number) {
  return request<API.Result_String_>(`/api/admin/category/brand/delete/${id}`, {
    method: 'DELETE',
  });
}

export async function getAllBrands() {
  return request<API.Result_List_Brand__>('/api/admin/category/brand/all', {
    method: 'GET',
  });
}

// 筛选维度管理
export async function getFilterDimensionList(params: {
  page?: number;
  size?: number;
  name?: string;
  mainId?: number;
  subId?: number;
}) {
  return request<API.Result_Page_FilterDimension__>('/api/admin/category/filter/list', {
    method: 'GET',
    params,
  });
}

export async function addFilterDimension(data: API.FilterDimension) {
  return request<API.Result_String_>('/api/admin/category/filter/add', {
    method: 'POST',
    data,
  });
}

export async function updateFilterDimension(data: API.FilterDimension) {
  return request<API.Result_String_>('/api/admin/category/filter/update', {
    method: 'PUT',
    data,
  });
}

export async function deleteFilterDimension(id: number) {
  return request<API.Result_String_>(`/api/admin/category/filter/delete/${id}`, {
    method: 'DELETE',
  });
}
