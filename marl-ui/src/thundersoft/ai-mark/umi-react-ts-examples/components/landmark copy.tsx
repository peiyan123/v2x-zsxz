import React, { Component } from 'react'
// 自研sdk
import { KeyPointScene, ShapePointData } from '@/thundersoft/ai-mark'
// 用来测试的图片数据
import { images } from './access-image'

class Landmark extends Component<any> {
  el!: HTMLDivElement | null
  keyPointCanvas!: KeyPointScene

  // 图片
  imageData = images

  // 标注规则
  state = {
    lineRuleString: '1:3;6:3;6-1;6-3',
    index: 1,
    maxIndex: 6,
    color: 'rgb(60,60,60)',
  }
  // 随机生成一个颜色
  getColor() {
    return (
      'rgb(' +
      parseInt(Math.random() * 1000 + '') / 4 +
      ',' +
      parseInt(Math.random() * 1000 + '') / 4 +
      ',' +
      parseInt(Math.random() * 1000 + '') / 4 +
      ')'
    )
  }

  componentDidMount() {
    this.keyPointCanvas = new KeyPointScene(this.el as HTMLElement)
    // 加载图片
    this.keyPointCanvas.reload(this.imageData[0], [])
    // 标注规则
    this.mark()
    // 新标注对象 绘制点事件
    this.keyPointCanvas.markCanvas.shapePointDrawAddEvent?.subscribe((d) => {
      this.setState({ index: d.point.source.index! + 1 })
      // 所有图形都设为 不可选的
      this.keyPointCanvas.markCanvas.shapeSelectPlan = []
      this.keyPointCanvas.markCanvas.shapeHover = null
      // 绘制 新标注对象 的 外矩形 填充区域
      this.keyPointCanvas.markCanvas.shapeRectangleFill?.set('landmark-shape', [d.shape])
    })
    // 新标注对象 绘制最后一个点 绘制完成
    this.keyPointCanvas.markCanvas.shapePointDrawSuccessEvent?.subscribe((d) => {
      // alert('选中点:' + JSON.stringify(d))
    })

    // 选中对象之后
    this.keyPointCanvas.markCanvas.shapeSelectedAfterEvent?.subscribe((d) => {
      // 其他图形都设为 不可选的
      this.keyPointCanvas.markCanvas.shapeSelectPlan = [d]
      // 当前对象信息
      let index = 1,
        color = d.color
      if (d.point && d.point.length) {
        index = d.point.sort((a, b) => b.source.index! - a.source.index!)[0].source.index!
        if (index != (d as ShapePointData).maxIndex) {
          index += 1
        }
      }
      this.setState({ index, color })
      this.keyPointCanvas.updatePoint(index)
    })
    // 选中点
    this.keyPointCanvas.markCanvas.pointSelectedEvent?.subscribe((d) => {
      // alert('选中点:' + JSON.stringify(d))
    })

    // 退出 对象选中 （ 键盘 ‘Esc’ 或者鼠标左键单击 图形外部区域）
    this.keyPointCanvas.markCanvas.shapeSelectedExitKeyEsc = true
    this.keyPointCanvas.markCanvas.shapeSelectedExitBeforeEvent?.subscribe((shape) => {
      if (shape === this.keyPointCanvas.markCanvas.currentShapePoint) {
        this.keyPointCanvas.markCanvas.currentShapePoint = null
        this.keyPointCanvas.markCanvas.pointDrawPlan = []
      }
    })
    // 退出对象选中之后, 开启 标注 功能
    this.keyPointCanvas.markCanvas.shapeSelectedExitBeforeEvent?.subscribe(() => {
      setTimeout(() => {
        this.mark()
      })
    })
    // 删除对象 之后
    this.keyPointCanvas.deleteShapeEvent.subscribe(() => {
      // 开启标注 模式
      this.mark()
    })
  }

