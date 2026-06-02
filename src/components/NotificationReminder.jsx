import { useEffect } from 'react'
import useStore from '../store/useStore'

const NotificationReminder = () => {
  const { tasks, subjects } = useStore()

  useEffect(() => {
    // 请求通知权限
    const requestPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }
    }

    requestPermission()

    // 检查并发送提醒
    const checkAndNotify = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return
      }

      const today = new Date().toISOString().split('T')[0]
      const todayTasks = tasks.filter(t => t.date === today && !t.completed)

      if (todayTasks.length > 0) {
        // 检查是否已经提醒过
        const lastReminder = localStorage.getItem('last_reminder_date')
        if (lastReminder === today) {
          return
        }

        // 发送提醒
        const taskList = todayTasks.slice(0, 3).map(t => {
          const subject = subjects.find(s => s.id === t.subjectId)
          return `${subject ? subject.name : ''}: ${t.title}`
        }).join('\n')

        const moreText = todayTasks.length > 3 ? `\n...还有 ${todayTasks.length - 3} 个任务` : ''

        new Notification('📚 今日复习提醒', {
          body: `你有 ${todayTasks.length} 个任务待完成：\n${taskList}${moreText}`,
          icon: '📚',
          tag: 'daily-reminder'
        })

        localStorage.setItem('last_reminder_date', today)
      }
    }

    // 页面加载时检查
    checkAndNotify()

    // 每小时检查一次
    const interval = setInterval(checkAndNotify, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [tasks, subjects])

  return null // 这是一个无UI的组件
}

export default NotificationReminder
