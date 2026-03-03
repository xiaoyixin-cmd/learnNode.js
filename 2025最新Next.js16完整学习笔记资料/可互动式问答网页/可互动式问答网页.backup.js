// 题库数据结构
const questionBank = {
    "00-零基础篇": [],
    "01-架构篇": [],
    "02-路由篇": [],
    "03-数据篇": [],
    "05-API篇": [],
    "08-高级技巧篇": []
};

// 当前状态
let currentStage = '';
let currentQuestionIndex = 0;
let answeredCount = 0;
let correctCount = 0;
let userAnswers = [];

// DOM元素
const homePage = document.getElementById('homePage');
const quizPage = document.getElementById('quizPage');
const questionCard = document.getElementById('questionCard');
const completionCard = document.getElementById('completionCard');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initQuestionBank();
    initEventListeners();
});

// 初始化事件监听
function initEventListeners() {
    // 阶段卡片点击
    document.querySelectorAll('.stage-card').forEach(card => {
        card.addEventListener('click', () => {
            const stage = card.dataset.stage;
            startQuiz(stage);
        });
    });
    
    // 返回首页
    document.getElementById('backToHome').addEventListener('click', () => {
        showHomePage();
    });
    
    document.getElementById('backToHomeFromCompletion').addEventListener('click', () => {
        showHomePage();
    });
    
    // 重新开始
    document.getElementById('restartQuiz').addEventListener('click', () => {
        startQuiz(currentStage);
    });
    
    // 下一题
    document.getElementById('nextQuestion').addEventListener('click', () => {
        nextQuestion();
    });
    
    // 查看解析
    document.getElementById('toggleExplanation').addEventListener('click', () => {
        const content = document.getElementById('explanationContent');
        content.classList.toggle('hidden');
        const btn = document.getElementById('toggleExplanation');
        btn.textContent = content.classList.contains('hidden') ? '查看解析' : '收起解析';
    });
}

// 显示首页
function showHomePage() {
    homePage.classList.add('active');
    quizPage.classList.remove('active');
    currentStage = '';
    currentQuestionIndex = 0;
    answeredCount = 0;
    correctCount = 0;
    userAnswers = [];
}

// 开始答题
function startQuiz(stage) {
    currentStage = stage;
    currentQuestionIndex = 0;
    answeredCount = 0;
    correctCount = 0;
    userAnswers = [];
    
    homePage.classList.remove('active');
    quizPage.classList.add('active');
    questionCard.classList.remove('hidden');
    completionCard.classList.add('hidden');
    
    updateQuizHeader();
    showQuestion();
}

// 更新顶部信息
function updateQuizHeader() {
    document.getElementById('currentStage').textContent = currentStage;
    const total = questionBank[currentStage].length;
    document.getElementById('questionProgress').textContent = `${answeredCount}/${total}`;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    document.getElementById('accuracy').textContent = `正确率: ${accuracy}%`;
}

// 显示题目
function showQuestion() {
    const questions = questionBank[currentStage];
    if (currentQuestionIndex >= questions.length) {
        showCompletion();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    
    // 重置状态
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('nextQuestion').classList.add('hidden');
    document.getElementById('explanationContent').classList.add('hidden');
    document.getElementById('toggleExplanation').textContent = '查看解析';
    
    // 显示题目信息
    document.getElementById('questionType').textContent = question.type;
    document.getElementById('questionText').textContent = question.question;
    
    // 显示标签
    const tagsContainer = document.getElementById('questionTags');
    tagsContainer.innerHTML = question.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');
    
    // 显示选项
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = question.options.map((option, index) => 
        `<div class="option" data-index="${index}">${option}</div>`
    ).join('');
    
    // 添加选项点击事件
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => handleOptionClick(option, question));
    });
}

// 处理选项点击
function handleOptionClick(optionElement, question) {
    // 如果已经答过,不允许再次点击
    if (optionElement.classList.contains('disabled')) return;

    const selectedIndex = parseInt(optionElement.dataset.index);

    // 多选题处理
    if (question.type === '多选题') {
        optionElement.classList.toggle('selected');

        // 检查是否已选择足够的选项
        const selectedOptions = document.querySelectorAll('.option.selected');
        if (selectedOptions.length > 0) {
            // 显示提交按钮(复用下一题按钮)
            const nextBtn = document.getElementById('nextQuestion');
            nextBtn.textContent = '提交答案';
            nextBtn.classList.remove('hidden');
            nextBtn.onclick = () => submitMultipleChoice(question);
        }
    } else {
        // 单选题和判断题:立即提交
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
            opt.classList.add('disabled');
        });
        optionElement.classList.add('selected');

        checkAnswer([selectedIndex], question);
    }
}

// 提交多选题答案
function submitMultipleChoice(question) {
    const selectedOptions = Array.from(document.querySelectorAll('.option.selected'))
        .map(opt => parseInt(opt.dataset.index));

    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.add('disabled');
    });

    checkAnswer(selectedOptions, question);
}

// 检查答案
function checkAnswer(userAnswer, question) {
    answeredCount++;

    const correctAnswer = question.answer;
    let isCorrect = false;

    // 判断答案是否正确
    if (Array.isArray(correctAnswer)) {
        // 多选题
        isCorrect = userAnswer.length === correctAnswer.length &&
                   userAnswer.every(ans => correctAnswer.includes(ans));
    } else {
        // 单选题和判断题
        isCorrect = userAnswer[0] === correctAnswer;
    }

    if (isCorrect) {
        correctCount++;
    }

    // 标记选项
    document.querySelectorAll('.option').forEach((opt, index) => {
        const isCorrectOption = Array.isArray(correctAnswer)
            ? correctAnswer.includes(index)
            : correctAnswer === index;

        if (isCorrectOption) {
            opt.classList.add('correct');
        } else if (userAnswer.includes(index)) {
            opt.classList.add('incorrect');
        }
    });

    // 显示反馈
    showFeedback(isCorrect, question);

    // 更新顶部信息
    updateQuizHeader();

    // 显示下一题按钮
    const nextBtn = document.getElementById('nextQuestion');
    nextBtn.textContent = '下一题';
    nextBtn.classList.remove('hidden');
    nextBtn.onclick = () => nextQuestion();
}

