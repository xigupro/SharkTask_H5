<template>
  <div class="about-page">
    <div class="panel">
      <div class="title">关于我们</div>
      <div
        class="content"
        v-if="systemInfo.about_us"
        v-html="systemInfo.about_us.replace(/\n/g, '<br>')">
      </div>
    </div>
  </div>
</template>
<script>
export default {

  computed: {
    systemInfo() {
      return this.$store.state.system.info;
    },
  },
};
</script>

<style lang="less" scoped>
  .about-page {
    .panel {
      padding: 10px;
      color: #333;
      .title {
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: bold;
      }
      .content {
        background-color: #fff;
        padding: 10px;
        position: relative;
        white-space: pre-line;
        &::after{
          clear: both;
          display: table;
          content: '';
        }
      }
    }
  }
</style>
