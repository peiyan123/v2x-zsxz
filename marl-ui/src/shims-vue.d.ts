/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  less: any;
  ResizeObserver: any
}

declare module 'less' {}

declare module '*.png'

// declare module 'rxjs' {
//   export type Subject<T> = any
//   export const Subject: any

//   export type fromEvent =  any
//   export const fromEvent: any

//   export type merge = any
//   export const merge:any

//   export type Subscription = any
//   export const Subscription: any
// }

