<template>
  <div class="address-list-page">
    <van-address-list
      v-model="chosenAddressId"
      :list="addressList"
      default-tag-text="默认"
      @select="onSelected"
      @add="onAdd"
      @edit="onEdit"
    />
  </div>
</template>
<script>
import {
  Button,
  AddressList,
} from 'vant';
import AddressProxy from '@/proxies/address';

export default {
  name: 'address-list',
  data() {
    return {
      addressList: [],
      loading: false,
      chosenAddressId: null,
    };
  },
  components: {
    [Button.name]: Button,
    [AddressList.name]: AddressList,
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
    // 1来自于商品详情
    type() {
      return this.$route.query.type;
    },
  },
  methods: {
    async getAddressList() {
      const params = {
        userId: this.userId,
      };
      this.loading = true;
      const res = await AddressProxy.getAddressList(params);
      this.loading = false;
      if (res.success) {
        this.addressList = res.data.map(item => ({
          id: item.id,
          name: item.name,
          tel: item.tel,
          address: `${item.province}${item.city}${item.address}`,
          isDefault: !!item.is_default,
        }));
        const defaultAddress = this.addressList.find(item => item.is_default);
        this.chosenAddressId = defaultAddress ? defaultAddress.id : null;
      }
    },
    onSelected(address) {
      if (this.type === 1) {
        // 将所选地址缓存到localStorage，并返回
        localStorage.setItem('selectedAddress', JSON.stringify(address));
        this.$router.go(-1);
      }
    },
    onAdd() {
      this.$router.push({
        name: 'address.form',
      });
    },
    onEdit(item) {
      this.$router.push({
        name: 'address.form',
        query: {
          id: item.id,
        },
      });
    },
  },
  created() {
    this.getAddressList();
  },
};
</script>

<style lang="less">
  .address-list-page {
    padding-bottom: 60px;
  }
</style>
