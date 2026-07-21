<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import http from '../api/http.js'
import { usePageTitle } from '../composables/usePageTitle.js'
import SakuraLayer from '../components/SakuraLayer.vue'

usePageTitle(() => '留言板')

const items = ref([])
const err = ref('')
const formErr = ref('')
const submitting = ref(false)
const nickname = ref('')
const content = ref('')

const replyingToId = ref(null)
const replyContent = ref('')
const replyErr = ref('')
const replySubmitting = ref(false)

async function load() {
  err.value = ''
  try {
    const { data } = await http.get('/api/guestbook')
    items.value = data.items || []
  } catch (e) {
    if (!e.response) {
      err.value =
        '连不上接口：请确认后端已启动（默认 3001），本地前端用 npm run dev 可走 Vite 代理 /api；若部署到线上请在构建时配置 VITE_API_BASE。'
    } else if (e.response.status === 500) {
      err.value =
        e.response.data?.error ||
        '服务器异常。请在 server 目录执行 npm run db:migrate-guestbook（含回复与置顶字段）。'
    } else {
      err.value = e.response?.data?.error || '加载留言失败'
    }
  }
}

async function submit() {
  formErr.value = ''
  submitting.value = true
  try {
    await http.post('/api/guestbook', {
      nickname: nickname.value.trim(),
      content: content.value.trim(),
    })
    content.value = ''
    await load()
  } catch (e) {
    if (!e.response) {
      formErr.value =
        '无法提交：网络或接口不可用，请检查后端与 VITE_API_BASE（参见上方说明）。'
    } else {
      formErr.value = e.response?.data?.error || '发表失败'
    }
  } finally {
    submitting.value = false
  }
}

function toggleReply(id) {
  replyErr.value = ''
  replyingToId.value = replyingToId.value === id ? null : id
  replyContent.value = ''
}

async function submitReply(parentId) {
  replyErr.value = ''
  const nick = nickname.value.trim()
  const text = replyContent.value.trim()
  if (!nick) {
    replyErr.value = '请先填写昵称（可与主留言共用）。'
    return
  }
  if (!text) {
    replyErr.value = '请填写回复内容。'
    return
  }
  replySubmitting.value = true
  try {
    await http.post('/api/guestbook', {
      nickname: nick,
      content: text,
      parent_id: parentId,
    })
    replyContent.value = ''
    replyingToId.value = null
    await load()
  } catch (e) {
    if (!e.response) {
      replyErr.value = '提交失败：请检查网络与接口。'
    } else {
      replyErr.value = e.response?.data?.error || '回复失败（含自动审核未通过时也会提示原因）'
    }
  } finally {
    replySubmitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="guestbook-page">
    <SakuraLayer />
    <div class="inner">
      <p class="back-wrap">
        <RouterLink class="back" to="/">← 返回首页</RouterLink>
      </p>

      <header class="page-head glass-panel">
        <h1 class="title">留言板</h1>
        <p class="lead">
          随便聊聊，无需登录。主留言与回复均经过自动审核；回复需填写昵称，且仅可回复主留言。
        </p>
      </header>

      <form class="form glass-panel" @submit.prevent="submit">
        <label class="field">
          <span class="label">昵称（回复会共用此项）</span>
          <input
            v-model="nickname"
            class="input"
            type="text"
            maxlength="32"
            placeholder="怎么称呼你"
            autocomplete="nickname"
            required
          />
        </label>
        <label class="field">
          <span class="label">留言</span>
          <textarea
            v-model="content"
            class="textarea"
            rows="5"
            maxlength="2000"
            placeholder="写点什么…"
            required
          />
        </label>
        <p v-if="formErr" class="form-err">{{ formErr }}</p>
        <button type="submit" class="submit" :disabled="submitting">
          {{ submitting ? '发送中…' : '发表留言' }}
        </button>
      </form>

      <p v-if="err" class="err">{{ err }}</p>
      <ul v-else class="list" aria-label="留言列表">
        <li v-for="m in items" :key="m.id" class="msg card" :class="{ pinned: m.pinned }">
          <div class="msg-meta">
            <span v-if="m.pinned" class="pin-badge">置顶</span>
            <span class="msg-name">{{ m.nickname }}</span>
            <time class="msg-time" :datetime="m.created_at">{{
              m.created_at?.slice(0, 16).replace('T', ' ')
            }}</time>
          </div>
          <p class="msg-body">{{ m.content }}</p>

          <ul v-if="m.replies?.length" class="replies">
            <li v-for="r in m.replies" :key="r.id" class="reply-item">
              <span class="reply-name">{{ r.nickname }}</span>
              <time class="reply-time">{{ r.created_at?.slice(0, 16).replace('T', ' ') }}</time>
              <p class="reply-body">{{ r.content }}</p>
            </li>
          </ul>

          <button type="button" class="reply-btn" @click="toggleReply(m.id)">
            {{ replyingToId === m.id ? '取消回复' : '回复' }}
          </button>

          <div v-if="replyingToId === m.id" class="reply-form glass-panel">
            <p class="reply-hint">昵称使用上方「昵称」；回复同样走自动审核。</p>
            <textarea
              v-model="replyContent"
              class="textarea textarea-sm"
              rows="3"
              maxlength="2000"
              placeholder="写下回复…"
            />
            <p v-if="replyErr" class="form-err">{{ replyErr }}</p>
            <button
              type="button"
              class="submit submit-sm"
              :disabled="replySubmitting"
              @click="submitReply(m.id)"
            >
              {{ replySubmitting ? '发送中…' : '发表回复' }}
            </button>
          </div>
        </li>
      </ul>
      <p v-if="!err && !items.length" class="empty">暂时还没有留言，来当第一个吧。</p>
    </div>
  </div>
</template>

<style scoped>
.guestbook-page {
  position: relative;
  min-height: calc(100vh - 55px);
  padding: 28px 16px 48px;
  background: transparent;
  overflow: hidden;
  color: var(--blog-text, #8fd8f0);
}

.inner {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
}

.back-wrap {
  margin: 0 0 16px;
}

.back {
  color: var(--blog-link-pop, #b3ebff);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  text-shadow: var(--blog-nav-shadow);
}

.back:hover {
  text-decoration: underline;
}

.glass-panel {
  background: var(--blog-glass-panel-bg, rgba(255, 255, 255, 0.06));
  backdrop-filter: blur(var(--blog-glass-panel-blur, 14px)) saturate(150%);
  -webkit-backdrop-filter: blur(var(--blog-glass-panel-blur, 14px)) saturate(150%);
  border: 1px solid var(--blog-glass-panel-border, rgba(140, 220, 255, 0.32));
  border-radius: 18px;
  padding: 22px 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 25, 50, 0.12);
}

.page-head .title {
  margin: 0 0 8px;
  font-size: 1.65rem;
  color: var(--blog-text-bright, #c5f1ff);
  text-shadow: var(--blog-title-shadow);
}

.page-head .lead {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.85));
  text-shadow: var(--blog-body-shadow);
}

.form .field {
  display: block;
  margin-bottom: 14px;
}

.form .label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--blog-text-bright, #c5f1ff);
}

.input,
.textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--blog-glass-card-border, rgba(130, 210, 255, 0.26));
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: var(--blog-body-on-glass, #fff4e8);
  background: var(--blog-glass-input-bg, rgba(255, 255, 255, 0.09));
}

