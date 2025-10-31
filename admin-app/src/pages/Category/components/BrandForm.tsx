import React from 'react';
import { ModalForm, ProFormText, ProFormDigit, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { message } from 'antd';
import services from '@/services/demo';

interface BrandFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: API.Brand;
}

const BrandForm: React.FC<BrandFormProps> = ({
    visible,
    onCancel,
    onSuccess,
    initialValues,
}) => {
    const isEdit = !!initialValues;

    const handleSubmit = async (values: API.Brand) => {
        try {
            let result;
            if (isEdit) {
                result = await services.CategoryController.updateBrand({
                    ...initialValues,
                    ...values,
                });
            } else {
                result = await services.CategoryController.addBrand(values);
            }

            if (result?.code === 200) {
                message.success(isEdit ? '更新品牌成功' : '添加品牌成功');
                onSuccess();
            } else {
                message.error(result?.message || (isEdit ? '更新品牌失败' : '添加品牌失败'));
            }
        } catch (error) {
            console.error('提交失败:', error);
            message.error(isEdit ? '更新品牌失败' : '添加品牌失败');
        }
    };

    return (
        <ModalForm
            title={isEdit ? '编辑品牌' : '新建品牌'}
            open={visible}
            onOpenChange={(open) => {
                if (!open) {
                    onCancel();
                }
            }}
            onFinish={handleSubmit}
            initialValues={initialValues}
            width={600}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
        >
            <ProFormText
                name="name"
                label="品牌名称"
                placeholder="请输入品牌名称"
                rules={[
                    { required: true, message: '请输入品牌名称' },
                    { max: 50, message: '品牌名称不能超过50个字符' },
                ]}
                width="xl"
            />

            <ProFormText
                name="logo"
                label="品牌Logo"
                placeholder="请输入品牌Logo URL"
                rules={[
                    { max: 200, message: 'Logo URL不能超过200个字符' },
                ]}
                width="xl"
            />

            <ProFormTextArea
                name="description"
                label="品牌描述"
                placeholder="请输入品牌描述"
                rules={[
                    { max: 200, message: '品牌描述不能超过200个字符' },
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
        </ModalForm>
    );
};

export default BrandForm;
