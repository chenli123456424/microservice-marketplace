import { modalService } from '../components/ModalManager';

// 全局Modal工具函数
export const showModal = {
    // 成功提示
    success: (message, title = '成功') => {
        modalService.success(message, title);
    },

    // 错误提示
    error: (message, title = '错误') => {
        modalService.error(message, title);
    },

    // 警告提示
    warning: (message, title = '警告') => {
        modalService.warning(message, title);
    },

    // 信息提示（支持回调）
    info: (message, title = '提示', onConfirm = null) => {
        modalService.info(message, title, onConfirm);
    },

    // 确认对话框
    confirm: (message, title = '确认', onConfirm, onCancel) => {
        modalService.confirm(message, title, onConfirm, onCancel);
    },

    // 自定义Modal
    show: (options) => {
        modalService.show(options);
    }
};

// 替换默认的alert函数
export const customAlert = (message, type = 'info') => {
    showModal[type](message);
};

// 替换默认的confirm函数
export const customConfirm = (message, onConfirm, onCancel) => {
    showModal.confirm(message, '确认', onConfirm, onCancel);
};

// 默认导出
export default showModal;
