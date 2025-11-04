import { request as umiRequest } from '@umijs/max';

/**
 * request工具封装
 */
const request = async (url: string, options?: any) => {
  try {
    const response = await umiRequest(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return response;
  } catch (error) {
    console.error('Request error:', error);
    throw error;
  }
};

export default request;

