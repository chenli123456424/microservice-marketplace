import React, { useEffect } from 'react';
import { ModalForm, ProFormText, ProFormDigit, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { message } from 'antd';
import services from '@/services/demo';

interface MainCategoryFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: API.MainCategory;
}

const MainCategoryForm: React.FC<MainCategoryFormProps> = ({
    visible,
    onCancel,
    onSuccess,
    initialValues,
}) => {
    const isEdit = !!initialValues;

    const handleSubmit = async (values: API.MainCategory) => {
        try {
            let result;
            if (isEdit) {
                result = await services.CategoryController.updateMainCategory({
                    ...initialValues,
                    ...values,
                });
            } else {
                result = await services.CategoryController.addMainCategory(values);
            }

            if (result?.code === 200) {
                message.success(isEdit ? '更新主分类成功' : '添加主分类成功');
                onSuccess();
            } else {
                message.error(result?.message || (isEdit ? '更新主分类失败' : '添加主分类失败'));
            }
        } catch (error) {
            console.error('提交失败:', error);
            message.error(isEdit ? '更新主分类失败' : '添加主分类失败');
        }
    };

    return (
        <ModalForm
            title={isEdit ? '编辑主分类' : '新建主分类'}
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
        </ModalForm>
    );
};

export default MainCategoryForm;
