/** 模态框固定 props 参数, 用于调用模态框成功|关闭|销毁 */
export const modalProps = {
  // 是否展示组件
  modelValue: Boolean,
  // 组件消失时(移除实例)
  vanish: Function,
  // 组件调用成功事件
  resolve: Function,
  // 组件调用失败事件
  reject: Function
}

export interface ModalProps {
  // 是否展示组件
  modelValue: boolean,
  // 组件消失时(移除实例)
  vanish: (el: Element) => void,
  // 组件调用成功事件
  resolve: () => void,
  // 组件调用失败事件
  reject: () => void
}

/** 组件内传入 props 参数, 用于模态框自定义功能 */
export const componentProps = {
  // 模态框标题
  title: {
    type: String,
    default: ''
  },
  // 模态框内容
  content: {
    type: String,
    default: ''
  },
  positiveButtonText: {
    type: String,
    default: '确定'
  },
  negativeButtonText: {
    type: String,
    default: '取消'
  }
}

export interface ComponentProps {
  title: string,
  content?: string,
  positiveButtonText?: string,
  negativeButtonText?: string
}

/** 组件内所有 Props 参数, 合并参数 */
export const props = { ...modalProps, ...componentProps }

export type Props = ModalProps & ComponentProps
