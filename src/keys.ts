import { InjectionKey, Ref } from 'vue'

export const openChatListKey: InjectionKey<() => void> = Symbol('openChatList')

export const openChatKey: InjectionKey<(target: string) => void> = Symbol('openChat')

export const nowTimestampKey: InjectionKey<Ref<number>> = Symbol('nowTimestamp')
