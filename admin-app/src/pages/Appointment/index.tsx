import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message, Modal, Form, Input, Select, Tag } from 'antd';
import request from '@/utils/request';

const { TextArea } = Input;
const { Option } = Select;

interface Appointment {
  id: number;
  userId: number;
  name: string;
  phone: string;
  city: string;
  area: number;
  style: string;
  budget: string;
  remark: string;
  designerId: number;
  designerName?: string;
  designer?: {
    id: number;
    name: string;
    title: string;
  };
  status: number;
  handlerId: number;
  handleTime: string;
  handleRemark: string;
  createTime: string;
  updateTime: string;
}

const AppointmentList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [handleModalVisible, setHandleModalVisible] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | undefined>();
  const [form] = Form.useForm();

  const statusMap = {
    0: { text: '待处理', color: 'orange' },
    1: { text: '已联系', color: 'blue' },
    2: { text: '已量尺', color: 'cyan' },
    3: { text: '已完成', color: 'green' },
    9: { text: '已取消', color: 'red' },
  };

  const columns: ProColumns<Appointment>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      search: false,
    },
    {
      title: '客户姓名',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      width: 120,
    },
    {
      title: '所在城市',
      dataIndex: 'city',
      width: 100,
      search: false,
    },
    {
      title: '房屋面积',
      dataIndex: 'area',
      width: 100,
      search: false,
      render: (text) => text ? `${text}㎡` : '-',
    },
    {
      title: '装修风格',
      dataIndex: 'style',
      width: 100,
      search: false,
    },
    {
      title: '预算范围',
      dataIndex: 'budget',
      width: 120,
      search: false,
    },
    {
      title: '设计师',
      dataIndex: 'designerName',
      width: 120,
      search: false,
      render: (text, record) => {
        if (record.designerName) {
          return record.designerName;
        }
        if (record.designer) {
          return record.designer.name;
        }
        return '-';
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      search: false,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        0: { text: '待处理', status: 'Warning' },
        1: { text: '已联系', status: 'Processing' },
        2: { text: '已量尺', status: 'Processing' },
        3: { text: '已完成', status: 'Success' },
        9: { text: '已取消', status: 'Error' },
      },
      render: (_, record) => {
        const status = statusMap[record.status as keyof typeof statusMap];
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '处理备注',
      dataIndex: 'handleRemark',
      width: 150,
      search: false,
      ellipsis: true,
    },
    {
      title: '预约时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '处理时间',
      dataIndex: 'handleTime',
      valueType: 'dateTime',
      width: 160,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="handle"
          onClick={() => {
            setCurrentAppointment(record);
            form.setFieldsValue({
              status: record.status,
              handleRemark: record.handleRemark,
            });
            setHandleModalVisible(true);
          }}
        >
          处理
        </a>,
        <a
          key="view"
          onClick={() => {
            Modal.info({
              title: '预约详情',
              width: 600,
              content: (
                <div style={{ marginTop: 20 }}>
                  <p><strong>客户姓名：</strong>{record.name}</p>
                  <p><strong>联系电话：</strong>{record.phone}</p>
                  <p><strong>所在城市：</strong>{record.city}</p>
                  <p><strong>房屋面积：</strong>{record.area ? `${record.area}㎡` : '-'}</p>
                  <p><strong>装修风格：</strong>{record.style || '-'}</p>
                  <p><strong>预算范围：</strong>{record.budget || '-'}</p>
                  <p><strong>指定设计师：</strong>{record.designerName || record.designer?.name || '未指定'}</p>
                  <p><strong>客户备注：</strong>{record.remark || '-'}</p>
                  <p><strong>状态：</strong>{statusMap[record.status as keyof typeof statusMap].text}</p>
                  {record.handleRemark && (
                    <p><strong>处理备注：</strong>{record.handleRemark}</p>
                  )}
                  <p><strong>预约时间：</strong>{record.createTime}</p>
                  {record.handleTime && (
                    <p><strong>处理时间：</strong>{record.handleTime}</p>
                  )}
                </div>
              ),
            });
          }}
        >
          详情
        </a>,
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这条预约记录吗？',
              onOk: async () => {
                try {
                  const response = await request(`/api/appointments/${record.id}`, {
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
      if (!currentAppointment) return;

      const response = await request(`/api/appointments/${currentAppointment.id}/handle`, {
        method: 'POST',
        data: {
          status: values.status,
          handlerId: 1, // TODO: 从登录用户信息获取
          handleRemark: values.handleRemark,
        },
      });

      if (response.code === 200) {
        message.success('处理成功');
        setHandleModalVisible(false);
        form.resetFields();
        setCurrentAppointment(undefined);
        actionRef.current?.reload();
      } else {
        message.error(response.message || '处理失败');
      }
    } catch (error) {
      message.error('处理失败');
    }
  };

  return (
    <PageContainer>
      <ProTable<Appointment>
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const response = await request('/api/appointments/page', {
            params: {
              pageNum: params.current,
              pageSize: params.pageSize,
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
        scroll={{ x: 1600 }}
      />

      <Modal
        title="处理预约"
        open={handleModalVisible}
        onCancel={() => {
          setHandleModalVisible(false);
          form.resetFields();
          setCurrentAppointment(undefined);
        }}
        onOk={() => form.submit()}
        width={500}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="status"
            label="处理状态"
            rules={[{ required: true, message: '请选择处理状态' }]}
          >
            <Select placeholder="请选择处理状态">
              <Option value={0}>待处理</Option>
              <Option value={1}>已联系</Option>
              <Option value={2}>已量尺</Option>
              <Option value={3}>已完成</Option>
              <Option value={9}>已取消</Option>
            </Select>
          </Form.Item>

          <Form.Item name="handleRemark" label="处理备注">
            <TextArea rows={4} placeholder="请输入处理备注" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default AppointmentList;

