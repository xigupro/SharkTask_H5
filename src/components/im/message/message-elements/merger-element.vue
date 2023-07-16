<template>
    <div>
        <message-bubble :isMine=isMine  :message=message>
            <div class="merger-box" @click="mergerHandler(message)">
                <p class="merger-title">{{payload.title}}</p>
                <p class="merger-text" v-for="(item, index) in payload.abstractList" :key="index">
                    {{item}}
                </p>
            </div>
            <span class="merger-text"> 聊天记录</span>
        </message-bubble>
    </div>
</template>

<script>
  import MessageBubble from '../message-bubble'
  export default {
    name: 'MergerElemnt',
    props: {
      payload: {
        type: Object,
        required: true
      },
      message: {
        type: Object,
        required: true
      },
      isMine: {
        type: Boolean
      }
    },
    components: {
      MessageBubble
    },
    data() {
      return {
        mergerContment:{
          title:'',

        }

      }
    },
    computed: {
    },
      methods: {
        mergerHandler(message) {
          this.$bus.$emit('mergerMessageShow', message)
        },
        onImageLoaded(event) {
          this.$bus.$emit('image-loaded', event)
        },
        handlePreview() {
          this.$bus.$emit('image-preview', {
            url: this.payload.imageInfoArray[0].url
          })
        }
      }
    }
</script>

<style lang="less" scoped>
    // Color variables (appears count calculates by raw css)
@color0: #b3b3b3; // Appears 2 times



.image-element {
	cursor: zoom-in;
	max-width: 100%;
}
.merger-box {
	border-bottom: 1px @color0 solid;
	margin-bottom: 5px;
	padding: 0 5px 5px -5px;
	.merger-title {
		font-size: 15px;
		max-width: 220px;
		min-width: 180px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
.merger-text {
	color: @color0;
	font-size: 13px;
	margin: 10px 0;
	max-width: 280px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.message-send {
	.merger-text {
		color: rgba(255,255,255,0.8);
		font-size: 13px;
		margin: 10px 0;
	}
	.merger-box {
		border-bottom: 1px rgba(255,255,255,0.6) solid;
	}
}
</style>