  // 标注
  mark() {
    const index = 1,
      color = this.getColor()
    this.setState({ index, color })
    this.keyPointCanvas.closeMarkMode()
    this.keyPointCanvas.openMarkMode({
      lineRuleString: this.state.lineRuleString,
      maxIndex: this.state.maxIndex,
      index,
      color,
    })
  }
  // 保存后，开启 新对象的绘制
  save() {
    // 删除 新标注对象 的 外矩形 填充区域
    this.keyPointCanvas.markCanvas.shapeRectangleFill?.delete('landmark-shape')
    if (this.keyPointCanvas.markCanvas.shapeSelected) {
      // 已选择对象，编辑模式，退出编辑模式
      this.keyPointCanvas.markCanvas.shapeSelectedExitBeforeEvent!.next(this.keyPointCanvas.markCanvas.shapeSelected)
      this.keyPointCanvas.markCanvas.shapeSelected = null
      this.keyPointCanvas.markCanvas.shapeSelectedExitAfterEvent!.next({})
    } else {
      // 执行 保存
      this.keyPointCanvas.markModeSave()
    }
    // 开启 对象选择功能
    this.keyPointCanvas.markCanvas.shapeSelectPlan = this.keyPointCanvas.markCanvas.shapePoints
    // 开启 标注功能（新颜色）
    this.mark()
  }

  // 更新绘制点
  updatePoint(index: number) {
    this.setState({ index })
    this.keyPointCanvas.updatePoint(index)
  }

  // 回显
  setData() {
    this.keyPointCanvas.markCanvas.loadShapePoint!([
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
    alert(JSON.stringify(this.keyPointCanvas.getData()))
  }

  // 禁用
  close() {
    this.save()
    this.keyPointCanvas.closeMarkMode()
  }
  // 开启
  open() {
    // 开启 对象选择功能
    this.keyPointCanvas.markCanvas.shapeSelectPlan = this.keyPointCanvas.markCanvas.shapePoints
    // 开启 标注功能（新颜色）
    this.mark()
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
            </h3>
            <h3>
              <button style={{ margin: '5px' }} onClick={(e) => this.save()}>
                Save
              </button>
            </h3>
            <h3 style={{ background: color }}>关键点：</h3>
            <p>
              <button
                style={{ margin: '0 5px', background: index == 1 ? color : 'white' }}
                onClick={() => this.updatePoint(1)}
              >
                {' '}
                1
              </button>
              <button
                style={{ margin: '0 5px', background: index == 2 ? color : 'white' }}
                onClick={() => this.updatePoint(2)}
              >
                {' '}
                2
              </button>
              <button
                style={{ margin: '0 5px', background: index == 3 ? color : 'white' }}
                onClick={() => this.updatePoint(3)}
              >
                {' '}
                3
              </button>
              <button
                style={{ margin: '0 5px', background: index == 4 ? color : 'white' }}
                onClick={() => this.updatePoint(4)}
              >
                {' '}
                4
              </button>
              <button
                style={{ margin: '0 5px', background: index == 5 ? color : 'white' }}
                onClick={() => this.updatePoint(5)}
              >
                {' '}
                5
              </button>
              <button
                style={{ margin: '0 5px', background: index == 6 ? color : 'white' }}
                onClick={() => this.updatePoint(6)}
              >
                {' '}
                6
              </button>
            </p>
            <h3>
              <button style={{ margin: '5px' }} onClick={(e) => this.keyPointCanvas.reset()}>
                复位
              </button>
            </h3>
            <h3>
              <button
                style={{ margin: '5px', background: index == 1 ? 'bisque' : 'white' }}
                onClick={(e) => this.keyPointCanvas.deleteSelected()}
              >
                删除 对象或者点
              </button>
            </h3>
            <h3>
              <button style={{ margin: '5px' }} onClick={(e) => this.open()}>
                开启
              </button>
              <button style={{ margin: '5px' }} onClick={(e) => this.close()}>
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
