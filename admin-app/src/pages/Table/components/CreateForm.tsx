import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Modal } from 'antd';
import React from 'react';

export interface CreateFormProps {
  onCancel: () => void;
  onSubmit: (values: API.UserInfo) => Promise<void>;
  modalVisible: boolean;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  return (
    <ModalForm<API.UserInfo>
      title="新建用户"
      width="400px"
      modalProps={{
        destroyOnHidden: true,
        onCancel: () => props.onCancel(),
      }}
      visible={props.modalVisible}
      onFinish={props.onSubmit}
    >
      <ProFormText
        name="username"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名！' }]}
      />
      <ProFormText
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱！' },
          { type: 'email', message: '请输入正确的邮箱地址！' },
        ]}
      />
      <ProFormText
        name="password"
        label="密码"
        rules={[{ required: true, message: '请输入密码！' }]}
        fieldProps={{
          type: 'password',
        }}
      />
      <ProFormSelect
        name="role"
        label="角色"
        valueEnum={{
          USER: '普通用户',
          MERCHANT: '商家',
          SUPER_ADMIN: '超级管理员',
        }}
        placeholder="请选择角色"
        rules={[{ required: true, message: '请选择角色！' }]}
        initialValue="USER"
      />
    </ModalForm>
  );
};

export default CreateForm;
