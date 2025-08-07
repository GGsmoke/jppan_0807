<template>
  <div class="gojuon-page">
    <div class="page-header">
      <div class="container">
        <h1>五十音图</h1>
        <p>日语基础假名学习，掌握平假名、片假名和发音</p>
      </div>
    </div>

    <div class="container">
      <div class="gojuon-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          <i :class="tab.icon"></i>
          {{ tab.name }}
        </button>
      </div>

      <!-- 五十音表 -->
      <div v-show="currentTab === 'chart'" class="gojuon-chart">
        <div class="chart-controls">
          <button 
            v-for="type in ['hiragana', 'katakana']" 
            :key="type"
            :class="['type-btn', { active: currentType === type }]"
            @click="currentType = type"
          >
            {{ type === 'hiragana' ? '平假名' : '片假名' }}
          </button>
        </div>

        <!-- 清音 -->
        <div class="chart-section">
          <h3>清音</h3>
          <div class="chart-grid">
            <div class="chart-header">
              <div class="chart-cell header"></div>
              <div class="chart-cell header">あ段</div>
              <div class="chart-cell header">い段</div>
              <div class="chart-cell header">う段</div>
              <div class="chart-cell header">え段</div>
              <div class="chart-cell header">お段</div>
            </div>
            <div 
              v-for="(row, rowIndex) in seionChart" 
              :key="rowIndex" 
              class="chart-row"
            >
              <div class="chart-cell row-header">{{ row.rowName }}</div>
              <div 
                v-for="(char, colIndex) in row.chars" 
                :key="colIndex"
                :class="['chart-cell', { empty: !char, playing: playingChar === char?.romaji }]"
                @click="playSound(char)"
              >
                <template v-if="char">
                  <div class="character">{{ currentType === 'hiragana' ? char.hiragana : char.katakana }}</div>
                  <div class="romaji">{{ char.romaji }}</div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 浊音 -->
        <div class="chart-section">
          <h3>浊音</h3>
          <div class="chart-grid">
            <div class="chart-header">
              <div class="chart-cell header"></div>
              <div class="chart-cell header">あ段</div>
              <div class="chart-cell header">い段</div>
              <div class="chart-cell header">う段</div>
              <div class="chart-cell header">え段</div>
              <div class="chart-cell header">お段</div>
            </div>
            <div 
              v-for="(row, rowIndex) in dakuonChart" 
              :key="rowIndex" 
              class="chart-row"
            >
              <div class="chart-cell row-header">{{ row.rowName }}</div>
              <div 
                v-for="(char, colIndex) in row.chars" 
                :key="colIndex"
                :class="['chart-cell', { empty: !char, playing: playingChar === char?.romaji }]"
                @click="playSound(char)"
              >
                <template v-if="char">
                  <div class="character">{{ currentType === 'hiragana' ? char.hiragana : char.katakana }}</div>
                  <div class="romaji">{{ char.romaji }}</div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 半浊音 -->
        <div class="chart-section">
          <h3>半浊音</h3>
          <div class="chart-grid">
            <div class="chart-header">
              <div class="chart-cell header"></div>
              <div class="chart-cell header">あ段</div>
              <div class="chart-cell header">い段</div>
              <div class="chart-cell header">う段</div>
              <div class="chart-cell header">え段</div>
              <div class="chart-cell header">お段</div>
            </div>
            <div 
              v-for="(row, rowIndex) in handakuonChart" 
              :key="rowIndex" 
              class="chart-row"
            >
              <div class="chart-cell row-header">{{ row.rowName }}</div>
              <div 
                v-for="(char, colIndex) in row.chars" 
                :key="colIndex"
                :class="['chart-cell', { empty: !char, playing: playingChar === char?.romaji }]"
                @click="playSound(char)"
              >
                <template v-if="char">
                  <div class="character">{{ currentType === 'hiragana' ? char.hiragana : char.katakana }}</div>
                  <div class="romaji">{{ char.romaji }}</div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- 拗音 -->
        <div class="chart-section">
          <h3>拗音</h3>
          <div class="youon-grid">
            <div class="youon-section">
              <h4>清音拗音</h4>
              <div class="youon-row" v-for="(row, index) in youonChart" :key="index">
                <div 
                  v-for="(char, charIndex) in row" 
                  :key="charIndex"
                  :class="['chart-cell youon-cell', { playing: playingChar === char?.romaji }]"
                  @click="playSound(char)"
                >
                  <div class="character">{{ currentType === 'hiragana' ? char.hiragana : char.katakana }}</div>
                  <div class="romaji">{{ char.romaji }}</div>
                </div>
              </div>
            </div>

            <div class="youon-section">
              <h4>浊音拗音</h4>
              <div class="youon-row" v-for="(row, index) in youonDakuonChart" :key="index">
                <div 
                  v-for="(char, charIndex) in row" 
                  :key="charIndex"
                  :class="['chart-cell youon-cell', { playing: playingChar === char?.romaji }]"
                  @click="playSound(char)"
                >
                  <div class="character">{{ currentType === 'hiragana' ? char.hiragana : char.katakana }}</div>
                  <div class="romaji">{{ char.romaji }}</div>
                </div>
              </div>
            </div>

            <div class="youon-section">
              <h4>半浊音拗音</h4>
              <div class="youon-row" v-for="(row, index) in youonHandakuonChart" :key="index">
                <div 
                  v-for="(char, charIndex) in row" 
                  :key="charIndex"
                  :class="['chart-cell youon-cell', { playing: playingChar === char?.romaji }]"
                  @click="playSound(char)"
                >
                  <div class="character">{{ currentType === 'hiragana' ? char.hiragana : char.katakana }}</div>
                  <div class="romaji">{{ char.romaji }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 手写练习 -->
      <div v-show="currentTab === 'writing'" class="writing-practice">
        <div class="writing-header">
          <h3>手写练习</h3>
          <div class="current-char">
            <span class="char-display">{{ currentWritingChar.hiragana }}</span>
            <span class="char-romaji">{{ currentWritingChar.romaji }}</span>
          </div>
        </div>
        <div class="writing-controls">
          <button class="btn-clear" @click="clearCanvas">
            <i class="ri-eraser-line"></i>
            清除
          </button>
          <button class="btn-random" @click="randomCharacter">
            <i class="ri-shuffle-line"></i>
            随机练习
          </button>
        </div>
        <!-- Add spacing between controls and canvas -->
        <div style="margin-top: 20px;"></div>
        <canvas 
          ref="canvas" 
          class="drawing-canvas"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart="handleTouch"
          @touchmove="handleTouch"
          @touchend="stopDrawing"
          
        ></canvas>

      </div>

      <!-- 发音练习 -->
      <div v-show="currentTab === 'pronunciation'" class="pronunciation-practice">
        <h3>发音练习</h3>
        
        <!-- 清音发音 -->
        <div class="sound-section">
          <h4>清音</h4>
          <div class="sound-grid">
            <div 
              v-for="char in seionChars" 
              :key="char.romaji"
              :class="['sound-card', { playing: playingChar === char.romaji }]"
              @click="playSound(char)"
            >
              <div class="card-content">
                <div class="character">{{ char.hiragana }}</div>
                <div class="romaji">{{ char.romaji }}</div>
              </div>
              <i class="ri-volume-up-line"></i>
            </div>
          </div>
        </div>

        <!-- 浊音发音 -->
        <div class="sound-section">
          <h4>浊音</h4>
          <div class="sound-grid">
            <div 
              v-for="char in dakuonChars" 
              :key="char.romaji"
              :class="['sound-card', { playing: playingChar === char.romaji }]"
              @click="playSound(char)"
            >
              <div class="card-content">
                <div class="character">{{ char.hiragana }}</div>
                <div class="romaji">{{ char.romaji }}</div>
              </div>
              <i class="ri-volume-up-line"></i>
            </div>
          </div>
        </div>

        <!-- 拗音发音 -->
        <div class="sound-section">
          <h4>拗音</h4>
          <div class="sound-grid">
            <div 
              v-for="char in youonChars" 
              :key="char.romaji"
              :class="['sound-card', { playing: playingChar === char.romaji }]"
              @click="playSound(char)"
            >
              <div class="card-content">
                <div class="character">{{ char.hiragana }}</div>
                <div class="romaji">{{ char.romaji }}</div>
              </div>
              <i class="ri-volume-up-line"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 五十音游戏 -->
      <div v-show="currentTab === 'game'" class="gojuon-game">
        <div class="game-header">
          <h2>五十音练习游戏</h2>
          <p>选择正确的读音！</p>
          
          <div class="game-stats">
            <div class="stat-item">
              <i class="ri-time-line"></i>
              <span>时间: {{ formatTime(gameTime) }}</span>
            </div>
            <div class="stat-item">
              <i class="ri-star-line"></i>
              <span>得分: {{ score }}</span>
            </div>
            <div class="stat-item">
              <i class="ri-heart-line"></i>
              <span>生命: {{ lives }}</span>
            </div>
          </div>
        </div>

        <div class="game-board" v-if="!gameOver">
          <div class="question-card">
            <div class="character">{{ currentGameQuestion?.character }}</div>
            <div class="type-label">{{ currentGameQuestion?.type === 'hiragana' ? '平假名' : '片假名' }}</div>
          </div>

          <div class="options-grid">
            <button 
              v-for="(option, index) in currentGameQuestion?.options" 
              :key="index"
              :class="['option-btn', {
                'correct': showAnswer && index === currentGameQuestion?.correctIndex,
                'incorrect': showAnswer && selectedAnswer === index && index !== currentGameQuestion?.correctIndex
              }]"
              @click="checkAnswer(index)"
              :disabled="showAnswer"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <div class="game-controls">
          <button 
            v-if="showAnswer && !gameOver" 
            class="btn-next" 
            @click="nextQuestion"
          >
            下一题
            <i class="ri-arrow-right-line"></i>
          </button>
          
          <button 
            v-if="gameOver" 
            class="btn-restart" 
            @click="startNewGame"
          >
            重新开始
            <i class="ri-refresh-line"></i>
          </button>
        </div>

        <!-- 游戏结束对话框 -->
        <div v-if="gameOver" class="game-over-modal">
          <div class="modal-content">
            <div class="result-icon">
              <i :class="isGameWon ? 'ri-trophy-line' : 'ri-emotion-sad-line'"></i>
            </div>
            <h3>{{ isGameWon ? '恭喜通关！' : '游戏结束！' }}</h3>
            <div class="final-stats">
              <div class="stat-row">
                <span>时间:</span>
                <span>{{ formatTime(gameTime) }}</span>
              </div>
              <div class="stat-row">
                <span>得分:</span>
                <span>{{ score }}</span>
              </div>
              <div class="stat-row">
                <span>正确率:</span>
                <span>{{ Math.round((score / (score + wrongAnswers)) * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const tabs = [
  { id: 'chart', name: '五十音表', icon: 'ri-grid-line' },
  { id: 'writing', name: '手写练习', icon: 'ri-pencil-line' },
  { id: 'pronunciation', name: '发音练习', icon: 'ri-volume-up-line' },
]
//   { id: 'game', name: '游戏', icon: 'ri-gamepad-line' }
const currentTab = ref('chart')
const currentType = ref('hiragana')
const canvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const isDrawing = ref(false)
const playingChar = ref('')
const currentWritingIndex = ref(0)

// 游戏相关状态
const gameTime = ref(0)
const score = ref(0)
const lives = ref(3)
const wrongAnswers = ref(0)
const currentGameQuestion = ref<any>(null)
const showAnswer = ref(false)
const selectedAnswer = ref(-1)
const gameOver = ref(false)
const isGameWon = ref(false)
const gameTimer = ref<number | null>(null)

// 清音
const seionChart = [
  {
    rowName: 'あ行',
    chars: [
      { hiragana: 'あ', katakana: 'ア', romaji: 'a' },
      { hiragana: 'い', katakana: 'イ', romaji: 'i' },
      { hiragana: 'う', katakana: 'ウ', romaji: 'u' },
      { hiragana: 'え', katakana: 'エ', romaji: 'e' },
      { hiragana: 'お', katakana: 'オ', romaji: 'o' }
    ]
  },
  {
    rowName: 'か行',
    chars: [
      { hiragana: 'か', katakana: 'カ', romaji: 'ka' },
      { hiragana: 'き', katakana: 'キ', romaji: 'ki' },
      { hiragana: 'く', katakana: 'ク', romaji: 'ku' },
      { hiragana: 'け', katakana: 'ケ', romaji: 'ke' },
      { hiragana: 'こ', katakana: 'コ', romaji: 'ko' }
    ]
  },
  {
    rowName: 'さ行',
    chars: [
      { hiragana: 'さ', katakana: 'サ', romaji: 'sa' },
      { hiragana: 'し', katakana: 'シ', romaji: 'shi' },
      { hiragana: 'す', katakana: 'ス', romaji: 'su' },
      { hiragana: 'せ', katakana: 'セ', romaji: 'se' },
      { hiragana: 'そ', katakana: 'ソ', romaji: 'so' }
    ]
  },
  {
    rowName: 'た行',
    chars: [
      { hiragana: 'た', katakana: 'タ', romaji: 'ta' },
      { hiragana: 'ち', katakana: 'チ', romaji: 'chi' },
      { hiragana: 'つ', katakana: 'ツ', romaji: 'tsu' },
      { hiragana: 'て', katakana: 'テ', romaji: 'te' },
      { hiragana: 'と', katakana: 'ト', romaji: 'to' }
    ]
  },
  {
    rowName: 'な行',
    chars: [
      { hiragana: 'な', katakana: 'ナ', romaji: 'na' },
      { hiragana: 'に', katakana: 'ニ', romaji: 'ni' },
      { hiragana: 'ぬ', katakana: 'ヌ', romaji: 'nu' },
      { hiragana: 'ね', katakana: 'ネ', romaji: 'ne' },
      { hiragana: 'の', katakana: 'ノ', romaji: 'no' }
    ]
  },
  {
    rowName: 'は行',
    chars: [
      { hiragana: 'は', katakana: 'ハ', romaji: 'ha' },
      { hiragana: 'ひ', katakana: 'ヒ', romaji: 'hi' },
      { hiragana: 'ふ', katakana: 'フ', romaji: 'fu' },
      { hiragana: 'へ', katakana: 'ヘ', romaji: 'he' },
      { hiragana: 'ほ', katakana: 'ホ', romaji: 'ho' }
    ]
  },
  {
    rowName: 'ま行',
    chars: [
      { hiragana: 'ま', katakana: 'マ', romaji: 'ma' },
      { hiragana: 'み', katakana: 'ミ', romaji: 'mi' },
      { hiragana: 'む', katakana: 'ム', romaji: 'mu' },
      { hiragana: 'め', katakana: 'メ', romaji: 'me' },
      { hiragana: 'も', katakana: 'モ', romaji: 'mo' }
    ]
  },
  {
    rowName: 'や行',
    chars: [
      { hiragana: 'や', katakana: 'ヤ', romaji: 'ya' },
      null,
      { hiragana: 'ゆ', katakana: 'ユ', romaji: 'yu' },
      null,
      { hiragana: 'よ', katakana: 'ヨ', romaji: 'yo' }
    ]
  },
  {
    rowName: 'ら行',
    chars: [
      { hiragana: 'ら', katakana: 'ラ', romaji: 'ra' },
      { hiragana: 'り', katakana: 'リ', romaji: 'ri' },
      { hiragana: 'る', katakana: 'ル', romaji: 'ru' },
      { hiragana: 'れ', katakana: 'レ', romaji: 're' },
      { hiragana: 'ろ', katakana: 'ロ', romaji: 'ro' }
    ]
  },
  {
    rowName: 'わ行',
    chars: [
      { hiragana: 'わ', katakana: 'ワ', romaji: 'wa' },
      null,
      null,
      null,
      { hiragana: 'を', katakana: 'ヲ', romaji: 'wo' }
    ]
  },
  {
    rowName: 'ん',
    chars: [
      { hiragana: 'ん', katakana: 'ン', romaji: 'n' },
      null,
      null,
      null,
      null
    ]
  }
]

// 浊音
const dakuonChart = [
  {
    rowName: 'が行',
    chars: [
      { hiragana: 'が', katakana: 'ガ', romaji: 'ga' },
      { hiragana: 'ぎ', katakana: 'ギ', romaji: 'gi' },
      { hiragana: 'ぐ', katakana: 'グ', romaji: 'gu' },
      { hiragana: 'げ', katakana: 'ゲ', romaji: 'ge' },
      { hiragana: 'ご', katakana: 'ゴ', romaji: 'go' }
    ]
  },
  {
    rowName: 'ざ行',
    chars: [
      { hiragana: 'ざ', katakana: 'ザ', romaji: 'za' },
      { hiragana: 'じ', katakana: 'ジ', romaji: 'ji' },
      { hiragana: 'ず', katakana: 'ズ', romaji: 'zu' },
      { hiragana: 'ぜ', katakana: 'ゼ', romaji: 'ze' },
      { hiragana: 'ぞ', katakana: 'ゾ', romaji: 'zo' }
    ]
  },
  {
    rowName: 'だ行',
    chars: [
      { hiragana: 'だ', katakana: 'ダ', romaji: 'da' },
      { hiragana: 'ぢ', katakana: 'ヂ', romaji: 'di' },
      { hiragana: 'づ', katakana: 'ヅ', romaji: 'du' },
      { hiragana: 'で', katakana: 'デ', romaji: 'de' },
      { hiragana: 'ど', katakana: 'ド', romaji: 'do' }
    ]
  },
  {
    rowName: 'ば行',
    chars: [
      { hiragana: 'ば', katakana: 'バ', romaji: 'ba' },
      { hiragana: 'び', katakana: 'ビ', romaji: 'bi' },
      { hiragana: 'ぶ', katakana: 'ブ', romaji: 'bu' },
      { hiragana: 'べ', katakana: 'ベ', romaji: 'be' },
      { hiragana: 'ぼ', katakana: 'ボ', romaji: 'bo' }
    ]
  }
]

// 半浊音
const handakuonChart = [
  {
    rowName: 'ぱ行',
    chars: [
      { hiragana: 'ぱ', katakana: 'パ', romaji: 'pa' },
      { hiragana: 'ぴ', katakana: 'ピ', romaji: 'pi' },
      { hiragana: 'ぷ', katakana: 'プ', romaji: 'pu' },
      { hiragana: 'ぺ', katakana: 'ペ', romaji: 'pe' },
      { hiragana: 'ぽ', katakana: 'ポ', romaji: 'po' }
    ]
  }
]

// 拗音
const youonChart = [
  [
    { hiragana: 'きゃ', katakana: 'キャ', romaji: 'kya' },
    { hiragana: 'きゅ', katakana: 'キュ', romaji: 'kyu' },
    { hiragana: 'きょ', katakana: 'キョ', romaji: 'kyo' }
  ],
  [
    { hiragana: 'しゃ', katakana: 'シャ', romaji: 'sha' },
    { hiragana: 'しゅ', katakana: 'シュ', romaji: 'shu' },
    { hiragana: 'しょ', katakana: 'ショ', romaji: 'sho' }
  ],
  [
    { hiragana: 'ちゃ', katakana: 'チャ', romaji: 'cha' },
    { hiragana: 'ちゅ', katakana: 'チュ', romaji: 'chu' },
    { hiragana: 'ちょ', katakana: 'チョ', romaji: 'cho' }
  ],
  [
    { hiragana: 'にゃ', katakana: 'ニャ', romaji: 'nya' },
    { hiragana: 'にゅ', katakana: 'ニュ', romaji: 'nyu' },
    { hiragana: 'にょ', katakana: 'ニョ', romaji: 'nyo' }
  ],
  [
    { hiragana: 'ひゃ', katakana: 'ヒャ', romaji: 'hya' },
    { hiragana: 'ひゅ', katakana: 'ヒュ', romaji: 'hyu' },
    { hiragana: 'ひょ', katakana: 'ヒョ', romaji: 'hyo' }
  ],
  [
    { hiragana: 'みゃ', katakana: 'ミャ', romaji: 'mya' },
    { hiragana: 'みゅ', katakana: 'ミュ', romaji: 'myu' },
    { hiragana: 'みょ', katakana: 'ミョ', romaji: 'myo' }
  ],
  [
    { hiragana: 'りゃ', katakana: 'リャ', romaji: 'rya' },
    { hiragana: 'りゅ', katakana: 'リュ', romaji: 'ryu' },
    { hiragana: 'りょ', katakana: 'リョ', romaji: 'ryo' }
  ]
]

const youonDakuonChart = [
  [
    { hiragana: 'ぎゃ', katakana: 'ギャ', romaji: 'gya' },
    { hiragana: 'ぎゅ', katakana: 'ギュ', romaji: 'gyu' },
    { hiragana: 'ぎょ', katakana: 'ギョ', romaji: 'gyo' }
  ],
  [
    { hiragana: 'じゃ', katakana: 'ジャ', romaji: 'ja' },
    { hiragana: 'じゅ', katakana: 'ジュ', romaji: 'ju' },
    { hiragana: 'じょ', katakana: 'ジョ', romaji: 'jo' }
  ],
  [
    { hiragana: 'びゃ', katakana: 'ビャ', romaji: 'bya' },
    { hiragana: 'びゅ', katakana: 'ビュ', romaji: 'byu' },
    { hiragana: 'びょ', katakana: 'ビョ', romaji: 'byo' }
  ]
]

const youonHandakuonChart = [
  [
    { hiragana: 'ぴゃ', katakana: 'ピャ', romaji: 'pya' },
    { hiragana: 'ぴゅ', katakana: 'ピュ', romaji: 'pyu' },
    { hiragana: 'ぴょ', katakana: 'ピョ', romaji: 'pyo' }
  ]
]

// 所有字符的计算属性
const allChars = computed(() => {
  const chars: any[] = []
  
  // 添加清音
  seionChart.forEach(row => {
    row.chars.forEach(char => {
      if (char) chars.push(char)
    })
  })
  
  // 添加浊音
  dakuonChart.forEach(row => {
    row.chars.forEach(char => {
      if (char) chars.push(char)
    })
  })
  
  // 添加半浊音
  handakuonChart.forEach(row => {
    row.chars.forEach(char => {
      if (char) chars.push(char)
    })
  })
  
  // 添加拗音
  youonChart.forEach(row => {
    row.forEach(char => chars.push(char))
  })
  youonDakuonChart.forEach(row => {
    row.forEach(char => chars.push(char))
  })
  youonHandakuonChart.forEach(row => {
    row.forEach(char => chars.push(char))
  })
  
  return chars
})

// 分类字符
const seionChars = computed(() => {
  const chars: any[] = []
  seionChart.forEach(row => {
    row.chars.forEach(char => {
      if (char) chars.push(char)
    })
  })
  return chars
})

const dakuonChars = computed(() => {
  const chars: any[] = []
  dakuonChart.forEach(row => {
    row.chars.forEach(char => {
      if (char) chars.push(char)
    })
  })
  handakuonChart.forEach(row => {
    row.chars.forEach(char => {
      if (char) chars.push(char)
    })
  })
  return chars
})

const youonChars = computed(() => {
  const chars: any[] = []
  youonChart.forEach(row => {
    row.forEach(char => chars.push(char))
  })
  youonDakuonChart.forEach(row => {
    row.forEach(char => chars.push(char))
  })
  youonHandakuonChart.forEach(row => {
    row.forEach(char => chars.push(char))
  })
  return chars
})

const currentWritingChar = computed(() => {
  return allChars.value[currentWritingIndex.value] || { hiragana: 'あ', katakana: 'ア', romaji: 'a' }
})

const playSound = (char: any) => {
  if (!char) return
  
  playingChar.value = char.romaji
  
  // 使用Web Speech API播放发音
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(char.hiragana)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.8
    utterance.pitch = 1.2  // 提高音调，让声音更温柔
    utterance.volume = 1.0 // 设置音量
    
    // 尝试选择日语女性语音
    const voices = window.speechSynthesis.getVoices()
    const japaneseVoice = voices.find(voice => 
      voice.lang === 'ja-JP' && 
      voice.name.toLowerCase().includes('female')
    )
    
    if (japaneseVoice) {
      utterance.voice = japaneseVoice
    } else {
      console.log('未找到日语女性语音，使用默认语音')
    }
    
    utterance.onend = () => {
      playingChar.value = ''
    }
    
    speechSynthesis.speak(utterance)
  } else {
    // 如果不支持语音合成，显示视觉反馈
    setTimeout(() => {
      playingChar.value = ''
    }, 500)
  }
}

// Canvas drawing functions
const startDrawing = (event: MouseEvent) => {
  isDrawing.value = true
  const rect = canvas.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  ctx.value!.beginPath()
  ctx.value!.moveTo(x, y)
}

const draw = (event: MouseEvent) => {
  if (!isDrawing.value) return
  const rect = canvas.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  ctx.value!.lineTo(x, y)
  ctx.value!.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const handleTouch = (event: TouchEvent) => {
  event.preventDefault()
  const touch = event.touches[0]
  const mouseEvent = new MouseEvent(event.type === 'touchstart' ? 'mousedown' : 'mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  event.type === 'touchstart' ? startDrawing(mouseEvent) : draw(mouseEvent)
}

const clearCanvas = () => {
  if (ctx.value && canvas.value) {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  }
}

const randomCharacter = () => {
  currentWritingIndex.value = Math.floor(Math.random() * allChars.value.length)
  clearCanvas()
}

// 游戏相关函数
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const generateGameQuestion = () => {
  // 随机选择字符类型
  const charTypes = ['seion', 'dakuon', 'youon']
  const selectedType = charTypes[Math.floor(Math.random() * charTypes.length)]
  
  let sourceChars: any[] = []
  switch (selectedType) {
    case 'seion':
      sourceChars = seionChars.value
      break
    case 'dakuon':
      sourceChars = dakuonChars.value
      break
    case 'youon':
      sourceChars = youonChars.value
      break
  }
  
  // 随机选择正确答案
  const correctChar = sourceChars[Math.floor(Math.random() * sourceChars.length)]
  
  // 生成选项（从同类型中选择）
  const options = [correctChar.romaji]
  while (options.length < 4) {
    const randomChar = sourceChars[Math.floor(Math.random() * sourceChars.length)]
    if (!options.includes(randomChar.romaji)) {
      options.push(randomChar.romaji)
    }
  }
  
  // 打乱选项顺序
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]
  }
  
  return {
    character: correctChar.hiragana,
    type: 'hiragana',
    options: options,
    correctIndex: options.indexOf(correctChar.romaji)
  }
}

const startNewGame = () => {
  gameTime.value = 0
  score.value = 0
  lives.value = 3
  wrongAnswers.value = 0
  showAnswer.value = false
  selectedAnswer.value = -1
  gameOver.value = false
  isGameWon.value = false
  
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
  }
  
  gameTimer.value = window.setInterval(() => {
    gameTime.value++
  }, 1000)

  nextQuestion()
}

const checkAnswer = (index: number) => {
  selectedAnswer.value = index
  showAnswer.value = true

  if (index === currentGameQuestion.value?.correctIndex) {
    score.value += 100
  } else {
    wrongAnswers.value++
    lives.value--
    if (lives.value <= 0) {
      endGame(false)
    }
  }
}

const nextQuestion = () => {
  if (score.value >= 1000) { // 达到1000分获胜
    endGame(true)
    return
  }
  
  showAnswer.value = false
  selectedAnswer.value = -1
  currentGameQuestion.value = generateGameQuestion()
}

const endGame = (won: boolean) => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
  }
  isGameWon.value = won
  gameOver.value = true
}

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = 400
    canvas.value.height = 400
    ctx.value = canvas.value.getContext('2d')
    if (ctx.value) {
      ctx.value.strokeStyle = '#4A90E2'
      ctx.value.lineWidth = 4
      ctx.value.lineCap = 'round'
      ctx.value.lineJoin = 'round'
    }
  }
  
  // 初始化随机字符
  randomCharacter()
  
  // 初始化游戏
  startNewGame()
})

