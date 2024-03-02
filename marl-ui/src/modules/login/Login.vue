<template>
  <a-layout class="login-container">
    <!-- <LoginHeader /> -->
    <a-layout-content class="layout-content">
      <div class="login">
        <div class="image-form-wrap">
          <img :src="imageUrl" />
          <!-- <div class="left"></div> -->
          <div class="right">
            <LoginForm />
          </div>
        </div>
      </div>
    </a-layout-content>
    <div class="copyright">copyright © 通港达园(中国)交通基建投资有限公司 粤ICP备17087183号</div>
  </a-layout>
</template>
<script lang="ts" setup>
import { defineComponent, onMounted, ref, nextTick, defineExpose } from 'vue'
import LoginForm from './LoginForm.vue'
import LoginHeader from './LoginHeader.vue'
import imageUrl from '@/assets/login/road.png'

const loginFormRef = ref(null)

onMounted(() => {
  nextTick(() => {
    console.log('ref', loginFormRef.value)
  })
})
</script>
<style lang="less" scoped>
.login-container {
  height: 100%;
  background-image: url('~@/assets/login/background.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.layout-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
.login {
  position: relative;
  width: 75%;
  // max-width: 1400px;
  // height: 0;
  display: flex;
  align-content: center;
  justify-content: center;
  border-radius: 16px;
  // overflow: hidden;
  // background-image: url('~@/assets/login/road.png');
  // background-repeat: no-repeat;
  // background-size: 100% 100%;
  // background-color: #4369b4;
  // padding: 40px;
  // padding-bottom: 35%;
  &::after {
    content: '';
    display: block;
    margin-top: 46.67%;
  }
  .image-form-wrap {
    display: inline-block;
    position: relative;
    width: 100%;
  }
  img {
    // position: absolute;
    // top: 0;
    // bottom: 0;
    // left: 0;
    // right: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: #4369b4;
    border-radius: 16px;
    margin: auto;
  }
  .left {
    width: 700px;
    background-image: url('~@/assets/image/aaaa.jpg');
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .right {
    position: absolute;
    top: -40px;
    bottom: -40px;
    right: 40px;
    width: 500px;
    background: #fff;
    border-radius: 16px;
  }
}
.copyright {
  position: absolute;
  bottom: 15px;
  width: 100%;
  text-align: center;
  color: #91a1bc;
}
@media screen and(min-width: 1800px) and (max-width: 2500px) {
  .login {
    width: 65%;
    // &::after {
    //   margin-top: 50%;
    // }
  }
}
</style>
