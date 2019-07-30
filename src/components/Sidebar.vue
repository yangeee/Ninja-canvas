<template>
  <div class="siderbar">
    <div class="wrapper">
      <i class="el-icon-s-unfold" :class="{open:open}" @click="open = !open"></i>
    </div>
    <div class="menu" :class="{open:open}">
      <div class="width">
        <span>大小：</span>
        <el-slider
          class="slider"
          input-size="mini"
          :value="lineWidth"
          :min="4"
          :max="48"
          @input="setLineWidth"
        ></el-slider>
      </div>
      <div class="color">
        <span>颜色：</span>
        <el-color-picker
          class="picker"
          size="small"
          show-alpha
          :predefine="predefineColors"
          :value="color"
          @change="setColor"
        ></el-color-picker>
      </div>
      <div class="back">
        <span>撤销：</span>
        <svg class="icon" aria-hidden="true" @click="setClean">
          <use xlink:href="#icon-chexiao"></use>
        </svg>
      </div>
      <div class="delete">
        <span>清屏：</span>
        <i class="el-icon-delete" @click="setDelete"></i>
      </div>
      <div class="delete">
        <span>保存：</span>
        <i class="el-icon-download" @click="setDownload"></i>
      </div>
      <div class="delete">
        <span>播放：</span>
        <i class="el-icon-video-play" @click="setPlay"></i>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'Sidebar',

  data() {
    return {
      open: false,
      predefineColors: [
        '#fff',
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577'
      ]
    }
  },
  mounted() {
    this.canvas = document.getElementById('myCanvas')
    this.context = this.canvas.getContext('2d')
  },
  computed: {
    lineWidth() {
      return this.$parent.lineWidth
    },
    color() {
      return this.$parent.strokeStyle
    }
  },
  methods: {
    setLineWidth(e) {
      this.$bus.$emit('setLineWidth', e)
    },
    setColor(e) {
      this.$bus.$emit('setColor', e)
    },
    setClean() {
      this.$bus.$emit('setClean')
    },
    setDelete() {
      this.$bus.$emit('setDelete')
    },
    setDownload() {
      let a = document.createElement('a')
      a.href = this.canvas.toDataURL('image/png')
      let ua = window.navigator.userAgent.toLowerCase()
      if (ua.match(/iphone|android|ipad/)) {
        a.target = '_blank'
      } else {
        a.download = 'myCanvas'
      }
      a.click()
    },
    setPlay() {
      let arr = this.$parent.stack.reduce((sum, item) => {
        return sum.concat(item)//扁平化
      })
      let maxLen = arr.length
      let length = 2//进行初始化与绘制第一个点
      let draw = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        if (length <= maxLen) {
          for (let i = 0; i < length; i++) {
            let value = arr[i]
            if (value.width) { //数组第一个对象
              this.context.lineWidth = value.width
              this.context.strokeStyle = value.style
            } else {
              if (arr[i - 1].width) {//第一个点
                this.context.beginPath()
                this.context.moveTo(value.x, value.y)
                this.context.lineTo(value.x, value.y)
              } else {//后面的点
                let x1 = arr[i - 1].x,
                  y1 = arr[i - 1].y,
                  x2 = value.x,
                  y2 = value.y
                let x3 = x1 / 2 + x2 / 2, y3 = y1 / 2 + y2 / 2
                this.context.quadraticCurveTo(x1, y1, x3, y3)
              }
              //最后一个点,直接连线并绘制，如果下一个对象是另一条线的起始对象，也要绘制，否则逻辑不会走这里
              if ((i === length - 1) || arr[i + 1].width) {
                this.context.lineTo(value.x, value.y)
                this.context.stroke()
              }
            }
          }
        }
        length += 1
        if (length > maxLen) {
          cancelAnimationFrame(raf)
          return
        }
        if (this.$parent.drawing) {
          cancelAnimationFrame(raf)
          this.$parent.drawLine()
          return
        }
        requestAnimationFrame(draw)
      }
      let raf = requestAnimationFrame(draw)
    }

  }

}
</script>


<style lang="scss" scoped>
i {
  cursor: pointer;
  font-size: 1.8em;
}
.siderbar {
  position: absolute;
  width: 50px;
  color: rgba(0, 0, 0, 0.7);
}
.wrapper {
  font-size: 2.5em;
  margin-left: 10px;
  .open {
    color: #409eff;
    transition: color 0.25s linear;
  }
  i {
    transition: color 0.25s linear;
    font-size: 1em;
  }
}
.menu {
  background: white;
  box-shadow: 0 0 10px 2px #aaa;
  width: 160px;
  padding: 6px 12px;
  transform: translateX(-110%);
  transition: transform .3s linear;
  &.open {
    transform: translateX(0);
    transition: transform .3s linear;
  }
  div {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }
  .width {
    .slider {
      width: 80px;
      margin-right: 2px;
    }
  }
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  cursor: pointer;
  fill: #666;
  transition: fill 0.2s linear;
}
.icon.open {
  fill: #d4237a;
  transition: fill 0.2s linear;
}
</style>