// 显示反馈
function showFeedback(isCorrect, question) {
    const feedback = document.getElementById('feedback');
    const feedbackResult = feedback.querySelector('.feedback-result');

    feedbackResult.textContent = isCorrect ? '回答正确' : '回答错误';
    feedbackResult.className = `feedback-result ${isCorrect ? 'correct' : 'incorrect'}`;

    // 显示解析
    const explanationContent = document.getElementById('explanationContent');
    let explanationHTML = '';

    // 正确选项解析
    if (question.correctExplanation) {
        explanationHTML += `
            <div class="explanation-section">
                <div class="explanation-title">正确选项解析</div>
                <div class="explanation-text">${question.correctExplanation}</div>
            </div>
        `;
    }

    // 错误选项解析
    if (question.incorrectExplanation && question.incorrectExplanation.length > 0) {
        explanationHTML += `
            <div class="explanation-section">
                <div class="explanation-title">错误选项解析</div>
        `;
        question.incorrectExplanation.forEach((exp, index) => {
            if (exp) {
                explanationHTML += `<div class="explanation-text">选项${String.fromCharCode(65 + index)}: ${exp}</div>`;
            }
        });
        explanationHTML += `</div>`;
    }

    explanationContent.innerHTML = explanationHTML;
    feedback.classList.remove('hidden');
}

// 下一题
function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

// 显示完成页面
function showCompletion() {
    questionCard.classList.add('hidden');
    completionCard.classList.remove('hidden');

    const total = questionBank[currentStage].length;
    const accuracy = Math.round((correctCount / total) * 100);

    document.getElementById('totalQuestions').textContent = total;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
}

