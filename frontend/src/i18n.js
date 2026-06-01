import { computed, ref } from 'vue'

const LOCALE_KEY = 'redeem-locale'

export const locales = [
  { code: 'zh', label: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇭🇰' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
]

const messages = {
  zh: {
    'gpt.page.title': 'ChatGPT Plus 充值',
    'gpt.page.subtitle': '验证卡密后填写 Session，提交任务并获取结果。',
    'gpt.dialog.body': '请先在浏览器中登录自己的 ChatGPT 账号后点击跳转，并把页面中全部内容复制到下面的输入框中。',
    'gpt.dialog.alert': '点击跳转会在新页面打开：https://chatgpt.com/api/auth/session',
    'gpt.guide.step2.title': '登录 ChatGPT',
    'gpt.guide.step2.desc': '先登录 ChatGPT，确保账号已在线。',
    'gpt.guide.step2.btn': '打开 ChatGPT',
    'gpt.guide.step3.title': '获取 AuthSession',
    'gpt.guide.step3.desc': '打开 AuthSession 页面，复制完整 JSON 内容并粘贴到输入框。',
    'gpt.guide.step3.btn': '打开 AuthSession 页面',
    'guide.title': '操作指南',
    'guide.subtitle': '跟着 4 步走即可完成充值，先验证卡密，再提交任务。',
    'guide.step1.title': '输入卡密并验证',
    'guide.step1.desc': '填写卡密并点击「验证卡密」，确认卡密未使用且商品正确。',
    'guide.step4.title': '确认账号后充值',
    'guide.step4.desc': '确认提交后耐心等待1分钟左右会自动充值完毕。',
    'nav.batchQuery': '卡密批量查询',
    'stock.turkeyLabel': '当前凭证库存为：',
    'stock.loading': '获取中',
    'query.title': '第一步：填写 CDKEY',
    'query.tip': '请输入收到的卡密，系统会反馈当前可用状态。',
    'query.cdkeyLabel': 'CDKEY 卡密',
    'query.cdkeyPlaceholder': '例如：XXXX-XXXX',
    'query.submit': '查询卡密',
    'recharge.title': '第二步：提交 Session 信息',
    'recharge.statusLabel': '状态：',
    'recharge.reset': '重新查询',
    'recharge.cdkeyLabel': 'CDKEY',
    'recharge.giftLabel': '礼物信息',
    'recharge.giftPlaceholder': '礼物信息',
    'recharge.sessionLabel': 'Session 信息',
    'recharge.sessionHelp': '获取教程',
    'recharge.sessionPlaceholder': '请输入来自官网的 Session 信息',
    'recharge.completedAtLabel': '完成时间',
    'recharge.submit': '提交充值',
    'recharge.accountLabel': '账号',
    'recharge.accountInfo': '账号信息',
    'recharge.forceLabel': '放弃剩余会员时间 强制充值（可选）',
    'dialog.title': '获取 Session 教程',
    'dialog.cancel': '取消',
    'dialog.confirm': '跳转',
    'confirm.emailTitle': '确认充值账号',
    'confirm.emailMessage': '请确认当前充值账号的邮箱为 {email}，确认无误后点击确认充值。',
    'validation.cdkey': '请输入 CDKEY',
    'validation.session': '请输入 Session 信息',
    'message.enterSession': '请输入 Session 后提交',
    'message.notAllow': '当前不可提交',
    'message.queryFail': '查询失败',
    'message.querySuccessFill': '查询成功，请填写 Session 信息',
    'message.networkError': '网络连接失败，请检查网络后重试',
    'message.errorTitle': '错误提示',
    'message.serverError': '服务器异常或网络波动',
    'message.submitSuccess': '充值成功',
    'message.activatedTip': '如果没到账，重新登录账号即可。',
    'result.title': '充值结果',
    'result.cdkey': '卡密',
    'result.gift': '礼物',
    'result.account': '账号',
    'result.status': '状态',
  },
  en: {
    'gpt.page.title': 'ChatGPT Plus Recharge',
    'gpt.page.subtitle': 'Verify your CDKEY, fill in the Session, and submit to get the result.',
    'gpt.dialog.body': 'Log in to your ChatGPT account in the browser, open the link, and copy all content into the field below.',
    'gpt.dialog.alert': 'Opening will launch a new page: https://chatgpt.com/api/auth/session',
    'gpt.guide.step2.title': 'Log in to ChatGPT',
    'gpt.guide.step2.desc': 'Log in to ChatGPT first and make sure your account is online.',
    'gpt.guide.step2.btn': 'Open ChatGPT',
    'gpt.guide.step3.title': 'Get AuthSession',
    'gpt.guide.step3.desc': 'Open the AuthSession page, copy the full JSON content and paste it into the input field.',
    'gpt.guide.step3.btn': 'Open AuthSession Page',
    'guide.title': 'Guide',
    'guide.subtitle': 'Follow 4 simple steps to recharge: verify your CDKEY, then submit the task.',
    'guide.step1.title': 'Enter CDKEY & Verify',
    'guide.step1.desc': 'Fill in the CDKEY and click "Verify". Confirm the key is unused and the product is correct.',
    'guide.step4.title': 'Confirm & Recharge',
    'guide.step4.desc': 'After submitting, please wait about 1 minute for the recharge to complete automatically.',
    'nav.batchQuery': 'Batch CDKEY Query',
    'stock.turkeyLabel': 'Current credential stock:',
    'stock.loading': 'Loading',
    'query.title': 'Step 1: Enter CDKEY',
    'query.tip': "Enter the card key you received and we'll show its current status.",
    'query.cdkeyLabel': 'CDKEY',
    'query.cdkeyPlaceholder': 'Example: XXXX-XXXX',
    'query.submit': 'Check CDKEY',
    'recharge.title': 'Step 2: Submit Session',
    'recharge.statusLabel': 'Status:',
    'recharge.reset': 'Check another',
    'recharge.cdkeyLabel': 'CDKEY',
    'recharge.giftLabel': 'Gift info',
    'recharge.giftPlaceholder': 'Gift info',
    'recharge.sessionLabel': 'Session info',
    'recharge.sessionHelp': 'How to get it',
    'recharge.sessionPlaceholder': 'Paste the session info from the official site',
    'recharge.completedAtLabel': 'Completed at',
    'recharge.submit': 'Submit recharge',
    'recharge.accountLabel': 'Account',
    'recharge.accountInfo': 'Account info',
    'recharge.forceLabel': 'Forfeit remaining membership time & force recharge (optional)',
    'dialog.title': 'How to get the session',
    'dialog.cancel': 'Cancel',
    'dialog.confirm': 'Open link',
    'confirm.emailTitle': 'Confirm recharge account',
    'confirm.emailMessage': 'Please confirm the recharge account email is {email}. Continue if it is correct.',
    'validation.cdkey': 'Please enter the CDKEY',
    'validation.session': 'Please enter session info',
    'message.enterSession': 'Enter the session before submitting',
    'message.notAllow': 'Submission is currently disabled',
    'message.queryFail': 'Query failed',
    'message.querySuccessFill': 'Query successful, please fill in the session info',
    'message.networkError': 'Network connection failed, please check your network',
    'message.errorTitle': 'Error',
    'message.serverError': 'Server error or network issue',
    'message.submitSuccess': 'Recharge submitted successfully',
    'message.activatedTip': "If credits haven't arrived, try logging out and back in.",
    'result.title': 'Recharge result',
    'result.cdkey': 'CDKEY',
    'result.gift': 'Gift',
    'result.account': 'Account',
    'result.status': 'Status',
  },
}

messages['zh-TW'] = {
  ...messages.zh,
  'gpt.page.title': 'ChatGPT Plus 儲值',
  'gpt.page.subtitle': '驗證卡密後填寫 Session，提交任務並取得結果。',
  'guide.title': '操作指南',
  'guide.subtitle': '跟著 4 步走即可完成儲值，先驗證卡密，再提交任務。',
  'query.title': '第一步：填寫 CDKEY',
  'query.tip': '請輸入收到的卡密，系統會回饋當前可用狀態。',
  'query.submit': '查詢卡密',
  'recharge.title': '第二步：提交 Session 資訊',
  'recharge.submit': '提交儲值',
  'message.submitSuccess': '儲值成功',
  'result.title': '儲值結果',
}

messages.ru = {
  ...messages.en,
  'gpt.page.title': 'Пополнение ChatGPT Plus',
  'gpt.page.subtitle': 'Проверьте CDKEY, заполните Session и отправьте задачу.',
  'guide.title': 'Руководство',
  'query.title': 'Шаг 1: введите CDKEY',
  'query.submit': 'Проверить CDKEY',
  'recharge.title': 'Шаг 2: отправьте Session',
  'recharge.submit': 'Отправить пополнение',
}

messages.vi = {
  ...messages.en,
  'gpt.page.title': 'Nạp ChatGPT Plus',
  'gpt.page.subtitle': 'Xác minh CDKEY, điền Session và gửi để nhận kết quả.',
  'guide.title': 'Hướng dẫn',
  'query.title': 'Bước 1: Nhập CDKEY',
  'query.submit': 'Kiểm tra CDKEY',
  'recharge.title': 'Bước 2: Gửi Session',
  'recharge.submit': 'Gửi nạp tiền',
}

export const statusLabels = {
  zh: { 0: '待提交', '-1': '正在调用', '-9': '库存不足', 1: '已完成', '-999': '异常', '-1000': '已作废', '-1001': '已售后处理' },
  'zh-TW': { 0: '待提交', '-1': '正在呼叫', '-9': '庫存不足', 1: '已完成', '-999': '異常', '-1000': '已作廢', '-1001': '已售後處理' },
  en: { 0: 'Pending', '-1': 'Processing', '-9': 'Out of stock', 1: 'Completed', '-999': 'Error', '-1000': 'Voided', '-1001': 'After-sale processed' },
  ru: { 0: 'Ожидает', '-1': 'Обработка', '-9': 'Нет в наличии', 1: 'Завершено', '-999': 'Ошибка', '-1000': 'Аннулировано', '-1001': 'Обработан после продажи' },
  vi: { 0: 'Chờ gửi', '-1': 'Đang xử lý', '-9': 'Hết hàng', 1: 'Hoàn thành', '-999': 'Lỗi', '-1000': 'Đã hủy', '-1001': 'Đã xử lý hậu mãi' },
}

function detectLocale() {
  const saved = localStorage.getItem(LOCALE_KEY)
  if (saved && messages[saved]) return saved

  const language = (navigator.language || 'en').toLowerCase()
  if (language === 'zh-tw' || language.startsWith('zh-hant')) return 'zh-TW'
  if (language.startsWith('zh')) return 'zh'
  if (language.startsWith('ru')) return 'ru'
  if (language.startsWith('vi')) return 'vi'
  return 'en'
}

export const locale = ref(detectLocale())

export const activeLocale = computed(() => locales.find((item) => item.code === locale.value) || locales[0])

export function setLocale(code) {
  if (!messages[code]) return
  locale.value = code
  localStorage.setItem(LOCALE_KEY, code)
  document.title = t('gpt.page.title')
}

export function t(key) {
  return messages[locale.value]?.[key] || messages.en[key] || key
}

export function statusText(value) {
  const labels = statusLabels[locale.value] || statusLabels.en
  return labels[String(value)] || value || '-'
}
