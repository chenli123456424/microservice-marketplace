import React, { useEffect, useState } from 'react';
import { ModalForm, ProFormText, ProFormDigit, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { message } from 'antd';
import services from '@/services/demo';

interface FilterDimensionFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: API.FilterDimension;
}

const FilterDimensionForm: React.FC<FilterDimensionFormProps> = ({
    visible,
    onCancel,
    onSuccess,
    initialValues,
}) => {
    const isEdit = !!initialValues;
    const [mainCategories, setMainCategories] = useState<API.MainCategory[]>([]);
    const [subCategories, setSubCategories] = useState<API.SubCategory[]>([]);
    const [parentDimensions, setParentDimensions] = useState<API.FilterDimension[]>([]);

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
            fetchMainCategories();
        }
    }, [visible]);

    // 获取子分类列表
    const fetchSubCategories = async (mainId: number) => {
        try {
            const response = await services.CategoryController.getAllSubCategories(mainId);
            if (response?.code === 200) {
                setSubCategories(response.data || []);
            }
        } catch (error) {
            console.error('获取子分类列表失败:', error);
        }
    };

    // 获取父级筛选维度列表
    const fetchParentDimensions = async (mainId?: number, subId?: number) => {
        try {
            const response = await services.CategoryController.getFilterDimensionList({
                page: 1,
                size: 1000,
                mainId,
                subId,
            });
            if (response?.code === 200) {
                // 只显示层级为1的维度作为父级
                const parentDims = (response.data?.records || []).filter(dim => dim.level === 1);
                setParentDimensions(parentDims);
            }
        } catch (error) {
            console.error('获取父级筛选维度列表失败:', error);
        }
    };

    const handleSubmit = async (values: API.FilterDimension) => {
        try {
            let result;
            if (isEdit) {
                result = await services.CategoryController.updateFilterDimension({
                    ...initialValues,
                    ...values,
                });
            } else {
                result = await services.CategoryController.addFilterDimension(values);
            }

            if (result?.code === 200) {
                message.success(isEdit ? '更新筛选维度成功' : '添加筛选维度成功');
                onSuccess();
            } else {
                message.error(result?.message || (isEdit ? '更新筛选维度失败' : '添加筛选维度失败'));
            }
        } catch (error) {
            console.error('提交失败:', error);
            message.error(isEdit ? '更新筛选维度失败' : '添加筛选维度失败');
        }
    };

    return (
        <ModalForm
            title={isEdit ? '编辑筛选维度' : '新建筛选维度'}
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
            <ProFormSelect
                name="mainId"
                label="所属主分类"
                placeholder="请选择所属主分类"
                rules={[
                    { required: true, message: '请选择所属主分类' },
                ]}
                width="md"
                options={mainCategories.map(category => ({
                    label: category.name,
                    value: category.mainId,
                }))}
                fieldProps={{
                    onChange: (value) => {
                        if (value) {
                            fetchSubCategories(value);
                            fetchParentDimensions(value);
                        } else {
                            setSubCategories([]);
                            setParentDimensions([]);
                        }
                    },
                }}
            />

            <ProFormSelect
                name="subId"
                label="所属子分类"
                placeholder="请选择所属子分类"
                width="md"
                options={subCategories.map(category => ({
                    label: category.name,
                    value: category.subId,
                }))}
                fieldProps={{
                    onChange: (value, option) => {
                        if (value && option) {
                            const mainId = (option as any).mainId;
                            fetchParentDimensions(mainId, value);
                        }
                    },
                }}
            />

            <ProFormSelect
                name="parentId"
                label="父级维度"
                placeholder="请选择父级维度（可选）"
                width="md"
                options={parentDimensions.map(dimension => ({
                    label: dimension.name,
                    value: dimension.dimensionId,
                }))}
            />

            <ProFormText
                name="name"
                label="维度名称"
                placeholder="请输入维度名称"
                rules={[
                    { required: true, message: '请输入维度名称' },
                    { max: 50, message: '维度名称不能超过50个字符' },
                ]}
                width="xl"
            />

            <ProFormDigit
                name="level"
                label="层级"
                placeholder="请输入层级"
                rules={[
                    { required: true, message: '请输入层级' },
                    { type: 'number', min: 1, max: 3, message: '层级必须在1-3之间' },
                ]}
                width="sm"
                fieldProps={{
                    precision: 0,
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

export default FilterDimensionForm;
