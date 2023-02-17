// pages/login/login.js
import request from '../../utils/request'
Page({ 
  /*页面的初始数据*/
  data: {
    phone: '',      //手机号
    password: ''    //密码
  },
  //表单项内容发生改变的回调
  handleInput(event){
    let type = event.currentTarget.id
    this.setData({
      [type]: event.detail.value
    })
  1},
  //登录的回调
  async login(){
    let {phone, password} = this.data
    //前端验证
    /* 1、手机号验证
     1). 内容为空
     2). 手机号输入格式不正确
     3). 手机号格式正确，代码验证通过
    */
   //手机号为空
    if(!phone){
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none'
      })
      return
    }
    //定义正则表达式验证手机号格式是否正确
    //第一位数字1开头，第二位数字是3-9任意一位，后面是随便的9位数字
    let phoneReg = /^1[3-9]\d{9}$/
    if(!phoneReg.test(phone)){
      wx.showToast({
        title: '手机号的格式错误',
        icon: 'none'
      })
      return
    }
    //验证密码不能为空
    if(!password){
      wx.showToast({
        title: '密码不能为空',
        icon: 'none'
      })
      return
    }
    //前端验证通过 (向服务器发送请求，进行后端验证)
    let result = await request('/login/cellphone', {phone,password,isLogin:true})
    if(result.code === 200){   //登录成功
      wx.showToast({
        title: '登录成功', 
      })
      //将用户的信息存储至本地
      wx.setStorageSync('userInfo', JSON.stringify(result.profile))
      //跳转至personal个人中心页面
      wx.switchTab({
        url: '/pages/personal/personal'
      })
    }else if(result.code === 400){
      wx.showToast({
        title: '手机号错误',
        icon: 'none'
      })
    }else if(result.code === 502){
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    }else{
      wx.showToast({
        title: '当前登录失败，请重新登录',
        icon: 'none'
      })
    }
  },
  /*生命周期函数--监听页面加载*/
  onLoad: function (options) {

  },

  /*生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },

  /*生命周期函数--监听页面显示*/
  onShow: function () {

  },

  /*生命周期函数--监听页面隐藏*/
  onHide: function () {

  },

  /*生命周期函数--监听页面卸载*/
  onUnload: function () {

  },

  /*页面相关事件处理函数--监听用户下拉动作*/
  onPullDownRefresh: function () {

  },

  /*页面上拉触底事件的处理函数*/
  onReachBottom: function () {

  },

  /*用户点击右上角分享*/
  onShareAppMessage: function () {

  }
})