onUnmounted(() => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
  }
})
</script>

<style lang="scss" scoped>
.gojuon-page {
  padding-bottom: var(--spacing-xxl);
}

.page-header {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xl);

  h1 {
    font-size: 2rem;
    margin-bottom: var(--spacing-sm);
  }

  p {
    opacity: 0.9;
    font-size: 1.1rem;
  }
}

.gojuon-tabs {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius);
  background: white;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);

  i {
    font-size: 1.2rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
  }
}

.chart-controls {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.type-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}

.chart-section {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-sm);

  h3 {
    text-align: center;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
    font-size: 1.3rem;
  }

  h4 {
    text-align: center;
    margin-bottom: var(--spacing-md);
    color: var(--secondary-color);
    font-size: 1.1rem;
  }
}

.chart-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 100%;
  overflow-x: auto;
}

.chart-header {
  display: flex;
  gap: 2px;
}

.chart-row {
  display: flex;
  gap: 2px;
}

.chart-cell {
  min-width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--background-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;

  &.header {
    background-color: var(--primary-color);
    color: white;
    font-weight: 600;
    cursor: default;
  }

  &.row-header {
    background-color: var(--secondary-color);
    color: white;
    font-weight: 600;
    cursor: default;
    writing-mode: vertical-rl;
    text-orientation: upright;
  }

  &:not(.header):not(.row-header):not(.empty):hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    background-color: white;
  }

  &.playing {
    background-color: var(--accent-color);
    color: white;
    transform: scale(1.1);
    box-shadow: var(--shadow-lg);
  }

  &.empty {
    background-color: transparent;
    cursor: default;
  }

  .character {
    font-size: 1.8rem;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .romaji {
    font-size: 0.8rem;
    color: var(--text-light);
    opacity: 0.8;
  }

  &.playing .romaji {
    color: white;
    opacity: 1;
  }
}

