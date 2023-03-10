// pages/recommendSong/recommendSong.js
import request from '../../utils/request'
import PubSub from 'pubsub-js'
Page({
 
  /*页面的初始数据*/
  data: {
    day: '',     //天
    month: '',    //月
    recommendList: [],   //推荐列表数据
    index: 0,      //标识点击音乐的下标
  },

  /*生命周期函数--监听页面加载*/
  onLoad: function (options) {
    // 判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo')
    if(!userInfo){
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          // 如果没有登录，跳转到登录页面
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })
    }
    // 更新日期的状态数据
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1
    })
    // 获取每日推荐的数据
    this.getRecommendList()
    // 订阅来自songDetail页面发布的消息
    // msg是事件的名字switchType， type是传递的数据
    PubSub.subscribe('switchType', (msg, type) => {
      let {recommendList, index} = this.data
      if(type === 'pre'){       //上一首(type==='pre')
        index = index - 1
      }else{                    //下一首(type==='next')
        index = index + 1
      }
      // 使第一首音乐和最后一首音乐可以相互切换
      if(index<0) index = recommendList.length - 1
      if(index>recommendList.length-1) index = 0
      // 点击上一首、下一首后，将新的下标更新到data里面
      this.setData({
        index
      })
      // 不管type是什么类型的，从if-else出来的都是最新歌曲的下标
      let musicId = recommendList[index].id
      // 将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId)
    })
  },
  // 获取用户每日推荐数据
  async getRecommendList(){
    let recommendListData = await request('/recommend/songs')
    this.setData({
      recommendList: recommendListData.recommend
    })
  }, 
  // 点击跳转歌曲详情页面
  toSongDetail(event){
    let {song, index} = event.currentTarget.dataset
    this.setData({
      index
    })
    wx.navigateTo({
      url: `/pages/songDetail/songDetail?musicId=${song.id}`,
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