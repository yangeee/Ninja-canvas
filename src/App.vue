<template>
  <div>
    <Sidebar></Sidebar>
    <canvas id="myCanvas"></canvas>
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar";
export default {
  name: 'app',
  components: {
    Sidebar
  },
  data() {
    return {
      canvas: undefined,
      context: undefined,
      drawing: false,//绘画是否开始
      myTimeStamp: undefined, //时间戳
      minTimeDiff: 8,//2个点之间绘制最小距离
      minPointDistance: 8,//最小点间距
      lineWidth: 6,//线宽
      strokeStyle: 'rgba(0,0,0,0.9)',//填充色
      color: 'rgba(0,0,0,0.9)',
      stack: [],//鼠标松开时，path会清空，必须用一个相同的stack保存
      path: []
    }
  },
  mounted() {
    this.canvas = document.getElementById('myCanvas')
    this.context = this.canvas.getContext('2d')
    this.initCanvas()
    this.initContext()
    this.siderBarListen()
    window.onresize = () => {
      this.initCanvas()
      this.initContext()//保证起始是圆形
    }
    this.canvas.addEventListener('mousedown', this.handleMousedown)
    this.canvas.addEventListener('touchstart', this.handleTouchstart)
  },
  methods: {
    initCanvas() {
      this.canvas.width = document.documentElement.clientWidth
      this.canvas.height = document.documentElement.clientHeight
    },
    initContext() {
      this.context.lineCap = 'round'//以圆形开始和结尾
      this.context.lineJoin = 'round'//圆形相连
    },
    handleMousedown(e) {
      this.drawing = true
      this.myTimeStamp = new Date().getTime()
      let x = e.clientX, y = e.clientY
      this.path.push({ 'width': this.lineWidth, 'style': this.strokeStyle })
      this.path.push({ x, y })
      this.stack.push(this.path)
      this.drawLine()//这里进行样式初始化
      this.canvas.addEventListener('mousemove', this.handleMousemove)
      this.canvas.addEventListener('mouseup', this.handleMouseup)
    },
    handleMousemove(e) {
      //函数节流，画的太快没必要都存
      if ((new Date().getTime() - this.myTimeStamp) < this.minTimeDiff) {
        return
      }
      //画的距离太短也没必要保存
      let x = e.clientX, y = e.clientY
      let x0 = this.path[this.path.length - 1].x, y0 = this.path[this.path.length - 1].y
      if (Math.abs(x - x0) < this.minPointDistance && Math.abs(y - y0) < this.minPointDistance) {
        return
      }
      //开始保存
      this.path.push({ x, y })
      this.myTimeStamp = new Date().getTime()//生成初始时间戳
      this.drawLine()
    },
    handleMouseup() {
      this.drawing = false
      this.path = []//坐标数组清空
      this.canvas.removeEventListener('mousemove', this.handleMousemove)
      this.canvas.removeEventListener('mouseup', this.handleMouseup)
    },
    drawLine() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)//清屏
      this.stack.forEach((path) => {
        //这里stack存储了每一次绘画的path，并在下一次绘画时重新渲染，所以前面的笔画不会消失
        let length = path.length
        path.forEach((value, index, arr) => {
          if (index === 0) {
            //初始化线条样式
            this.context.lineWidth = value.width
            this.context.strokeStyle = value.style
          } else if (index === 1) {
            //第一个点,鼠标按下的那个点
            this.context.beginPath()
            this.context.moveTo(value.x, value.y)
            this.context.lineTo(value.x, value.y)//绘制起点
          } else {
            //使用贝塞尔曲线
            let x1 = arr[index - 1].x, y1 = arr[index - 1].y, x2 = value.x, y2 = value.y
            let x3 = x1 / 2 + x2 / 2, y3 = y1 / 2 + y2 / 2
            this.context.quadraticCurveTo(x1, y1, x3, y3)
            //这里的算法是平滑的关键，取前一个点为控制点，前一个与当前点的中点为目标点绘制
          }
          if (index === length - 1) {
            //这个path在动的时候，每一笔都是最后一笔，一旦鼠标离开，path完成，length的值才确定下来
            this.context.lineTo(value.x, value.y)
            this.context.stroke()//绘制已经规划好的路线
          }
        })
      })
    },
    handleTouchstart(e) {
      e.preventDefault()
      this.drawing = true
      this.myTimeStamp = new Date().getTime()
      let x = e.touches[0].clientX, y = e.touches[0].clientY
      this.path.push({ 'width': this.lineWidth, 'style': this.strokeStyle })
      this.path.push({ x, y })
      this.stack.push(this.path)
      this.drawLine()//这里进行样式初始化
      this.canvas.addEventListener('touchmove', this.handleTouchmove)
      this.canvas.addEventListener('touchend', this.handleTouchend)
    },
    handleTouchmove(e) {
      e.preventDefault()
      if ((new Date().getTime() - this.myTimeStamp) < this.minTimeDiff) {
        return
      }
      let x = e.touches[0].clientX, y = e.touches[0].clientY
      let x0 = this.path[this.path.length - 1].x, y0 = this.path[this.path.length - 1].y
      if (Math.abs(x - x0) < this.minPointDistance && Math.abs(y - y0) < this.minPointDistance) {
        return
      }
      this.path.push({ x, y })
      this.myTimeStamp = new Date().getTime()
      this.drawLine()
    },
    handleTouchend(e) {
      e.preventDefault()
      this.drawing = false
      this.path = []//坐标数组清空
      this.canvas.removeEventListener('touchmove', this.handleTouchmove)
      this.canvas.removeEventListener('touchend', this.handleTouchend)
    },
    siderBarListen() {
      this.$bus.$on('setLineWidth', (e) => {
        this.lineWidth = e
      })
      this.$bus.$on('setColor', (e) => {
        this.strokeStyle = e
      })
      this.$bus.$on('setClean', () => {
        this.back()
      })
      this.$bus.$on('setDelete', () => {
        this.delete()
      })
    },
    back() {
      this.stack.pop()
      this.drawLine()
    },
    delete() {
      this.stack = []
      this.drawLine()
    }

  }
}
</script>

<style>
#myCanvas {
  cursor: crosshair;
}
</style>
