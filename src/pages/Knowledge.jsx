import { useState, useMemo } from 'react'
import mammoth from 'mammoth'
import useStore from '../store/useStore'
import KnowledgeCard from '../components/KnowledgeCard'

const detectCategory = (text) => {
  const keyWords = ['重点', '核心', '关键', '高频']
  const hardWords = ['难点', '易错', '注意', '陷阱']
  const errorWords = ['错误', '坑', '容易错']

  if (keyWords.some(w => text.includes(w))) return 'key'
  if (hardWords.some(w => text.includes(w))) return 'hard'
  if (errorWords.some(w => text.includes(w))) return 'error'
  return 'key'
}

const parseKnowledgeText = (text) => {
  const lines = text.split('\n')
  const results = []
  let currentTitle = ''
  let currentContent = []
  let currentCategory = 'key'
  let currentLevel = 0

  const saveCurrent = () => {
    if (currentTitle && currentContent.length > 0) {
      const content = currentContent.join('\n').trim()
      if (content) {
        results.push({
          title: currentTitle,
          content: content,
          category: currentCategory,
          level: currentLevel,
          selected: true
        })
      }
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      currentContent.push('')
      continue
    }

    // 检测一级标题：第一部分、第二部分...
    if (/^第[一二三四五六七八九十百千]+部分/.test(trimmed)) {
      saveCurrent()
      currentTitle = trimmed
      currentContent = []
      currentCategory = 'key'
      currentLevel = 1
      continue
    }

    // 检测二级标题：一、二、三、...
    if (/^[一二三四五六七八九十]+、/.test(trimmed)) {
      saveCurrent()
      currentTitle = trimmed
      currentContent = []
      currentCategory = detectCategory(trimmed)
      currentLevel = 2
      continue
    }

    // 检测三级标题：1. 2. 3. ... 或 标题：
    if (/^\d+\.\s/.test(trimmed) || /^.{2,8}：$/.test(trimmed)) {
      // 如果当前已有标题且内容不为空，保存当前
      if (currentTitle && currentContent.length > 0) {
        saveCurrent()
        currentTitle = trimmed
        currentContent = []
        currentCategory = detectCategory(trimmed)
        currentLevel = 3
        continue
      }
    }

    // 普通内容
    currentContent.push(trimmed)
  }

  // 保存最后一个知识点
  saveCurrent()

  return results
}

