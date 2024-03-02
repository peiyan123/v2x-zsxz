import React, { Component } from 'react'
// 自研sdk
import { KeyPointScene } from '@/pages/ai-mark'
// 用来测试的图片数据
import { images } from './access-image'

class KeyPoint extends Component<any> {
  el!: HTMLDivElement | null
  keyPointCanvas!: KeyPointScene
  /**
   * 预加载多图片，网络慢时 加载图片 的loading效果由业务层处理
   * ["data:image/jpeg;base64,/9j/4....", ...]
   */
  imageData = images

  componentDidMount() {
    this.keyPointCanvas = new KeyPointScene(this.el as HTMLElement)
    // 进入标注模式
    this.loadImage()
    // 选中对象
    this.keyPointCanvas.markCanvas.shapeSelectedBeforeEvent?.subscribe((d) => {
      // alert('选中对象:' + JSON.stringify(d))
    })
    // 选中点
    this.keyPointCanvas.markCanvas.pointSelectedEvent?.subscribe((d) => {
      // alert('选中点:' + JSON.stringify(d))
    })
  }

  // 未标注图片加载 默认进入标注模式
  loadImage() {
    this.keyPointCanvas.reload(this.imageData[1], [])
  }

  // 回显
  setData() {
    this.keyPointCanvas.reload(this.imageData[0], [
      {
        pointSource: [
          { x: 510, y: 460, index: 1, label: '1嘴', color: 'blue' },
          { x: 330, y: 440, index: 2, label: '2脸', color: 'blue' },
          { x: 330, y: 330, index: 3, label: '3眼', color: 'blue' },
        ],
        maxIndex: 6, // 最多可以标注6个点
        lineRuleString: '1:3;6:3;6-1;6-3',
        color: 'rgb(35, 98, 29)',
      },
      {
        pointSource: [
          { x: 200, y: 270, index: 4, label: '发', color: 'blue' },
          { x: 270, y: 270, index: 5, label: '眉', color: 'blue' },
          { x: 169, y: 610, index: 6, label: '耳', color: 'blue' },
        ],
        maxIndex: 6, // 最多可以标注6个点
        lineRuleString: '1:3;6:3;6-1;6-3',
        color: 'rgb(35, 98, 129)',
      },
      {
        pointSource: [
          { color: 'black', index: 1, label: '1', x: 588, y: 420 },
          { color: 'black', index: 2, label: '2', x: 829, y: 302 },
          { color: 'black', index: 3, label: '3', x: 728, y: 208 },
        ],
        maxIndex: 6, // 最多可以标注6个点
        lineRuleString: '1:3;6:3;6-1;6-3',
        color: 'rgb(237, 244, 189)',
      },
      {
        pointSource: [
          { color: 'black', index: 4, x: 940, y: 149 },
          { color: 'black', index: 5, x: 730, y: 118 },
          { color: 'black', index: 6, x: 999, y: 369 },
        ],
        maxIndex: 6, // 最多可以标注6个点
        lineRuleString: '1:3;6:3;6-1;6-3',
        color: 'rgb(37, 244, 189)',
      },
    ])
  }

  // 标注
  mark() {
    const color =
      'rgb(' +
      parseInt(Math.random() * 1000 + '') / 4 +
      ',' +
      parseInt(Math.random() * 1000 + '') / 4 +
      ',' +
      parseInt(Math.random() * 1000 + '') / 4 +
      ')'
    this.keyPointCanvas.openMarkMode({
      lineRuleString: '1:3;6:3;6-1;6-3',
      color,
      index: 1,
      maxIndex: 6,
    })
  }

  // 获取数据
  getData() {
    alert(JSON.stringify(this.keyPointCanvas.getData()))
  }

