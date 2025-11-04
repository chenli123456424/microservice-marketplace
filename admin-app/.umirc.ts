import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '用户管理',
      path: '/table',
      component: './Table',
    },
    {
      name:'商品管理',
      path: '/product',
      component: './Product',
    },
    {
      name: '订单管理',
      path: '/order',
      component: './Order',
    },
    {
      name: '分类管理',
      path: '/category',
      component: './Category',
    },
    {
      name: '公告管理',
      path: '/announcement',
      component: './Announcement',
    },
    {
      name: '定制案例管理',
      path: '/custom-case',
      component: './CustomCase',
    },
    {
      name: '设计师管理',
      path: '/designer',
      component: './Designer',
    },
    {
      name: '定制方案管理',
      path: '/custom-plan',
      component: './CustomPlan',
    },
    {
      name: '预约管理',
      path: '/appointment',
      component: './Appointment',
    },
    {
      name: '门店管理',
      path: '/store',
      component: './Store',
    }
  ],
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://localhost:8081',  // 修改为正确的后端地址
      changeOrigin: true,               // 修改请求源
      pathRewrite: { '^/api': '/api' }, // 路径重写
    },
  }
});