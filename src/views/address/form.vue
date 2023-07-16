<template>
  <div class="address-form-page">
    <van-address-edit
      :area-list="areaList"
      show-postal
      show-delete
      show-set-default
      show-search-result
      :address-info="addressDetail"
      :is-saving="loading"
      :area-columns-placeholder="['请选择', '请选择', '请选择']"
      @save="onSave"
      @delete="removeAddress"
    />
  </div>
</template>
<script>
import {
  Button,
  Area,
  AddressEdit,
} from 'vant';
import { areaList } from '@vant/area-data';
import AddressProxy from '@/proxies/address';

export default {
  name: 'address-form',
  data() {
    return {
      addressDetail: null,
      areaList,
      loading: false,
      chosenAddressId: null,
    };
  },
  components: {
    [Button.name]: Button,
    [AddressEdit.name]: AddressEdit,
    [Area.name]: Area,
  },
  computed: {
    userId() {
      return this.$store.state.account.info.id;
    },
  },
  methods: {
    async getAddressDetail(id) {
      const params = {
        id,
      };
      this.loading = true;
      const res = await AddressProxy.addressDetail(params);
      this.loading = false;
      if (res.success) {
        this.addressDetail = {
          ...res.data,
          areaCode: res.data.area_code,
          isDefault: !!res.data.is_default,
          postalCode: res.data.postal_code,
          addressDetail: res.data.address,
        };
      }
    },
    async addAddress(content) {
      const params = {
        ...content,
        userId: this.userId,
      };
      this.loading = true;
      const res = await AddressProxy.addAddress(params);
      this.loading = false;
      if (res.success) {
        this.$toast('添加成功');
        this.$router.go(-1);
      }
    },
    async updateAddress(content) {
      const params = {
        ...content,
        userId: this.userId,
        id: this.addressDetail.id,
      };
      this.loading = true;
      const res = await AddressProxy.updateAddress(params);
      this.loading = false;
      if (res.success) {
        this.$toast('修改成功');
        this.$router.go(-1);
      }
    },
    onSave(content) {
      const params = {
        ...content,
        addressDetail: content.addressDetail,
        area_code: content.areaCode,
        is_default: content.isDefault,
        postal_code: content.postalCode,
      };
      if (this.addressDetail) {
        this.updateAddress(params);
      } else {
        this.addAddress(params);
      }
    },
    async removeAddress() {
      const params = {
        id: this.addressDetail.id,
      };
      this.loading = true;
      const res = await AddressProxy.removeAddress(params);
      this.loading = false;
      if (res.success) {
        this.$toast('删除成功');
        this.$router.go(-1);
      }
    },
  },
  created() {
    const { id } = this.$route.query;
    if (id) {
      this.getAddressDetail(id);
    }
  },
};
</script>

<style lang="less">
  .address-form-page {
    padding-bottom: 60px;
  }
</style>
