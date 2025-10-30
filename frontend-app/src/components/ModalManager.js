import React, { useState, useCallback } from 'react';
import CustomModal from './CustomModal';

// 创建全局Modal管理器
class ModalService {
    constructor() {
        this.listeners = [];
        this.modalState = {
            isOpen: false,
            title: '',
            message: '',
            type: 'info',
            showCancel: false,
            onConfirm: null,
            onCancel: null,
            onSuccess: null
        };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.modalState));
    }

    show({ title, message, type = 'info', showCancel = false, onConfirm, onCancel, onSuccess }) {
        this.modalState = {
            isOpen: true,
            title,
            message,
            type,
            showCancel,
            onConfirm,
            onCancel,
            onSuccess
        };
        this.notify();
    }

    hide() {
        this.modalState = {
            ...this.modalState,
            isOpen: false
        };
        this.notify();
    }

    // 便捷方法
    success(message, title = '成功', onConfirm = null, onSuccess = null) {
        console.log('ModalService.success 被调用:', { message, title, onConfirm, onSuccess });
        this.show({ title, message, type: 'success', onConfirm, onSuccess });
    }

    error(message, title = '错误', onConfirm = null) {
        this.show({ title, message, type: 'error', onConfirm });
    }

    warning(message, title = '警告', onConfirm = null) {
        this.show({ title, message, type: 'warning', onConfirm });
    }

    info(message, title = '提示', onConfirm = null) {
        this.show({ title, message, type: 'info', onConfirm });
    }

    confirm(message, title = '确认', onConfirm, onCancel) {
        this.show({ 
            title, 
            message, 
            type: 'warning', 
            showCancel: true, 
            onConfirm, 
            onCancel 
        });
    }
}

// 创建全局实例
const modalService = new ModalService();

// Modal管理器组件
const ModalManager = () => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        showCancel: false,
        onConfirm: null,
        onCancel: null,
        onSuccess: null
    });

    React.useEffect(() => {
        const unsubscribe = modalService.subscribe(setModalState);
        return unsubscribe;
    }, []);

    const handleClose = useCallback(() => {
        modalService.hide();
    }, []);

    return (
        <CustomModal
            isOpen={modalState.isOpen}
            onClose={handleClose}
            title={modalState.title}
            message={modalState.message}
            type={modalState.type}
            showCancel={modalState.showCancel}
            onConfirm={modalState.onConfirm}
            onCancel={modalState.onCancel}
            onSuccess={modalState.onSuccess}
        />
    );
};

// 导出服务实例和组件
export { modalService };
export default ModalManager;
