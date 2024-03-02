import React, { Component } from 'react'
// 自研sdk
import { SegmentationScene } from '@/pages/ai-mark'
// 用来测试的图片数据
import { images } from './access-image'

class Segmentaton extends Component<any> {
  el!: HTMLDivElement | null
  keyPointCanvas!: SegmentationScene
  /**
   * 预加载多图片，网络慢时 加载图片 的loading效果由业务层处理
   * ["data:image/jpeg;base64,/9j/4....", ...]
   */
  imageData = images

  types = [
    {
      color:
        'rgb(' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ',' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ',' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ')',
      type: 'head',
      label: '头',
    },
    {
      color:
        'rgb(' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ',' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ',' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ')',
      type: '1111',
      label: '身子',
    },
    {
      color:
        'rgb(' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ',' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ',' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ')',
      type: '2222',
      label: '腿',
    },
    {
      color:
        'rgb(' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ',' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ',' +
        parseInt(Math.random() * 1000 + '') / 4 +
        ')',
      type: '3333',
      label: '脚',
    },
  ]

  componentDidMount() {
    this.keyPointCanvas = new SegmentationScene(this.el as HTMLElement)
    // 加载图片
    this.keyPointCanvas.reload(this.imageData[1], [
      {
        ...this.types[0],
        pointSource: [
          { x: 494, y: 164 },
          { x: 516, y: 239 },
          { x: 621, y: 328 },
          { x: 815, y: 251 },
          { x: 782, y: 103 },
          { x: 690, y: 49 },
          { x: 564, y: 72 },
        ],
      },
    ])
    // 进入标注模式
    this.keyPointCanvas.openMarkMode(this.types[0])
  }

  // 未标注图片加载 默认进入标注模式
  loadImage() {
    this.keyPointCanvas.reload(this.imageData[1], [])
  }

  // 回显
  setData() {
    this.keyPointCanvas.setData([
      {
        ...this.types[0],
        pointSource: [
          { x: 494, y: 164 },
          { x: 516, y: 239 },
          { x: 621, y: 328 },
          { x: 815, y: 251 },
          { x: 782, y: 103 },
          { x: 690, y: 49 },
          { x: 564, y: 72 },
        ],
      },
    ])
  }

  // 获取数据
  getData() {
    alert(JSON.stringify(this.keyPointCanvas.getData()))
  }

  render() {
    return (
      <div
        style={{
          userSelect: 'none',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            margin: '20px',
          }}
        >
          segmentation (图像分割)
        </h1>
        <div
          style={{
            verticalAlign: 'top',
            margin: '0 1vw',
            display: 'inline-block',
            width: '24vw',
            border: '1px solid',
          }}
        >
          <div>
            <h3>
              <span>进入：</span>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.loadImage()}>
                图片
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.setData()}>
                回显
              </button>
            </h3>
            <h3>
              <span>类型：</span>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.keyPointCanvas.closeMarkMode()}>
                关闭标注模式
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.keyPointCanvas.openMarkMode()}>
                开启标注模式（可选中）
              </button>

              <button style={{ margin: '5px 10px' }} onClick={(e) => this.keyPointCanvas.openMarkMode(this.types[0])}>
                开启标注模式（标注：头) 默认
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.keyPointCanvas.openMarkMode(this.types[1])}>
                开启标注模式（标注：身子)
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.keyPointCanvas.openMarkMode(this.types[2])}>
                开启标注模式（标注：腿)
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.keyPointCanvas.openMarkMode(this.types[3])}>
                开启标注模式（标注：脚)
              </button>
            </h3>
            <h3>
              <span>操作：</span>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.keyPointCanvas.markModeSave()}>
                暂存
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.keyPointCanvas.reset()}>
                复位
              </button>
            </h3>
            <h3>
              <span>数据：</span>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.getData()}>
                数据
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.keyPointCanvas.deleteSelected()}>
                删除 对象或者点
              </button>
            </h3>
          </div>
        </div>
        <div
          style={{
            margin: '0 1vw',
            display: 'inline-block',
            width: '70vw',
            height: '68vh',
            border: '1px solid',
          }}
          ref={(el) => (this.el = el)}
        ></div>
        <div
          style={{
            verticalAlign: 'top',
            margin: '0 1vw',
            display: 'inline-block',
            width: '96vw',
            border: '1px solid',
          }}
        >
          <h2>辅助线：</h2>
          准星
          <button
            style={{ margin: '10px 10px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineCollimator = true)}
          >
            开启
          </button>
          <button
            style={{ margin: '5px 10px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineCollimator = false)}
          >
            关闭
          </button>
          线条类型
          <button
            style={{ margin: '7px 10px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineDash = 0)}
          >
            实
          </button>
          <button
            style={{ margin: '5px 10px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineDash = 1)}
          >
            虚1
          </button>
          <button
            style={{ margin: '5px 10px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineDash = 6)}
          >
            6
          </button>
          <button
            style={{ margin: '5px 10px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineDash = 15)}
          >
            15
          </button>
          线条颜色
          <button
            style={{ margin: '10px 5px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineColor = 'black')}
          >
            black
          </button>
          <button
            style={{ margin: '5px 5px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineColor = 'red')}
          >
            red
          </button>
          <button
            style={{ margin: '5px 5px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineColor = 'blue')}
          >
            blue
          </button>
          <button
            style={{ margin: '5px 5px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineColor = '#f5dc5d')}
          >
            默认
          </button>
          线条宽度
          <button
            style={{ margin: '10px 10px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineWidth = 1)}
          >
            1
          </button>
          <button
            style={{ margin: '5px 10px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineWidth = 2)}
          >
            2
          </button>
          <button
            style={{ margin: '5px 10px' }}
            onClick={() => (this.keyPointCanvas.markCanvas.guideLineConfig!.guideLineWidth = 3)}
          >
            3
          </button>
        </div>
      </div>
    )
  }
}

export default Segmentaton
