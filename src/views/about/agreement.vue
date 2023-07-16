<template>
  <div class="agreement-page">
    <h2>{{systemInfo.agreement_title}}</h2>
    <div v-html="systemInfo.agreement_content"></div>
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
<style lang="less">
.agreement-page {
  padding: 10px;
  p {
    color: #555;
  }
  h2 {
    margin: 5px 0;
    text-align: center;
  }
}
</style>
