// 应用状态管理
class QuizApp {
    constructor() {
        // 当前状态
        this.currentStage = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.startTime = null;
        
        // DOM元素缓存
        this.elements = {
            homePage: document.getElementById('homePage'),
            quizPage: document.getElementById('quizPage'),
            resultPage: document.getElementById('resultPage'),
            stageTitle: document.getElementById('currentStage'),
            questionNumber: document.getElementById('questionProgress'),
            totalQuestions: document.getElementById('questionProgress'),
            accuracy: document.getElementById('accuracy'),
            progressFill: document.getElementById('progressFill'),
            questionType: document.getElementById('questionType'),
            questionTitle: document.getElementById('questionTitle'),
            questionTags: document.getElementById('questionTags'),
            optionsContainer: document.getElementById('optionsContainer'),
            explanationContainer: document.getElementById('explanationContainer'),
            nextContainer: document.getElementById('nextContainer'),
            nextBtn: document.getElementById('next-btn')
        };
        
        // 绑定事件
        this.bindEvents();
    }
    
    // 绑定事件监听器
    bindEvents() {
        // 阶段选择按钮
        document.querySelectorAll('.start-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const stageNum = parseInt(e.target.getAttribute('data-stage'));
                const stageId = `stage${stageNum}`;
                await this.startQuiz(stageId);
            });
        });
        
        // 返回首页按钮
        const backHomeBtn = document.getElementById('back-home');
        if (backHomeBtn) {
            backHomeBtn.addEventListener('click', () => {
                this.showPage('home');
            });
        }
        
        // 下一题按钮
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => {
                this.nextQuestion();
            });
        }

        // 结果页面按钮
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartQuiz();
            });
        }

        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                this.showPage('home');
            });
        }
    }
    
    // 页面切换
    showPage(pageId) {
        // 页面ID映射表，将简短名称映射到实际的DOM元素ID
        const pageMap = {
            'home': 'homePage',
            'quiz': 'quizPage', 
            'result': 'resultPage'
        };
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // 获取实际的页面ID
        const actualPageId = pageMap[pageId] || pageId;
        const targetPage = document.getElementById(actualPageId);
        
        if (targetPage) {
            targetPage.classList.add('active');
        } else {
            console.error(`页面元素未找到: ${actualPageId}`);
        }
    }
    
    // 开始答题
    async startQuiz(stageId) {
        // 确保题库已加载
        if (!window.STAGE_QUESTIONS || Object.keys(window.STAGE_QUESTIONS).length === 0) {
            console.log('正在加载题库...');
            try {
                await window.loadQuestions();
            } catch (error) {
                console.error('题库加载失败:', error);
                return;
            }
        }
        
        // 重置答题状态
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.answers = [];
        this.currentStage = stageId;
        this.startTime = Date.now();
        
        // 获取当前阶段的题目并随机选择
        const allQuestions = window.getStageQuestions(stageId);
        const limit = Math.min(50, allQuestions.length);
        this.questions = getRandomItems(allQuestions, limit);
        
        // 更新阶段信息
        const stageInfo = this.getStageInfo(stageId);
        if (stageInfo && stageInfo.title) {
            this.elements.stageTitle.textContent = stageInfo.title;
        } else {
            console.error('无法获取阶段信息:', stageId);
            this.elements.stageTitle.textContent = '未知阶段';
        }
        
        // 更新题目进度显示
        this.updateProgress();
        
        this.showPage('quiz');
        this.renderQuestion();
    }
    
    // 获取阶段信息
    getStageInfo(stageId) {
        const stages = {
            'stage1': {
                title: '阶段一：基础入门',
                questions: window.getStageQuestions ? window.getStageQuestions('stage1') : []
            },
            'stage2': {
                title: '阶段二：进阶入门',
                questions: window.getStageQuestions ? window.getStageQuestions('stage2') : []
            },
            'stage3': {
                title: '阶段三：高阶精进',
                questions: window.getStageQuestions ? window.getStageQuestions('stage3') : []
            },
            'stage4': {
                title: '阶段四：面试与实战',
                questions: window.getStageQuestions ? window.getStageQuestions('stage4') : []
            },
            'stage5': {
                title: '阶段五：源码解析与内核探秘',
                questions: window.getStageQuestions ? window.getStageQuestions('stage5') : []
            }
        };
        return stages[stageId];
    }
    
    // 渲染当前题目
    renderQuestion() {
        if (!this.questions || this.questions.length === 0) {
            console.error('没有可用的题目');
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        if (!question) {
            this.showResults();
            return;
        }
        
        // 更新题目编号
        this.elements.questionNumber.textContent = this.currentQuestionIndex + 1;
        
        // 渲染题目类型
        this.elements.questionType.textContent = this.getQuestionTypeText(question.type);
        
        // 渲染题目标题
        this.elements.questionTitle.textContent = question.question;
        
        // 渲染题目标签
        if (question.tags && question.tags.length > 0) {
            this.elements.questionTags.innerHTML = question.tags
                .map(tag => `<span class="tag">${tag}</span>`)
                .join('');
        } else {
            this.elements.questionTags.innerHTML = '';
        }
        
        // 渲染选项
        this.renderOptions(question);
        
        // 清空并隐藏解释容器，避免上一次状态残留
        this.elements.explanationContainer.innerHTML = '';
        this.elements.explanationContainer.style.display = 'none';
        
        // 隐藏下一题按钮
        this.elements.nextContainer.style.display = 'none';
        
        // 更新进度
        this.updateProgress();
    }
    
    // 获取题目类型文本
    getQuestionTypeText(type) {
        const types = {
            'single': '单选题',
            'multiple': '多选题',
            'boolean': '判断题'
        };
        return types[type] || '未知题型';
    }
    
    // 渲染选项
    renderOptions(question) {
        // 检查题目和选项是否存在（为判断题提供兜底选项）
        if (!question) {
            console.error('题目或选项数据不存在:', question);
            return;
        }
        if (!question.options || question.options.length === 0) {
            if (question.type === 'boolean') {
                // 为判断题补充默认选项，避免无 options 导致渲染中断
                question.options = [
                    { value: true, text: '正确' },
                    { value: false, text: '错误' }
                ];
            } else {
                console.error('题目或选项数据不存在:', question);
                return;
            }
        }
        
        let optionsHTML = '';
        
        question.options.forEach((option, index) => {
            const optionId = `option-${index}`;
            // 统一规范化每个选项，确保都有 { value, text }
            let optionText = typeof option === 'string' ? option : (option.text ?? option.value ?? '');
            let optionValue = typeof option === 'string' ? option : (option.value ?? option.text ?? index);
            
            // 调试信息
            console.log(`渲染选项 ${index}:`, option, '提取文本:', optionText, '类型:', typeof optionText);
            
            // 强制转换为字符串，防止显示 [object Object]
            optionText = String(optionText);
            // 就地规范化，避免后续读取 value 为空
            question.options[index] = { value: optionValue, text: optionText };
            
            optionsHTML += `
                <div class="option" data-index="${index}" id="${optionId}">
                    <span class="option-label">${String.fromCharCode(65 + index)}</span>
                    <span class="option-text">${optionText}</span>
                </div>
            `;
        });
        
        this.elements.optionsContainer.innerHTML = optionsHTML;
        
        // 绑定选项点击事件
        this.bindOptionEvents(question);
    }
    
    // 获取正确答案文本
    getCorrectAnswerText(question) {
        // 统一布尔值规范化，防止 'false' 被当作真值
        const normalizeBool = (v) => {
            if (v === true || v === false) return v;
            if (typeof v === 'string') {
                const s = v.trim().toLowerCase();
                if (s === 'true' || s === '1' || s === '是' || s === '正确') return true;
                if (s === 'false' || s === '0' || s === '否' || s === '错误') return false;
            }
            if (typeof v === 'number') return v !== 0;
            return Boolean(v);
        };

        if (question.type === 'boolean') {
            const ans = normalizeBool(question.correctAnswer);
            return ans ? '正确' : '错误';
        }
        
        if (question.type === 'multiple') {
            const correctOptions = question.options.filter(opt => 
                question.correctAnswer.includes(opt.value)
            );
            return correctOptions.map(opt => opt.text).join('、');
        }
        
        const correctOption = question.options.find(opt => 
            opt.value === question.correctAnswer
        );
        return correctOption ? correctOption.text : '';
    }
    
    // 渲染选项解析
    renderOptionExplanations(question) {
        if (question.type === 'boolean' || !question.optionExplanations) {
            return '';
        }
        
        return `
            <div style="margin-top: 1rem;">
                <h4 style="margin-bottom: 0.5rem; color: var(--gray-700);">选项解析：</h4>
                ${question.options.map((option, index) => {
                    const explanation = question.optionExplanations[option.value];
                    if (!explanation) return '';
                    
                    const isCorrect = question.type === 'multiple' 
                        ? question.correctAnswer.includes(option.value)
                        : question.correctAnswer === option.value;
                    
                    return `
                        <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: ${isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border-radius: 0.375rem;">
                            <strong>${String.fromCharCode(65 + index)}. ${option.text}</strong>
                            <br>
                            <span style="color: var(--gray-600);">${explanation}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // 绑定选项点击事件
    bindOptionEvents(question) {
        const options = this.elements.optionsContainer.querySelectorAll('.option');
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                if (option.classList.contains('disabled')) return;
                
                this.handleOptionClick(option, question);
            });
        });
    }
    
    // 处理选项点击
    handleOptionClick(clickedOption, question) {
        if (question.type === 'multiple') {
            // 多选题处理
            clickedOption.classList.toggle('selected');
        } else {
            // 单选题和判断题处理
            const allOptions = this.elements.optionsContainer.querySelectorAll('.option');
            allOptions.forEach(option => option.classList.remove('selected'));
            clickedOption.classList.add('selected');
        }
        
        // 获取用户答案
        let userAnswer;
        if (question.type === 'multiple') {
            // 多选题：获取所有选中的选项值
            const selectedOptions = this.elements.optionsContainer.querySelectorAll('.option.selected');
            userAnswer = Array.from(selectedOptions).map(option => 
                question.options[parseInt(option.dataset.index)].value
            );
        } else {
            // 单选题和判断题：获取选中选项的值（带兜底）
            const idx = parseInt(clickedOption.dataset.index);
            userAnswer = question.options[idx] && question.options[idx].value;
            // 兜底：判断题极端情况下仍无 value，用索引 0/1 推断 true/false
            if (userAnswer === undefined && question.type === 'boolean') {
                userAnswer = idx === 0;
            }
        }
        
        // 提交答案
        this.submitAnswer(question, userAnswer);
    }
    
    // 提交答案
    submitAnswer(question, userAnswer) {
        // 检查答案是否正确
        const isCorrect = this.checkAnswer(userAnswer, question.correctAnswer, question.type);
        
        // 记录用户答案
        this.userAnswers.push({
            questionIndex: this.currentQuestionIndex,
            userAnswer: userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect
        });
        
        // 显示答案反馈
        this.showAnswerFeedback(question, isCorrect);
        
        // 更新统计
        this.updateProgress();
        
        // 禁用所有选项
        const allOptions = this.elements.optionsContainer.querySelectorAll('.option');
        allOptions.forEach(option => option.classList.add('disabled'));
    }
    
    // 检查答案是否正确
    checkAnswer(userAnswer, correctAnswer, questionType) {
        if (questionType === 'multiple') {
            // 多选题：比较数组
            if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
                return false;
            }
            if (userAnswer.length !== correctAnswer.length) {
                return false;
            }
            return userAnswer.sort().join(',') === correctAnswer.sort().join(',');
        } else if (questionType === 'boolean') {
            // 判断题：宽松接收 string/number/bool，统一规范化后比较
            const normalizeBool = (v) => {
                if (v === true || v === false) return v;
                if (typeof v === 'string') {
                    const s = v.trim().toLowerCase();
                    if (s === 'true' || s === '1' || s === '是' || s === '正确') return true;
                    if (s === 'false' || s === '0' || s === '否' || s === '错误') return false;
                }
                if (typeof v === 'number') return v !== 0;
                return Boolean(v);
            };
            return normalizeBool(userAnswer) === normalizeBool(correctAnswer);
        } else {
            // 单选题：直接比较
            return userAnswer === correctAnswer;
        }
    }
    
    // 显示答案反馈
    showAnswerFeedback(question, isCorrect) {
        // 标记正确和错误答案
        const allOptions = this.elements.optionsContainer.querySelectorAll('.option');
        allOptions.forEach((option, index) => {
            const optionValue = question.options[index].value;
            
            // 处理不同题型的正确答案标记
            if (question.type === 'multiple') {
                if (question.correctAnswer.includes(optionValue)) {
                    option.classList.add('correct');
                }
            } else {
                if (optionValue === question.correctAnswer) {
                    option.classList.add('correct');
                }
            }
            
            if (option.classList.contains('selected') && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
        
        // 显示解释
        const correctAnswerText = this.getCorrectAnswerText(question);
        const optionExplanations = this.renderOptionExplanations(question);
        
        const explanationHTML = `
            <div class="explanation-header">
                <h3>题目解析 <span style="font-size: 0.875rem; color: var(--gray-600); margin-left: 0.5rem;">（已自动展开，可手动收起）</span></h3>
                <button class="toggle-explanation" onclick="toggleExplanation()">
                    <span id="toggleText">收起</span>
                    <svg id="toggleIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform: rotate(180deg); transition: transform 0.2s ease;">
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                </button>
            </div>
            <div class="explanation-content expanded">
                <div class="correct-answer">
                    <strong>正确答案：</strong>${correctAnswerText}
                </div>
                <div class="explanation-text">
                    ${question.explanation}
                </div>
                ${optionExplanations}
            </div>
        `;
        
        this.elements.explanationContainer.innerHTML = explanationHTML;
        this.elements.explanationContainer.style.display = 'block';
        
        // 显示下一题按钮
        this.elements.nextContainer.style.display = 'block';
    }
    
    // 下一题
    nextQuestion() {
        this.currentQuestionIndex++;
        this.questionStartTime = Date.now();
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.renderQuestion();
        } else {
            this.showResults();
        }
    }
    
    // 更新进度显示
    updateProgress() {
        if (!this.questions || this.questions.length === 0) return;
        
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        
        // 更新题目进度文本
        this.elements.questionNumber.textContent = `${this.currentQuestionIndex + 1} / ${this.questions.length}`;
        
        // 更新正确率
        const correctCount = this.userAnswers.filter(answer => answer.isCorrect).length;
        const answeredCount = this.userAnswers.length;
        const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
        this.elements.accuracy.textContent = `正确率: ${accuracy}%`;
    }
    
    // 显示结果页面
    showResults() {
        const totalQuestions = this.questions.length;
        const correctAnswers = this.userAnswers.filter(answer => answer.isCorrect).length;
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
        const totalTime = this.userAnswers.reduce((sum, answer) => sum + answer.timeSpent, 0);
        
        // 更新结果页面内容
        document.getElementById('finalScore').textContent = correctAnswers;
        document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
        document.getElementById('totalQuestions').textContent = totalQuestions;
        
        this.showPage('result');
    }
    
    // 重新开始测试
    restartQuiz() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.questionStartTime = Date.now();
        this.renderQuestion();
        this.showPage('quiz');
    }
    
    // 返回首页
    goHome() {
        this.showPage('home');
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', async () => {
    // 预加载题库
    console.log('开始加载题库...');
    await window.loadQuestions();
    console.log('题库加载完成');
    
    // 初始化应用
    window.app = new QuizApp();
    
    // 检查是否有题库数据，如果没有则显示提示
    const hasQuestions = window.stage1Questions && window.stage1Questions.length > 0;
    if (!hasQuestions) {
        console.warn('题库数据尚未加载，请确保题库文件已正确引入');
    }
});

// 工具函数：打乱数组顺序
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 工具函数：从数组中随机选择指定数量的元素
function getRandomItems(array, count) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
}

// 全局折叠/展开解析区域（支持静态按钮与动态内容）
// Why: index.html 内置了一个 onclick="toggleExplanation()" 的按钮，但原脚本未实现；
// 同时我们注入的解析内容默认展开，提供该函数以便需要时可折叠。
function toggleExplanation() {
    // 获取承载解析的容器
    const container = document.getElementById('explanationContainer');
    if (!container) return;

    // 定位当前题目的解析内容区域
    const content = container.querySelector('.explanation-content');
    if (!content) return;

    // 执行折叠/展开
    const expanded = content.classList.toggle('expanded');

    // 如果解析容器当前被隐藏，展开时确保其可见
    if (expanded) {
        container.style.display = 'block';
    }

    // 同步按钮文案与图标（若存在）
    const toggleText = document.getElementById('toggleText');
    if (toggleText) {
        toggleText.textContent = expanded ? '收起' : '展开';
    }
    const toggleIcon = document.getElementById('toggleIcon');
    if (toggleIcon) {
        toggleIcon.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
        toggleIcon.style.transition = 'transform 0.2s ease';
    }
}