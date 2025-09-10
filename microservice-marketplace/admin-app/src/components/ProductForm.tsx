import React from 'react';

interface ProductFormProps {
    product?: ProductInfo;
    onSubmit: (product: ProductInfo) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // 处理表单提交逻辑
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* 表单内容 */}
        </form>
    );
};

export default ProductForm;