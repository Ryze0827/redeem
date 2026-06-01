<template>
  <div class="layout">
    <div class="locale-switcher">
      <button class="locale-trigger" type="button" @click="localeOpen = !localeOpen">
        <span class="locale-flag">{{ activeLocale.flag }}</span>
        <span class="locale-label">{{ activeLocale.label }}</span>
        <span class="arrow">⌄</span>
      </button>
      <div v-if="localeOpen" class="locale-menu">
        <button
          v-for="item in locales"
          :key="item.code"
          :class="{ 'is-active': item.code === locale }"
          type="button"
          @click="chooseLocale(item.code)"
        >
          <span>{{ item.flag }}</span>
          {{ item.label }}
        </button>
      </div>
    </div>

    <header>
      <h1>{{ t('gpt.page.title') }}</h1>
      <p>{{ t('gpt.page.subtitle') }}</p>
      <a class="batch-link" href="/batch.html">{{ t('nav.batchQuery') }}</a>
      <div :class="['stock-line', { 'stock-line--error': stockError }]">
        {{ t('stock.turkeyLabel') }}
        <span>{{ stockText }}</span>
      </div>
    </header>

    <main>
      <section class="activation-layout">
        <div v-if="notice.visible" :class="['notice', `notice--${notice.type}`]">
          <strong>{{ notice.message }}</strong>
        </div>

        <div class="two-col">
          <aside class="guide-panel">
            <div class="guide-header">
              <h3>{{ t('guide.title') }}</h3>
              <p>{{ t('guide.subtitle') }}</p>
            </div>
            <div class="guide-steps">
              <div class="guide-step">
                <span class="step-badge">01</span>
                <div class="step-body">
                  <h4>{{ t('guide.step1.title') }}</h4>
                  <p>{{ t('guide.step1.desc') }}</p>
                </div>
              </div>
              <div class="guide-step">
                <span class="step-badge">02</span>
                <div class="step-body">
                  <h4>{{ t('gpt.guide.step2.title') }}</h4>
                  <p>{{ t('gpt.guide.step2.desc') }}</p>
                  <a class="step-link" href="https://chatgpt.com" target="_blank" rel="noopener noreferrer">
                    {{ t('gpt.guide.step2.btn') }}
                  </a>
                </div>
              </div>
              <div class="guide-step">
                <span class="step-badge">03</span>
                <div class="step-body">
                  <h4>{{ t('gpt.guide.step3.title') }}</h4>
                  <p>{{ t('gpt.guide.step3.desc') }}</p>
                  <a class="step-link" :href="sessionUrl" target="_blank" rel="noopener noreferrer">
                    {{ t('gpt.guide.step3.btn') }}
                  </a>
                </div>
              </div>
              <div class="guide-step">
                <span class="step-badge">04</span>
                <div class="step-body">
                  <h4>{{ t('guide.step4.title') }}</h4>
                  <p>{{ t('guide.step4.desc') }}</p>
                </div>
              </div>
            </div>
          </aside>

          <div class="form-panel">
            <article v-if="stage === 'query'" class="card-panel">
              <h2>{{ t('query.title') }}</h2>
              <p class="muted">{{ t('query.tip') }}</p>
              <form @submit.prevent="onQuery">
                <label class="field">
                  <span><em>*</em>{{ t('query.cdkeyLabel') }}</span>
                  <input
                    v-model.trim="queryForm.cdkey"
                    maxlength="64"
                    :placeholder="t('query.cdkeyPlaceholder')"
                    @input="queryError = ''"
                  />
                  <small v-if="queryError">{{ queryError }}</small>
                </label>
                <button class="primary-button" type="submit" :disabled="loading">
                  <span v-if="loading" class="loading-dot"></span>
                  <span v-else class="button-icon">○</span>
                  {{ t('query.submit') }}
                </button>
              </form>
              <div v-if="queryFeedback" class="inline-alert inline-alert--info">{{ queryFeedback }}</div>
            </article>

            <article v-else class="card-panel">
              <div class="card-head">
                <div>
                  <h2>{{ t('recharge.title') }}</h2>
                  <p class="muted">
                    {{ t('recharge.statusLabel') }}
                    <span :class="['status-chip', sessionDisabled ? 'status-chip--warn' : 'status-chip--ok']">
                      {{ statusHint }}
                    </span>
                  </p>
                </div>
                <button class="text-button" type="button" @click="resetFlow">{{ t('recharge.reset') }}</button>
              </div>

              <div v-if="giftName" class="gift-highlight">
                <div class="gift-title">{{ giftName }}</div>
                <div class="gift-status">{{ statusHint }}</div>
              </div>

              <form class="recharge-form" @submit.prevent="onRecharge">
                <label class="field">
                  <span>{{ t('recharge.cdkeyLabel') }}</span>
                  <input class="center-input big-input" :value="cdkeyLocked" disabled />
                </label>

                <label class="field">
                  <span>{{ t('recharge.giftLabel') }}</span>
                  <input class="center-input big-input" :value="giftName" :placeholder="t('recharge.giftPlaceholder')" disabled />
                </label>

                <label v-if="account" class="field">
                  <span>{{ t('recharge.accountInfo') }}</span>
                  <input class="center-input big-input" :value="account" disabled />
                </label>

                <label class="field">
                  <span class="label-with-action">
                    {{ t('recharge.sessionLabel') }}
                    <button class="help-button" type="button" @click="tutorialVisible = true">
                      {{ t('recharge.sessionHelp') }}
                    </button>
                  </span>
                  <textarea
                    v-model.trim="rechargeForm.sessionInfo"
                    :class="{ 'session-input--locked': sessionDisabled }"
                    rows="4"
                    maxlength="10000"
                    :disabled="sessionDisabled"
                    :placeholder="t('recharge.sessionPlaceholder')"
                    @input="rechargeError = ''"
                  ></textarea>
                  <small v-if="rechargeError">{{ rechargeError }}</small>
                </label>

                <label v-if="!sessionDisabled" class="force-checkbox">
                  <input v-model="forceRecharge" type="checkbox" />
                  <span>{{ t('recharge.forceLabel') }}</span>
                </label>

                <button class="primary-button" type="submit" :disabled="loading || sessionDisabled">
                  <span v-if="loading" class="loading-dot"></span>
                  <span v-else class="button-icon">✓</span>
                  {{ t('recharge.submit') }}
                </button>
              </form>

              <div v-if="rechargeFeedback" class="inline-alert inline-alert--error">{{ rechargeFeedback }}</div>
              <div v-if="sessionDisabled" class="inline-alert inline-alert--warning">{{ statusHint }}</div>

              <section v-if="activationResult.cdkey" class="result-card">
                <h3>{{ t('result.title') }}</h3>
                <div class="result-grid">
                  <div class="result-item">
                    <p class="label">{{ t('result.cdkey') }}</p>
                    <p class="value">{{ activationResult.cdkey }}</p>
                  </div>
                  <div class="result-item">
                    <p class="label">{{ t('result.gift') }}</p>
                    <p class="value">{{ activationResult.giftName || '-' }}</p>
                  </div>
                  <div class="result-item">
                    <p class="label">{{ t('result.account') }}</p>
                    <p class="value">{{ activationResult.account || '-' }}</p>
                  </div>
                  <div class="result-item">
                    <p class="label">{{ t('result.status') }}</p>
                    <p class="value status">{{ statusText(activationResult.useStatus) }}</p>
                  </div>
                </div>
                <p class="activated-tip">{{ t('message.activatedTip') }}</p>
              </section>
            </article>
          </div>
        </div>
      </section>
    </main>

    <div v-if="tutorialVisible" class="dialog-mask" @click.self="tutorialVisible = false">
      <section class="tutorial-dialog">
        <header>
          <h3>{{ t('dialog.title') }}</h3>
          <button type="button" @click="tutorialVisible = false">×</button>
        </header>
        <p>{{ t('gpt.dialog.body') }}</p>
        <div class="inline-alert inline-alert--info">{{ t('gpt.dialog.alert') }}</div>
        <footer>
          <button class="plain-button" type="button" @click="tutorialVisible = false">{{ t('dialog.cancel') }}</button>
          <button class="primary-button" type="button" @click="openSessionPage">{{ t('dialog.confirm') }}</button>
        </footer>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { checkCdkey, getStock, submitRecharge } from './api'
