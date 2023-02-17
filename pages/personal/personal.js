// pages/personal/personal.js
import request from '../../utils/request'
let startY = 0    //手指起始的坐标
let moveY = 0     //手指移动的坐标
let moveDistance = 0    //手指移动的距离
Page({
  /*页面的初始数据*/
  data: {
    coverTransform: 'translateY(0rpx)',
    coverTransition: '',
    userInfo: {},  //用户信息
    recentPlayList: []   //用户的播放记录
  },
  /*生命周期函数--监听页面加载*/
  onLoad: function (options) {
    //读取用户的基本信息
    let userInfo = wx.getStorageSync('userInfo')
    if(userInfo){
      //更新userInfo状态
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
      //获取用户的播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },
  //获取用户的播放记录的功能函数
  async getUserRecentPlayList(userId){
    let recentPlayListData = await request('/user/record',{uid:userId, type:0})
    let index = 0
    let recentPlayList = recentPlayListData.allData.splice(0,10).map(item => {
      item.id = index++
      return item
    })
    this.setData({
      recentPlayList
    })
  },
  //手指触摸动作开始
  handleTouchStart(event){
    //每次开始触摸的时候，取消过渡的效果
    this.setData({
      coverTransition: ''
    })
    //获取手指的起始坐标
    startY = event.touches[0].clientY
  },
  //手指触摸后移动
  handleTouchMove(event){ 
    //移动后位置的坐标
    moveY = event.touches[0].clientY
    //手指移动距离
    moveDistance = moveY - startY
    //动态的更新coverTransform的值
    //只能向下移动，而且做多只能移动80rpx
    if(moveDistance <= 0){
      return
    }
    if(moveDistance >= 80){
      moveDistance = 80
    }
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  //手指触摸动作
  handleTouchEnd(){
    //版块下拉后回弹是有一个过渡效果的
    this.setData({
      coverTransform: 'translateY(0rpx)',
      coverTransition: 'transform 0.4s linear'
    })
  },
  //跳转至登录界面的回调
  toLogin(){
    wx.reLaunch({
      url: '/pages/login/login',
    })
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