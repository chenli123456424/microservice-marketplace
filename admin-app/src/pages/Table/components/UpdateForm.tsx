import {
  ProFormText,
  ProFormSelect,
  StepsForm,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import React from 'react';

export interface FormValueType extends Partial<API.UserInfo> {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
}

export interface UpdateFormProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  values: Partial<API.UserInfo>;
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => (
  <StepsForm
    stepsProps={{
      size: 'small',
    }}
    stepsFormRender={(dom, submitter) => {
      return (
        <Modal
          width={640}
          bodyStyle={{ padding: '32px 40px 48px' }}
          destroyOnHidden
          title="编辑用户"
          open={props.updateModalVisible}
          footer={submitter}
          onCancel={() => props.onCancel()}
        >
          {dom}
        </Modal>
      );
    }}
    onFinish={props.onSubmit}
  >
    <StepsForm.StepForm
      initialValues={{
        id: props.values.id,
        username: props.values.username,
        email: props.values.email,
        role: props.values.role || 'USER',
      }}
      title="基本信息"
    >
      <ProFormText
        width="md"
        name="id"
        label="用户ID"
        disabled
      />
      <ProFormText
        width="md"
        name="username"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名！' }]}
      />
      <ProFormText
        name="email"
        width="md"
        label="邮箱"
        rules={[
          { type: 'email', message: '请输入正确的邮箱地址！' },
        ]}
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
      />
    </StepsForm.StepForm>
  </StepsForm>
);

export default UpdateForm;
