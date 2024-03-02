import React, { Component } from 'react'
// 自研sdk
import { LandmarkScene } from '@/pages/ai-mark'
// 用来测试的图片数据
import { images } from './access-image'

class Landmark extends Component<any> {
  el!: HTMLDivElement | null
  landmarkScene!: LandmarkScene

  // 标注规则
  state = {
    lineRuleString: '1:4;4-1',
    index: 1,
    maxIndex: 4,
    color: 'rgb(60,60,60)',
  }

  componentDidMount() {
    // 初始化： 加载图片 + 数据 + 标注规则
    this.landmarkScene = LandmarkScene.init(this.el as HTMLElement, images[0], [], this.state)

    // this.landmarkScene = LandmarkScene.init(this.el as HTMLElement)
    // state change
    this.landmarkScene.stateChangeEvent.subscribe((state) => {
      this.setState(state)
    })
  }

  // 回显
  setData() {
    this.landmarkScene.setData([
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
  // 获取数据
  getData() {
    alert(JSON.stringify(this.landmarkScene.getData()))
  }

  render() {
    const { index, color } = this.state
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
          Landmark (关键点)
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
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.setData()}>
                回显数据
              </button>
              <button style={{ margin: '5px 10px' }} onClick={(e) => this.getData()}>
                获取数据
              </button>
            </h3>
            <h3>
              <button style={{ margin: '5px' }} onClick={(e) => this.landmarkScene.save()}>
                Save
              </button>
            </h3>
            <h3 style={{ background: color }}>关键点：</h3>
            <p>
              <button
                style={{ margin: '0 5px', background: index == 1 ? color : 'white' }}
                onClick={() => this.landmarkScene.updatePoint(1)}
              >
                {' '}
                1
              </button>
              <button
                style={{ margin: '0 5px', background: index == 2 ? color : 'white' }}
                onClick={() => this.landmarkScene.updatePoint(2)}
              >
                {' '}
                2
              </button>
              <button
                style={{ margin: '0 5px', background: index == 3 ? color : 'white' }}
                onClick={() => this.landmarkScene.updatePoint(3)}
              >
                {' '}
                3
              </button>
              <button
                style={{ margin: '0 5px', background: index == 4 ? color : 'white' }}
                onClick={() => this.landmarkScene.updatePoint(4)}
              >
                {' '}
                4
              </button>
              <button
                style={{ margin: '0 5px', background: index == 5 ? color : 'white' }}
                onClick={() => this.landmarkScene.updatePoint(5)}
              >
                {' '}
                5
              </button>
              <button
                style={{ margin: '0 5px', background: index == 6 ? color : 'white' }}
                onClick={() => this.landmarkScene.updatePoint(6)}
              >
                {' '}
                6
              </button>
            </p>
            <h3>
              <button style={{ margin: '5px' }} onClick={(e) => this.landmarkScene.keyPointCanvas.reset()}>
                复位
              </button>
              <button style={{ margin: '5px' }} onClick={(e) => this.landmarkScene.drawArrow()}>
                画箭头
              </button>
              <button style={{ margin: '5px' }} onClick={(e) => this.landmarkScene.drawMark()}>
                画标记
              </button>
            </h3>
            <h3>
              <button
                style={{ margin: '5px', background: index == 1 ? 'bisque' : 'white' }}
                onClick={(e) => this.landmarkScene.keyPointCanvas.deleteSelected()}
              >
                删除 对象或者点
              </button>
            </h3>
            <h3>
              <button style={{ margin: '5px' }} onClick={(e) => this.landmarkScene.open()}>
                开启
              </button>
              <button style={{ margin: '5px' }} onClick={(e) => this.landmarkScene.close()}>
                关闭
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
      </div>
    )
  }
}

export default Landmark
