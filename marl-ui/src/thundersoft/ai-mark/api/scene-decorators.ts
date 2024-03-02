export function SceneDecorators<T extends new (...args: any[]) => any>(constructor: T) {
  return class extends constructor {
    // 当前场景是否显示
    isVisible: boolean = false
    toggleShowAndHide(isVisible) {
      this.isVisible = isVisible
      this.markCanvas.isVisible = isVisible
      if (isVisible) {
        this.markCanvas.canvasRendering()
      }
    }
  }
}