const Knowledge = () => {
  const { subjects, knowledge, addKnowledge } = useStore()
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showSmartImport, setShowSmartImport] = useState(false)
  const [importSubjectId, setImportSubjectId] = useState('')
  const [importText, setImportText] = useState('')
  const [parsedItems, setParsedItems] = useState([])
  const [importStatus, setImportStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const fileName = file.name.toLowerCase()
    setIsLoading(true)
    setImportStatus({ type: 'info', message: `正在读取 ${file.name}...` })

    try {
      let text = ''

      if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        // 读取纯文本和Markdown文件
        text = await file.text()
      } else if (fileName.endsWith('.docx')) {
        // 读取Word文档
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value
      } else {
        setImportStatus({ type: 'error', message: '不支持的文件格式，请使用 .txt、.md 或 .docx 文件' })
        setIsLoading(false)
        return
      }

      if (!text.trim()) {
        setImportStatus({ type: 'error', message: '文件内容为空' })
        setIsLoading(false)
        return
      }

      setImportText(text)
      setImportStatus({ type: 'success', message: `已读取 ${file.name}，共 ${text.length} 字` })
    } catch (error) {
      console.error('File import error:', error)
      setImportStatus({ type: 'error', message: '文件读取失败，请重试' })
    }

    setIsLoading(false)
    // 清除input的值，允许重复选择同一文件
    e.target.value = ''
  }

  const filteredKnowledge = useMemo(() => {
    let filtered = [...knowledge]

    if (filterSubject !== 'all') {
      filtered = filtered.filter(k => k.subjectId === filterSubject)
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(k => k.category === filterCategory)
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [knowledge, filterSubject, filterCategory])

  const handleParse = () => {
    if (!importSubjectId) {
      setImportStatus({ type: 'error', message: '请先选择科目' })
      return
    }
    if (!importText.trim()) {
      setImportStatus({ type: 'error', message: '请粘贴内容' })
      return
    }
    if (importText.length > 10000) {
      setImportStatus({ type: 'error', message: '内容过长，建议分批导入（每批不超过10000字）' })
      return
    }

    const parsed = parseKnowledgeText(importText)
    if (parsed.length === 0) {
      setImportStatus({ type: 'error', message: '未识别到知识点结构，请检查格式' })
      return
    }

    setParsedItems(parsed)
    setImportStatus(null)
  }

  const handleToggleItem = (index) => {
    setParsedItems(prev => prev.map((item, i) =>
      i === index ? { ...item, selected: !item.selected } : item
    ))
  }

  const handleImport = () => {
    const selectedItems = parsedItems.filter(item => item.selected)
    if (selectedItems.length === 0) {
      setImportStatus({ type: 'error', message: '请至少选择一个知识点' })
      return
    }

    selectedItems.forEach(item => {
      addKnowledge({
        subjectId: importSubjectId,
        title: item.title,
        content: item.content,
        category: item.category
      })
    })

    setImportStatus({ type: 'success', message: `成功导入 ${selectedItems.length} 个知识点` })
    setImportText('')
    setParsedItems([])

    // 3秒后关闭面板
    setTimeout(() => {
      setShowSmartImport(false)
      setImportStatus(null)
    }, 2000)
  }

  const getCategoryLabel = (category) => {
    const labels = { key: '重点', hard: '难点', error: '易错' }
    return labels[category] || category
  }

  return (
    <div className="knowledge-page">
      <div className="page-header">
        <h1>📝 知识点库</h1>
        <button className="btn btn-primary" onClick={() => setShowSmartImport(true)}>
          📥 智能导入
        </button>
      </div>

      {showSmartImport && (
        <div className="card smart-import-card">
          <h3>📥 智能导入知识点</h3>
          <p className="smart-import-desc">
            支持两种方式导入：
            <br />1. 上传文件：支持 .txt、.md、.docx 格式
            <br />2. 粘贴文字：直接粘贴复习资料
          </p>

          <div className="form-group">
            <label>选择科目</label>
            <select
              value={importSubjectId}
              onChange={(e) => setImportSubjectId(e.target.value)}
              className="input"
            >
              <option value="">请选择科目</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>上传文件</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept=".txt,.md,.docx"
                onChange={handleFileImport}
                className="file-input"
                id="file-import"
              />
              <label htmlFor="file-import" className="file-upload-label">
                📄 选择文件（.txt、.md、.docx）
              </label>
              {isLoading && <span className="loading-text">读取中...</span>}
            </div>
          </div>

          <div className="form-group">
            <label>或 粘贴文字</label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="input smart-textarea"
              placeholder="粘贴复习资料，例如：&#10;第一部分：语法基础&#10;一、Java语言概述&#10;• 1995年 Sun公司发布Java&#10;• 面向对象、跨平台..."
              rows="10"
            />
          </div>

          {importStatus && (
            <div className={`import-status ${importStatus.type}`}>
              {importStatus.message}
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleParse}>
              🔍 解析预览
            </button>
            <button className="btn" onClick={() => {
              setShowSmartImport(false)
              setImportText('')
              setParsedItems([])
              setImportStatus(null)
            }}>
              取消
            </button>
          </div>

          {parsedItems.length > 0 && (
            <div className="parsed-preview">
              <h4>预览（点击可取消勾选）</h4>
              <div className="parsed-list">
                {parsedItems.map((item, index) => (
                  <div
                    key={index}
                    className={`parsed-item ${!item.selected ? 'disabled' : ''}`}
                    onClick={() => handleToggleItem(index)}
                  >
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleItem(index)}
                      className="parsed-checkbox"
                    />
                    <div className="parsed-content">
                      <span className="parsed-title">{item.title}</span>
                      <span className={`parsed-category category-${item.category}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleImport}>
                  ✅ 导入 {parsedItems.filter(i => i.selected).length} 个知识点
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="filters">
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="input"
        >
          <option value="all">所有科目</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input"
        >
          <option value="all">所有分类</option>
          <option value="key">重点</option>
          <option value="hard">难点</option>
          <option value="error">易错点</option>
        </select>
      </div>

      <div className="knowledge-grid">
        {filteredKnowledge.length > 0 ? (
          filteredKnowledge.map(k => <KnowledgeCard key={k.id} knowledge={k} />)
        ) : (
          <p className="empty-message">暂无知识点，点击上方「📥 智能导入」快速添加！</p>
        )}
      </div>
    </div>
  )
}

export default Knowledge
