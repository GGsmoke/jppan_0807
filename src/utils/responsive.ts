// 响应式工具函数
export const useResponsive = () => {
  const isMobile = () => window.innerWidth <= 768
  const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024
  const isDesktop = () => window.innerWidth > 1024
  
  const getDialogWidth = () => {
    if (isMobile()) return '95vw'
    if (isTablet()) return '80vw'
    return '600px'
  }
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    getDialogWidth
  }
}