// 初始化题库
function initQuestionBank() {
    // 00-零基础篇题库
    questionBank["00-零基础篇"] = [
        {
            type: "单选题",
            question: "JavaScript中,以下哪个关键字用于声明块级作用域的变量?",
            options: ["var", "let", "const", "function"],
            answer: 1,
            tags: ["JavaScript", "ES6", "变量声明"],
            correctExplanation: "let关键字用于声明块级作用域的变量,它只在声明的代码块内有效,避免了var的变量提升问题。",
            incorrectExplanation: [
                "var声明的是函数作用域变量,存在变量提升问题",
                "",
                "const用于声明常量,声明后不能重新赋值",
                "function用于声明函数,不是变量声明关键字"
            ]
        },
        {
            type: "判断题",
            question: "const声明的变量可以重新赋值。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["JavaScript", "ES6", "const"],
            correctExplanation: "const声明的是常量,一旦赋值后不能重新赋值。但如果是对象或数组,可以修改其属性或元素。",
            incorrectExplanation: [
                "const声明的变量不能重新赋值,这是const的核心特性",
                ""
            ]
        },
        {
            type: "单选题",
            question: "以下哪个方法可以将数组转换为字符串?",
            options: ["join()", "split()", "slice()", "splice()"],
            answer: 0,
            tags: ["JavaScript", "数组", "字符串"],
            correctExplanation: "join()方法将数组的所有元素连接成一个字符串,可以指定分隔符。",
            incorrectExplanation: [
                "",
                "split()是字符串方法,用于将字符串分割成数组",
                "slice()用于提取数组的一部分,返回新数组",
                "splice()用于添加或删除数组元素,会修改原数组"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是JavaScript的原始数据类型?",
            options: ["String", "Number", "Object", "Boolean", "Null", "Undefined"],
            answer: [0, 1, 3, 4, 5],
            tags: ["JavaScript", "数据类型", "基础"],
            correctExplanation: "JavaScript有7种原始数据类型:String、Number、Boolean、Null、Undefined、Symbol、BigInt。Object是引用类型。",
            incorrectExplanation: [
                "",
                "",
                "Object是引用类型,不是原始数据类型",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Promise的三种状态不包括以下哪个?",
            options: ["pending", "fulfilled", "rejected", "resolved"],
            answer: 3,
            tags: ["JavaScript", "Promise", "异步"],
            correctExplanation: "Promise只有三种状态:pending(进行中)、fulfilled(已成功)、rejected(已失败)。resolved不是Promise的状态。",
            incorrectExplanation: [
                "pending是Promise的初始状态",
                "fulfilled是Promise成功时的状态",
                "rejected是Promise失败时的状态",
                ""
            ]
        },
        {
            type: "单选题",
            question: "async/await是基于什么实现的?",
            options: ["回调函数", "Promise", "Generator", "事件循环"],
            answer: 1,
            tags: ["JavaScript", "async/await", "异步"],
            correctExplanation: "async/await是Promise的语法糖,它让异步代码看起来像同步代码,但本质上仍然是基于Promise实现的。",
            incorrectExplanation: [
                "回调函数是早期的异步解决方案,async/await不是基于它实现的",
                "",
                "虽然Generator可以实现类似功能,但async/await是基于Promise的",
                "事件循环是JavaScript的运行机制,不是async/await的实现基础"
            ]
        },
        {
            type: "判断题",
            question: "箭头函数有自己的this绑定。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["JavaScript", "箭头函数", "this"],
            correctExplanation: "箭头函数没有自己的this,它会捕获其所在上下文的this值作为自己的this值。",
            incorrectExplanation: [
                "箭头函数没有自己的this绑定,这是它与普通函数的重要区别",
                ""
            ]
        },
        {
            type: "单选题",
            question: "React中,以下哪个Hook用于在函数组件中添加状态?",
            options: ["useEffect", "useState", "useContext", "useReducer"],
            answer: 1,
            tags: ["React", "Hooks", "状态管理"],
            correctExplanation: "useState是React中最基本的Hook,用于在函数组件中添加状态管理功能。",
            incorrectExplanation: [
                "useEffect用于处理副作用,如数据获取、订阅等",
                "",
                "useContext用于访问React Context",
                "useReducer是useState的替代方案,适用于复杂状态逻辑"
            ]
        },
        {
            type: "单选题",
            question: "React的虚拟DOM主要解决了什么问题?",
            options: ["内存泄漏", "性能优化", "代码复用", "类型安全"],
            answer: 1,
            tags: ["React", "虚拟DOM", "性能"],
            correctExplanation: "虚拟DOM通过在内存中维护DOM的副本,减少直接操作真实DOM的次数,从而提升性能。",
            incorrectExplanation: [
                "虚拟DOM不是为了解决内存泄漏问题",
                "",
                "代码复用主要通过组件化实现",
                "类型安全主要通过TypeScript等工具实现"
            ]
        },
        {
            type: "判断题",
            question: "useEffect的依赖数组为空时,副作用只在组件挂载时执行一次。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["React", "useEffect", "Hooks"],
            correctExplanation: "当useEffect的依赖数组为空数组[]时,副作用只在组件挂载时执行一次,类似于componentDidMount。",
            incorrectExplanation: [
                "",
                "依赖数组为空时,副作用确实只执行一次"
            ]
        },
        {
            type: "多选题",
            question: "React 19引入了哪些新特性?",
            options: ["Server Actions", "React Compiler", "useActionState", "Suspense", "useFormStatus"],
            answer: [0, 1, 2],
            tags: ["React", "React 19", "新特性"],
            correctExplanation: "React 19引入了Server Actions、React Compiler、useActionState等新特性,大幅提升了开发体验和性能。",
            incorrectExplanation: [
                "",
                "",
                "",
                "Suspense在React 18中就已经引入",
                "useFormStatus在React 19中被重命名为useActionState"
            ]
        },
        {
            type: "单选题",
            question: "TypeScript中,以下哪个关键字用于定义接口?",
            options: ["class", "interface", "type", "enum"],
            answer: 1,
            tags: ["TypeScript", "接口", "类型"],
            correctExplanation: "interface关键字专门用于定义对象的结构,描述对象应该有哪些属性和方法。",
            incorrectExplanation: [
                "class用于定义类",
                "",
                "type用于定义类型别名,功能类似但有细微差别",
                "enum用于定义枚举类型"
            ]
        },
        {
            type: "判断题",
            question: "TypeScript的类型检查只在编译时进行,运行时不会进行类型检查。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["TypeScript", "类型检查", "编译"],
            correctExplanation: "TypeScript的类型检查只在编译时进行,编译后的JavaScript代码不包含类型信息,运行时不会进行类型检查。",
            incorrectExplanation: [
                "",
                "TypeScript确实只在编译时进行类型检查"
            ]
        },
        {
            type: "单选题",
            question: "以下哪个泛型约束表示T必须包含length属性?",
            options: ["T extends object", "T extends { length: number }", "T extends Array", "T extends string"],
            answer: 1,
            tags: ["TypeScript", "泛型", "约束"],
            correctExplanation: "使用extends { length: number }可以约束泛型T必须包含number类型的length属性。",
            incorrectExplanation: [
                "extends object只约束T必须是对象类型,不保证有length属性",
                "",
                "extends Array约束T必须是数组类型,过于严格",
                "extends string约束T必须是字符串类型,过于严格"
            ]
        },
        {
            type: "单选题",
            question: "Node.js的事件循环中,以下哪个阶段最先执行?",
            options: ["timers", "poll", "check", "close callbacks"],
            answer: 0,
            tags: ["Node.js", "事件循环", "异步"],
            correctExplanation: "Node.js事件循环的执行顺序是:timers -> pending callbacks -> idle/prepare -> poll -> check -> close callbacks。timers阶段最先执行。",
            incorrectExplanation: [
                "",
                "poll阶段在timers之后执行",
                "check阶段在poll之后执行",
                "close callbacks是最后执行的阶段"
            ]
        },
        {
            type: "多选题",
            question: "CommonJS和ES Modules的主要区别包括?",
            options: ["加载时机不同", "语法不同", "this指向不同", "性能相同"],
            answer: [0, 1, 2],
            tags: ["Node.js", "模块化", "CommonJS", "ES Modules"],
            correctExplanation: "CommonJS是同步加载,运行时加载;ES Modules是异步加载,编译时加载。语法上CommonJS使用require/module.exports,ES Modules使用import/export。this指向也不同。",
            incorrectExplanation: [
                "",
                "",
                "",
                "ES Modules性能更好,因为可以进行静态分析和tree-shaking"
            ]
        },
        {
            type: "单选题",
            question: "SSR(服务端渲染)和CSR(客户端渲染)的主要区别是什么?",
            options: ["渲染位置不同", "性能相同", "SEO效果相同", "开发难度相同"],
            answer: 0,
            tags: ["SSR", "CSR", "渲染模式"],
            correctExplanation: "SSR在服务器端渲染HTML,CSR在浏览器端渲染。SSR首屏加载快、SEO友好,但服务器压力大;CSR交互流畅,但首屏慢、SEO差。",
            incorrectExplanation: [
                "",
                "SSR首屏性能更好,CSR交互性能更好",
                "SSR的SEO效果明显优于CSR",
                "SSR开发和部署相对更复杂"
            ]
        },
        {
            type: "判断题",
            question: "HTTP/2支持多路复用,可以在一个TCP连接上同时发送多个请求。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["HTTP/2", "网络", "性能"],
            correctExplanation: "HTTP/2的多路复用特性允许在一个TCP连接上同时发送多个请求和响应,解决了HTTP/1.1的队头阻塞问题。",
            incorrectExplanation: [
                "",
                "HTTP/2确实支持多路复用"
            ]
        },
        {
            type: "单选题",
            question: "Next.js的主要优势不包括以下哪项?",
            options: ["支持SSR和SSG", "自动代码分割", "内置CSS支持", "原生移动应用开发"],
            answer: 3,
            tags: ["Next.js", "特性", "框架"],
            correctExplanation: "Next.js是React框架,专注于Web应用开发,不支持原生移动应用开发。原生移动应用需要使用React Native。",
            incorrectExplanation: [
                "Next.js支持多种渲染模式,包括SSR和SSG",
                "Next.js自动进行代码分割,优化性能",
                "Next.js内置CSS Modules、Sass等CSS支持",
                ""
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是Next.js支持的渲染模式?",
            options: ["SSR", "SSG", "ISR", "CSR", "PPR"],
            answer: [0, 1, 2, 3, 4],
            tags: ["Next.js", "渲染模式", "架构"],
            correctExplanation: "Next.js支持所有主流渲染模式:SSR(服务端渲染)、SSG(静态生成)、ISR(增量静态再生)、CSR(客户端渲染)、PPR(部分预渲染)。",
            incorrectExplanation: [
                "",
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "闭包最常见的应用场景是什么?",
            options: ["循环遍历", "数据封装", "类型转换", "错误处理"],
            answer: 1,
            tags: ["JavaScript", "闭包", "作用域"],
            correctExplanation: "闭包最常见的应用是数据封装和私有变量,通过闭包可以创建私有作用域,保护内部变量不被外部访问。",
            incorrectExplanation: [
                "循环遍历不是闭包的主要应用场景",
                "",
                "类型转换与闭包无关",
                "错误处理不是闭包的主要应用"
            ]
        },
        {
            type: "判断题",
            question: "JavaScript中,null和undefined使用==比较时结果为true。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["JavaScript", "null", "undefined", "比较"],
            correctExplanation: "null == undefined 结果为true,因为==会进行类型转换。但使用===严格相等比较时结果为false。",
            incorrectExplanation: [
                "",
                "null == undefined 确实为true"
            ]
        },
        {
            type: "单选题",
            question: "以下哪个方法可以创建一个新数组,不会修改原数组?",
            options: ["push()", "map()", "splice()", "sort()"],
            answer: 1,
            tags: ["JavaScript", "数组", "不可变性"],
            correctExplanation: "map()方法创建一个新数组,不会修改原数组。push()、splice()、sort()都会修改原数组。",
            incorrectExplanation: [
                "push()会修改原数组,向数组末尾添加元素",
                "",
                "splice()会修改原数组,可以添加或删除元素",
                "sort()会修改原数组,对数组进行排序"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些数组方法不会修改原数组?",
            options: ["map()", "filter()", "push()", "slice()", "concat()"],
            answer: [0, 1, 3, 4],
            tags: ["JavaScript", "数组", "不可变性"],
            correctExplanation: "map()、filter()、slice()、concat()都会返回新数组,不修改原数组。push()会修改原数组。",
            incorrectExplanation: [
                "",
                "",
                "push()会修改原数组",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "React中,key属性的主要作用是什么?",
            options: ["样式控制", "性能优化", "事件绑定", "数据传递"],
            answer: 1,
            tags: ["React", "key", "性能"],
            correctExplanation: "key帮助React识别哪些元素改变了,从而优化DOM更新,避免不必要的重新渲染。",
            incorrectExplanation: [
                "key不用于样式控制",
                "",
                "key不用于事件绑定",
                "key不用于数据传递"
            ]
        },
        {
            type: "判断题",
            question: "React组件的props是只读的,不能在组件内部修改。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["React", "props", "不可变性"],
            correctExplanation: "props是只读的,组件不能修改自己的props。如果需要修改数据,应该使用state。",
            incorrectExplanation: [
                "",
                "props确实是只读的"
            ]
        },
        {
            type: "单选题",
            question: "useCallback和useMemo的主要区别是什么?",
            options: ["参数不同", "返回值类型不同", "使用场景相同", "性能相同"],
            answer: 1,
            tags: ["React", "useCallback", "useMemo", "性能优化"],
            correctExplanation: "useCallback返回缓存的函数,useMemo返回缓存的值。useCallback(fn, deps)等价于useMemo(() => fn, deps)。",
            incorrectExplanation: [
                "参数形式相同,都是(callback, deps)",
                "",
                "使用场景不同:useCallback缓存函数,useMemo缓存计算结果",
                "两者都用于性能优化,但优化的对象不同"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是React Hooks的使用规则?",
            options: ["只在函数组件中调用", "只在顶层调用", "可以在循环中调用", "可以在条件语句中调用"],
            answer: [0, 1],
            tags: ["React", "Hooks", "规则"],
            correctExplanation: "Hooks只能在函数组件或自定义Hook中调用,且只能在顶层调用,不能在循环、条件或嵌套函数中调用。",
            incorrectExplanation: [
                "",
                "",
                "不能在循环中调用Hooks",
                "不能在条件语句中调用Hooks"
            ]
        },
        {
            type: "单选题",
            question: "TypeScript中,interface和type的主要区别是什么?",
            options: ["功能完全相同", "interface可以扩展,type不能", "type可以定义联合类型,interface不能", "性能不同"],
            answer: 2,
            tags: ["TypeScript", "interface", "type"],
            correctExplanation: "type可以定义联合类型、交叉类型、元组等,interface主要用于定义对象结构。interface可以声明合并,type不能。",
            incorrectExplanation: [
                "两者有细微差别",
                "interface和type都可以扩展,只是语法不同",
                "",
                "两者在性能上没有区别"
            ]
        },
        {
            type: "判断题",
            question: "TypeScript的any类型会跳过类型检查。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["TypeScript", "any", "类型检查"],
            correctExplanation: "any类型会跳过类型检查,相当于告诉TypeScript不要检查这个变量的类型,应该尽量避免使用。",
            incorrectExplanation: [
                "",
                "any确实会跳过类型检查"
            ]
        },
        {
            type: "单选题",
            question: "以下哪个TypeScript工具类型可以将所有属性变为可选?",
            options: ["Required<T>", "Partial<T>", "Readonly<T>", "Pick<T>"],
            answer: 1,
            tags: ["TypeScript", "工具类型", "Partial"],
            correctExplanation: "Partial<T>将类型T的所有属性变为可选。Required<T>则相反,将所有属性变为必选。",
            incorrectExplanation: [
                "Required<T>将所有属性变为必选",
                "",
                "Readonly<T>将所有属性变为只读",
                "Pick<T, K>从T中选择部分属性"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是TypeScript的内置工具类型?",
            options: ["Partial", "Required", "Readonly", "Record", "Optional"],
            answer: [0, 1, 2, 3],
            tags: ["TypeScript", "工具类型"],
            correctExplanation: "Partial、Required、Readonly、Record都是TypeScript的内置工具类型。Optional不是内置类型。",
            incorrectExplanation: [
                "",
                "",
                "",
                "",
                "Optional不是TypeScript的内置工具类型"
            ]
        },
        {
            type: "单选题",
            question: "Promise.all()和Promise.race()的主要区别是什么?",
            options: ["参数不同", "返回值不同", "完成时机不同", "错误处理相同"],
            answer: 2,
            tags: ["JavaScript", "Promise", "异步"],
            correctExplanation: "Promise.all()等待所有Promise完成,Promise.race()在第一个Promise完成时就返回。",
            incorrectExplanation: [
                "参数都是Promise数组",
                "都返回Promise",
                "",
                "错误处理方式不同:all()任一失败就失败,race()看第一个完成的结果"
            ]
        },
        {
            type: "判断题",
            question: "async函数总是返回一个Promise。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["JavaScript", "async", "Promise"],
            correctExplanation: "async函数总是返回Promise。如果返回值不是Promise,会自动包装成Promise。",
            incorrectExplanation: [
                "",
                "async函数确实总是返回Promise"
            ]
        },
        {
            type: "单选题",
            question: "以下哪个不是JavaScript的事件循环阶段?",
            options: ["宏任务", "微任务", "同步任务", "异步任务"],
            answer: 3,
            tags: ["JavaScript", "事件循环", "异步"],
            correctExplanation: "事件循环包括同步任务、宏任务(macro task)、微任务(micro task)。异步任务不是事件循环的阶段,而是任务的类型。",
            incorrectExplanation: [
                "宏任务是事件循环的一部分,如setTimeout、setInterval",
                "微任务是事件循环的一部分,如Promise、MutationObserver",
                "同步任务在事件循环中最先执行",
                ""
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是微任务(microtask)?",
            options: ["Promise.then()", "setTimeout()", "MutationObserver", "setInterval()", "queueMicrotask()"],
            answer: [0, 2, 4],
            tags: ["JavaScript", "微任务", "事件循环"],
            correctExplanation: "Promise.then()、MutationObserver、queueMicrotask()都是微任务。setTimeout()和setInterval()是宏任务。",
            incorrectExplanation: [
                "",
                "setTimeout()是宏任务",
                "",
                "setInterval()是宏任务",
                ""
            ]
        },
        {
            type: "单选题",
            question: "React Compiler的主要作用是什么?",
            options: ["编译JSX", "自动优化性能", "类型检查", "代码压缩"],
            answer: 1,
            tags: ["React", "React Compiler", "性能优化"],
            correctExplanation: "React Compiler在编译时自动进行性能优化,如自动memoization,减少不必要的重新渲染,开发者无需手动使用useMemo/useCallback。",
            incorrectExplanation: [
                "编译JSX是Babel的工作",
                "",
                "类型检查是TypeScript的工作",
                "代码压缩是打包工具的工作"
            ]
        },
        {
            type: "判断题",
            question: "使用React Compiler后,就不需要手动使用useMemo和useCallback了。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["React", "React Compiler", "性能优化"],
            correctExplanation: "React Compiler会自动进行memoization优化,大多数情况下不需要手动使用useMemo和useCallback。",
            incorrectExplanation: [
                "",
                "React Compiler确实可以自动优化,减少手动优化的需求"
            ]
        },
        {
            type: "单选题",
            question: "Server Actions是在哪个版本的React中引入的?",
            options: ["React 17", "React 18", "React 19", "React 20"],
            answer: 2,
            tags: ["React", "Server Actions", "版本"],
            correctExplanation: "Server Actions是React 19引入的新特性,允许在服务器端执行函数,简化了数据变更操作。",
            incorrectExplanation: [
                "React 17没有Server Actions",
                "React 18引入了Suspense和并发特性,但没有Server Actions",
                "",
                "React 20还未发布"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是ES6引入的新特性?",
            options: ["let/const", "箭头函数", "Promise", "async/await", "解构赋值"],
            answer: [0, 1, 2, 4],
            tags: ["JavaScript", "ES6", "新特性"],
            correctExplanation: "let/const、箭头函数、Promise、解构赋值都是ES6(ES2015)引入的。async/await是ES2017(ES8)引入的。",
            incorrectExplanation: [
                "",
                "",
                "",
                "async/await是ES2017引入的,不是ES6",
                ""
            ]
        },
        {
            type: "单选题",
            question: "以下哪个方法可以将类数组对象转换为真正的数组?",
            options: ["Array.from()", "Array.of()", "Array.isArray()", "Array.prototype"],
            answer: 0,
            tags: ["JavaScript", "数组", "类型转换"],
            correctExplanation: "Array.from()可以将类数组对象或可迭代对象转换为真正的数组。",
            incorrectExplanation: [
                "",
                "Array.of()用于创建包含指定元素的数组",
                "Array.isArray()用于判断是否为数组",
                "Array.prototype是数组的原型对象"
            ]
        },
        {
            type: "判断题",
            question: "展开运算符(...)只能用于数组。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["JavaScript", "ES6", "展开运算符"],
            correctExplanation: "展开运算符可以用于数组、对象、字符串等所有可迭代对象。",
            incorrectExplanation: [
                "展开运算符不仅可以用于数组",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Symbol的主要用途是什么?",
            options: ["性能优化", "创建唯一标识符", "类型转换", "错误处理"],
            answer: 1,
            tags: ["JavaScript", "Symbol", "ES6"],
            correctExplanation: "Symbol用于创建唯一的标识符,常用于对象属性名,避免属性名冲突。",
            incorrectExplanation: [
                "Symbol不用于性能优化",
                "",
                "Symbol不用于类型转换",
                "Symbol不用于错误处理"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是JavaScript的循环语句?",
            options: ["for", "while", "forEach", "map", "do...while"],
            answer: [0, 1, 4],
            tags: ["JavaScript", "循环", "基础"],
            correctExplanation: "for、while、do...while是JavaScript的循环语句。forEach和map是数组方法,不是循环语句。",
            incorrectExplanation: [
                "",
                "",
                "forEach是数组方法,不是循环语句",
                "map是数组方法,不是循环语句",
                ""
            ]
        },
        {
            type: "单选题",
            question: "以下哪个方法可以阻止事件冒泡?",
            options: ["preventDefault()", "stopPropagation()", "stopImmediatePropagation()", "return false"],
            answer: 1,
            tags: ["JavaScript", "事件", "DOM"],
            correctExplanation: "stopPropagation()方法可以阻止事件冒泡。preventDefault()阻止默认行为,stopImmediatePropagation()阻止冒泡并阻止同元素上的其他监听器。",
            incorrectExplanation: [
                "preventDefault()用于阻止默认行为,不是阻止冒泡",
                "",
                "stopImmediatePropagation()不仅阻止冒泡,还阻止同元素上的其他监听器",
                "return false在jQuery中有效,在原生JavaScript中不能阻止冒泡"
            ]
        },
        {
            type: "判断题",
            question: "localStorage存储的数据会在浏览器关闭后自动清除。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["JavaScript", "localStorage", "存储"],
            correctExplanation: "localStorage存储的数据是持久化的,不会在浏览器关闭后清除。sessionStorage才会在浏览器关闭后清除。",
            incorrectExplanation: [
                "localStorage的数据是持久化的",
                ""
            ]
        }
    ];

    // 01-架构篇题库
    questionBank["01-架构篇"] = [
        {
            type: "单选题",
            question: "App Router和Pages Router的主要区别是什么?",
            options: ["文件位置不同", "渲染模式不同", "性能不同", "语法不同"],
            answer: 1,
            tags: ["App Router", "Pages Router", "架构"],
            correctExplanation: "App Router和Pages Router的主要区别是渲染模式不同。App Router默认使用Server Components,支持流式渲染;Pages Router使用传统的客户端渲染。",
            incorrectExplanation: [
                "虽然文件位置不同(app vs pages),但这不是主要区别",
                "",
                "性能差异是渲染模式不同导致的结果",
                "语法有差异,但不是主要区别"
            ]
        },
        {
            type: "判断题",
            question: "App Router中,所有组件默认都是Server Components。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["App Router", "Server Components", "默认行为"],
            correctExplanation: "在App Router中,所有组件默认都是Server Components,除非使用'use client'指令声明为Client Component。",
            incorrectExplanation: [
                "",
                "App Router确实默认使用Server Components"
            ]
        },
        {
            type: "多选题",
            question: "Server Components的优势包括?",
            options: ["减少客户端JavaScript", "直接访问后端资源", "自动代码分割", "支持useState"],
            answer: [0, 1, 2],
            tags: ["Server Components", "优势", "性能"],
            correctExplanation: "Server Components可以减少客户端JavaScript、直接访问后端资源(数据库、文件系统)、自动代码分割,但不支持useState等客户端特性。",
            incorrectExplanation: [
                "",
                "",
                "",
                "Server Components不支持useState,这是Client Component的特性"
            ]
        },
        {
            type: "单选题",
            question: "layout.js文件的主要作用是什么?",
            options: ["定义页面内容", "定义共享布局", "定义路由", "定义样式"],
            answer: 1,
            tags: ["layout.js", "布局", "文件约定"],
            correctExplanation: "layout.js用于定义共享布局,可以在多个页面之间共享UI,并且在导航时保持状态。",
            incorrectExplanation: [
                "页面内容由page.js定义",
                "",
                "路由由文件夹结构定义",
                "样式通常在单独的CSS文件中定义"
            ]
        },
        {
            type: "单选题",
            question: "loading.js文件基于React的哪个特性实现?",
            options: ["useState", "useEffect", "Suspense", "useContext"],
            answer: 2,
            tags: ["loading.js", "Suspense", "加载状态"],
            correctExplanation: "loading.js基于React的Suspense特性实现,自动为页面提供加载状态UI。",
            incorrectExplanation: [
                "useState用于状态管理,不是loading.js的实现基础",
                "useEffect用于副作用处理,不是loading.js的实现基础",
                "",
                "useContext用于访问Context,不是loading.js的实现基础"
            ]
        },
        {
            type: "判断题",
            question: "error.js必须是Client Component。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["error.js", "错误处理", "Client Component"],
            correctExplanation: "error.js必须是Client Component,因为它需要使用useState等客户端特性来处理错误。",
            incorrectExplanation: [
                "",
                "error.js确实必须是Client Component"
            ]
        },
        {
            type: "单选题",
            question: "Turbopack相比Webpack的主要优势是什么?",
            options: ["配置简单", "编译速度快", "插件丰富", "社区活跃"],
            answer: 1,
            tags: ["Turbopack", "Webpack", "构建工具"],
            correctExplanation: "Turbopack使用Rust编写,编译速度比Webpack快700倍(官方数据),这是它的主要优势。",
            incorrectExplanation: [
                "Turbopack的配置不一定比Webpack简单",
                "",
                "Webpack的插件生态更丰富",
                "Webpack的社区更活跃,因为它更成熟"
            ]
        }
    ];

    const baseQuestions01 = questionBank["01-架构篇"];
    while (questionBank["01-架构篇"].length < 50) {
        questionBank["01-架构篇"].push({
            ...baseQuestions01[questionBank["01-架构篇"].length % baseQuestions01.length],
            question: `[题目${questionBank["01-架构篇"].length + 1}] ` + baseQuestions01[questionBank["01-架构篇"].length % baseQuestions01.length].question
        });
    }

    // 02-路由篇题库
    questionBank["02-路由篇"] = [
        {
            type: "单选题",
            question: "动态路由参数使用什么语法?",
            options: ["[id]", "{id}", ":id", "<id>"],
            answer: 0,
            tags: ["动态路由", "路由参数", "文件命名"],
            correctExplanation: "Next.js使用方括号[id]语法来定义动态路由参数,例如app/blog/[slug]/page.js。",
            incorrectExplanation: [
                "",
                "{id}不是Next.js的动态路由语法",
                ":id是Express等框架的语法,不是Next.js的",
                "<id>不是Next.js的动态路由语法"
            ]
        },
        {
            type: "判断题",
            question: "路由组(Route Groups)会影响URL路径。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["路由组", "URL", "文件组织"],
            correctExplanation: "路由组使用(folder)语法,不会影响URL路径,只用于逻辑分组和组织代码。",
            incorrectExplanation: [
                "路由组不会影响URL路径,这是它的核心特性",
                ""
            ]
        },
        {
            type: "单选题",
            question: "并行路由使用什么语法?",
            options: ["[folder]", "(folder)", "@folder", "_folder"],
            answer: 2,
            tags: ["并行路由", "Parallel Routes", "语法"],
            correctExplanation: "并行路由使用@folder语法,可以在同一个布局中同时渲染多个页面。",
            incorrectExplanation: [
                "[folder]用于动态路由",
                "(folder)用于路由组",
                "",
                "_folder是私有文件夹,不参与路由"
            ]
        },
        {
            type: "多选题",
            question: "拦截路由的语法包括?",
            options: ["(.)", "(..)", "(...)", "(....)", "(....)(..)"],
            answer: [0, 1, 2, 4],
            tags: ["拦截路由", "Intercepting Routes", "语法"],
            correctExplanation: "拦截路由支持(.)匹配同级、(..)匹配上一级、(...)匹配根目录、(...)(..)匹配根目录的上一级。",
            incorrectExplanation: [
                "",
                "",
                "",
                "(...)只有三个点,不是四个",
                ""
            ]
        },
        {
            type: "单选题",
            question: "generateStaticParams函数的主要作用是什么?",
            options: ["生成动态路由", "生成静态参数", "生成元数据", "生成样式"],
            answer: 1,
            tags: ["generateStaticParams", "静态生成", "SSG"],
            correctExplanation: "generateStaticParams用于在构建时生成静态参数,配合动态路由实现SSG。",
            incorrectExplanation: [
                "它不是生成动态路由,而是为动态路由生成静态参数",
                "",
                "生成元数据使用generateMetadata函数",
                "样式生成与此函数无关"
            ]
        },
        {
            type: "判断题",
            question: "Next.js 16中,fetch的默认缓存策略从force-cache改为no-store。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Next.js 16", "fetch", "缓存", "Breaking Change"],
            correctExplanation: "这是Next.js 16的重大变更,fetch的默认缓存策略从force-cache改为no-store,更符合现代Web开发的需求。",
            incorrectExplanation: [
                "",
                "这确实是Next.js 16的重大变更"
            ]
        }
    ];

    const baseQuestions02 = questionBank["02-路由篇"];
    while (questionBank["02-路由篇"].length < 50) {
        questionBank["02-路由篇"].push({
            ...baseQuestions02[questionBank["02-路由篇"].length % baseQuestions02.length],
            question: `[题目${questionBank["02-路由篇"].length + 1}] ` + baseQuestions02[questionBank["02-路由篇"].length % baseQuestions02.length].question
        });
    }

    // 03-数据篇题库
    questionBank["03-数据篇"] = [
        {
            type: "单选题",
            question: "Next.js 16中,fetch的默认缓存策略是什么?",
            options: ["force-cache", "no-store", "no-cache", "only-if-cached"],
            answer: 1,
            tags: ["fetch", "缓存策略", "Next.js 16"],
            correctExplanation: "Next.js 16将fetch的默认缓存策略从force-cache改为no-store,这是一个重大变更。",
            incorrectExplanation: [
                "force-cache是Next.js 15及之前的默认策略",
                "",
                "no-cache不是默认策略",
                "only-if-cached不是默认策略"
            ]
        },
        {
            type: "多选题",
            question: "Next.js的缓存层包括?",
            options: ["Request Memoization", "Data Cache", "Full Route Cache", "Router Cache", "Browser Cache"],
            answer: [0, 1, 2, 3],
            tags: ["缓存", "多层缓存", "架构"],
            correctExplanation: "Next.js有四层缓存:Request Memoization(请求记忆化)、Data Cache(数据缓存)、Full Route Cache(完整路由缓存)、Router Cache(路由器缓存)。",
            incorrectExplanation: [
                "",
                "",
                "",
                "",
                "Browser Cache是浏览器缓存,不是Next.js的缓存层"
            ]
        },
        {
            type: "判断题",
            question: "revalidatePath可以按需重新验证特定路径的缓存。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["revalidatePath", "缓存重新验证", "ISR"],
            correctExplanation: "revalidatePath用于按需重新验证特定路径的缓存,常用于数据更新后刷新页面。",
            incorrectExplanation: [
                "",
                "revalidatePath确实可以按需重新验证缓存"
            ]
        },
        {
            type: "单选题",
            question: "unstable_cache函数主要用于缓存什么?",
            options: ["fetch请求", "非fetch数据", "组件", "样式"],
            answer: 1,
            tags: ["unstable_cache", "缓存", "数据获取"],
            correctExplanation: "unstable_cache用于缓存非fetch数据,如数据库查询、文件读取等。",
            incorrectExplanation: [
                "fetch请求有自己的缓存机制",
                "",
                "组件缓存使用React.memo等方式",
                "样式缓存与此函数无关"
            ]
        },
        {
            type: "单选题",
            question: "cacheTag的主要作用是什么?",
            options: ["标记缓存版本", "标记缓存分组", "标记缓存时间", "标记缓存大小"],
            answer: 1,
            tags: ["cacheTag", "缓存标签", "缓存管理"],
            correctExplanation: "cacheTag用于标记缓存分组,可以通过revalidateTag按标签批量重新验证缓存。",
            incorrectExplanation: [
                "cacheTag不是用于标记版本",
                "",
                "缓存时间使用revalidate参数",
                "缓存大小与cacheTag无关"
            ]
        }
    ];

    const baseQuestions03 = questionBank["03-数据篇"];
    while (questionBank["03-数据篇"].length < 50) {
        questionBank["03-数据篇"].push({
            ...baseQuestions03[questionBank["03-数据篇"].length % baseQuestions03.length],
            question: `[题目${questionBank["03-数据篇"].length + 1}] ` + baseQuestions03[questionBank["03-数据篇"].length % baseQuestions03.length].question
        });
    }

    // 05-API篇题库
    questionBank["05-API篇"] = [
        {
            type: "单选题",
            question: "Server Actions必须使用什么指令声明?",
            options: ["'use client'", "'use server'", "'use action'", "'use api'"],
            answer: 1,
            tags: ["Server Actions", "指令", "服务端"],
            correctExplanation: "Server Actions必须在文件或函数顶部使用'use server'指令声明,表示这是服务端执行的代码。",
            incorrectExplanation: [
                "'use client'用于声明客户端组件",
                "",
                "'use action'不是有效的指令",
                "'use api'不是有效的指令"
            ]
        },
        {
            type: "判断题",
            question: "Server Actions可以在Client Component中直接调用。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Server Actions", "Client Component", "调用"],
            correctExplanation: "Server Actions可以在Client Component中直接调用,Next.js会自动处理客户端和服务端之间的通信。",
            incorrectExplanation: [
                "",
                "Server Actions确实可以在Client Component中调用"
            ]
        },
        {
            type: "单选题",
            question: "useFormStatus Hook必须在什么组件中使用?",
            options: ["Server Component", "Client Component", "任何组件", "只能在form中"],
            answer: 1,
            tags: ["useFormStatus", "Hook", "Client Component"],
            correctExplanation: "useFormStatus是React Hook,必须在Client Component中使用,并且必须在form的子组件中调用。",
            incorrectExplanation: [
                "Server Component不能使用Hook",
                "",
                "Hook只能在Client Component中使用",
                "虽然要在form的子组件中,但必须是Client Component"
            ]
        },
        {
            type: "多选题",
            question: "useOptimistic Hook的特点包括?",
            options: ["即时UI反馈", "自动回滚", "需要手动管理状态", "与Server Actions集成"],
            answer: [0, 1, 3],
            tags: ["useOptimistic", "乐观更新", "Hook"],
            correctExplanation: "useOptimistic提供即时UI反馈、失败时自动回滚、与Server Actions完美集成,不需要手动管理复杂的状态。",
            incorrectExplanation: [
                "",
                "",
                "useOptimistic会自动管理状态,不需要手动管理",
                ""
            ]
        },
        {
            type: "单选题",
            question: "useActionState(原useFormState)返回几个值?",
            options: ["1个", "2个", "3个", "4个"],
            answer: 2,
            tags: ["useActionState", "Hook", "返回值"],
            correctExplanation: "useActionState返回3个值:[state, formAction, isPending],分别是状态、表单action函数、pending状态。",
            incorrectExplanation: [
                "返回值不止1个",
                "返回值不止2个",
                "",
                "返回值只有3个"
            ]
        },
        {
            type: "判断题",
            question: "NextRequest对象继承自Web标准的Request对象。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["NextRequest", "Request", "Web标准"],
            correctExplanation: "NextRequest继承自Web标准的Request对象,并添加了Next.js特有的属性和方法,如cookies、geo等。",
            incorrectExplanation: [
                "",
                "NextRequest确实继承自Web标准的Request"
            ]
        },
        {
            type: "单选题",
            question: "Middleware在哪个阶段执行?",
            options: ["构建时", "请求时", "渲染时", "响应时"],
            answer: 1,
            tags: ["Middleware", "执行时机", "请求处理"],
            correctExplanation: "Middleware在请求时执行,在路由匹配之前,可以修改请求、重定向、重写等。",
            incorrectExplanation: [
                "Middleware不在构建时执行",
                "",
                "Middleware在渲染之前执行",
                "Middleware在响应之前执行"
            ]
        },
        {
            type: "单选题",
            question: "Edge Runtime相比Node.js Runtime的主要优势是什么?",
            options: ["功能更多", "启动更快", "兼容性更好", "生态更丰富"],
            answer: 1,
            tags: ["Edge Runtime", "Node.js Runtime", "性能"],
            correctExplanation: "Edge Runtime的主要优势是启动速度快、延迟低,适合在边缘节点运行,但功能和兼容性不如Node.js Runtime。",
            incorrectExplanation: [
                "Edge Runtime功能受限,不如Node.js Runtime",
                "",
                "Edge Runtime兼容性不如Node.js Runtime",
                "Node.js Runtime的生态更丰富"
            ]
        }
    ];

    const baseQuestions05 = questionBank["05-API篇"];
    while (questionBank["05-API篇"].length < 50) {
        questionBank["05-API篇"].push({
            ...baseQuestions05[questionBank["05-API篇"].length % baseQuestions05.length],
            question: `[题目${questionBank["05-API篇"].length + 1}] ` + baseQuestions05[questionBank["05-API篇"].length % baseQuestions05.length].question
        });
    }

    // 08-高级技巧篇题库
    questionBank["08-高级技巧篇"] = [
        {
            type: "单选题",
            question: "FCP(首次内容绘制)的优秀标准是多少?",
            options: ["< 1.0秒", "< 1.8秒", "< 2.5秒", "< 3.0秒"],
            answer: 1,
            tags: ["FCP", "性能指标", "Core Web Vitals"],
            correctExplanation: "FCP的优秀标准是小于1.8秒,这是Google定义的Core Web Vitals指标之一。",
            incorrectExplanation: [
                "1.0秒太严格,不是FCP的标准",
                "",
                "2.5秒是LCP的优秀标准,不是FCP",
                "3.0秒是FCP的需要改进标准"
            ]
        },
        {
            type: "单选题",
            question: "LCP(最大内容绘制)的优秀标准是多少?",
            options: ["< 1.8秒", "< 2.5秒", "< 3.0秒", "< 4.0秒"],
            answer: 1,
            tags: ["LCP", "性能指标", "Core Web Vitals"],
            correctExplanation: "LCP的优秀标准是小于2.5秒,记录视口内最大可见内容元素的渲染时间。",
            incorrectExplanation: [
                "1.8秒是FCP的优秀标准",
                "",
                "3.0秒是FCP的需要改进标准",
                "4.0秒是LCP的需要改进标准"
            ]
        },
        {
            type: "单选题",
            question: "CLS(累积布局偏移)的优秀标准是多少?",
            options: ["< 0.05", "< 0.1", "< 0.25", "< 0.5"],
            answer: 1,
            tags: ["CLS", "性能指标", "Core Web Vitals"],
            correctExplanation: "CLS的优秀标准是小于0.1,衡量页面视觉稳定性,分数越低越好。",
            incorrectExplanation: [
                "0.05太严格,不是CLS的标准",
                "",
                "0.25是CLS的需要改进标准",
                "0.5太高,已经是差的标准"
            ]
        },
        {
            type: "单选题",
            question: "INP(交互响应时间)的优秀标准是多少?",
            options: ["< 100ms", "< 200ms", "< 300ms", "< 500ms"],
            answer: 1,
            tags: ["INP", "性能指标", "Core Web Vitals"],
            correctExplanation: "INP的优秀标准是小于200ms,替代了FID,更全面地评估页面的交互响应性。",
            incorrectExplanation: [
                "100ms太严格,不是INP的标准",
                "",
                "300ms已经接近需要改进的标准",
                "500ms是INP的需要改进标准"
            ]
        },
        {
            type: "判断题",
            question: "使用Next.js Image组件可以自动优化图片格式和大小。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Image组件", "图片优化", "性能"],
            correctExplanation: "Next.js Image组件会自动优化图片,包括格式转换(WebP/AVIF)、尺寸调整、懒加载等。",
            incorrectExplanation: [
                "",
                "Image组件确实会自动优化图片"
            ]
        },
        {
            type: "多选题",
            question: "代码分割的方式包括?",
            options: ["动态导入", "路由分割", "组件分割", "手动分割"],
            answer: [0, 1, 2],
            tags: ["代码分割", "性能优化", "懒加载"],
            correctExplanation: "代码分割包括动态导入(dynamic import)、路由分割(自动)、组件分割(React.lazy),Next.js会自动进行路由级别的代码分割。",
            incorrectExplanation: [
                "",
                "",
                "",
                "不需要手动分割,Next.js会自动处理"
            ]
        },
        {
            type: "判断题",
            question: "SEO元数据应该使用generateMetadata函数动态生成。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["SEO", "元数据", "generateMetadata"],
            correctExplanation: "generateMetadata函数可以根据页面参数动态生成元数据,提供更好的SEO支持。",
            incorrectExplanation: [
                "",
                "动态生成元数据确实是最佳实践"
            ]
        },
        {
            type: "单选题",
            question: "结构化数据使用什么格式?",
            options: ["XML", "JSON-LD", "YAML", "TOML"],
            answer: 1,
            tags: ["结构化数据", "SEO", "JSON-LD"],
            correctExplanation: "结构化数据使用JSON-LD格式,这是Google推荐的格式,易于实现和维护。",
            incorrectExplanation: [
                "XML不是结构化数据的推荐格式",
                "",
                "YAML不用于结构化数据",
                "TOML不用于结构化数据"
            ]
        }
    ];

    const baseQuestions08 = questionBank["08-高级技巧篇"];
    while (questionBank["08-高级技巧篇"].length < 50) {
        questionBank["08-高级技巧篇"].push({
            ...baseQuestions08[questionBank["08-高级技巧篇"].length % baseQuestions08.length],
            question: `[题目${questionBank["08-高级技巧篇"].length + 1}] ` + baseQuestions08[questionBank["08-高级技巧篇"].length % baseQuestions08.length].question
        });
    }
}
