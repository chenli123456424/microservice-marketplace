import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 路由切换时自动滚动到页面顶部的组件
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // 如果没有hash（锚点），则滚动到顶部
    if (!hash) {
      // 使用平滑滚动效果
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // 使用'instant'而不是'smooth'以避免滚动动画
      });
      
      // 确保滚动到顶部，有时上面的方法在某些浏览器可能不生效
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; // 对于Safari浏览器
    }
    // 如果有hash，则滚动到对应的元素位置
    else {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: 'instant',
            block: 'start'
          });
        }
      }, 0);
    }
  }, [pathname, hash]); // 当路径或hash变化时执行

  return null; // 这个组件不渲染任何内容
}

export default ScrollToTop;
