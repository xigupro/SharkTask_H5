<template>
  <div class="policy-page">
    <h2>{{systemInfo.policy_title}}</h2>
    <div v-html="systemInfo.policy_content"></div>
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
.policy-page {
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