import { activeLocale, locale, locales, setLocale, statusText, t } from './i18n'

const sessionUrl = 'https://chatgpt.com/api/auth/session'
const stage = ref('query')
const loading = ref(false)
const localeOpen = ref(false)
const tutorialVisible = ref(false)
const stockCount = ref('')
const stockError = ref(false)
const queryError = ref('')
const rechargeError = ref('')
const queryFeedback = ref('')
const rechargeFeedback = ref('')
const cdkeyLocked = ref('')
const giftName = ref('')
const account = ref('')
const statusHint = ref('')
const sessionDisabled = ref(false)
const forceRecharge = ref(false)

const queryForm = reactive({ cdkey: '' })
const rechargeForm = reactive({ sessionInfo: '' })
const activationResult = reactive({ cdkey: '', giftName: '', account: '', useStatus: null })
const notice = reactive({ visible: false, type: 'info', message: '' })

const stockText = computed(() => stockCount.value || t('stock.loading'))

watch(locale, () => {
  document.title = t('gpt.page.title')
})

onMounted(() => {
  document.title = t('gpt.page.title')
  const presetCdkey = new URLSearchParams(window.location.search).get('cdkey')
  if (presetCdkey) queryForm.cdkey = presetCdkey.trim()
  loadStock()
})

function chooseLocale(code) {
  setLocale(code)
  localeOpen.value = false
}

async function loadStock() {
  try {
    const response = await getStock()
    stockCount.value = response?.data?.count ?? response?.count ?? '--'
    stockError.value = !isSuccess(response)
  } catch {
    stockCount.value = '--'
    stockError.value = true
  }
}

