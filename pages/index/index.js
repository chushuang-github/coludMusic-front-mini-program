// pages/index/index.js
import request from '../../utils/request'
Page({ 
  /*页面的初始数据*/
  data: {
    bannerList: [],     //轮播图数据
    recommendList: [],   //推荐歌曲的数据
    topList: []       //排行榜数据
  },
  /* 生命周期函数--监听页面加载*/
  onLoad: function (options) {
    //请求轮播图的数据 
    request('/banner',{type:2}).then(res => {
      this.setData({bannerList: res.banners})
    })
    //推荐歌曲的数据
    request('/personalized',{limit:10}).then(res => {
      this.setData({recommendList: res.result})
    })
    //获取排行榜的数据
    /* 需求分析
     1). 需要根据idx的值获取对应的数据
     2). idx的取值范围是0-20，我们需要0-4，需要发送5次请求
    **/ 
    let index = 0
    let resultArr = []
    while(index < 5){
      request('/top/list',{idx:index++}).then(res => {
        let topListItem = {name:res.playlist.name, tracks:res.playlist.tracks.slice(0,3)}
        resultArr.push(topListItem)
        this.setData({topList:resultArr})
      })
    }
  },
  // 跳转到歌曲推荐页面
  toRecommendSong(){
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong',
    })
  },
  /* 生命周期函数--监听页面初次渲染完成*/
  onReady: function () {

  },
  /*生命周期函数--监听页面显示*/
  onShow: function () {

  },
  /* 生命周期函数--监听页面隐藏*/
  onHide: function () {

  },
  /*生命周期函数--监听页面卸载*/
  onUnload: function () {

  },
  /* 页面相关事件处理函数--监听用户下拉动作*/
  onPullDownRefresh: function () {

  },
  /*页面上拉触底事件的处理函数 */
  onReachBottom: function () {

  },
  /*用户点击右上角分享*/
  onShareAppMessage: function () {

  }
})