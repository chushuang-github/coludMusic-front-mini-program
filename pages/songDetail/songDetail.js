// pages/songDetail/songDetail.js
import request from '../../utils/request'
import PubSub from 'pubsub-js'
import moment from 'moment'
// 获取全局的实例
const appInstance = getApp()
Page({
  /*页面的初始数据*/
  data: {
    isPlay: false,      //表示音乐是否在播放
    song: {},           //歌曲详情对象      
    musicId: '',        //当前音乐的id 
    musicLink: '',      //音乐的链接
    currentTime: '00:00',     //实时时长
    durationTime: '00:00',    //总时长
    currentWidth: 0,          //实时进度条的宽度
  },
  // 控制音乐播放/暂停
  handleMusicPlay(){
    let isPlay = !this.data.isPlay
    let {musicId, musicLink} = this.data
    this.musicControl(isPlay, musicId, musicLink)
  },
  // 控制音乐播放、暂停的功能函数(让音乐可以真正的播放和暂停)
  async musicControl(isPlay, musicId, musicLink){
    if(isPlay){    //使音乐播放
      if(!musicLink){
        // 获取音乐的播放链接
        let musicLinkData = await request('/song/url', {id: musicId})
        musicLink = musicLinkData.data[0].url
        this.setData({
          musicLink
        }) 
      }
      // src 和 title这两个属性是必填的，不然音乐不会播放
      // 设置了src属性和title属性后，会自动播放音乐
      this.backgroundAudioManager.src = musicLink
      this.backgroundAudioManager.title = this.data.song.name
    }else{         //使音乐暂停
      this.backgroundAudioManager.pause()
    }
  },
  // 获取音乐详情的数据
  async getMusicInfo(musicId){
    let songData = await request('/song/detail', {ids: musicId})
    // songData.songs[0].dt 单位是ms，moment()括号里面要求传入的单位就是毫秒
    let durationTime = moment(songData.songs[0].dt).format('mm:ss')
    this.setData({
      song: songData.songs[0],
      durationTime
    })
    // 动态的设置页面的标题
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },
  // 点击切换歌曲的回调(点击上一首、下一首音乐的按钮)
  handleSwitch(event){
    // 获取切歌的类型(页面中通过id属性来传递参数)
    let type = event.currentTarget.id
    // 关闭当前播放的音乐
    this.backgroundAudioManager.stop()
    // 订阅来自recommendSong发布的消息(接收recommendSong传递的数据musicId)
    // 这个订阅可以放在onLoad中，放在onLoad中，需要在页面卸载的时候取消订阅
    PubSub.subscribe('musicId', (msg, musicId) => {
      // 获取音乐的详细信息
      this.getMusicInfo(musicId)
      // 自动播放上一首或者下一首的音乐
      this.musicControl(true, musicId)
      // 每次监听完，需要取消上一次的订阅
      PubSub.unsubscribe('musicId')
    })
    // 发布消息数据给recommendSong页面(点击上一首、下一首音乐的时候发布)
    PubSub.publish('switchType', type)
  },
  /*生命周期函数--监听页面加载*/
  onLoad: function (options) {
    // options用于接收路由跳转的query参数
    // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长，会自动截取掉
    let musicId = options.musicId
    this.setData({
      musicId
    })
    // 获取音乐详情
    this.getMusicInfo(musicId)
    // 判断当前页面的音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      // 修改当前页面的音乐播放状态为true
      this.setData({isPlay: true})
    }
    // 创建控制音乐播放的实例对象
    this.backgroundAudioManager = wx.getBackgroundAudioManager()
    // 问题：如果用户操作系统的控制音乐播放/暂停的按钮(对应手机的是下拉出来的窗口)，页面不知道
    // 导致页面显示是否播放的状态和真实的音频播放状态不一致
    // 解决：通过控制音频的实例去监视音乐的播放和暂停
    this.backgroundAudioManager.onPlay(() => {
      // 修改音乐是否播放的状态
      this.changePlayState(true)
      // 修改全局音乐播放的状态
      appInstance.globalData.musicId = musicId
    })
    // 监听音乐暂停
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    })
    // 监听音乐的停止(比如手机系统任务控制音乐停止)
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    })
    // 监听音乐的实时播放进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // 格式化实时的播放时间
      let currentTime = moment(this.backgroundAudioManager.currentTime*1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration * 450
      this.setData({
        currentTime,
        currentWidth
      })
    })
    // 监听音乐自然的播放结束
    this.backgroundAudioManager.onEnded(() => {
      PubSub.subscribe('musicId', (msg, musicId) => {
        // 获取音乐的详细信息
        this.getMusicInfo(musicId)
        // 自动播放上一首或者下一首的音乐
        this.musicControl(true, musicId)
        // 每次监听完，需要取消上一次的订阅
        PubSub.unsubscribe('musicId')
      })
      // 自动切换到下一首音乐，并且自动播放下一首音乐
      PubSub.publish('switchType', 'next')
      // 将实时进度条的长度还原为0
      this.setData({
        currentWidth: '00:00',
        currentTime: '00:00'
      })
    })
  },
  // 修改播放状态的功能函数
  changePlayState(isPlay){
    this.setData({
      isPlay
    })
    // 修改全局音乐播放的状态
    appInstance.globalData.isMusicPlay = isPlay
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