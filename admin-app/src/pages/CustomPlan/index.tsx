import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Modal, Form, Input, InputNumber, Select, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import request from '@/utils/request';
import ImageUpload from '@/components/ImageUpload';

const { TextArea } = Input;
const { Option } = Select;

interface CustomPlan {
  id: number;
  name: string;
  type: string;
  priceRange: string;
  priceFrom: number;
  priceTo: number;
  description: string;
  includes: string;
  highlight: string;
  icon: string;
  sortOrder: number;
  status: number;
  createTime: string;
  updateTime: string;
}

const CustomPlanList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<CustomPlan | undefined>();
  const [form] = Form.useForm();

  const columns: ProColumns<CustomPlan>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '方案名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '方案类型',
      dataIndex: 'type',
      width: 120,
      valueType: 'select',
      valueEnum: {
        basic: { text: '基础版' },
        advanced: { text: '进阶版' },
        luxury: { text: '豪华版' },
      },
    },
    {
      title: '价格区间',
      dataIndex: 'priceRange',
      width: 150,
      search: false,
    },
    {
      title: '起始价格',
      dataIndex: 'priceFrom',
      width: 120,
      search: false,
      render: (text) => `¥${Number(text).toLocaleString()}/㎡`,
    },
    {
      title: '结束价格',
      dataIndex: 'priceTo',
      width: 120,
      search: false,
      render: (text) => `¥${Number(text).toLocaleString()}/㎡`,
    },
    {
      title: '方案亮点',
      dataIndex: 'highlight',
      width: 150,
      search: false,
      ellipsis: true,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 80,
      search: false,
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      width: 80,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        0: { text: '下架', status: 'Default' },
        1: { text: '上架', status: 'Success' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 150,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentPlan(record);
            form.setFieldsValue({
              ...record,
              includes: record.includes ? JSON.parse(record.includes) : [],
            });
            setModalVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这个方案吗？',
              onOk: async () => {
                try {
                  const response = await request(`/api/custom-plans/${record.id}`, {
                    method: 'DELETE',
                  });
                  if (response.code === 200) {
                    message.success('删除成功');
                    actionRef.current?.reload();
                  } else {
                    message.error(response.message || '删除失败');
                  }
                } catch (error) {
                  message.error('删除失败');
                }
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        includes: JSON.stringify(values.includes || []),
        status: values.status ? 1 : 0,
      };

      const url = '/api/custom-plans';
      const method = currentPlan ? 'PUT' : 'POST';

      if (currentPlan) {
        data.id = currentPlan.id;
      }

      const response = await request(url, {
        method,
        data,
      });

      if (response.code === 200) {
        message.success(currentPlan ? '更新成功' : '创建成功');
        setModalVisible(false);
        form.resetFields();
        setCurrentPlan(undefined);
        actionRef.current?.reload();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <PageContainer>
      <ProTable<CustomPlan>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const response = await request('/api/custom-plans/page', {
            params: {
              pageNum: params.current,
              pageSize: params.pageSize,
              type: params.type,
              status: params.status,
            },
          });
          return {
            data: response.data?.records || [],
            success: response.code === 200,
            total: response.data?.total || 0,
          };
        }}
        rowKey="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 1400 }}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentPlan(undefined);
              form.resetFields();
              setModalVisible(true);
            }}
            type="primary"
          >
            新建方案
          </Button>,
        ]}
      />

      <Modal
        title={currentPlan ? '编辑方案' : '新建方案'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setCurrentPlan(undefined);
        }}
        onOk={() => form.submit()}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 1,
            sortOrder: 0,
          }}
        >
          <Form.Item
            name="name"
            label="方案名称"
            rules={[{ required: true, message: '请输入方案名称' }]}
          >
            <Input placeholder="请输入方案名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="方案类型"
            rules={[{ required: true, message: '请选择方案类型' }]}
          >
            <Select placeholder="请选择方案类型">
              <Option value="basic">基础版</Option>
              <Option value="advanced">进阶版</Option>
              <Option value="luxury">豪华版</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priceRange"
            label="价格区间"
            rules={[{ required: true, message: '请输入价格区间' }]}
          >
            <Input placeholder="例如：800-1200元/㎡" />
          </Form.Item>

          <Form.Item
            name="priceFrom"
            label="起始价格（元/㎡）"
            rules={[{ required: true, message: '请输入起始价格' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="priceTo"
            label="结束价格（元/㎡）"
            rules={[{ required: true, message: '请输入结束价格' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="description" label="方案描述">
            <TextArea rows={3} placeholder="请输入方案描述" />
          </Form.Item>

          <Form.Item name="includes" label="包含内容">
            <Select mode="tags" placeholder="输入后按回车添加">
              <Option value="优质板材">优质板材</Option>
              <Option value="品牌五金">品牌五金</Option>
              <Option value="专业设计师">专业设计师</Option>
              <Option value="专业安装">专业安装</Option>
              <Option value="质保服务">质保服务</Option>
            </Select>
          </Form.Item>

          <Form.Item name="highlight" label="方案亮点">
            <Input placeholder="请输入方案亮点" />
          </Form.Item>

          <Form.Item name="icon" label="方案图标（emoji）">
            <Input placeholder="例如：💰 ⭐ 👑" />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序权重">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数值越小越靠前" />
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default CustomPlanList;