.textarea {
  resize: vertical;
  min-height: 120px;
}

.textarea-sm {
  min-height: 72px;
  margin-bottom: 10px;
}

.input::placeholder,
.textarea::placeholder {
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.45));
}

.form-err {
  color: #ffcdd2;
  font-size: 0.88rem;
  margin: 0 0 10px;
}

.submit {
  border: 1px solid var(--blog-accent-border, rgba(100, 200, 255, 0.45));
  background: rgba(100, 200, 255, 0.22);
  color: var(--blog-nav-text, #e8fbff);
  font-weight: 700;
  font-size: 0.95rem;
  padding: 10px 22px;
  border-radius: 999px;
  cursor: pointer;
  text-shadow: var(--blog-nav-shadow);
}

.submit-sm {
  font-size: 0.88rem;
  padding: 8px 18px;
}

.submit:hover:not(:disabled) {
  background: rgba(100, 200, 255, 0.32);
}

.submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.err {
  color: #ffcdd2;
  font-weight: 600;
  text-align: center;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.msg.card {
  background: var(--blog-glass-card-bg, rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(var(--blog-glass-card-blur, 12px));
  -webkit-backdrop-filter: blur(var(--blog-glass-card-blur, 12px));
  border: 1px solid var(--blog-glass-card-border, rgba(130, 210, 255, 0.26));
  border-radius: 14px;
  padding: 16px 18px;
}

.msg.card.pinned {
  border-color: rgba(255, 200, 120, 0.45);
  box-shadow: 0 0 0 1px rgba(255, 200, 120, 0.15);
}

.pin-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(255, 190, 120, 0.25);
  color: #ffe0b2;
  margin-right: 6px;
}

.msg-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 14px;
  margin-bottom: 8px;
}

.msg-name {
  font-weight: 700;
  color: var(--blog-text-bright, #c5f1ff);
  text-shadow: var(--blog-title-shadow);
}

.msg-time {
  font-size: 0.8rem;
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.65));
}

.msg-body {
  margin: 0 0 12px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.65;
  color: var(--blog-body-on-glass, #fff4e8);
  text-shadow: var(--blog-body-shadow);
}

.replies {
  list-style: none;
  margin: 0 0 12px;
  padding: 10px 0 0 12px;
  border-left: 2px solid rgba(130, 210, 255, 0.25);
}

.reply-item {
  margin-bottom: 10px;
}

.reply-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--blog-text-bright, #c5f1ff);
}

.reply-time {
  font-size: 0.72rem;
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.55));
  margin-left: 8px;
}

.reply-body {
  margin: 4px 0 0;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.55;
  color: var(--blog-body-on-glass, #fff4e8);
  text-shadow: var(--blog-body-shadow);
}

.reply-btn {
  margin-top: 4px;
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid var(--blog-glass-card-border, rgba(130, 210, 255, 0.35));
  background: rgba(0, 40, 70, 0.25);
  color: var(--blog-link-pop, #b3ebff);
  cursor: pointer;
}

.reply-btn:hover {
  background: rgba(100, 200, 255, 0.15);
}

.reply-form {
  margin-top: 12px;
  padding: 14px 16px !important;
  margin-bottom: 0 !important;
}

.reply-hint {
  margin: 0 0 8px;
  font-size: 0.8rem;
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.75));
}

.empty {
  text-align: center;
  color: var(--blog-text-muted, rgba(143, 216, 240, 0.75));
  font-size: 0.92rem;
  margin-top: 8px;
}
</style>
