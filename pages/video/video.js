// pages/video/video.js
import request from '../../utils/request'
Page({
  /*页面的初始数据*/
  data: {
    videoGroupList: [],
    navId: '',      //导航的标识
    videoList: [],   //视频列表数据
    videoId: '',     //视频的id表示
    videoUpdateTime: [],   //记录video播放的时长
    isTrigger: false   //表示下拉刷新是否被触发
  },
  /*生命周期函数--监听页面加载*/
  onLoad: function (options) {
    //获取导航数据
    request('/video/group/list').then(res => {
      //this.setData是同步执行的
      this.setData({
        videoGroupList: res.data.slice(0,14),
        navId: res.data[0].id
      })
      //获取视频列表事件 (因为只有在这里才能拿到this.data.navId)
      this.getVideoList(this.data.navId)
    })
  },
  //获取视频数据列表
  getVideoList(navId){
    request('/video/group',{id:navId}).then(res => {
      let index = 0
      let videoList = res.datas.map(item => {
        item.id = index++
        return item
      })
      this.setData({
        videoList,
        //关闭下拉刷新
        isTrigger: false
      })
      //关闭正在加载消失提示框
      wx.hideLoading()
    })
  },
  //点击切换导航的回调
  changeNav(event){
    //通过id向event传参的时候，如果传的是number，会自动转化成string
    let navId = event.currentTarget.id
    this.setData({
      navId: navId*1,
      videoList: []
    })
    //显示正在加载
    wx.showLoading({
      title: '正在加载'
    })
    //动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId)
  },
  //点击播放/继续播放的回调
  //默认情况下可以同时播放多个视频，我们希望一次只能播放一个视频
  handlePlay(event){
    /* 需求：
     1).点击播放的的事件中，需要找到上一个播放的视频
          注意：关键就是如何找到上一个视频的实例对象
     2).在播放新的视频之前，关闭上一个正在播放的视频
          注意：如何确认点击播放的视频和正在播放的视频不是同一视频
    */
    let vid = event.currentTarget.id
   //关闭上一次视频，这里的this.videoContext就是上一次视频的实例
   //this.vid !== vid 是确保不是同一个视频(点击同一个视频会导致视频打不开)
    // this.vid !==vid && this.videoContext && this.videoContext.stop()
    //创建控制video标签的实例对象
    //将vid和videoContext挂载在this身上，是为了再次点击的时候，可以找到上一个播放的视频
    //不管点击多少次，this身上都只有一个vodeoContext对象，通过代码的顺序可以很好的找到上一个对象
    //这种模式是js的一种设计模式，叫单例模式
    // this.vid = vid
    //更新data中的videoId的状态数据
    this.setData({
      videoId: vid
    })
    this.videoContext = wx.createVideoContext(vid)
    //判断当前的视频是否有播放记录
    //如果有，跳转至指定的播放位置
    let {videoUpdateTime} = this.data
    let videoItem = videoUpdateTime.find(item => item.vid === vid)
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime)
    }
    // 点击图片的时候，播放图片对应的视频
    this.videoContext.play()
  },
  // 监听视频播放进度的回调
  handleTimeUpdate(event){
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime
    }
    let {videoUpdateTime} = this.data
    //判断记录播放时长的数组中，是否有当前视频的播放记录
    //如果有，需要在原有的播放记录上修改播放时间为当前的播放时间
    //如果没有，需要在数组中添加当前视频的播放对象
    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
    if(videoItem){   //之前有
      videoItem.currentTime =  event.detail.currentTime
    }else{          //之前没有
      videoUpdateTime.push(videoTimeObj)
    } 
    this.setData({
      videoUpdateTime
    })
  },
  // 监听视频播放结束
  handleEnded(event){
    //视频播放结束，移除播放时长数组中，当前视频的对象
    let {videoUpdateTime} = this.data
    let index = videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id)
    videoUpdateTime.splice(index, 1)
    this.setData({
      videoUpdateTime
    })
  },
  // 自定义下拉刷新的回调：scroll-view
  handleRefresher(){
    console.log('下拉刷新')
    // 再次发送请求，获取最新数据
    this.getVideoList(this.data.navId)
  },
  // 上拉触底事件：scroll-view
  handleToLower(){
    console.log('scroll-view 上拉触底')
    //数据分页：后端分页 和 前端分页
    //注意：网易云音乐没有提供对应的接口，所以没法写
  },
  // 跳转到搜索页面
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search',
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
  onShareAppMessage: function (res) {
    //from是判断是通过button按钮转发的，还是通过右上角进行转发的
    //button设置 open-type="share" 可以实现转发的效果
    console.log(res.from)
    return {
      title: '自定义转发内容',
      page: '/pages/video/video.js',
      imageUrl: '/static/images/nvsheng.jpg'
    }
  }
})