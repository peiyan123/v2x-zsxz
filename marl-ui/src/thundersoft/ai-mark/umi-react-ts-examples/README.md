# 标注工具 可用性测试 Demo

# 基于 umi + react 的SDK集成 示例

# 将 sdk 加入依赖

> 直接将整个目录放入 training_client/src/
    import { ClassificationScene } from '@/thundersoft/ai-mark';


或者 
> npm install git+https://isaacs@github.com/npm/npm.git

参考资料：https://www.cnblogs.com/dreamless/p/8616670.html

之后在项目中 可以 像这样引入

// 放入node_modules

import { ClassificationScene } from '@thundersoft/ai-mark';


# 运行 Demo

## 第一步 将 umi-react-ts-examples 目录放入 training_client/src/page 
## 第二步 配置 前端路由 打开文件 training_client/config/routes.ts
    写入：
    {
        path: '/demo1',
        component: './umi-react-ts-examples/demo-classification',
    },
    ...
## 第三步 npm run dev 运行成功之后 浏览器打开 http://localhost:8000/demo1

# ./ 当前目录 说明

>    ./components  react 组件
>    ./demo-classification      图像分类