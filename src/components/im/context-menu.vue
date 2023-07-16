<template>
  <van-popover
    placement="top"
    style="display: flex;flex-direction: column;"
    v-model="visible"
  >
    <van-button class="context-menu-button" type="text" @click="option.handler" v-for="option in options" :key="option.text">{{options.text}}</van-button>
    <van-button class="context-menu-button" type="text" @click="visible = false ">取消</van-button>
    <slot slot="reference" @contextmenu.prevent=""></slot>
  </van-popover>
</template>

<script>
import { Popover, Button } from 'vant'
export default {
  props: ['visible', 'options'],
  components: {
    [Popover.name]: Popover,
    [Button.name]: Button
  }
}
</script>

<style lang="less" scoped>
</style>
