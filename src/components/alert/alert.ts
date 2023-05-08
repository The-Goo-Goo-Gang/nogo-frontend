import { ref } from 'vue'
import AlertComponent from './Alert.vue'
import { ComponentProps } from './props'
import { renderInstance } from './utils'

/** 组件 Props 类型, ExtractPropTypes 可将 Constructor 转换为对应值类型 */
type Props = ComponentProps & { onConfirm?: () => void, onClose?: () => void, onNeutralClicked?: () => void }

/** 组件调用 resolve 返回结果 */
type Result = { path: string }[]

/**
 * 模态框调用方法
 * @param props
 * @returns {Promise}
 */
export const Alert = (props: Props): Promise<Result> => {
  return new Promise<Result>((resolve, reject) => {
    renderInstance(AlertComponent, {
      // 这里 modelValue, 为了使组件可修改, 需要传入 ref
      // 注意这块地方，我们将这个值设置为 true 为了调起即直接展示组件
      modelValue: ref(true),
      ...props,
      resolve,
      reject
    })
  })
}
