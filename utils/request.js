//发送ajax请求
/* 1. 封装功能函数
*    a. 功能点明确
*    b. 函数内部应该保留固定代码(静态代码)
*    c. 将动态的数据抽取成形参，由使用者根据自身的情况动态的传入实参
*    d. 一个良好的功能函数应该设置形参的默认值(ES6的形参默认值)
*  2. 封装功能组件
*    a. 功能点明确
*    b. 组件内部保留静态的代码
*    c. 将动态的数据抽取成props参数，由使用者根据自身的情况以标签的属性动态的传入props数据
*    d. 一个良好的组件应该设置组件传入参数的必要性及数据类型
***/
import config from './config'
export default (url, data={}, method="GET") => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        cookie:  wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
      },
      success: (res) => {
        if(data.isLogin){   //说明是登录请求
          //将用户的cookie存入本地
          wx.setStorage({
            data: res.cookies,
            key: 'cookies',
          })
        }
        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}
