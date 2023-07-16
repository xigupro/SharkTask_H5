/* ============
 * Routes File
 * ============
 *
 * The routes and redirects are defined in this file.
 */
/* Layout */
import DefaultLayout from '@/components/layouts/default';
import PureLayout from '@/components/layouts/pure';

/**
 * meta里字段释义
 * 1. auth 是否需要授权才能访问该页面，默认需要授权（不设置或设置为true为需要授权，false为不需授权）
 * 2. menuName 菜单项的名字，面包屑导航时显示该名字
 * 3. parentMenuId 父菜单id，面包屑导航时用于跳转到父级菜单地址
 * 4. showLeftbar 是否显示左边菜单栏，默认显示，（不设置或设置为true为显示，false为不显示）
 * 5. showBreadcrumb 是否显示面包屑导航，默认显示（值同showLeftbar的设置）
 */

export default [
  // {
  //   path: '/login',
  //   component: () => import(/* webpackChunkName: "login" */ '@/views/login/index'),
  //   name: 'login',
  //   meta: {
  //     auth: false,
  //     menuName: '登录',
  //   },
  // },
  // {
  //   path: '/register',
  //   component: () => import(/* webpackChunkName: "register" */ '@/views/register/index'),
  //   name: 'register',
  //   meta: {
  //     auth: false,
  //     menuName: '注册',
  //   },
  // },
  {
    path: '/auth',
    name: 'auth',
    component: PureLayout,
    meta: {
      auth: false,
      menuName: '登录注册',
    },
    children: [
      {
        path: 'login',
        name: 'auth.login',
        component: () => import(/* webpackChunkName: "auth.login" */ '@/views/auth/login'),
        meta: {
          menuName: '登录',
          parentMenuId: 'auth',
          showHeaderInApp: true,
        },
      },
      {
        path: 'phone',
        name: 'auth.phone',
        component: () => import(/* webpackChunkName: "auth.phone" */ '@/views/auth/phone'),
        meta: {
          menuName: '手机号登录',
          parentMenuId: 'auth',
        },
      },
      {
        path: 'bind',
        name: 'auth.bind',
        component: () => import(/* webpackChunkName: "auth.bind" */ '@/views/auth/bind'),
        meta: {
          menuName: '手机号绑定',
          parentMenuId: 'auth',
        },
      },
      {
        path: 'register',
        name: 'auth.register',
        component: () => import(/* webpackChunkName: "auth.register" */ '@/views/auth/register'),
        meta: {
          menuName: '注册',
          parentMenuId: 'auth',
        },
      },
      {
        path: 'reset',
        name: 'auth.reset',
        component: () => import(/* webpackChunkName: "auth.reset" */ '@/views/auth/reset'),
        meta: {
          menuName: '找回密码',
          parentMenuId: 'auth',
        },
      },
    ],
  },
  {
    path: '/home',
    name: 'home',
    component: DefaultLayout,
    meta: {
      auth: false,
      menuName: '鲨鱼任务',
    },
    children: [
      {
        path: '',
        name: 'home.index',
        component: () => import(/* webpackChunkName: "home.index" */ '@/views/home/index'),
        meta: {
          menuName: '鲨鱼任务',
          parentMenuId: 'home',
          keepAlive: true,
          withTabbar: true,
        },
      },
      // 冗余的任务详情，为了解决详情返回列表无刷新的问题
      {
        path: 'task-detail/:id',
        name: 'home-task.detail',
        component: () => import(/* webpackChunkName: "home-task.detail" */ '@/views/task/detail'),
        meta: {
          menuName: '任务详情',
          parentMenuId: 'home',
          topRight: {
            icon: 'share',
            event: 'shareSystem',
          },
        },
      },
    ],
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: DefaultLayout,
    meta: {
      auth: false,
      menuName: '任务列表',
    },
    children: [
      {
        path: '',
        name: 'task.list',
        component: () => import(/* webpackChunkName: "task.list" */ '@/views/task/list'),
        meta: {
          menuName: '任务列表',
          parentMenuId: 'tasks',
          keepAlive: true,
          withTabbar: true,
        },
      },
      // 冗余的任务详情，为了解决详情返回列表无刷新的问题
      {
        path: 'detail/:id',
        name: 'task.detail',
        component: () => import(/* webpackChunkName: "task.detail" */ '@/views/task/detail'),
        meta: {
          menuName: '任务详情',
          parentMenuId: 'tasks',
          topRight: {
            icon: 'share',
            event: 'shareSystem',
          },
        },
      },
    ],
  },
  {
    path: '/goods',
    name: 'goods',
    component: PureLayout,
    meta: {
      auth: false,
      menuName: '商品列表',
    },
    children: [
      {
        path: 'list',
        name: 'goods.list',
        component: () => import(/* webpackChunkName: "goods.list" */ '@/views/goods/list'),
        meta: {
          menuName: '商品列表',
          parentMenuId: 'goods',
          keepAlive: true,
        },
      },
      {
        path: 'detail/:id',
        name: 'goods.detail',
        component: () => import(/* webpackChunkName: "goods.detail" */ '@/views/goods/detail'),
        meta: {
          menuName: '商品详情',
          parentMenuId: 'goods',
          topRight: {
            icon: 'share',
            event: 'shareSystem',
          },
        },
      },
    ],
  },
  {
    path: '/im',
    name: 'im',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '聊天',
    },
    children: [
      {
        path: '',
        name: 'im.index',
        component: () => import(/* webpackChunkName: "im.index" */ '@/views/im/index'),
        meta: {
          menuName: '聊天列表',
          parentMenuId: 'im',
        },
      },
      {
        path: 'chat',
        name: 'im.chat',
        component: () => import(/* webpackChunkName: "im.chat" */ '@/views/im/chat'),
        meta: {
          menuName: '聊天',
          parentMenuId: 'im',
        },
      },
    ],
  },
  {
    path: '/account',
    name: 'account',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '账号信息',
    },
    children: [
      {
        path: '',
        name: 'account.index',
        component: () => import(/* webpackChunkName: "account.index" */ '@/views/account/index'),
        meta: {
          menuName: '账号信息',
          parentMenuId: 'account',
        },
      },
      {
        path: 'password',
        name: 'account.password',
        component: () => import(/* webpackChunkName: "account.password" */ '@/views/account/password'),
        meta: {
          menuName: '修改密码',
          parentMenuId: 'account',
        },
      },
    ],
  },
  {
    path: '/ucenter',
    name: 'ucenter',
    component: DefaultLayout,
    meta: {
      auth: true,
      menuName: '个人中心',
    },
    children: [
      {
        path: '',
        name: 'ucenter.index',
        component: () => import(/* webpackChunkName: "ucenter.index" */ '@/views/ucenter/index'),
        meta: {
          menuName: '个人中心',
          parentMenuId: 'ucenter',
          keepAlive: true,
          withTabbar: true,
        },
      },
    ],
  },
  {
    path: '/task',
    name: 'task',
    component: PureLayout,
    meta: {
      menuName: '任务',
    },
    children: [,
      {
        path: 'self',
        name: 'task.self',
        component: () => import(/* webpackChunkName: "task.self" */ '@/views/task/self'),
        meta: {
          menuName: '自营任务',
          parentMenuId: 'task',
        },
      },
      {
        path: 'detail/:id',
        name: 'task.detail',
        component: () => import(/* webpackChunkName: "task.detail" */ '@/views/task/detail'),
        meta: {
          menuName: '任务详情',
          parentMenuId: 'task',
          topRight: {
            icon: 'share',
            event: 'shareSystem',
          },
        },
      },
      {
        path: 'form',
        name: 'task.add',
        component: () => import(/* webpackChunkName: "task.add" */ '@/views/task/form'),
        meta: {
          menuName: '发布任务',
          parentMenuId: 'task',
          keepAlive: true,
        },
      },
      {
        path: 'form/:id',
        name: 'task.update',
        component: () => import(/* webpackChunkName: "task.update" */ '@/views/task/form'),
        meta: {
          menuName: '编辑任务',
          parentMenuId: 'task',
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: '/review',
    name: 'review',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '审核',
    },
    children: [
      {
        path: 'submit',
        name: 'review.submit',
        component: () => import(/* webpackChunkName: "review.submit" */ '@/views/review/submit'),
        meta: {
          menuName: '提交审核',
          parentMenuId: 'review',
        },
      },
      {
        path: 'detail',
        name: 'review.detail',
        component: () => import(/* webpackChunkName: "review.detail" */ '@/views/review/detail'),
        meta: {
          menuName: '审核详情',
          parentMenuId: 'review',
        },
      },
      {
        path: 'list',
        name: 'review.list',
        component: () => import(/* webpackChunkName: "review.list" */ '@/views/review/list'),
        meta: {
          menuName: '待审核列表',
          parentMenuId: 'review',
        },
      },
      {
        path: 'do',
        name: 'review.do',
        component: () => import(/* webpackChunkName: "review.do" */ '@/views/review/do'),
        meta: {
          menuName: '审核页面',
          parentMenuId: 'review',
        },
      },
      {
        path: 'appeal',
        name: 'review.appeal',
        component: () => import(/* webpackChunkName: "review.appeal" */ '@/views/review/appeal'),
        meta: {
          menuName: '申诉页面',
          parentMenuId: 'review',
        },
      },
    ],
  },
  {
    path: '/favorite',
    name: 'favorite',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '收藏',
    },
    children: [
      {
        path: 'index',
        name: 'favorite.index',
        component: () => import(/* webpackChunkName: "favorite.index" */ '@/views/favorite/index'),
        meta: {
          menuName: '我的收藏',
          parentMenuId: 'favorite',
        },
      },
    ],
  },
  {
    path: '/sign',
    name: 'sign',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '签到',
    },
    children: [
      {
        path: '',
        name: 'sign.index',
        component: () => import(/* webpackChunkName: "sign.index" */ '@/views/sign/index'),
        meta: {
          menuName: '签到',
          parentMenuId: 'sign',
        },
      },
    ],
  },
  {
    path: '/shop',
    name: 'shop',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '店铺',
    },
    children: [
      {
        path: ':id',
        name: 'shop.index',
        component: () => import(/* webpackChunkName: "shop.index" */ '@/views/shop/index'),
        meta: {
          menuName: '雇主主页',
          parentMenuId: 'shop',
        },
      },
    ],
  },
  {
    path: '/withdraw',
    name: 'withdraw',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '提现',
    },
    children: [
      {
        path: 'submit',
        name: 'withdraw.submit',
        component: () => import(/* webpackChunkName: "withdraw.submit" */ '@/views/withdraw/submit'),
        meta: {
          menuName: '提现',
          parentMenuId: 'withdraw',
        },
      },
      {
        path: 'list',
        name: 'withdraw.list',
        component: () => import(/* webpackChunkName: "withdraw.list" */ '@/views/withdraw/list'),
        meta: {
          menuName: '提现列表',
          parentMenuId: 'withdraw',
        },
      },
      {
        path: 'detail',
        name: 'withdraw.detail',
        component: () => import(/* webpackChunkName: "withdraw.detail" */ '@/views/withdraw/detail'),
        meta: {
          menuName: '提现详情',
          parentMenuId: 'withdraw',
        },
      },
    ],
  },
  {
    path: '/recharge',
    name: 'recharge',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '充值',
    },
    children: [
      {
        path: 'index',
        name: 'recharge.index',
        component: () => import(/* webpackChunkName: "recharge.index" */ '@/views/recharge/index'),
        meta: {
          menuName: '充值',
          parentMenuId: 'recharge',
        },
      },
    ],
  },
  {
    path: '/refresh',
    name: 'refresh',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '付费刷新',
    },
    children: [
      {
        path: 'index',
        name: 'refresh.index',
        component: () => import(/* webpackChunkName: "refresh.index" */ '@/views/refresh/index'),
        meta: {
          menuName: '付费刷新',
          parentMenuId: 'refresh',
        },
      },
    ],
  },
  {
    path: '/grabbed',
    name: 'grabbed',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '我参与的',
    },
    children: [
      {
        path: 'index',
        name: 'grabbed.index',
        component: () => import(/* webpackChunkName: "grabbed.index" */ '@/views/grabbed/index'),
        meta: {
          menuName: '我参与的',
          parentMenuId: 'grabbed',
        },
      },
    ],
  },
  {
    path: '/certification',
    name: 'certification',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '实名认证',
    },
    children: [
      {
        path: 'index',
        name: 'certification.index',
        component: () => import(/* webpackChunkName: "certification.index" */ '@/views/certification/index'),
        meta: {
          menuName: '实名认证',
          parentMenuId: 'certification',
        },
      },
    ],
  },
  {
    path: '/wallet',
    name: 'wallet',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '我的钱包',
    },
    children: [
      {
        path: 'index',
        name: 'wallet.index',
        component: () => import(/* webpackChunkName: "wallet.index" */ '@/views/wallet/index'),
        meta: {
          menuName: '我的钱包',
          parentMenuId: 'wallet',
        },
      },
    ],
  },
  {
    path: '/published',
    name: 'published',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '我的发布',
    },
    children: [
      {
        path: 'index',
        name: 'published.index',
        component: () => import(/* webpackChunkName: "published.index" */ '@/views/published/index'),
        meta: {
          menuName: '我的发布',
          parentMenuId: 'published',
        },
      },
    ],
  },
  {
    path: '/partner',
    name: 'partner',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '合伙人专区',
    },
    children: [
      {
        path: 'index',
        name: 'partner.index',
        component: () => import(/* webpackChunkName: "partner.index" */ '@/views/partner/index'),
        meta: {
          menuName: '合伙人专区',
          parentMenuId: 'partner',
        },
      },
    ],
  },
  {
    path: '/order',
    name: 'order',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '商城订单',
    },
    children: [
      {
        path: 'list',
        name: 'order.list',
        component: () => import(/* webpackChunkName: "order.list" */ '@/views/order/list'),
        meta: {
          menuName: '订单列表',
          parentMenuId: 'order',
        },
      },
      {
        path: 'detail/:id',
        name: 'order.detail',
        component: () => import(/* webpackChunkName: "order.detail" */ '@/views/order/detail'),
        meta: {
          menuName: '订单详情',
          parentMenuId: 'order',
        },
      },
    ],
  },
  {
    path: '/address',
    name: 'address',
    component: PureLayout,
    meta: {
      auth: true,
      menuName: '收货地址',
    },
    children: [
      {
        path: 'list',
        name: 'address.list',
        component: () => import(/* webpackChunkName: "address.list" */ '@/views/address/list'),
        meta: {
          menuName: '收货地址',
          parentMenuId: 'address',
        },
      },
      {
        path: 'form',
        name: 'address.form',
        component: () => import(/* webpackChunkName: "address.form" */ '@/views/address/form'),
        meta: {
          menuName: '添加/编辑收货地址',
          parentMenuId: 'address',
        },
      },
    ],
  },
  {
    path: '/about',
    name: 'about',
    component: PureLayout,
    meta: {
      auth: false,
      menuName: '关于我们',
    },
    children: [
      {
        path: '',
        name: 'about.index',
        component: () => import(/* webpackChunkName: "about.index" */ '@/views/about/index'),
        meta: {
          menuName: '关于我们',
          parentMenuId: 'about',
        },
      },
      {
        path: 'policy',
        name: 'about.policy',
        component: () => import(/* webpackChunkName: "about.policy" */ '@/views/about/policy'),
        meta: {
          menuName: '隐私政策',
          parentMenuId: 'about',
        },
      },
      {
        path: 'agreement',
        name: 'about.agreement',
        component: () => import(/* webpackChunkName: "about.agreement" */ '@/views/about/agreement'),
        meta: {
          menuName: '服务协议',
          parentMenuId: 'about',
        },
      },
    ],
  },
  {
    path: '/help',
    name: 'help',
    component: PureLayout,
    meta: {
      menuName: '帮助中心',
    },
    children: [
      {
        path: '',
        name: 'help.index',
        component: () => import(/* webpackChunkName: "help.index" */ '@/views/help/index'),
        meta: {
          menuName: '帮助文章列表',
          keepAlive: true,
          parentMenuId: 'help',
        },
      },
      {
        path: 'detail/:id',
        name: 'help.detail',
        component: () => import(/* webpackChunkName: "help.detail" */ '@/views/help/detail'),
        meta: {
          menuName: '帮助文章详情',
          parentMenuId: 'help',
        },
      },
    ],
  },
  {
    path: '/discover',
    name: 'discover',
    component: DefaultLayout,
    meta: {
      menuName: '发现',
    },
    children: [
      {
        path: '',
        name: 'discover.index',
        component: () => import(/* webpackChunkName: "discover.index" */ '@/views/discover/index'),
        meta: {
          menuName: '发现',
          parentMenuId: 'discover',
          keepAlive: true,
          withTabbar: true,
        },
      },
    ],
  },
  {
    path: '/message',
    name: 'message',
    component: DefaultLayout,
    meta: {
      auth: true,
      menuName: '消息',
    },
    children: [
      {
        path: 'list',
        name: 'message.list',
        component: () => import(/* webpackChunkName: "message.list" */ '@/views/message/list'),
        meta: {
          menuName: '消息列表',
          parentMenuId: 'message',
          keepAlive: true,
        },
      },
      {
        path: 'detail/:id',
        name: 'message.detail',
        component: () => import(/* webpackChunkName: "message.detail" */ '@/views/message/detail'),
        meta: {
          menuName: '消息详情',
          parentMenuId: 'message',
        },
      },
    ],
  },
  {
    path: '/amap',
    name: 'amap',
    component: PureLayout,
    meta: {
      auth: false,
      menuName: '位置',
    },
    children: [
      {
        path: 'select',
        name: 'amap.select',
        component: () => import(/* webpackChunkName: "amap.select" */ '@/views/amap/select'),
        meta: {
          menuName: '位置选择',
          parentMenuId: 'amap',
          keepAlive: true,
        },
      },
    ],
  },
  {
    path: '/',
    redirect: '/home',
  },
];