  // 当前模式
  getModel() {
    alert(this.keyPointCanvas.getModel())
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
          keyPoint (关键点)
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
            <h3>连线规则：</h3>
            <h3>'1:3;6:3;6-1;6-3' (数字：index)</h3>
            <h3>'1:3;6:3;6-1;6-3' (";" 分割) </h3>
            <h3>'1:3;6:3;6-1;6-3' ("3:5" 3点到5点按顺序连线) </h3>
            <h3>"3-5" 3点和5点 两点直接连线</h3>
            <h3>index = 1 (index: 大于0的正整数，默认：1 )</h3>
            <h3>maxIndex = 6 (最大的标注数量) </h3>

            <h3>默认：未标注图片+标注模式</h3>
            <h3>
              <span>进入：</span>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.loadImage()}>
                图片
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.setData()}>
                回显
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.getModel()}>
                模式
              </button>
            </h3>
            <h3>
              <span>操作：</span>
              <button style={{ margin: '5px' }} onClick={(e) => this.keyPointCanvas.reset()}>
                复位
              </button>
              <button style={{ margin: '5px' }} onClick={(e) => this.keyPointCanvas.markModeSave()}>
                暂存
              </button>
              <button style={{ margin: '5px' }} onClick={() => this.mark()}>
                {' '}
                标注(1:3;6:3;6-1;6-3)
              </button>
              <button style={{ margin: '5px' }} onClick={() => this.keyPointCanvas.openMarkMode()}>
                {' '}
                开启标注模式（可选中）
              </button>
              <button style={{ margin: '5px' }} onClick={() => this.keyPointCanvas.closeMarkMode()}>
                {' '}
                关闭标注模式
              </button>
            </h3>
            <h3>单点标注模式：</h3>
            <p>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.singlePoint(1)}>
                {' '}
                1
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.singlePoint(2)}>
                {' '}
                2
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.singlePoint(3)}>
                {' '}
                3
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.singlePoint(4)}>
                {' '}
                4
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.singlePoint(5)}>
                {' '}
                5
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.singlePoint(6)}>
                {' '}
                6
              </button>
            </p>
            <h3>单点标注模式：(自定义点)</h3>
            <p>
              <button
                style={{ margin: '0 5px' }}
                onClick={() => this.keyPointCanvas.singlePoint(1, [{ index: 1, label: '嘴' }])}
              >
                {' '}
                嘴
              </button>
              <button
                style={{ margin: '0 5px' }}
                onClick={() => this.keyPointCanvas.singlePoint(2, [{ index: 2, label: '脸' }])}
              >
                {' '}
                脸
              </button>
              <button
                style={{ margin: '0 5px' }}
                onClick={() => this.keyPointCanvas.singlePoint(3, [{ index: 3, label: '眼' }])}
              >
                {' '}
                眼
              </button>
              <button
                style={{ margin: '0 5px' }}
                onClick={() => this.keyPointCanvas.singlePoint(4, [{ index: 4, label: '头发' }])}
              >
                {' '}
                头发
              </button>
              <button
                style={{ margin: '0 5px' }}
                onClick={() => this.keyPointCanvas.singlePoint(5, [{ index: 5, label: '眉毛' }])}
              >
                {' '}
                眉毛
              </button>
              <button
                style={{ margin: '0 5px' }}
                onClick={() => this.keyPointCanvas.singlePoint(6, [{ index: 6, label: '耳朵' }])}
              >
                {' '}
                耳朵
              </button>
            </p>
            <h3>持续标注模式：</h3>
            <p>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.updatePoint(1)}>
                {' '}
                1
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.updatePoint(2)}>
                {' '}
                2
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.updatePoint(3)}>
                {' '}
                3
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.updatePoint(4)}>
                {' '}
                4
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.updatePoint(5)}>
                {' '}
                5
              </button>
              <button style={{ margin: '0 5px' }} onClick={() => this.keyPointCanvas.updatePoint(6)}>
                {' '}
                6
              </button>
            </p>
            <h3>持续标注模式：(自定义点)</h3>
            <p>
              <button
                style={{ margin: '0 5px' }}
                onClick={() =>
                  this.keyPointCanvas.updatePoint(5, [
                    { index: 5, label: '眉毛' },
                    { index: 6, label: '耳朵' },
                  ])
                }
              >
                {' '}
                眉、耳
              </button>
            </p>
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
            height: '81vh',
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

export default KeyPoint
