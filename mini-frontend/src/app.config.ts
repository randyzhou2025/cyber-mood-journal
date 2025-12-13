export default defineAppConfig({
  pages: ['pages/index/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0ea5e9',
    navigationBarTitleText: 'Mood Journal',
    navigationBarTextStyle: 'white'
  },
  permission: {
    'scope.userLocation': {
      desc: '用于在记录时获取当前位置'
    }
  },
  requiredPrivateInfos: ['getLocation']
});
