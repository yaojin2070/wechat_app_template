//获取应用实例
var app = getApp();

Page({
  data: {
    imageCtx: app.globalData.imageCtx,
    start: '',
    end: '',
    list: [],
    page: 1,
    stateList: [
      { state: 1, name: '接单中' },
      { state: 2, name: '生产中' },
      { state: 3, name: '生产完成' },
      { state: 4, name: '已发货' },
      { state: 5, name: '已完成' },
      { state: 6, name: '已取消' },
      { state: 7, name: '不接单' },
    ],
    state: 1,
    hidden: false,
    emptyShow: false,
    hasMore: true,
    scrollTop: 0,
    scrollHeight: 0
  },
  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
    that.getOrders();
  },
  scroll: function (e) {
    //  该方法绑定了页面滚动时的事件，这里记录了当前的position.y的值,为了请求数据之后把页面定位到这里来。
    this.setData({
      scrollTop: e.detail.scrollTop
    });
  },
  search: function (e) {
    this.setData({
      search: e.detail.value
    })
  },
  getOrders: function (e) {
    var that = this;
    if (e != undefined) {
      var state = e.currentTarget.dataset.state;
      if (state != undefined) {
        that.setData({
          state: state
        })
      }
    }
    that.setData({
      list: [],
      page: 1,
      emptyShow: false,
      hidden: false,
      scrollTop: 0
    })
    that.commonSearch(that, 'one');
  },
  bindDownLoad: function () {
    var that = this;
    that.commonSearch(that, 'more');
  },
  goTop: function () {
    this.setData({
      scrollTop: 0
    });
  },
  bindStartChange: function (e) {
    this.setData({
      start: e.detail.value
    })
  },
  bindEndChange: function (e) {
    this.setData({
      end: e.detail.value
    })
  },
  commonSearch: function (that, difference) {
    var params = {}, page = that.data.page,adminObj = app.globalData.adminObj;
    params.state = that.data.state;
    params.start = that.data.start;
    params.end = that.data.end;
    params.pageNumber = page;
    params.phone = adminObj.phone;
    params.password = app.globalData.password;
    params.sessionId = adminObj.sessionId;
    
    wx.request({
      url: app.globalData.requestUrl + "weixinMerchant/getPrintOrders",
      data: params,
      success: function (res) {
        that.setData({
          hidden: true
        })
        if (res.data.code == '0') {
          var mapResults = res.data.mapResults;
          that.setData({
            start: mapResults.start,
            end: mapResults.end
          })
          var reqList = mapResults.orders.list;
          if (reqList != null && reqList.length > 0) {
            var listNew = that.data.list.concat(reqList);
            that.setData({
              list: listNew,
              page: page + 1,
              hasMore: true
            })
          } else {
            that.setData({
              hasMore: false
            })
            //one为点击切换订单状态,more为上拉加载
            if (difference == 'one') {
              that.setData({
                emptyShow: true
              })
            } else {
              that.setData({
                emptyShow: false
              })
            }
          }
        } else {
          app.noLogin(res.data.msg);
        }
      },
      fail: function (res) {
        that.setData({
          hidden: true
        })
        app.warning("服务器无响应");
      }
    })
  }
})