async function onQuery() {
  if (!queryForm.cdkey) {
    queryError.value = t('validation.cdkey')
    return
  }

  loading.value = true
  queryFeedback.value = ''
  rechargeFeedback.value = ''
  try {
    const response = await checkCdkey(queryForm.cdkey)
    applyCheckResult(response)
  } catch (error) {
    const message = normalizeError(error)
    queryFeedback.value = `${t('message.queryFail')}：${message}`
    showNotice('error', message)
  } finally {
    loading.value = false
  }
}

async function onRecharge() {
  if (sessionDisabled.value) {
    showNotice('warning', statusHint.value || t('message.notAllow'))
    return
  }

  if (!rechargeForm.sessionInfo.trim()) {
    rechargeError.value = t('validation.session')
    showNotice('warning', t('message.enterSession'))
    return
  }

  const email = extractEmail(rechargeForm.sessionInfo)
  if (email) {
    const message = t('confirm.emailMessage').replace('{email}', email)
    if (!window.confirm(`${t('confirm.emailTitle')}\n\n${message}`)) return
  }

  loading.value = true
  rechargeFeedback.value = ''
  try {
    const response = await submitRecharge({
      cdkey: cdkeyLocked.value,
      sessionInfo: rechargeForm.sessionInfo,
      force: forceRecharge.value,
    })
    applyRechargeResult(response)
  } catch (error) {
    const message = normalizeError(error)
    rechargeFeedback.value = message
    statusHint.value = message
    showNotice('error', message)
  } finally {
    loading.value = false
  }
}

function applyCheckResult(response) {
  const success = isSuccess(response)
  const message = normalizeMessage(response?.msg || t('message.queryFail'))
  const data = response?.data || {}
  notice.visible = true
  notice.type = success ? 'success' : 'error'
  notice.message = message

  if (!success) {
    queryFeedback.value = `${t('message.queryFail')}：${message}`
    return
  }

  const useStatus = Number(data.use_status)
  cdkeyLocked.value = data.cdkey || queryForm.cdkey
  giftName.value = data.gift_name || ''
  account.value = data.account || ''
  statusHint.value = normalizeMessage(data.status_hint || message || statusText(useStatus))
  sessionDisabled.value = useStatus !== 0
  queryFeedback.value = ''

  if (useStatus === 1) {
    activationResult.cdkey = cdkeyLocked.value
    activationResult.giftName = giftName.value
    activationResult.account = account.value
    activationResult.useStatus = useStatus
  }

  rechargeForm.sessionInfo = sessionDisabled.value
    ? [accountLine(account.value), completedLine(data.completed_at), statusHint.value].filter(Boolean).join('\n')
    : accountLine(account.value)

  stage.value = 'recharge'
}

function applyRechargeResult(response) {
  const success = isSuccess(response)
  const message = normalizeMessage(response?.msg || t('message.serverError'))
  if (!success) {
    rechargeFeedback.value = message
    statusHint.value = message
    showNotice('error', message)
    return
  }

  const data = response?.data || {}
  activationResult.cdkey = data.cdkey || cdkeyLocked.value
  activationResult.giftName = data.gift_name || giftName.value
  activationResult.account = data.account || account.value || ''
  activationResult.useStatus = data.use_status ?? 1
  account.value = activationResult.account
  statusHint.value = message || t('message.submitSuccess')
  sessionDisabled.value = true
  rechargeForm.sessionInfo = [
    accountLine(activationResult.account),
    completedLine(data.completed_at),
    statusHint.value,
  ].filter(Boolean).join('\n')
  showNotice('success', statusHint.value)
}

function resetFlow() {
  stage.value = 'query'
  queryForm.cdkey = ''
  rechargeForm.sessionInfo = ''
  queryError.value = ''
  rechargeError.value = ''
  queryFeedback.value = ''
  rechargeFeedback.value = ''
  cdkeyLocked.value = ''
  giftName.value = ''
  account.value = ''
  statusHint.value = ''
  sessionDisabled.value = false
  forceRecharge.value = false
  notice.visible = false
  Object.assign(activationResult, { cdkey: '', giftName: '', account: '', useStatus: null })
}

function openSessionPage() {
  window.open(sessionUrl, '_blank', 'noopener,noreferrer')
  tutorialVisible.value = false
}

function showNotice(type, message) {
  notice.visible = true
  notice.type = type
  notice.message = message
}

function isSuccess(response) {
  return Boolean(response?.success ?? response?.flag)
}

function normalizeError(error) {
  return normalizeMessage(error?.message || t('message.networkError'))
}

function normalizeMessage(message) {
  return message || t('message.serverError')
}

function completedLine(value) {
  if (!value) return ''
  const date = new Date(value)
  const text = Number.isNaN(date.getTime()) ? value : date.toLocaleString()
  return `${t('recharge.completedAtLabel')}: ${text}`
}

function accountLine(value) {
  return value ? `${t('recharge.accountLabel')}: ${value}` : ''
}

function extractEmail(text) {
  if (!text) return ''
  try {
    const parsed = JSON.parse(text)
    if (parsed?.user?.email) return String(parsed.user.email).trim()
  } catch {
    const match = text.match(/["']user["']\s*:\s*\{[^}]*?["']email["']\s*:\s*["']([^"']+)["']/)
    if (match) return match[1].trim()
  }
  return ''
}
</script>
