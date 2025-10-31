import React, { useEffect, useState, useRef } from 'react';
import { ModalForm, ProFormText, ProFormDigit, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { message, Upload, Button, Form } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import services from '@/services/demo';

interface SubCategoryFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: API.SubCategory;
}

const SubCategoryForm: React.FC<SubCategoryFormProps> = ({
    visible,
    onCancel,
    onSuccess,
    initialValues,
}) => {
    const isEdit = !!initialValues;
    const [mainCategories, setMainCategories] = useState<API.MainCategory[]>([]);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const formRef = useRef<any>();

    // 获取主分类列表
    useEffect(() => {
        const fetchMainCategories = async () => {
            try {
                const response = await services.CategoryController.getAllMainCategories();
                if (response?.code === 200) {
                    setMainCategories(response.data || []);
                }
            } catch (error) {
                console.error('获取主分类列表失败:', error);
            }
        };

        if (visible) {
            console.log('SubCategoryForm: 表单打开，initialValues:', initialValues);
            fetchMainCategories();
            // 初始化图片URL
            setImageUrl(initialValues?.imageUrl || '');
            
            // 使用setFieldsValue设置表单值
            if (isEdit && initialValues && formRef.current) {
                setTimeout(() => {
                    formRef.current?.setFieldsValue(initialValues);
                    console.log('SubCategoryForm: 设置表单值:', initialValues);
                }, 100);
            }
        } else {
            setImageUrl('');
        }
    }, [visible, initialValues?.subId]);

    const handleSubmit = async (values: API.SubCategory) => {
        try {
            // 将图片URL添加到提交数据中
            const submitData = {
                ...values,
                imageUrl: imageUrl,
            };

            let result;
            if (isEdit) {
                result = await services.CategoryController.updateSubCategory({
                    ...initialValues,
                    ...submitData,
                });
            } else {
                result = await services.CategoryController.addSubCategory(submitData);
            }

            if (result?.code === 200) {
                message.success(isEdit ? '更新子分类成功' : '添加子分类成功');
                onSuccess();
            } else {
                message.error(result?.message || (isEdit ? '更新子分类失败' : '添加子分类失败'));
            }
        } catch (error) {
            console.error('提交失败:', error);
            message.error(isEdit ? '更新子分类失败' : '添加子分类失败');
        }
    };

    return (
        <ModalForm
            key={isEdit ? `edit-${initialValues?.subId}` : 'create'}
            title={isEdit ? '编辑子分类' : '新建子分类'}
            open={visible}
            onOpenChange={(open) => {
                if (!open) {
                    onCancel();
                }
            }}
            onFinish={handleSubmit}
            initialValues={initialValues}
            formRef={formRef}
            width={600}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
        >
            <ProFormSelect
                name="mainId"
                label="所属主分类"
                placeholder="请选择所属主分类"
                rules={[
                    { required: true, message: '请选择所属主分类' },
                ]}
                width="md"
                options={mainCategories.map(category => {
                    console.log('主分类选项:', category);
                    return {
                        label: category.name,
                        value: category.mainId,
                    };
                })}
                fieldProps={{
                    onChange: (value) => {
                        console.log('主分类选择变化:', value);
                    }
                }}
            />

            <ProFormText
                name="name"
                label="分类名称"
                placeholder="请输入分类名称"
                rules={[
                    { required: true, message: '请输入分类名称' },
                    { max: 50, message: '分类名称不能超过50个字符' },
                ]}
                width="xl"
            />

            <ProFormTextArea
                name="description"
                label="分类描述"
                placeholder="请输入分类描述"
                rules={[
                    { max: 200, message: '分类描述不能超过200个字符' },
                ]}
                width="xl"
                fieldProps={{
                    rows: 3,
                }}
            />

            <ProFormDigit
                name="sortOrder"
                label="排序顺序"
                placeholder="请输入排序顺序"
                rules={[
                    { required: true, message: '请输入排序顺序' },
                    { type: 'number', min: 0, message: '排序顺序不能小于0' },
                ]}
                width="sm"
                fieldProps={{
                    precision: 0,
                }}
            />

            <ProFormSelect
                name="status"
                label="状态"
                placeholder="请选择状态"
                rules={[
                    { required: true, message: '请选择状态' },
                ]}
                width="sm"
                options={[
                    { label: '启用', value: 1 },
                    { label: '禁用', value: 0 },
                ]}
            />

            {/* 图片上传组件 */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>子分类图片</label>
                
                {/* 显示当前图片 */}
                {imageUrl && (
                    <div style={{ marginBottom: 12, position: 'relative', display: 'inline-block' }}>
                        <img
                            src={`http://localhost:8081${imageUrl}`}
                            alt="子分类图片"
                            style={{
                                width: 120,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 4,
                                border: '1px solid #d9d9d9'
                            }}
                            onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22120%22%20height%3D%22120%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687e593c1e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687e593c1e%22%3E%3Crect%20width%3D%22120%22%20height%3D%22120%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2240%22%20y%3D%2260%22%3E加载失败%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                            }}
                        />
                        <Button
                            type="text"
                            danger
                            size="small"
                            style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: '#ff4d4f',
                                color: 'white',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                cursor: 'pointer'
                            }}
                            onClick={() => setImageUrl('')}
                        >
                            ×
                        </Button>
                    </div>
                )}

                {/* 上传按钮 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="subcategory-image-upload"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setLoading(true);
                                const formData = new FormData();
                                formData.append('file', file);
                                
                                services.CategoryController.uploadSubCategoryImage(file)
                                    .then(response => {
                                        if (response && response.code === 200) {
                                            const uploadedImageUrl = response.data;
                                            setImageUrl(uploadedImageUrl);
                                            message.success('图片上传成功');
                                        } else {
                                            message.error('图片上传失败: ' + (response?.message || '未知错误'));
                                        }
                                    })
                                    .catch(error => {
                                        console.error('上传失败:', error);
                                        message.error('图片上传失败');
                                    })
                                    .finally(() => {
                                        setLoading(false);
                                    });
                            }
                        }}
                    />
                    <Button
                        type="dashed"
                        loading={loading}
                        onClick={() => {
                            if (!loading) {
                                document.getElementById('subcategory-image-upload')?.click();
                            }
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            height: 40,
                            minWidth: 120
                        }}
                    >
                        <UploadOutlined />
                        {imageUrl ? '更换图片' : '上传图片'}
                    </Button>
                    {imageUrl && (
                        <span style={{ color: '#52c41a', fontSize: 12 }}>
                            ✓ 图片已上传
                        </span>
                    )}
                </div>
                
                <div style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: '#666',
                    backgroundColor: imageUrl ? '#f6ffed' : '#f4f4f4',
                    border: `1px solid ${imageUrl ? '#b7eb8f' : '#d9d9d9'}`,
                    borderRadius: 4,
                    padding: '6px 12px'
                }}>
                    {imageUrl 
                        ? '图片已上传，点击图片右上角的 × 可删除' 
                        : '请上传子分类图片，建议尺寸：200x200px'}
                </div>
            </div>
        </ModalForm>
    );
};

export default SubCategoryForm;