.youon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.youon-section {
  h4 {
    text-align: center;
    margin-bottom: var(--spacing-md);
    color: var(--secondary-color);
  }
}

.youon-row {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  justify-content: center;
}

.youon-cell {
  min-width: 70px;
  height: 70px;
}

.writing-practice {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.writing-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);

  h3 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
  }

  .current-char {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);

    .char-display {
      font-size: 3rem;
      color: var(--primary-color);
    }

    .char-romaji {
      font-size: 1.2rem;
      color: var(--text-light);
    }
  }
}

.drawing-canvas {
  width: 100%;
  max-width: 400px;
  height: 400px;
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin: 0 auto var(--spacing-md);
  display: block;
  touch-action: none;
  border: 2px dashed var(--border-color);
}

.writing-controls {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: var(--border-radius);
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-weight: 500;

    i {
      font-size: 1.2rem;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-clear {
    background-color: var(--background-color);
    color: var(--text-color);

    &:hover:not(:disabled) {
      background-color: var(--border-color);
    }
  }

  .btn-random {
    background-color: var(--primary-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--primary-dark);
    }
  }
}

.pronunciation-practice {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);

  h3 {
    text-align: center;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
  }
}

.sound-section {
  margin-bottom: var(--spacing-xl);

  h4 {
    color: var(--secondary-color);
    margin-bottom: var(--spacing-md);
    font-size: 1.2rem;
  }
}

