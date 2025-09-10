export interface Result_Product_ {
    success: boolean; // 改为必填字段
    errorMessage?: string;
    message?: string;
    data?: Product;
    code?: number; // 添加code字段
}