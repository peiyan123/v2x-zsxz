import React, { Component } from 'react'
// 自研sdk
import { ClassificationScene } from '@/pages/ai-mark'
// 用来测试的图片数据
import { images } from './access-image'

class ImageClassification extends Component<any> {
  el!: HTMLDivElement | null
  classificationScene!: ClassificationScene

  /**
   * 预加载多图片，网络慢时 加载图片 的loading效果由业务层处理
   * ["data:image/jpeg;base64,/9j/4....", ...]
   */
  imageData = images

  componentDidMount() {
    this.classificationScene = new ClassificationScene(this.el as HTMLElement, this.imageData[0])
  }

  // 换图, 或者复位
  changeImage(index: number) {
    this.classificationScene.reload(this.imageData[index])
  }

  render() {
    return (
      <div>
        <h1
          style={{
            textAlign: 'center',
            margin: '20px',
          }}
        >
          Image Cassification (图像分类)
        </h1>
        <div
          style={{
            margin: '0 5vw',
            width: '88vw',
            height: '600px',
            border: '1px solid',
          }}
          ref={(el) => (this.el = el)}
        ></div>
        <button style={{ margin: '10px 20px' }} onClick={(e) => this.changeImage(1)}>
          第1张图（复位）
        </button>
        <button style={{ margin: '10px 20px' }} onClick={(e) => this.changeImage(2)}>
          第2张图（复位）
        </button>
        <button style={{ margin: '10px 20px' }} onClick={(e) => this.changeImage(3)}>
          第3张图（复位）
        </button>
        <button style={{ margin: '10px 20px' }} onClick={(e) => this.changeImage(4)}>
          第4张图（复位）
        </button>
        <button style={{ margin: '10px 20px' }} onClick={(e) => this.changeImage(5)}>
          第5张图（复位）
        </button>
        <button style={{ margin: '10px 20px' }} onClick={(e) => this.changeImage(0)}>
          默认张图（复位）
        </button>
      </div>
    )
  }
}

export default ImageClassification