.sound-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--spacing-md);
}

.sound-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    background-color: white;
  }

  &.playing {
    background-color: var(--accent-color);
    color: white;
    transform: scale(1.05);
  }

  .card-content {
    flex: 1;
    text-align: center;

    .character {
      font-size: 1.5rem;
      margin-bottom: 2px;
    }

    .romaji {
      font-size: 0.8rem;
      color: var(--text-light);
    }
  }

  &.playing .card-content .romaji {
    color: white;
  }

  i {
    color: var(--primary-color);
    font-size: 1.2rem;
  }

  &.playing i {
    color: white;
  }
}

.gojuon-game {
  max-width: 600px;
  margin: 0 auto;
}

.game-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  h2 {
    font-size: 1.8rem;
    margin-bottom: var(--spacing-sm);
    color: var(--primary-color);
  }

  p {
    color: var(--text-light);
    margin-bottom: var(--spacing-lg);
  }
}

.game-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 1.1rem;

    i {
      color: var(--primary-color);
    }
  }
}

.game-board {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
}

.question-card {
  text-align: center;
  margin-bottom: var(--spacing-xl);

  .character {
    font-size: 4rem;
    margin-bottom: var(--spacing-sm);
  }

  .type-label {
    color: var(--text-light);
  }
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.option-btn {
  padding: var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.correct {
    background-color: rgba(46, 204, 113, 0.1);
    border-color: var(--success-color);
    color: var(--success-color);
  }

  &.incorrect {
    background-color: rgba(231, 76, 60, 0.1);
    border-color: var(--error-color);
    color: var(--error-color);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.game-controls {
  text-align: center;
}

.btn-next,
.btn-restart {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--primary-dark);
  }

  i {
    font-size: 1.2rem;
  }
}

.game-over-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal-content {
    background-color: white;
    padding: var(--spacing-xl);
    border-radius: var(--border-radius);
    text-align: center;
    max-width: 400px;
    width: 90%;

    .result-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
      
      i {
        color: var(--primary-color);
      }
    }

    h3 {
      font-size: 1.5rem;
      margin-bottom: var(--spacing-lg);
    }
  }

  .final-stats {
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);

      &:last-child {
        border-bottom: none;
      }
    }
  }
}

@media (max-width: 768px) {
  .chart-cell {
    min-width: 60px;
    height: 60px;

    .character {
      font-size: 1.4rem;
    }

    .romaji {
      font-size: 0.7rem;
    }
  }

  .youon-cell {
    min-width: 60px;
    height: 60px;
  }

  .drawing-canvas {
    width: 100%;
    height: 300px;
  }

  .sound-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>