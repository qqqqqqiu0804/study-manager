import { useState, useEffect, useRef } from 'react'

const POMODORO_TIME = 25 * 60 // 25分钟
const SHORT_BREAK = 5 * 60    // 5分钟
const LONG_BREAK = 15 * 60    // 15分钟

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('work') // work, shortBreak, longBreak
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    workTime: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreak: true
  })
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // 从localStorage加载设置和统计
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro_settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    const today = new Date().toISOString().split('T')[0]
    const savedStats = localStorage.getItem('pomodoro_stats')
    if (savedStats) {
      const stats = JSON.parse(savedStats)
      if (stats.date === today) {
        setCompletedPomodoros(stats.count)
      }
    }
  }, [])

  // 保存设置
  useEffect(() => {
    localStorage.setItem('pomodoro_settings', JSON.stringify(settings))
  }, [settings])

  // 计时器逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const handleTimerComplete = () => {
    setIsRunning(false)

    // 播放提示音
    playNotificationSound()

    // 发送浏览器通知
    sendNotification()

    if (mode === 'work') {
      const newCount = completedPomodoros + 1
      setCompletedPomodoros(newCount)

      // 保存统计数据
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('pomodoro_stats', JSON.stringify({
        date: today,
        count: newCount
      }))

      // 自动开始休息
      if (settings.autoStartBreak) {
        if (newCount % 4 === 0) {
          setMode('longBreak')
          setTimeLeft(settings.longBreak * 60)
        } else {
          setMode('shortBreak')
          setTimeLeft(settings.shortBreak * 60)
        }
        setIsRunning(true)
      }
    } else {
      // 休息结束，开始工作
      setMode('work')
      setTimeLeft(settings.workTime * 60)
    }
  }

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.log('Audio notification not supported')
    }
  }

  const sendNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = mode === 'work'
        ? '🍅 番茄时间结束！休息一下吧~'
        : '⏰ 休息结束！继续加油！'

      new Notification('番茄钟', {
        body: message,
        icon: '🍅'
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  const toggleTimer = async () => {
    if (!isRunning) {
      // 请求通知权限
      if (Notification.permission === 'default') {
        await requestNotificationPermission()
      }
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    if (mode === 'work') {
      setTimeLeft(settings.workTime * 60)
    } else if (mode === 'shortBreak') {
      setTimeLeft(settings.shortBreak * 60)
    } else {
      setTimeLeft(settings.longBreak * 60)
    }
  }

  const switchMode = (newMode) => {
    setIsRunning(false)
    setMode(newMode)
    if (newMode === 'work') {
      setTimeLeft(settings.workTime * 60)
    } else if (newMode === 'shortBreak') {
      setTimeLeft(settings.shortBreak * 60)
    } else {
      setTimeLeft(settings.longBreak * 60)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getModeLabel = () => {
    switch (mode) {
      case 'work': return '🍅 专注时间'
      case 'shortBreak': return '☕ 短休息'
      case 'longBreak': return '🌴 长休息'
      default: return ''
    }
  }

  const getProgress = () => {
    const totalTime = mode === 'work'
      ? settings.workTime * 60
      : mode === 'shortBreak'
        ? settings.shortBreak * 60
        : settings.longBreak * 60
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  return (
    <div className="pomodoro-widget">
      <div className="pomodoro-header">
        <span className="pomodoro-title">{getModeLabel()}</span>
        <button
          className="pomodoro-settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="pomodoro-settings">
          <div className="setting-item">
            <label>专注时间（分钟）</label>
            <input
              type="number"
              value={settings.workTime}
              onChange={(e) => setSettings({ ...settings, workTime: parseInt(e.target.value) || 25 })}
              min="1"
              max="60"
            />
          </div>
          <div className="setting-item">
            <label>短休息（分钟）</label>
            <input
              type="number"
              value={settings.shortBreak}
              onChange={(e) => setSettings({ ...settings, shortBreak: parseInt(e.target.value) || 5 })}
              min="1"
              max="30"
            />
          </div>
          <div className="setting-item">
            <label>长休息（分钟）</label>
            <input
              type="number"
              value={settings.longBreak}
              onChange={(e) => setSettings({ ...settings, longBreak: parseInt(e.target.value) || 15 })}
              min="1"
              max="60"
            />
          </div>
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.autoStartBreak}
                onChange={(e) => setSettings({ ...settings, autoStartBreak: e.target.checked })}
              />
              自动开始休息
            </label>
          </div>
        </div>
      )}

      <div className="pomodoro-timer">
        <div className="timer-circle">
          <svg viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={mode === 'work' ? '#3b82f6' : '#10b981'}
              strokeWidth="6"
              strokeDasharray={`${getProgress() * 2.83} 283`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="timer-text">{formatTime(timeLeft)}</div>
        </div>
      </div>

      <div className="pomodoro-controls">
        <button className="btn btn-primary" onClick={toggleTimer}>
          {isRunning ? '⏸️ 暂停' : '▶️ 开始'}
        </button>
        <button className="btn" onClick={resetTimer}>
          🔄 重置
        </button>
      </div>

      <div className="pomodoro-modes">
        <button
          className={`mode-btn ${mode === 'work' ? 'active' : ''}`}
          onClick={() => switchMode('work')}
        >
          专注
        </button>
        <button
          className={`mode-btn ${mode === 'shortBreak' ? 'active' : ''}`}
          onClick={() => switchMode('shortBreak')}
        >
          短休
        </button>
        <button
          className={`mode-btn ${mode === 'longBreak' ? 'active' : ''}`}
          onClick={() => switchMode('longBreak')}
        >
          长休
        </button>
      </div>

      <div className="pomodoro-stats">
        <span>🍅 今日完成：{completedPomodoros} 个番茄</span>
      </div>
    </div>
  )
}

export default PomodoroTimer
