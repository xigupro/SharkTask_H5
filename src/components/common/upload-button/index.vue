<template>
  <div class="upload-button-component">
    <van-icon class="plus" name="plus" />
  </div>
</template>

<script>
import { Icon } from 'vant';

export default {
  name: 'upload-button',
  components: {
    [Icon.name]: Icon,
  },
};
</script>
<style lang="less" scoped>
  .upload-button-component {
    width: 80px;
    height: 80px;
    text-align: center;
    background-color: #fff;
    border: 1px dashed #e5e5e5;
    border-radius: 4px;
    margin: 8px 8px 8px 0;
    font-size: 24px;
    position: relative;
    .plus {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>
