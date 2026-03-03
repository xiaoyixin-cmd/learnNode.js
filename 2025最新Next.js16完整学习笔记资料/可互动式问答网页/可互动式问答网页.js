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

    // 解析内容自动展开（无需用户手动点击）
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
        },
        {
            type: "单选题",
            question: "React中的虚拟DOM主要解决什么问题?",
            options: ["内存泄漏", "频繁操作真实DOM性能差", "代码可读性", "安全性"],
            answer: 1,
            tags: ["React", "虚拟DOM", "性能"],
            correctExplanation: "虚拟DOM通过在内存中进行diff计算,批量更新真实DOM,避免频繁操作真实DOM导致的性能问题。",
            incorrectExplanation: [
                "虚拟DOM不是为了解决内存泄漏",
                "",
                "虚拟DOM主要是性能优化,不是为了代码可读性",
                "虚拟DOM不是为了解决安全性问题"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是React Hooks?",
            options: ["useState", "useEffect", "useContext", "useClass"],
            answer: [0, 1, 2],
            tags: ["React", "Hooks", "API"],
            correctExplanation: "useState、useEffect、useContext都是React内置的Hooks,useClass不存在。",
            incorrectExplanation: [
                "",
                "",
                "",
                "React没有useClass这个Hook"
            ]
        },
        {
            type: "单选题",
            question: "闭包的主要作用是什么?",
            options: ["提高性能", "访问外部函数的变量", "防止内存泄漏", "加密数据"],
            answer: 1,
            tags: ["JavaScript", "闭包", "作用域"],
            correctExplanation: "闭包允许内部函数访问外部函数作用域中的变量,即使外部函数已经执行完毕。",
            incorrectExplanation: [
                "闭包不是为了提高性能",
                "",
                "闭包使用不当反而可能导致内存泄漏",
                "闭包不是用于加密数据"
            ]
        },
        {
            type: "判断题",
            question: "箭头函数可以作为构造函数使用。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["JavaScript", "箭头函数", "构造函数"],
            correctExplanation: "箭头函数没有prototype属性,也没有[[Construct]]方法,不能作为构造函数使用。",
            incorrectExplanation: [
                "箭头函数不能作为构造函数",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Promise的三种状态是?",
            options: ["pending、success、error", "pending、fulfilled、rejected", "waiting、done、failed", "init、success、fail"],
            answer: 1,
            tags: ["JavaScript", "Promise", "异步"],
            correctExplanation: "Promise有三种状态:pending(进行中)、fulfilled(已成功)、rejected(已失败)。",
            incorrectExplanation: [
                "状态名称不正确",
                "",
                "状态名称不正确",
                "状态名称不正确"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是JavaScript的基本数据类型?",
            options: ["String", "Number", "Object", "Boolean", "Null", "Undefined"],
            answer: [0, 1, 3, 4, 5],
            tags: ["JavaScript", "数据类型", "基础"],
            correctExplanation: "JavaScript的基本数据类型包括String、Number、Boolean、Null、Undefined、Symbol、BigInt。Object是引用类型。",
            incorrectExplanation: [
                "",
                "",
                "Object是引用类型,不是基本数据类型",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "useEffect的清理函数什么时候执行?",
            options: ["组件挂载时", "组件卸载时", "每次渲染后", "只执行一次"],
            answer: 1,
            tags: ["React", "useEffect", "生命周期"],
            correctExplanation: "useEffect返回的清理函数在组件卸载时执行,用于清理副作用(如取消订阅、清除定时器)。",
            incorrectExplanation: [
                "清理函数不在挂载时执行",
                "",
                "清理函数不是每次渲染后执行",
                "清理函数在卸载时执行,不是只执行一次"
            ]
        },
        {
            type: "判断题",
            question: "async/await是Promise的语法糖。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["JavaScript", "async/await", "Promise"],
            correctExplanation: "async/await是基于Promise的语法糖,让异步代码看起来像同步代码,更易读。",
            incorrectExplanation: [
                "",
                "async/await确实是Promise的语法糖"
            ]
        },
        {
            type: "单选题",
            question: "什么是事件委托?",
            options: ["将事件绑定到子元素", "将事件绑定到父元素", "取消事件", "阻止事件冒泡"],
            answer: 1,
            tags: ["JavaScript", "事件委托", "DOM"],
            correctExplanation: "事件委托是利用事件冒泡,将子元素的事件监听器绑定到父元素上,减少内存占用。",
            incorrectExplanation: [
                "事件委托是绑定到父元素,不是子元素",
                "",
                "事件委托不是取消事件",
                "事件委托不是阻止冒泡"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些方法可以实现深拷贝?",
            options: ["JSON.parse(JSON.stringify())", "Object.assign()", "structuredClone()", "lodash.cloneDeep()"],
            answer: [0, 2, 3],
            tags: ["JavaScript", "深拷贝", "对象"],
            correctExplanation: "JSON.parse(JSON.stringify())、structuredClone()、lodash.cloneDeep()都可以实现深拷贝。Object.assign()只能浅拷贝。",
            incorrectExplanation: [
                "",
                "Object.assign()只能实现浅拷贝",
                "",
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
        },
        {
            type: "单选题",
            question: "在App Router中,文件夹的作用是什么?",
            options: ["定义页面", "定义路由段", "定义组件", "定义样式"],
            answer: 1,
            tags: ["App Router", "文件系统", "路由段"],
            correctExplanation: "在App Router中,文件夹定义路由段(route segment),每个文件夹代表URL中的一个路径段。",
            incorrectExplanation: [
                "页面由page.js文件定义,不是文件夹",
                "",
                "组件可以放在任何位置,不一定在路由文件夹中",
                "样式文件可以放在任何位置"
            ]
        },
        {
            type: "判断题",
            question: "layout.js在路由切换时会重新渲染。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["layout.js", "布局", "性能"],
            correctExplanation: "layout.js在路由切换时不会重新渲染,会保持状态,这是它的性能优势之一。",
            incorrectExplanation: [
                "layout.js会保持状态,不会重新渲染",
                ""
            ]
        },
        {
            type: "多选题",
            question: "App Router的特殊文件包括?",
            options: ["page.js", "layout.js", "loading.js", "error.js", "index.js"],
            answer: [0, 1, 2, 3],
            tags: ["App Router", "特殊文件", "文件约定"],
            correctExplanation: "App Router的特殊文件包括page.js、layout.js、loading.js、error.js、not-found.js、template.js等。index.js是Pages Router的约定。",
            incorrectExplanation: [
                "",
                "",
                "",
                "",
                "index.js是Pages Router的约定,不是App Router的"
            ]
        },
        {
            type: "单选题",
            question: "Server Components不能使用以下哪个特性?",
            options: ["async/await", "useState", "fetch", "数据库查询"],
            answer: 1,
            tags: ["Server Components", "限制", "React Hooks"],
            correctExplanation: "Server Components不能使用useState、useEffect等React Hooks,因为它们在服务器端执行,没有客户端状态。",
            incorrectExplanation: [
                "Server Components可以使用async/await",
                "",
                "Server Components可以使用fetch",
                "Server Components可以直接查询数据库"
            ]
        },
        {
            type: "判断题",
            question: "Client Components必须在文件顶部添加'use client'指令。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Client Components", "use client", "指令"],
            correctExplanation: "'use client'指令必须在文件顶部,任何import语句之前,用于标记该文件为Client Component。",
            incorrectExplanation: [
                "",
                "'use client'确实必须在文件顶部"
            ]
        },
        {
            type: "单选题",
            question: "not-found.js文件的触发方式是什么?",
            options: ["自动触发", "调用notFound()函数", "返回404状态码", "抛出错误"],
            answer: 1,
            tags: ["not-found.js", "404", "错误处理"],
            correctExplanation: "not-found.js通过调用next/navigation中的notFound()函数来触发,用于显示404页面。",
            incorrectExplanation: [
                "不是自动触发,需要手动调用notFound()",
                "",
                "返回404状态码不会触发not-found.js",
                "抛出错误会触发error.js,不是not-found.js"
            ]
        },
        {
            type: "多选题",
            question: "template.js和layout.js的区别包括?",
            options: ["template.js每次导航都重新渲染", "layout.js保持状态", "template.js不能嵌套", "layout.js是必需的"],
            answer: [0, 1],
            tags: ["template.js", "layout.js", "区别"],
            correctExplanation: "template.js每次导航都会重新渲染,不保持状态;layout.js在导航时保持状态。两者都可以嵌套,layout.js在根目录是必需的。",
            incorrectExplanation: [
                "",
                "",
                "template.js可以嵌套",
                "只有根layout.js是必需的,其他是可选的"
            ]
        },
        {
            type: "单选题",
            question: "Server Components可以直接访问以下哪个资源?",
            options: ["localStorage", "数据库", "window对象", "document对象"],
            answer: 1,
            tags: ["Server Components", "数据访问", "后端资源"],
            correctExplanation: "Server Components在服务器端执行,可以直接访问数据库、文件系统等后端资源,但不能访问浏览器API。",
            incorrectExplanation: [
                "localStorage是浏览器API,Server Components不能访问",
                "",
                "window对象是浏览器API,Server Components不能访问",
                "document对象是浏览器API,Server Components不能访问"
            ]
        },
        {
            type: "判断题",
            question: "Server Components的JavaScript代码会发送到客户端。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["Server Components", "性能", "JavaScript"],
            correctExplanation: "Server Components的JavaScript代码不会发送到客户端,只发送渲染结果(HTML)和RSC Payload,这大幅减少了客户端包大小。",
            incorrectExplanation: [
                "Server Components的代码不会发送到客户端",
                ""
            ]
        },
        {
            type: "单选题",
            question: "App Router中,根布局文件必须包含哪些标签?",
            options: ["<div>和<main>", "<html>和<body>", "<head>和<body>", "<header>和<footer>"],
            answer: 1,
            tags: ["layout.js", "根布局", "HTML结构"],
            correctExplanation: "根布局(app/layout.js)必须包含<html>和<body>标签,因为Next.js不会自动创建它们。",
            incorrectExplanation: [
                "<div>和<main>不是必需的",
                "",
                "<head>由Next.js自动管理,不需要手动添加",
                "<header>和<footer>是可选的"
            ]
        },
        {
            type: "多选题",
            question: "Client Components可以使用以下哪些特性?",
            options: ["useState", "useEffect", "事件处理器", "async组件"],
            answer: [0, 1, 2],
            tags: ["Client Components", "特性", "React Hooks"],
            correctExplanation: "Client Components可以使用useState、useEffect、事件处理器等所有React特性,但不能是async组件。",
            incorrectExplanation: [
                "",
                "",
                "",
                "Client Components不能是async组件,只有Server Components可以"
            ]
        },
        {
            type: "单选题",
            question: "Turbopack在Next.js 16中的状态是什么?",
            options: ["实验性", "稳定版", "已废弃", "计划中"],
            answer: 1,
            tags: ["Turbopack", "Next.js 16", "稳定性"],
            correctExplanation: "Turbopack在Next.js 16中已经是稳定版,可以在生产环境中使用。",
            incorrectExplanation: [
                "Turbopack在Next.js 15中是实验性的,但在16中已稳定",
                "",
                "Turbopack没有被废弃,而是成为默认选项",
                "Turbopack已经发布,不是计划中"
            ]
        },
        {
            type: "判断题",
            question: "error.js可以捕获layout.js中的错误。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["error.js", "layout.js", "错误处理"],
            correctExplanation: "error.js不能捕获同级layout.js中的错误,只能捕获子组件的错误。要捕获layout.js的错误,需要在父级添加error.js。",
            incorrectExplanation: [
                "error.js不能捕获同级layout.js的错误",
                ""
            ]
        },
        {
            type: "单选题",
            question: "loading.js会自动包裹哪个组件?",
            options: ["layout.js", "page.js", "error.js", "template.js"],
            answer: 1,
            tags: ["loading.js", "Suspense", "自动包裹"],
            correctExplanation: "loading.js会自动用Suspense包裹page.js,在页面加载时显示加载状态。",
            incorrectExplanation: [
                "loading.js不包裹layout.js",
                "",
                "loading.js不包裹error.js",
                "loading.js不包裹template.js"
            ]
        },
        {
            type: "多选题",
            question: "Server Components的性能优势包括?",
            options: ["减少客户端JavaScript 40-60%", "首屏TTFB提升50%", "更好的SEO", "减少服务器压力"],
            answer: [0, 1, 2],
            tags: ["Server Components", "性能", "优势"],
            correctExplanation: "Server Components可以减少客户端JavaScript 40-60%、首屏TTFB提升50%、更好的SEO,但会增加服务器压力。",
            incorrectExplanation: [
                "",
                "",
                "",
                "Server Components会增加服务器压力,不是减少"
            ]
        },
        {
            type: "单选题",
            question: "在App Router中,哪个文件用于定义全局错误处理?",
            options: ["error.js", "global-error.js", "_error.js", "500.js"],
            answer: 1,
            tags: ["global-error.js", "错误处理", "全局"],
            correctExplanation: "global-error.js用于定义全局错误处理,可以捕获根layout.js中的错误。",
            incorrectExplanation: [
                "error.js是路由段级的错误处理",
                "",
                "_error.js是Pages Router的约定",
                "500.js是Pages Router的约定"
            ]
        },
        {
            type: "判断题",
            question: "Server Components可以导入Client Components。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Server Components", "Client Components", "组件组合"],
            correctExplanation: "Server Components可以导入并渲染Client Components,这是常见的组合模式。",
            incorrectExplanation: [
                "",
                "Server Components确实可以导入Client Components"
            ]
        },
        {
            type: "单选题",
            question: "Client Components不能导入Server Components,应该如何传递?",
            options: ["直接导入", "通过props传递", "通过Context传递", "不能传递"],
            answer: 1,
            tags: ["Client Components", "Server Components", "组件组合"],
            correctExplanation: "Client Components不能直接导入Server Components,但可以通过props.children等方式接收Server Components作为子组件。",
            incorrectExplanation: [
                "不能直接导入",
                "",
                "Context不适合传递组件",
                "可以通过props传递"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些文件必须是Client Component?",
            options: ["error.js", "loading.js", "page.js", "global-error.js"],
            answer: [0, 3],
            tags: ["Client Component", "文件约定", "必需"],
            correctExplanation: "error.js和global-error.js必须是Client Component,因为它们需要使用useState等客户端特性。loading.js和page.js可以是Server Component。",
            incorrectExplanation: [
                "",
                "loading.js可以是Server Component",
                "page.js可以是Server Component",
                ""
            ]
        },
        {
            type: "单选题",
            question: "App Router的文件系统路由中,文件夹名称用什么包裹表示路由组?",
            options: ["[]", "()", "{}", "<>"],
            answer: 1,
            tags: ["路由组", "文件命名", "约定"],
            correctExplanation: "路由组使用圆括号()包裹文件夹名称,如(marketing),不会影响URL路径。",
            incorrectExplanation: [
                "[]用于动态路由",
                "",
                "{}不是Next.js的约定",
                "<>不是Next.js的约定"
            ]
        },
        {
            type: "判断题",
            question: "Pages Router和App Router可以在同一个项目中共存。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Pages Router", "App Router", "共存"],
            correctExplanation: "Pages Router和App Router可以在同一个项目中共存,支持渐进式迁移。",
            incorrectExplanation: [
                "",
                "两者确实可以共存"
            ]
        },
        {
            type: "单选题",
            question: "Server Components在什么时候执行?",
            options: ["客户端渲染时", "构建时或请求时", "用户交互时", "页面卸载时"],
            answer: 1,
            tags: ["Server Components", "执行时机", "渲染"],
            correctExplanation: "Server Components在构建时(静态渲染)或请求时(动态渲染)在Node.js服务器上执行。",
            incorrectExplanation: [
                "Server Components在服务器端执行,不是客户端",
                "",
                "Server Components不响应用户交互",
                "Server Components不在页面卸载时执行"
            ]
        },
        {
            type: "多选题",
            question: "App Router相比Pages Router的优势包括?",
            options: ["更好的性能", "流式渲染", "细粒度控制", "更简单的学习曲线"],
            answer: [0, 1, 2],
            tags: ["App Router", "Pages Router", "优势"],
            correctExplanation: "App Router提供更好的性能、流式渲染、细粒度控制(loading、error、layout),但学习曲线稍陡。",
            incorrectExplanation: [
                "",
                "",
                "",
                "App Router的学习曲线比Pages Router稍陡"
            ]
        },
        {
            type: "单选题",
            question: "RSC Payload是什么?",
            options: ["React组件", "服务器响应数据格式", "CSS文件", "JavaScript包"],
            answer: 1,
            tags: ["RSC", "Server Components", "数据格式"],
            correctExplanation: "RSC Payload是React Server Components的特殊数据格式,包含渲染结果和客户端水合所需的信息。",
            incorrectExplanation: [
                "RSC Payload不是React组件",
                "",
                "RSC Payload不是CSS文件",
                "RSC Payload不是JavaScript包"
            ]
        },
        {
            type: "判断题",
            question: "Turbopack支持所有Webpack插件。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["Turbopack", "Webpack", "插件"],
            correctExplanation: "Turbopack不支持所有Webpack插件,它有自己的插件系统,但提供了一些常用插件的兼容。",
            incorrectExplanation: [
                "Turbopack不支持所有Webpack插件",
                ""
            ]
        },
        {
            type: "单选题",
            question: "在App Router中,metadata对象用于什么?",
            options: ["定义组件状态", "定义SEO元数据", "定义样式", "定义路由"],
            answer: 1,
            tags: ["metadata", "SEO", "元数据"],
            correctExplanation: "metadata对象用于定义页面的SEO元数据,如title、description、keywords等。",
            incorrectExplanation: [
                "metadata不用于定义组件状态",
                "",
                "metadata不用于定义样式",
                "metadata不用于定义路由"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是Server Components的限制?",
            options: ["不能使用useState", "不能使用事件处理器", "不能访问浏览器API", "不能使用async/await"],
            answer: [0, 1, 2],
            tags: ["Server Components", "限制", "约束"],
            correctExplanation: "Server Components不能使用useState、事件处理器、浏览器API,但可以使用async/await。",
            incorrectExplanation: [
                "",
                "",
                "",
                "Server Components可以使用async/await"
            ]
        },
        {
            type: "单选题",
            question: "streaming渲染的主要优势是什么?",
            options: ["减少内存使用", "更快的首屏显示", "更好的SEO", "更小的包体积"],
            answer: 1,
            tags: ["streaming", "流式渲染", "性能"],
            correctExplanation: "streaming渲染允许服务器逐步发送HTML,用户可以更快看到首屏内容,提升感知性能。",
            incorrectExplanation: [
                "streaming主要优势不是减少内存使用",
                "",
                "streaming对SEO的影响有限",
                "streaming不影响包体积"
            ]
        },
        {
            type: "判断题",
            question: "App Router中,page.js是可选的。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["page.js", "必需", "文件约定"],
            correctExplanation: "page.js是必需的,只有包含page.js的路由段才能被公开访问。",
            incorrectExplanation: [
                "page.js是必需的,没有它路由不可访问",
                ""
            ]
        },
        {
            type: "单选题",
            question: "在Server Components中,如何处理用户输入?",
            options: ["使用useState", "使用Server Actions", "使用useEffect", "使用事件处理器"],
            answer: 1,
            tags: ["Server Components", "Server Actions", "用户输入"],
            correctExplanation: "Server Components使用Server Actions来处理用户输入和表单提交。",
            incorrectExplanation: [
                "Server Components不能使用useState",
                "",
                "Server Components不能使用useEffect",
                "Server Components不能使用事件处理器"
            ]
        },
        {
            type: "多选题",
            question: "layout.js可以定义哪些内容?",
            options: ["共享UI", "metadata", "字体加载", "路由参数"],
            answer: [0, 1, 2],
            tags: ["layout.js", "功能", "用途"],
            correctExplanation: "layout.js可以定义共享UI、metadata、字体加载等,但不能定义路由参数。",
            incorrectExplanation: [
                "",
                "",
                "",
                "路由参数由动态路由定义,不是layout.js"
            ]
        },
        {
            type: "单选题",
            question: "Client Components的水合(hydration)发生在什么时候?",
            options: ["构建时", "服务器渲染时", "客户端加载时", "用户交互时"],
            answer: 2,
            tags: ["Client Components", "hydration", "水合"],
            correctExplanation: "Client Components的水合发生在客户端加载时,将服务器渲染的HTML转换为可交互的React组件。",
            incorrectExplanation: [
                "水合不发生在构建时",
                "水合不发生在服务器渲染时",
                "",
                "水合在页面加载时就开始,不等用户交互"
            ]
        },
        {
            type: "判断题",
            question: "App Router支持并行路由(Parallel Routes)。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["App Router", "并行路由", "高级特性"],
            correctExplanation: "App Router支持并行路由,使用@folder语法可以在同一个布局中同时渲染多个页面。",
            incorrectExplanation: [
                "",
                "App Router确实支持并行路由"
            ]
        },
        {
            type: "单选题",
            question: "在App Router中,如何实现路由拦截?",
            options: ["使用middleware", "使用(.)语法", "使用redirect", "使用rewrite"],
            answer: 1,
            tags: ["拦截路由", "Intercepting Routes", "语法"],
            correctExplanation: "路由拦截使用(.)、(..)、(...)等语法,可以在当前布局中拦截并显示其他路由的内容。",
            incorrectExplanation: [
                "middleware用于请求拦截,不是路由拦截",
                "",
                "redirect用于重定向,不是路由拦截",
                "rewrite用于URL重写,不是路由拦截"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些场景应该使用Client Components?",
            options: ["需要useState", "需要事件处理", "需要访问localStorage", "需要查询数据库"],
            answer: [0, 1, 2],
            tags: ["Client Components", "使用场景", "选择"],
            correctExplanation: "需要useState、事件处理、localStorage等客户端特性时应使用Client Components。查询数据库应在Server Components中进行。",
            incorrectExplanation: [
                "",
                "",
                "",
                "查询数据库应在Server Components中进行"
            ]
        },
        {
            type: "单选题",
            question: "App Router的默认缓存策略是什么?",
            options: ["不缓存", "缓存所有请求", "智能缓存", "手动控制"],
            answer: 2,
            tags: ["缓存", "默认行为", "性能"],
            correctExplanation: "App Router使用智能缓存策略,根据请求类型和配置自动决定是否缓存。",
            incorrectExplanation: [
                "App Router有默认缓存",
                "不是缓存所有请求",
                "",
                "虽然可以手动控制,但有默认策略"
            ]
        },
        {
            type: "判断题",
            question: "Server Components可以使用Context API。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["Server Components", "Context API", "限制"],
            correctExplanation: "Server Components不能使用Context API,因为Context需要客户端状态。如需使用Context,应在Client Components中。",
            incorrectExplanation: [
                "Server Components不能使用Context API",
                ""
            ]
        },
        {
            type: "单选题",
            question: "在Next.js 16中,默认的开发服务器使用什么?",
            options: ["Webpack", "Turbopack", "Vite", "esbuild"],
            answer: 1,
            tags: ["Turbopack", "Next.js 16", "开发服务器"],
            correctExplanation: "Next.js 16默认使用Turbopack作为开发服务器,提供更快的编译速度。",
            incorrectExplanation: [
                "Webpack是旧版本的默认选项",
                "",
                "Vite不是Next.js的默认选项",
                "esbuild用于生产构建,不是开发服务器"
            ]
        }
    ];

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
        },
        {
            type: "单选题",
            question: "catch-all路由使用什么语法?",
            options: ["[id]", "[...slug]", "[[...slug]]", "*"],
            answer: 1,
            tags: ["catch-all", "动态路由", "语法"],
            correctExplanation: "catch-all路由使用[...slug]语法,可以匹配所有后续路径段,slug会是一个数组。",
            incorrectExplanation: [
                "[id]是单个动态参数",
                "",
                "[[...slug]]是可选catch-all路由",
                "*不是Next.js的路由语法"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是Next.js 16中params的特性?",
            options: ["是Promise类型", "需要await解析", "可以直接访问", "是同步的"],
            answer: [0, 1],
            tags: ["params", "Next.js 16", "异步"],
            correctExplanation: "Next.js 16中,params是Promise类型,需要使用await解析,这是为了支持PPR和更好的性能优化。",
            incorrectExplanation: [
                "",
                "",
                "params不能直接访问,必须await",
                "params是异步的,不是同步的"
            ]
        },
        {
            type: "单选题",
            question: "可选catch-all路由[[...slug]]和catch-all路由[...slug]的区别是什么?",
            options: ["语法不同", "可选catch-all可以匹配根路径", "性能不同", "没有区别"],
            answer: 1,
            tags: ["可选catch-all", "catch-all", "区别"],
            correctExplanation: "可选catch-all路由[[...slug]]可以匹配根路径(slug为空数组),而[...slug]不能匹配根路径。",
            incorrectExplanation: [
                "语法不同是表象,核心区别是匹配范围",
                "",
                "性能没有区别",
                "两者有明显区别"
            ]
        },
        {
            type: "判断题",
            question: "路由组(Route Groups)的名称会出现在URL中。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["路由组", "URL", "命名"],
            correctExplanation: "路由组使用(folder)语法,名称不会出现在URL中,只用于逻辑分组和代码组织。",
            incorrectExplanation: [
                "路由组名称不会出现在URL中",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Link组件的prefetch属性默认值是什么?",
            options: ["true", "false", "null", "auto"],
            answer: 0,
            tags: ["Link", "prefetch", "预加载"],
            correctExplanation: "Link组件的prefetch属性默认为true,会在视口中的链接自动预加载,提升导航速度。",
            incorrectExplanation: [
                "",
                "默认值是true,不是false",
                "默认值是true,不是null",
                "没有auto选项"
            ]
        },
        {
            type: "多选题",
            question: "useRouter hook提供哪些导航方法?",
            options: ["push", "replace", "back", "forward", "refresh"],
            answer: [0, 1, 2, 3, 4],
            tags: ["useRouter", "导航", "客户端"],
            correctExplanation: "useRouter提供push、replace、back、forward、refresh等导航方法,用于客户端路由控制。",
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
            question: "usePathname hook返回什么?",
            options: ["完整URL", "当前路径名", "查询参数", "路由参数"],
            answer: 1,
            tags: ["usePathname", "路径", "hook"],
            correctExplanation: "usePathname返回当前路径名,如/blog/post-1,不包含域名和查询参数。",
            incorrectExplanation: [
                "usePathname不返回完整URL",
                "",
                "查询参数由useSearchParams返回",
                "路由参数由useParams返回"
            ]
        },
        {
            type: "判断题",
            question: "useSearchParams hook只能在Client Component中使用。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["useSearchParams", "Client Component", "限制"],
            correctExplanation: "useSearchParams是客户端hook,只能在Client Component中使用。Server Component应使用searchParams prop。",
            incorrectExplanation: [
                "",
                "useSearchParams确实只能在Client Component中使用"
            ]
        },
        {
            type: "单选题",
            question: "redirect函数应该在哪里调用?",
            options: ["Client Component", "Server Component或Server Action", "middleware", "任何地方"],
            answer: 1,
            tags: ["redirect", "服务端", "导航"],
            correctExplanation: "redirect函数应该在Server Component、Server Action或Route Handler中调用,用于服务端重定向。",
            incorrectExplanation: [
                "redirect不能在Client Component中调用",
                "",
                "middleware使用NextResponse.redirect",
                "redirect有使用限制"
            ]
        },
        {
            type: "多选题",
            question: "并行路由的优势包括?",
            options: ["独立加载状态", "独立错误处理", "并发渲染", "影响URL结构"],
            answer: [0, 1, 2],
            tags: ["并行路由", "优势", "性能"],
            correctExplanation: "并行路由提供独立的加载状态、错误处理和并发渲染,但不影响URL结构。",
            incorrectExplanation: [
                "",
                "",
                "",
                "并行路由不影响URL结构"
            ]
        },
        {
            type: "单选题",
            question: "拦截路由的(.)符号表示什么?",
            options: ["拦截根路由", "拦截同级路由", "拦截上一级路由", "拦截下一级路由"],
            answer: 1,
            tags: ["拦截路由", "符号", "语法"],
            correctExplanation: "(.)表示拦截同级路由,(..)表示上一级,(...)表示根路由。",
            incorrectExplanation: [
                "(...)表示拦截根路由",
                "",
                "(..)表示拦截上一级路由",
                "没有拦截下一级的概念"
            ]
        },
        {
            type: "判断题",
            question: "拦截路由在硬导航(刷新页面)时会被拦截。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["拦截路由", "硬导航", "行为"],
            correctExplanation: "拦截路由只在软导航(客户端导航)时生效,硬导航会直接访问目标路由。",
            incorrectExplanation: [
                "拦截路由在硬导航时不会被拦截",
                ""
            ]
        },
        {
            type: "单选题",
            question: "私有文件夹使用什么前缀?",
            options: ["@", "()", "_", "."],
            answer: 2,
            tags: ["私有文件夹", "命名约定", "文件组织"],
            correctExplanation: "私有文件夹使用下划线_前缀,如_components,不会参与路由。",
            incorrectExplanation: [
                "@用于并行路由",
                "()用于路由组",
                "",
                ".用于拦截路由"
            ]
        },
        {
            type: "多选题",
            question: "路由匹配的优先级从高到低是?",
            options: ["静态路由", "动态路由", "catch-all路由", "可选catch-all路由"],
            answer: [0, 1, 2, 3],
            tags: ["路由优先级", "匹配规则", "顺序"],
            correctExplanation: "路由匹配优先级:静态路由 > 动态路由 > catch-all路由 > 可选catch-all路由。",
            incorrectExplanation: [
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "permanentRedirect和redirect的区别是什么?",
            options: ["没有区别", "HTTP状态码不同", "使用场景相同", "性能不同"],
            answer: 1,
            tags: ["permanentRedirect", "redirect", "HTTP状态码"],
            correctExplanation: "permanentRedirect返回308状态码(永久重定向),redirect返回307状态码(临时重定向)。",
            incorrectExplanation: [
                "两者有明显区别",
                "",
                "使用场景不同:永久重定向vs临时重定向",
                "性能差异不大,主要是语义不同"
            ]
        },
        {
            type: "判断题",
            question: "并行路由必须配合default.js文件使用。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["并行路由", "default.js", "必需"],
            correctExplanation: "default.js不是必需的,但强烈推荐使用,用于处理插槽没有匹配内容的情况。",
            incorrectExplanation: [
                "default.js不是必需的,但推荐使用",
                ""
            ]
        },
        {
            type: "单选题",
            question: "在Next.js 16中,如何在Server Component中访问searchParams?",
            options: ["使用useSearchParams", "通过props接收", "使用window.location", "使用useParams"],
            answer: 1,
            tags: ["searchParams", "Server Component", "访问方式"],
            correctExplanation: "Server Component通过props接收searchParams,且需要await解析。useSearchParams只能在Client Component中使用。",
            incorrectExplanation: [
                "useSearchParams只能在Client Component中使用",
                "",
                "Server Component不能访问window对象",
                "useParams用于访问路由参数,不是查询参数"
            ]
        },
        {
            type: "多选题",
            question: "generateStaticParams的作用包括?",
            options: ["在构建时生成静态页面", "提升性能", "减少服务器压力", "实现CSR"],
            answer: [0, 1, 2],
            tags: ["generateStaticParams", "SSG", "性能"],
            correctExplanation: "generateStaticParams用于在构建时生成静态页面,提升性能并减少服务器压力,实现SSG而非CSR。",
            incorrectExplanation: [
                "",
                "",
                "",
                "generateStaticParams实现SSG,不是CSR"
            ]
        },
        {
            type: "单选题",
            question: "动态路由参数在URL中如何编码特殊字符?",
            options: ["不需要编码", "使用encodeURIComponent", "使用btoa", "使用JSON.stringify"],
            answer: 1,
            tags: ["URL编码", "特殊字符", "动态路由"],
            correctExplanation: "特殊字符需要使用encodeURIComponent进行URL编码,解码时使用decodeURIComponent。",
            incorrectExplanation: [
                "特殊字符必须编码",
                "",
                "btoa用于Base64编码,不是URL编码",
                "JSON.stringify用于序列化对象,不是URL编码"
            ]
        },
        {
            type: "判断题",
            question: "路由组可以嵌套使用。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["路由组", "嵌套", "组织"],
            correctExplanation: "路由组可以任意嵌套,用于更细粒度的代码组织和布局管理。",
            incorrectExplanation: [
                "",
                "路由组确实可以嵌套"
            ]
        },
        {
            type: "单选题",
            question: "拦截路由最适合实现什么功能?",
            options: ["页面跳转", "模态框", "表单验证", "数据缓存"],
            answer: 1,
            tags: ["拦截路由", "模态框", "使用场景"],
            correctExplanation: "拦截路由最适合实现模态框、图片预览等需要保持上下文的UI,同时保持URL可分享性。",
            incorrectExplanation: [
                "普通页面跳转不需要拦截路由",
                "",
                "表单验证与拦截路由无关",
                "数据缓存与拦截路由无关"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些hook必须在Client Component中使用?",
            options: ["useRouter", "usePathname", "useSearchParams", "useParams"],
            answer: [0, 1, 2, 3],
            tags: ["Client Component", "hooks", "限制"],
            correctExplanation: "所有路由相关的hooks(useRouter、usePathname、useSearchParams、useParams)都必须在Client Component中使用。",
            incorrectExplanation: [
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "并行路由的插槽在layout中如何接收?",
            options: ["通过props", "通过context", "通过全局变量", "自动注入"],
            answer: 0,
            tags: ["并行路由", "插槽", "props"],
            correctExplanation: "并行路由的插槽通过props传递给layout,如@analytics、@team等。",
            incorrectExplanation: [
                "",
                "不通过context传递",
                "不使用全局变量",
                "需要在layout的props中显式接收"
            ]
        },
        {
            type: "判断题",
            question: "动态路由参数可以包含多个段,如[category]/[id]。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["动态路由", "多参数", "嵌套"],
            correctExplanation: "动态路由可以包含多个参数段,如app/products/[category]/[id]/page.js。",
            incorrectExplanation: [
                "",
                "动态路由确实可以包含多个参数段"
            ]
        },
        {
            type: "单选题",
            question: "Link组件的replace属性的作用是什么?",
            options: ["替换当前页面", "替换历史记录", "替换URL参数", "替换组件"],
            answer: 1,
            tags: ["Link", "replace", "历史记录"],
            correctExplanation: "replace属性为true时,会替换当前历史记录而不是添加新记录,用户无法通过后退按钮返回。",
            incorrectExplanation: [
                "不是替换页面内容",
                "",
                "不是替换URL参数",
                "不是替换组件"
            ]
        },
        {
            type: "多选题",
            question: "路由组的使用场景包括?",
            options: ["多布局应用", "团队协作", "权限分组", "影响URL结构"],
            answer: [0, 1, 2],
            tags: ["路由组", "使用场景", "应用"],
            correctExplanation: "路由组适用于多布局应用、团队协作、权限分组等场景,但不影响URL结构。",
            incorrectExplanation: [
                "",
                "",
                "",
                "路由组不影响URL结构"
            ]
        },
        {
            type: "单选题",
            question: "拦截路由的(...)符号表示什么?",
            options: ["拦截同级", "拦截上一级", "拦截根路由", "拦截所有"],
            answer: 2,
            tags: ["拦截路由", "根路由", "符号"],
            correctExplanation: "(...)表示从app根目录开始拦截路由。",
            incorrectExplanation: [
                "(.)表示拦截同级",
                "(..)表示拦截上一级",
                "",
                "没有拦截所有的概念"
            ]
        },
        {
            type: "判断题",
            question: "useRouter的push方法会刷新页面。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["useRouter", "push", "客户端导航"],
            correctExplanation: "useRouter的push方法是客户端导航,不会刷新页面,只更新URL和渲染新内容。",
            incorrectExplanation: [
                "push是客户端导航,不会刷新页面",
                ""
            ]
        },
        {
            type: "单选题",
            question: "在Next.js中,如何实现路由参数验证?",
            options: ["使用中间件", "使用Zod等验证库", "使用TypeScript", "以上都可以"],
            answer: 3,
            tags: ["参数验证", "路由", "最佳实践"],
            correctExplanation: "可以使用中间件、Zod等验证库或TypeScript类型系统来验证路由参数,推荐组合使用。",
            incorrectExplanation: [
                "中间件可以,但不是唯一方式",
                "验证库可以,但不是唯一方式",
                "TypeScript可以,但不是唯一方式",
                ""
            ]
        },
        {
            type: "多选题",
            question: "并行路由的每个插槽可以有哪些独立文件?",
            options: ["loading.js", "error.js", "not-found.js", "layout.js"],
            answer: [0, 1, 2, 3],
            tags: ["并行路由", "插槽", "文件"],
            correctExplanation: "并行路由的每个插槽都可以有独立的loading.js、error.js、not-found.js、layout.js等文件。",
            incorrectExplanation: [
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "catch-all路由[...slug]匹配的参数类型是什么?",
            options: ["string", "string[]", "object", "any"],
            answer: 1,
            tags: ["catch-all", "参数类型", "数组"],
            correctExplanation: "catch-all路由的参数是string[],包含所有匹配的路径段。",
            incorrectExplanation: [
                "不是单个字符串,是数组",
                "",
                "不是对象",
                "有明确的类型"
            ]
        },
        {
            type: "判断题",
            question: "拦截路由和目标路由必须有相同的内容。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["拦截路由", "目标路由", "内容"],
            correctExplanation: "拦截路由和目标路由可以有不同的内容,但建议保持一致以提供良好的用户体验。",
            incorrectExplanation: [
                "不必须相同,但建议一致",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Link组件的scroll属性默认值是什么?",
            options: ["true", "false", "auto", "smooth"],
            answer: 0,
            tags: ["Link", "scroll", "滚动行为"],
            correctExplanation: "Link组件的scroll属性默认为true,导航后会滚动到页面顶部。设为false可保持滚动位置。",
            incorrectExplanation: [
                "",
                "默认值是true",
                "没有auto选项",
                "smooth是CSS属性,不是scroll的值"
            ]
        },
        {
            type: "多选题",
            question: "路由优先级考虑的因素包括?",
            options: ["静态vs动态", "路由深度", "文件创建时间", "路由类型"],
            answer: [0, 3],
            tags: ["路由优先级", "匹配规则", "因素"],
            correctExplanation: "路由优先级主要考虑静态vs动态、路由类型(普通/catch-all/可选catch-all),不考虑深度和创建时间。",
            incorrectExplanation: [
                "",
                "路由深度不影响优先级",
                "文件创建时间不影响优先级",
                ""
            ]
        },
        {
            type: "单选题",
            question: "在并行路由中,如果某个插槽没有匹配的内容会怎样?",
            options: ["报错", "渲染null", "使用default.js", "使用default.js或渲染null"],
            answer: 3,
            tags: ["并行路由", "default.js", "回退"],
            correctExplanation: "如果插槽没有匹配内容,会先尝试使用default.js,如果default.js也不存在,则渲染null。",
            incorrectExplanation: [
                "不会报错",
                "会先尝试default.js",
                "如果default.js不存在,才渲染null",
                ""
            ]
        },
        {
            type: "判断题",
            question: "私有文件夹_folder会参与路由匹配。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["私有文件夹", "路由", "命名约定"],
            correctExplanation: "私有文件夹(以_开头)不会参与路由匹配,用于组织组件、工具函数等非路由文件。",
            incorrectExplanation: [
                "私有文件夹不参与路由匹配",
                ""
            ]
        }
    ];

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
        },
        {
            type: "判断题",
            question: "Request Memoization只在单次渲染周期内有效。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Request Memoization", "请求去重", "缓存层级"],
            correctExplanation: "Request Memoization是最底层的缓存,只在单次渲染周期内自动去重相同请求,渲染结束后立即清除。",
            incorrectExplanation: [
                "",
                "Request Memoization确实只在单次渲染周期内有效"
            ]
        },
        {
            type: "多选题",
            question: "fetch缓存策略包括哪些选项?",
            options: ["force-cache", "no-store", "no-cache", "only-if-cached", "reload"],
            answer: [0, 1, 2, 3, 4],
            tags: ["fetch", "缓存策略", "选项"],
            correctExplanation: "fetch支持force-cache、no-store、no-cache、only-if-cached、reload等缓存策略。",
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
            question: "revalidateTag函数应该在哪里调用?",
            options: ["Client Component", "Server Action", "浏览器控制台", "任何地方"],
            answer: 1,
            tags: ["revalidateTag", "Server Action", "缓存重新验证"],
            correctExplanation: "revalidateTag必须在Server Action或Route Handler中调用,不能在Client Component中使用。",
            incorrectExplanation: [
                "revalidateTag不能在Client Component中调用",
                "",
                "不能在浏览器控制台调用",
                "revalidateTag有使用限制"
            ]
        },
        {
            type: "单选题",
            question: "Next.js的Data Cache生命周期是?",
            options: ["单次渲染", "跨请求持久化", "会话期间", "页面刷新后清除"],
            answer: 1,
            tags: ["Data Cache", "缓存生命周期", "持久化"],
            correctExplanation: "Data Cache是跨请求持久化的,根据配置的策略决定何时过期或重新验证。",
            incorrectExplanation: [
                "单次渲染是Request Memoization的生命周期",
                "",
                "会话期间是Router Cache的生命周期",
                "Data Cache不会在页面刷新后清除"
            ]
        },
        {
            type: "判断题",
            question: "Next.js的fetch扩展只在服务端组件中生效。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["fetch", "Server Component", "限制"],
            correctExplanation: "Next.js的fetch扩展(如next.revalidate、next.tags)只在服务端环境中生效,客户端使用原生fetch。",
            incorrectExplanation: [
                "",
                "fetch扩展确实只在服务端组件中生效"
            ]
        },
        {
            type: "多选题",
            question: "revalidatePath的type参数可以是?",
            options: ["page", "layout", "component", "route"],
            answer: [0, 1],
            tags: ["revalidatePath", "type参数", "路径类型"],
            correctExplanation: "revalidatePath的type参数可以是'page'(精确匹配)或'layout'(前缀匹配)。",
            incorrectExplanation: [
                "",
                "",
                "component不是有效的type值",
                "route不是有效的type值"
            ]
        },
        {
            type: "单选题",
            question: "并行数据获取应该使用什么方法?",
            options: ["await依次调用", "Promise.all", "Promise.race", "async/await循环"],
            answer: 1,
            tags: ["并行数据获取", "Promise.all", "性能优化"],
            correctExplanation: "并行数据获取应使用Promise.all同时发起多个请求,避免串行等待,提升性能。",
            incorrectExplanation: [
                "await依次调用是串行,不是并行",
                "",
                "Promise.race只返回最快的结果,不适合并行获取",
                "async/await循环是串行执行"
            ]
        },
        {
            type: "判断题",
            question: "unstable_cache可以缓存数据库查询结果。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["unstable_cache", "数据库", "缓存"],
            correctExplanation: "unstable_cache专门用于缓存非fetch数据,如数据库查询、文件读取等操作的结果。",
            incorrectExplanation: [
                "",
                "unstable_cache确实可以缓存数据库查询"
            ]
        },
        {
            type: "单选题",
            question: "fetch请求去重的判断标准不包括?",
            options: ["URL完全相同", "请求方法相同", "请求头相同", "在同一渲染周期"],
            answer: 2,
            tags: ["请求去重", "判断标准", "Request Memoization"],
            correctExplanation: "请求去重的判断标准是URL完全相同、请求方法相同、在同一渲染周期内,不考虑请求头。",
            incorrectExplanation: [
                "URL完全相同是判断标准之一",
                "请求方法相同是判断标准之一",
                "",
                "在同一渲染周期是判断标准之一"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是有效的缓存重新验证方式?",
            options: ["基于时间(revalidate)", "按需(revalidateTag)", "按路径(revalidatePath)", "手动刷新"],
            answer: [0, 1, 2],
            tags: ["缓存重新验证", "ISR", "方式"],
            correctExplanation: "Next.js支持基于时间、按需标签、按路径三种缓存重新验证方式。手动刷新不是程序化的重新验证方式。",
            incorrectExplanation: [
                "",
                "",
                "",
                "手动刷新不是程序化的重新验证方式"
            ]
        },
        {
            type: "单选题",
            question: "Full Route Cache缓存的是什么?",
            options: ["数据", "整个路由的渲染结果", "组件", "样式"],
            answer: 1,
            tags: ["Full Route Cache", "路由缓存", "渲染结果"],
            correctExplanation: "Full Route Cache缓存整个路由的渲染结果(HTML和RSC Payload),用于静态页面优化。",
            incorrectExplanation: [
                "数据由Data Cache缓存",
                "",
                "组件不单独缓存",
                "样式不由此缓存"
            ]
        },
        {
            type: "判断题",
            question: "Router Cache是服务端缓存。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["Router Cache", "客户端缓存", "位置"],
            correctExplanation: "Router Cache是客户端缓存,存储在浏览器中,用于缓存已访问的路由段。",
            incorrectExplanation: [
                "Router Cache是客户端缓存,不是服务端",
                ""
            ]
        },
        {
            type: "单选题",
            question: "revalidate: 0的效果等同于?",
            options: ["force-cache", "no-store", "no-cache", "永久缓存"],
            answer: 1,
            tags: ["revalidate", "no-store", "缓存策略"],
            correctExplanation: "revalidate: 0表示不缓存,效果等同于cache: 'no-store'。",
            incorrectExplanation: [
                "force-cache是永久缓存",
                "",
                "no-cache会验证缓存",
                "永久缓存使用force-cache"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些数据适合使用force-cache策略?",
            options: ["博客文章", "产品目录", "用户个人信息", "实时股票价格"],
            answer: [0, 1],
            tags: ["force-cache", "适用场景", "静态内容"],
            correctExplanation: "博客文章、产品目录等静态或很少变化的内容适合使用force-cache永久缓存。",
            incorrectExplanation: [
                "",
                "",
                "用户个人信息应使用no-store",
                "实时数据应使用no-store"
            ]
        },
        {
            type: "单选题",
            question: "串行数据获取的缺点是?",
            options: ["代码复杂", "性能差", "内存占用高", "不安全"],
            answer: 1,
            tags: ["串行数据获取", "性能", "缺点"],
            correctExplanation: "串行数据获取需要等待前一个请求完成才能发起下一个,总时间是所有请求时间之和,性能较差。",
            incorrectExplanation: [
                "串行代码相对简单",
                "",
                "内存占用与串行并行关系不大",
                "安全性与串行并行无关"
            ]
        },
        {
            type: "判断题",
            question: "next.tags可以为fetch请求添加多个标签。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["next.tags", "缓存标签", "多标签"],
            correctExplanation: "next.tags接受字符串数组,可以为一个fetch请求添加多个标签,方便分组管理。",
            incorrectExplanation: [
                "",
                "next.tags确实可以添加多个标签"
            ]
        },
        {
            type: "单选题",
            question: "缓存标签的命名最佳实践是?",
            options: ["使用数字", "使用有意义的描述性名称", "使用随机字符串", "使用中文"],
            answer: 1,
            tags: ["缓存标签", "命名规范", "最佳实践"],
            correctExplanation: "缓存标签应使用有意义的描述性名称,如'posts'、'user-123',便于理解和维护。",
            incorrectExplanation: [
                "纯数字不够描述性",
                "",
                "随机字符串无法维护",
                "建议使用英文,更通用"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些操作会触发缓存重新验证?",
            options: ["调用revalidatePath", "调用revalidateTag", "revalidate时间到期", "用户刷新页面"],
            answer: [0, 1, 2],
            tags: ["缓存重新验证", "触发条件", "ISR"],
            correctExplanation: "调用revalidatePath、revalidateTag或revalidate时间到期都会触发缓存重新验证。用户刷新页面不会触发服务端缓存重新验证。",
            incorrectExplanation: [
                "",
                "",
                "",
                "用户刷新页面不会触发服务端缓存重新验证"
            ]
        },
        {
            type: "单选题",
            question: "fetch的next.revalidate单位是?",
            options: ["毫秒", "秒", "分钟", "小时"],
            answer: 1,
            tags: ["revalidate", "时间单位", "配置"],
            correctExplanation: "next.revalidate的单位是秒,例如revalidate: 60表示60秒后重新验证。",
            incorrectExplanation: [
                "不是毫秒",
                "",
                "不是分钟",
                "不是小时"
            ]
        },
        {
            type: "判断题",
            question: "Data Cache在开发环境中默认禁用。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["Data Cache", "开发环境", "行为"],
            correctExplanation: "Data Cache在开发和生产环境中都启用,但开发环境中可以通过配置禁用以便调试。",
            incorrectExplanation: [
                "Data Cache在开发环境中也启用",
                ""
            ]
        },
        {
            type: "单选题",
            question: "如何禁用特定fetch请求的缓存?",
            options: ["cache: 'no-cache'", "cache: 'no-store'", "revalidate: 0", "以上都可以"],
            answer: 3,
            tags: ["禁用缓存", "no-store", "配置"],
            correctExplanation: "cache: 'no-store'、cache: 'no-cache'或revalidate: 0都可以禁用缓存。",
            incorrectExplanation: [
                "no-cache可以,但不是唯一方式",
                "no-store可以,但不是唯一方式",
                "revalidate: 0可以,但不是唯一方式",
                ""
            ]
        },
        {
            type: "多选题",
            question: "unstable_cache函数的参数包括?",
            options: ["缓存函数", "缓存键", "配置选项", "回调函数"],
            answer: [0, 1, 2],
            tags: ["unstable_cache", "参数", "API"],
            correctExplanation: "unstable_cache接受缓存函数、缓存键和配置选项(如tags、revalidate)三个参数。",
            incorrectExplanation: [
                "",
                "",
                "",
                "没有回调函数参数"
            ]
        },
        {
            type: "单选题",
            question: "revalidatePath的'layout'类型会重新验证?",
            options: ["只验证layout文件", "验证该路径及所有子路径", "只验证page文件", "验证所有路径"],
            answer: 1,
            tags: ["revalidatePath", "layout类型", "范围"],
            correctExplanation: "type: 'layout'会重新验证该路径及其所有子路径,实现前缀匹配。",
            incorrectExplanation: [
                "不只验证layout文件",
                "",
                "不只验证page文件",
                "不验证所有路径,只验证该路径及子路径"
            ]
        },
        {
            type: "判断题",
            question: "相同URL的GET和POST请求会被去重。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["请求去重", "HTTP方法", "判断标准"],
            correctExplanation: "请求去重要求URL和请求方法都相同,GET和POST是不同方法,不会去重。",
            incorrectExplanation: [
                "GET和POST不会被去重",
                ""
            ]
        },
        {
            type: "单选题",
            question: "缓存标签的最大数量限制是?",
            options: ["10个", "64个", "128个", "无限制"],
            answer: 2,
            tags: ["缓存标签", "限制", "数量"],
            correctExplanation: "Next.js建议每个缓存项的标签数量不超过128个,以保证性能。",
            incorrectExplanation: [
                "不是10个",
                "不是64个",
                "",
                "有数量限制"
            ]
        },
        {
            type: "多选题",
            question: "以下哪些场景适合使用no-store策略?",
            options: ["用户仪表盘", "实时股票", "个人信息", "博客文章"],
            answer: [0, 1, 2],
            tags: ["no-store", "适用场景", "实时数据"],
            correctExplanation: "用户仪表盘、实时股票、个人信息等需要实时更新的数据适合使用no-store。",
            incorrectExplanation: [
                "",
                "",
                "",
                "博客文章适合使用force-cache"
            ]
        },
        {
            type: "单选题",
            question: "Request Memoization的缓存键基于?",
            options: ["URL", "URL和方法", "URL、方法和请求头", "URL和请求体"],
            answer: 1,
            tags: ["Request Memoization", "缓存键", "判断标准"],
            correctExplanation: "Request Memoization的缓存键基于URL和请求方法,不包括请求头和请求体。",
            incorrectExplanation: [
                "不只是URL",
                "",
                "不包括请求头",
                "不包括请求体"
            ]
        },
        {
            type: "判断题",
            question: "revalidateTag可以同时重新验证多个标签。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["revalidateTag", "批量操作", "限制"],
            correctExplanation: "revalidateTag一次只能重新验证一个标签,需要多次调用来重新验证多个标签。",
            incorrectExplanation: [
                "revalidateTag一次只能验证一个标签",
                ""
            ]
        },
        {
            type: "单选题",
            question: "fetch的cache选项优先级高于?",
            options: ["next.revalidate", "路由段配置", "全局配置", "以上都是"],
            answer: 3,
            tags: ["cache选项", "优先级", "配置"],
            correctExplanation: "fetch的cache选项优先级最高,会覆盖next.revalidate、路由段配置和全局配置。",
            incorrectExplanation: [
                "优先级高于next.revalidate,但不只是",
                "优先级高于路由段配置,但不只是",
                "优先级高于全局配置,但不只是",
                ""
            ]
        },
        {
            type: "多选题",
            question: "以下哪些是有效的数据获取模式?",
            options: ["并行获取", "串行获取", "预加载", "流式渲染"],
            answer: [0, 1, 2, 3],
            tags: ["数据获取模式", "模式", "最佳实践"],
            correctExplanation: "Next.js支持并行获取、串行获取、预加载、流式渲染等多种数据获取模式。",
            incorrectExplanation: [
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "如何在Route Handler中重新验证缓存?",
            options: ["不能重新验证", "使用revalidatePath", "使用revalidateTag", "使用revalidatePath或revalidateTag"],
            answer: 3,
            tags: ["Route Handler", "缓存重新验证", "API"],
            correctExplanation: "Route Handler中可以使用revalidatePath或revalidateTag来重新验证缓存。",
            incorrectExplanation: [
                "Route Handler可以重新验证缓存",
                "可以使用,但不是唯一方式",
                "可以使用,但不是唯一方式",
                ""
            ]
        },
        {
            type: "判断题",
            question: "Full Route Cache只缓存静态路由。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Full Route Cache", "静态路由", "范围"],
            correctExplanation: "Full Route Cache只缓存静态路由的渲染结果,动态路由不会被缓存。",
            incorrectExplanation: [
                "",
                "Full Route Cache确实只缓存静态路由"
            ]
        },
        {
            type: "单选题",
            question: "预加载数据的最佳位置是?",
            options: ["layout", "page", "component", "middleware"],
            answer: 0,
            tags: ["预加载", "layout", "最佳实践"],
            correctExplanation: "在layout中预加载数据可以让子页面和组件共享数据,避免重复请求。",
            incorrectExplanation: [
                "",
                "page中预加载范围较小",
                "component中预加载范围最小",
                "middleware不适合预加载数据"
            ]
        },
        {
            type: "多选题",
            question: "缓存失效的原因可能是?",
            options: ["revalidate时间到期", "调用revalidateTag", "调用revalidatePath", "服务器重启"],
            answer: [0, 1, 2],
            tags: ["缓存失效", "原因", "生命周期"],
            correctExplanation: "缓存失效的原因包括revalidate时间到期、调用revalidateTag、调用revalidatePath。服务器重启不会清除持久化缓存。",
            incorrectExplanation: [
                "",
                "",
                "",
                "服务器重启不会清除持久化缓存"
            ]
        },
        {
            type: "单选题",
            question: "Router Cache的默认过期时间是?",
            options: ["30秒", "5分钟", "30分钟", "根据路由类型不同"],
            answer: 3,
            tags: ["Router Cache", "过期时间", "客户端"],
            correctExplanation: "Router Cache的过期时间根据路由类型不同:静态路由5分钟,动态路由30秒。",
            incorrectExplanation: [
                "不是固定30秒",
                "不是固定5分钟",
                "不是固定30分钟",
                ""
            ]
        },
        {
            type: "判断题",
            question: "unstable_cache的名称表示这是一个不稳定的API。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["unstable_cache", "API稳定性", "命名"],
            correctExplanation: "unstable_前缀表示这是一个实验性API,未来可能会有变化,使用时需要注意。",
            incorrectExplanation: [
                "",
                "unstable_确实表示不稳定的API"
            ]
        }
    ];

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
        },
        {
            type: "多选题",
            question: "Server Actions的优势包括?",
            options: ["类型安全", "渐进增强", "自动序列化", "需要创建API路由"],
            answer: [0, 1, 2],
            tags: ["Server Actions", "优势", "特性"],
            correctExplanation: "Server Actions提供类型安全、渐进增强、自动序列化等优势,无需创建API路由。",
            incorrectExplanation: [
                "",
                "",
                "",
                "Server Actions不需要创建API路由"
            ]
        },
        {
            type: "判断题",
            question: "useFormStatus必须在form标签的子组件中使用。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["useFormStatus", "使用限制", "form"],
            correctExplanation: "useFormStatus只能在form标签的子组件中工作,在form外部无法获取状态。",
            incorrectExplanation: [
                "",
                "useFormStatus确实必须在form子组件中使用"
            ]
        },
        {
            type: "单选题",
            question: "useFormStatus返回的pending属性表示什么?",
            options: ["表单是否有效", "表单是否正在提交", "表单是否已提交", "表单是否有错误"],
            answer: 1,
            tags: ["useFormStatus", "pending", "状态"],
            correctExplanation: "pending属性表示表单是否正在提交,可用于禁用按钮和显示加载状态。",
            incorrectExplanation: [
                "表单有效性需要自己验证",
                "",
                "已提交状态需要其他方式判断",
                "错误状态需要其他方式获取"
            ]
        },
        {
            type: "多选题",
            question: "useOptimistic Hook的使用场景包括?",
            options: ["点赞功能", "评论发布", "购物车更新", "数据查询"],
            answer: [0, 1, 2],
            tags: ["useOptimistic", "使用场景", "乐观更新"],
            correctExplanation: "useOptimistic适合点赞、评论、购物车等需要即时反馈的场景,数据查询不需要乐观更新。",
            incorrectExplanation: [
                "",
                "",
                "",
                "数据查询不需要乐观更新"
            ]
        },
        {
            type: "单选题",
            question: "useActionState的第一个参数是什么?",
            options: ["初始状态", "Server Action函数", "表单引用", "配置对象"],
            answer: 1,
            tags: ["useActionState", "参数", "API"],
            correctExplanation: "useActionState的第一个参数是Server Action函数,第二个参数是初始状态。",
            incorrectExplanation: [
                "初始状态是第二个参数",
                "",
                "不需要表单引用",
                "没有配置对象参数"
            ]
        },
        {
            type: "判断题",
            question: "Server Actions可以返回任意类型的数据。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["Server Actions", "返回值", "限制"],
            correctExplanation: "Server Actions只能返回可序列化的数据,不能返回函数、类实例等不可序列化的值。",
            incorrectExplanation: [
                "Server Actions只能返回可序列化数据",
                ""
            ]
        },
        {
            type: "单选题",
            question: "NextRequest对象的cookies属性如何访问?",
            options: ["request.cookies", "request.cookies()", "await request.cookies", "request.getCookies()"],
            answer: 0,
            tags: ["NextRequest", "cookies", "访问方式"],
            correctExplanation: "NextRequest的cookies是一个对象,直接通过request.cookies访问,不需要调用或await。",
            incorrectExplanation: [
                "",
                "cookies不是函数",
                "cookies不是Promise",
                "没有getCookies方法"
            ]
        },
        {
            type: "多选题",
            question: "NextResponse提供哪些静态方法?",
            options: ["json", "redirect", "rewrite", "next"],
            answer: [0, 1, 2, 3],
            tags: ["NextResponse", "静态方法", "API"],
            correctExplanation: "NextResponse提供json、redirect、rewrite、next等静态方法用于创建不同类型的响应。",
            incorrectExplanation: [
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Middleware的配置文件名是?",
            options: ["middleware.js", "middleware.ts", "middleware.config.js", "以上都可以"],
            answer: 3,
            tags: ["Middleware", "配置", "文件名"],
            correctExplanation: "Middleware可以使用middleware.js或middleware.ts,放在项目根目录或src目录下。",
            incorrectExplanation: [
                "可以,但不是唯一选项",
                "可以,但不是唯一选项",
                "不需要.config后缀",
                ""
            ]
        },
        {
            type: "判断题",
            question: "Middleware可以修改请求头和响应头。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Middleware", "请求头", "响应头"],
            correctExplanation: "Middleware可以修改请求头和响应头,用于添加认证信息、CORS头等。",
            incorrectExplanation: [
                "",
                "Middleware确实可以修改请求头和响应头"
            ]
        },
        {
            type: "单选题",
            question: "Middleware的matcher配置用于?",
            options: ["匹配请求方法", "匹配路径", "匹配请求头", "匹配查询参数"],
            answer: 1,
            tags: ["Middleware", "matcher", "路径匹配"],
            correctExplanation: "matcher配置用于指定Middleware应该在哪些路径上运行,支持字符串或正则表达式。",
            incorrectExplanation: [
                "不是匹配请求方法",
                "",
                "不是匹配请求头",
                "不是匹配查询参数"
            ]
        },
        {
            type: "多选题",
            question: "Edge Runtime的限制包括?",
            options: ["不支持Node.js API", "不支持原生模块", "代码大小限制", "没有限制"],
            answer: [0, 1, 2],
            tags: ["Edge Runtime", "限制", "约束"],
            correctExplanation: "Edge Runtime不支持Node.js API、原生模块,且有代码大小限制(通常1-4MB)。",
            incorrectExplanation: [
                "",
                "",
                "",
                "Edge Runtime有多个限制"
            ]
        },
        {
            type: "单选题",
            question: "如何在Server Action中访问请求头?",
            options: ["使用request参数", "使用headers()函数", "使用getHeaders()", "无法访问"],
            answer: 1,
            tags: ["Server Actions", "headers", "访问方式"],
            correctExplanation: "在Server Action中使用headers()函数访问请求头,需要从next/headers导入。",
            incorrectExplanation: [
                "Server Action没有request参数",
                "",
                "没有getHeaders函数",
                "可以通过headers()访问"
            ]
        },
        {
            type: "判断题",
            question: "useOptimistic的乐观更新失败后会自动回滚。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["useOptimistic", "回滚", "错误处理"],
            correctExplanation: "useOptimistic在Server Action失败时会自动回滚到之前的状态,无需手动处理。",
            incorrectExplanation: [
                "",
                "useOptimistic确实会自动回滚"
            ]
        },
        {
            type: "单选题",
            question: "Route Handler的文件名必须是?",
            options: ["route.js", "api.js", "handler.js", "index.js"],
            answer: 0,
            tags: ["Route Handler", "文件名", "约定"],
            correctExplanation: "Route Handler的文件名必须是route.js或route.ts,放在app目录下的任意位置。",
            incorrectExplanation: [
                "",
                "api.js不是Route Handler的文件名",
                "handler.js不是Route Handler的文件名",
                "index.js不是Route Handler的文件名"
            ]
        },
        {
            type: "多选题",
            question: "Route Handler支持哪些HTTP方法?",
            options: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            answer: [0, 1, 2, 3, 4],
            tags: ["Route Handler", "HTTP方法", "API"],
            correctExplanation: "Route Handler支持GET、POST、PUT、DELETE、PATCH、HEAD、OPTIONS等所有标准HTTP方法。",
            incorrectExplanation: [
                "",
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "判断题",
            question: "Server Actions支持文件上传。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Server Actions", "文件上传", "功能"],
            correctExplanation: "Server Actions支持文件上传,通过FormData可以接收文件并处理。",
            incorrectExplanation: [
                "",
                "Server Actions确实支持文件上传"
            ]
        },
        {
            type: "单选题",
            question: "cookies()函数在Next.js 16中是?",
            options: ["同步函数", "异步函数", "类", "对象"],
            answer: 1,
            tags: ["cookies", "Next.js 16", "异步"],
            correctExplanation: "Next.js 16中cookies()是异步函数,需要使用await调用。",
            incorrectExplanation: [
                "Next.js 16中cookies()是异步的",
                "",
                "cookies()是函数,不是类",
                "cookies()是函数,不是对象"
            ]
        },
        {
            type: "多选题",
            question: "headers()函数可以获取哪些信息?",
            options: ["User-Agent", "Cookie", "Authorization", "所有请求头"],
            answer: [0, 1, 2, 3],
            tags: ["headers", "请求头", "信息"],
            correctExplanation: "headers()函数可以获取所有请求头信息,包括User-Agent、Cookie、Authorization等。",
            incorrectExplanation: [
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Middleware的返回值类型是?",
            options: ["void", "NextResponse", "Response", "NextResponse或Response"],
            answer: 3,
            tags: ["Middleware", "返回值", "类型"],
            correctExplanation: "Middleware可以返回NextResponse或Response对象,也可以不返回(继续处理)。",
            incorrectExplanation: [
                "可以不返回,但也可以返回Response",
                "可以返回,但不是唯一选项",
                "可以返回,但不是唯一选项",
                ""
            ]
        },
        {
            type: "判断题",
            question: "useActionState的isPending参数表示Action是否正在执行。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["useActionState", "isPending", "状态"],
            correctExplanation: "isPending表示Action是否正在执行,可用于显示加载状态和禁用按钮。",
            incorrectExplanation: [
                "",
                "isPending确实表示Action是否正在执行"
            ]
        },
        {
            type: "单选题",
            question: "Server Actions的错误处理最佳实践是?",
            options: ["不处理错误", "返回错误对象", "抛出异常", "使用try-catch并返回错误状态"],
            answer: 3,
            tags: ["Server Actions", "错误处理", "最佳实践"],
            correctExplanation: "最佳实践是使用try-catch捕获错误,并返回包含错误信息的状态对象,便于客户端显示。",
            incorrectExplanation: [
                "必须处理错误",
                "返回错误对象是好的,但应该在try-catch中",
                "抛出异常会导致错误边界捕获",
                ""
            ]
        },
        {
            type: "多选题",
            question: "NextRequest对象提供哪些额外属性?",
            options: ["geo", "ip", "nextUrl", "cookies"],
            answer: [0, 1, 2, 3],
            tags: ["NextRequest", "属性", "扩展"],
            correctExplanation: "NextRequest提供geo(地理位置)、ip(IP地址)、nextUrl(URL对象)、cookies等额外属性。",
            incorrectExplanation: [
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "如何在Middleware中重写URL?",
            options: ["NextResponse.redirect", "NextResponse.rewrite", "NextResponse.next", "request.rewrite"],
            answer: 1,
            tags: ["Middleware", "rewrite", "URL重写"],
            correctExplanation: "使用NextResponse.rewrite()可以在不改变浏览器URL的情况下重写请求URL。",
            incorrectExplanation: [
                "redirect会改变浏览器URL",
                "",
                "next不会重写URL",
                "request没有rewrite方法"
            ]
        },
        {
            type: "判断题",
            question: "Edge Runtime支持所有Node.js内置模块。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["Edge Runtime", "Node.js", "兼容性"],
            correctExplanation: "Edge Runtime不支持所有Node.js内置模块,只支持部分Web标准API和有限的Node.js API。",
            incorrectExplanation: [
                "Edge Runtime不支持所有Node.js模块",
                ""
            ]
        },
        {
            type: "单选题",
            question: "useFormStatus的data属性包含什么?",
            options: ["表单验证结果", "表单提交的数据", "表单错误信息", "表单配置"],
            answer: 1,
            tags: ["useFormStatus", "data", "属性"],
            correctExplanation: "data属性包含表单提交的FormData对象,可以访问表单字段的值。",
            incorrectExplanation: [
                "验证结果需要自己实现",
                "",
                "错误信息需要其他方式获取",
                "配置不在data中"
            ]
        },
        {
            type: "多选题",
            question: "Server Actions的安全措施包括?",
            options: ["输入验证", "权限检查", "CSRF保护", "自动加密"],
            answer: [0, 1, 2],
            tags: ["Server Actions", "安全", "措施"],
            correctExplanation: "Server Actions应该实现输入验证、权限检查,Next.js提供CSRF保护,但不会自动加密数据。",
            incorrectExplanation: [
                "",
                "",
                "",
                "数据加密需要自己实现"
            ]
        },
        {
            type: "单选题",
            question: "Route Handler中如何设置响应头?",
            options: ["response.headers.set", "new Headers()", "NextResponse.json的headers选项", "以上都可以"],
            answer: 3,
            tags: ["Route Handler", "响应头", "设置"],
            correctExplanation: "可以使用response.headers.set、new Headers()或NextResponse.json的headers选项来设置响应头。",
            incorrectExplanation: [
                "可以,但不是唯一方式",
                "可以,但不是唯一方式",
                "可以,但不是唯一方式",
                ""
            ]
        },
        {
            type: "判断题",
            question: "Middleware可以访问数据库。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["Middleware", "数据库", "限制"],
            correctExplanation: "Middleware运行在Edge Runtime,不支持数据库连接,应该使用Route Handler或Server Actions。",
            incorrectExplanation: [
                "Middleware不能访问数据库",
                ""
            ]
        },
        {
            type: "单选题",
            question: "useOptimistic的第一个参数是?",
            options: ["更新函数", "当前状态", "初始状态", "Server Action"],
            answer: 1,
            tags: ["useOptimistic", "参数", "API"],
            correctExplanation: "useOptimistic的第一个参数是当前状态,第二个参数是更新函数。",
            incorrectExplanation: [
                "更新函数是第二个参数",
                "",
                "不是初始状态,是当前状态",
                "Server Action不是参数"
            ]
        },
        {
            type: "多选题",
            question: "NextResponse.redirect的选项包括?",
            options: ["status", "headers", "permanent", "以上都不是"],
            answer: [0, 1],
            tags: ["NextResponse", "redirect", "选项"],
            correctExplanation: "NextResponse.redirect可以设置status(状态码)和headers(响应头)选项。",
            incorrectExplanation: [
                "",
                "",
                "permanent不是选项,应该通过status设置",
                "有status和headers选项"
            ]
        },
        {
            type: "单选题",
            question: "Server Actions的渐进增强是指?",
            options: ["性能逐步提升", "功能逐步增加", "无JavaScript也能工作", "逐步加载"],
            answer: 2,
            tags: ["Server Actions", "渐进增强", "概念"],
            correctExplanation: "渐进增强指即使禁用JavaScript,表单仍然可以通过原生HTML提交到Server Actions。",
            incorrectExplanation: [
                "不是性能提升",
                "不是功能增加",
                "",
                "不是逐步加载"
            ]
        },
        {
            type: "判断题",
            question: "Route Handler和Server Actions可以共存。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Route Handler", "Server Actions", "共存"],
            correctExplanation: "Route Handler和Server Actions可以共存,分别用于不同场景:Route Handler用于API,Server Actions用于表单。",
            incorrectExplanation: [
                "",
                "两者可以共存"
            ]
        },
        {
            type: "单选题",
            question: "Middleware的执行顺序是?",
            options: ["随机", "按文件名", "在路由匹配之前", "在路由匹配之后"],
            answer: 2,
            tags: ["Middleware", "执行顺序", "时机"],
            correctExplanation: "Middleware在路由匹配之前执行,可以修改请求、重定向或重写URL。",
            incorrectExplanation: [
                "执行顺序是确定的",
                "不按文件名",
                "",
                "Middleware在路由匹配之前执行"
            ]
        },
        {
            type: "多选题",
            question: "useActionState适用的场景包括?",
            options: ["表单提交", "多步骤流程", "搜索功能", "静态页面"],
            answer: [0, 1, 2],
            tags: ["useActionState", "使用场景", "应用"],
            correctExplanation: "useActionState适用于表单提交、多步骤流程、搜索功能等需要管理Action状态的场景。",
            incorrectExplanation: [
                "",
                "",
                "",
                "静态页面不需要useActionState"
            ]
        },
        {
            type: "单选题",
            question: "如何在Server Action中设置cookie?",
            options: ["response.cookies.set", "cookies().set", "setCookie()", "document.cookie"],
            answer: 1,
            tags: ["Server Actions", "cookie", "设置"],
            correctExplanation: "在Server Action中使用cookies().set()来设置cookie,需要从next/headers导入cookies。",
            incorrectExplanation: [
                "Server Action没有response对象",
                "",
                "没有setCookie函数",
                "document.cookie是客户端API"
            ]
        },
        {
            type: "判断题",
            question: "useFormStatus可以在任何组件中使用。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["useFormStatus", "使用限制", "组件"],
            correctExplanation: "useFormStatus只能在Client Component中使用,且必须是form标签的子组件。",
            incorrectExplanation: [
                "useFormStatus有使用限制",
                ""
            ]
        },
        {
            type: "单选题",
            question: "NextRequest的geo属性包含什么信息?",
            options: ["用户位置", "服务器位置", "CDN节点位置", "以上都不是"],
            answer: 0,
            tags: ["NextRequest", "geo", "地理位置"],
            correctExplanation: "geo属性包含用户的地理位置信息,如国家、城市、经纬度等,由CDN提供。",
            incorrectExplanation: [
                "",
                "不是服务器位置",
                "不是CDN节点位置",
                "geo确实包含用户位置信息"
            ]
        }
    ];

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
        },
        {
            type: "多选题",
            question: "Core Web Vitals包括哪些指标?",
            options: ["LCP", "FID", "CLS", "INP", "FCP"],
            answer: [0, 2, 3],
            tags: ["Core Web Vitals", "性能指标", "Google"],
            correctExplanation: "Core Web Vitals包括LCP(最大内容绘制)、CLS(累积布局偏移)、INP(交互响应时间),INP已替代FID。",
            incorrectExplanation: [
                "",
                "FID已被INP替代",
                "",
                "",
                "FCP不是Core Web Vitals之一"
            ]
        },
        {
            type: "判断题",
            question: "Image组件的priority属性应该用于首屏图片。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Image组件", "priority", "优化"],
            correctExplanation: "priority属性告诉Next.js优先加载该图片,应该用于首屏的LCP图片,避免懒加载延迟。",
            incorrectExplanation: [
                "",
                "priority确实应该用于首屏图片"
            ]
        },
        {
            type: "单选题",
            question: "动态导入(dynamic import)的主要作用是?",
            options: ["提高安全性", "代码分割", "类型检查", "错误处理"],
            answer: 1,
            tags: ["动态导入", "代码分割", "性能"],
            correctExplanation: "动态导入的主要作用是代码分割,按需加载组件,减少初始bundle大小。",
            incorrectExplanation: [
                "动态导入不提高安全性",
                "",
                "动态导入不用于类型检查",
                "动态导入不是主要用于错误处理"
            ]
        },
        {
            type: "多选题",
            question: "Script组件的strategy选项包括?",
            options: ["beforeInteractive", "afterInteractive", "lazyOnload", "worker"],
            answer: [0, 1, 2, 3],
            tags: ["Script组件", "strategy", "加载策略"],
            correctExplanation: "Script组件支持beforeInteractive、afterInteractive、lazyOnload、worker四种加载策略。",
            incorrectExplanation: [
                "",
                "",
                "",
                ""
            ]
        },
        {
            type: "单选题",
            question: "font-display: swap的作用是?",
            options: ["隐藏文本", "显示后备字体", "禁用字体", "加载字体"],
            answer: 1,
            tags: ["字体优化", "font-display", "FOIT"],
            correctExplanation: "font-display: swap会先显示后备字体,字体加载完成后再切换,避免FOIT(不可见文本闪烁)。",
            incorrectExplanation: [
                "不是隐藏文本",
                "",
                "不是禁用字体",
                "不是加载字体的方法"
            ]
        },
        {
            type: "判断题",
            question: "CLS分数越高越好。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["CLS", "性能指标", "评分"],
            correctExplanation: "CLS(累积布局偏移)分数越低越好,优秀标准是小于0.1,分数越高表示布局越不稳定。",
            incorrectExplanation: [
                "CLS分数越低越好",
                ""
            ]
        },
        {
            type: "单选题",
            question: "如何为图片设置占位符避免CLS?",
            options: ["使用placeholder='blur'", "使用loading='lazy'", "使用priority", "使用quality"],
            answer: 0,
            tags: ["图片占位符", "CLS", "优化"],
            correctExplanation: "使用placeholder='blur'配合blurDataURL可以显示模糊占位符,避免图片加载时的布局偏移。",
            incorrectExplanation: [
                "",
                "loading='lazy'是懒加载,不是占位符",
                "priority是优先加载,不是占位符",
                "quality是图片质量,不是占位符"
            ]
        },
        {
            type: "多选题",
            question: "代码分割的好处包括?",
            options: ["减少初始加载时间", "按需加载", "提高缓存效率", "增加代码复杂度"],
            answer: [0, 1, 2],
            tags: ["代码分割", "好处", "性能"],
            correctExplanation: "代码分割可以减少初始加载时间、按需加载组件、提高缓存效率,但不会增加代码复杂度。",
            incorrectExplanation: [
                "",
                "",
                "",
                "代码分割不会增加复杂度,反而简化加载"
            ]
        },
        {
            type: "单选题",
            question: "generateMetadata函数应该在哪里定义?",
            options: ["layout.js", "page.js", "middleware.js", "layout.js或page.js"],
            answer: 3,
            tags: ["generateMetadata", "元数据", "SEO"],
            correctExplanation: "generateMetadata可以在layout.js或page.js中定义,用于动态生成页面元数据。",
            incorrectExplanation: [
                "可以在layout.js,但不是唯一位置",
                "可以在page.js,但不是唯一位置",
                "middleware.js不能定义generateMetadata",
                ""
            ]
        },
        {
            type: "判断题",
            question: "lazyOnload策略会在页面加载完成后加载脚本。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["lazyOnload", "Script组件", "加载策略"],
            correctExplanation: "lazyOnload策略会在页面加载完成后(onload事件后)加载脚本,适合非关键的第三方脚本。",
            incorrectExplanation: [
                "",
                "lazyOnload确实在页面加载完成后加载"
            ]
        },
        {
            type: "单选题",
            question: "Image组件的sizes属性用于?",
            options: ["设置图片尺寸", "响应式图片", "图片质量", "图片格式"],
            answer: 1,
            tags: ["Image组件", "sizes", "响应式"],
            correctExplanation: "sizes属性告诉浏览器在不同视口宽度下图片的显示宽度,用于生成响应式图片。",
            incorrectExplanation: [
                "不是直接设置尺寸",
                "",
                "quality属性用于图片质量",
                "format不是sizes的作用"
            ]
        },
        {
            type: "多选题",
            question: "优化LCP的方法包括?",
            options: ["使用priority属性", "预加载关键资源", "使用CDN", "增加图片大小"],
            answer: [0, 1, 2],
            tags: ["LCP优化", "性能", "方法"],
            correctExplanation: "优化LCP可以使用priority属性、预加载关键资源、使用CDN加速,增加图片大小会降低性能。",
            incorrectExplanation: [
                "",
                "",
                "",
                "增加图片大小会降低LCP性能"
            ]
        },
        {
            type: "单选题",
            question: "beforeInteractive策略适合加载什么脚本?",
            options: ["分析脚本", "广告脚本", "polyfill脚本", "聊天工具"],
            answer: 2,
            tags: ["beforeInteractive", "Script组件", "polyfill"],
            correctExplanation: "beforeInteractive适合加载polyfill等需要在页面交互前执行的关键脚本。",
            incorrectExplanation: [
                "分析脚本使用afterInteractive",
                "广告脚本使用lazyOnload",
                "",
                "聊天工具使用lazyOnload"
            ]
        },
        {
            type: "判断题",
            question: "所有图片都应该使用priority属性。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["priority", "Image组件", "误区"],
            correctExplanation: "只有首屏的LCP图片应该使用priority,过度使用会降低优先级效果,其他图片应该懒加载。",
            incorrectExplanation: [
                "只有首屏LCP图片应该使用priority",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Web Vitals库的作用是?",
            options: ["构建工具", "测量性能指标", "打包工具", "测试框架"],
            answer: 1,
            tags: ["Web Vitals", "性能监控", "库"],
            correctExplanation: "Web Vitals是Google提供的库,用于测量Core Web Vitals等性能指标。",
            incorrectExplanation: [
                "不是构建工具",
                "",
                "不是打包工具",
                "不是测试框架"
            ]
        },
        {
            type: "多选题",
            question: "避免CLS的方法包括?",
            options: ["为图片设置width和height", "使用transform动画", "预留广告位空间", "使用top/left动画"],
            answer: [0, 1, 2],
            tags: ["CLS", "避免", "方法"],
            correctExplanation: "避免CLS应该为图片设置尺寸、使用transform动画、预留动态内容空间,不要使用top/left动画。",
            incorrectExplanation: [
                "",
                "",
                "",
                "top/left动画会触发布局重排,导致CLS"
            ]
        },
        {
            type: "单选题",
            question: "Image组件的quality属性默认值是?",
            options: ["50", "75", "85", "100"],
            answer: 1,
            tags: ["Image组件", "quality", "默认值"],
            correctExplanation: "Image组件的quality默认值是75,在质量和文件大小之间取得平衡。",
            incorrectExplanation: [
                "50太低",
                "",
                "85不是默认值",
                "100太高,文件过大"
            ]
        },
        {
            type: "判断题",
            question: "动态导入会自动进行代码分割。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["动态导入", "代码分割", "自动"],
            correctExplanation: "动态导入(dynamic import)会自动创建单独的chunk,实现代码分割。",
            incorrectExplanation: [
                "",
                "动态导入确实会自动代码分割"
            ]
        },
        {
            type: "单选题",
            question: "Lighthouse性能评分满分是?",
            options: ["100", "90", "80", "95"],
            answer: 0,
            tags: ["Lighthouse", "性能评分", "满分"],
            correctExplanation: "Lighthouse性能评分满分是100分,90分以上被认为是优秀。",
            incorrectExplanation: [
                "",
                "90不是满分",
                "80不是满分",
                "95不是满分"
            ]
        },
        {
            type: "多选题",
            question: "Next.js自动优化包括?",
            options: ["代码分割", "图片优化", "字体优化", "数据库优化"],
            answer: [0, 1, 2],
            tags: ["Next.js", "自动优化", "功能"],
            correctExplanation: "Next.js自动进行代码分割、图片优化(Image组件)、字体优化,但不包括数据库优化。",
            incorrectExplanation: [
                "",
                "",
                "",
                "数据库优化需要自己实现"
            ]
        },
        {
            type: "单选题",
            question: "TTFB(首字节时间)的优秀标准是?",
            options: ["< 200ms", "< 600ms", "< 1000ms", "< 1500ms"],
            answer: 1,
            tags: ["TTFB", "性能指标", "标准"],
            correctExplanation: "TTFB的优秀标准是小于600ms,这是服务器响应速度的关键指标。",
            incorrectExplanation: [
                "200ms太严格",
                "",
                "1000ms已经需要改进",
                "1500ms太慢"
            ]
        },
        {
            type: "判断题",
            question: "使用CDN可以提高全球用户的访问速度。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["CDN", "性能优化", "全球"],
            correctExplanation: "CDN(内容分发网络)将资源缓存到全球各地的节点,用户从最近的节点获取资源,提高访问速度。",
            incorrectExplanation: [
                "",
                "CDN确实可以提高全球访问速度"
            ]
        },
        {
            type: "单选题",
            question: "bundle分析工具@next/bundle-analyzer的作用是?",
            options: ["代码检查", "分析打包体积", "性能测试", "错误追踪"],
            answer: 1,
            tags: ["bundle-analyzer", "打包分析", "工具"],
            correctExplanation: "@next/bundle-analyzer用于可视化分析打包后的bundle大小,帮助识别大型依赖。",
            incorrectExplanation: [
                "不是代码检查工具",
                "",
                "不是性能测试工具",
                "不是错误追踪工具"
            ]
        },
        {
            type: "多选题",
            question: "优化首屏加载的策略包括?",
            options: ["静态生成", "代码分割", "资源预加载", "增加依赖"],
            answer: [0, 1, 2],
            tags: ["首屏优化", "策略", "性能"],
            correctExplanation: "优化首屏加载应该使用静态生成、代码分割、资源预加载,增加依赖会降低性能。",
            incorrectExplanation: [
                "",
                "",
                "",
                "增加依赖会降低首屏加载速度"
            ]
        },
        {
            type: "单选题",
            question: "Image组件的loading='lazy'表示?",
            options: ["立即加载", "懒加载", "预加载", "禁用加载"],
            answer: 1,
            tags: ["Image组件", "loading", "懒加载"],
            correctExplanation: "loading='lazy'表示懒加载,图片进入视口时才加载,减少初始加载时间。",
            incorrectExplanation: [
                "不是立即加载",
                "",
                "预加载使用priority属性",
                "不是禁用加载"
            ]
        },
        {
            type: "判断题",
            question: "generateMetadata可以返回Promise。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["generateMetadata", "异步", "Promise"],
            correctExplanation: "generateMetadata可以是异步函数,返回Promise,用于动态获取元数据。",
            incorrectExplanation: [
                "",
                "generateMetadata确实可以返回Promise"
            ]
        },
        {
            type: "单选题",
            question: "TBT(总阻塞时间)的优秀标准是?",
            options: ["< 100ms", "< 200ms", "< 300ms", "< 500ms"],
            answer: 1,
            tags: ["TBT", "性能指标", "标准"],
            correctExplanation: "TBT的优秀标准是小于200ms,衡量主线程被阻塞的总时间。",
            incorrectExplanation: [
                "100ms太严格",
                "",
                "300ms已经需要改进",
                "500ms太高"
            ]
        },
        {
            type: "多选题",
            question: "Script组件的优势包括?",
            options: ["自动优化加载", "控制加载策略", "防止阻塞渲染", "自动压缩"],
            answer: [0, 1, 2],
            tags: ["Script组件", "优势", "优化"],
            correctExplanation: "Script组件可以自动优化加载、控制加载策略、防止阻塞渲染,但不会自动压缩脚本。",
            incorrectExplanation: [
                "",
                "",
                "",
                "Script组件不会自动压缩脚本"
            ]
        },
        {
            type: "单选题",
            question: "如何在Next.js中使用Google Fonts?",
            options: ["直接引入CDN", "使用next/font/google", "手动下载", "使用link标签"],
            answer: 1,
            tags: ["字体优化", "Google Fonts", "next/font"],
            correctExplanation: "使用next/font/google可以自动优化Google Fonts,包括自托管、预加载、字体显示优化。",
            incorrectExplanation: [
                "直接引入CDN性能较差",
                "",
                "手动下载不方便",
                "link标签不是最佳实践"
            ]
        },
        {
            type: "判断题",
            question: "预加载所有资源可以提高性能。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["预加载", "误区", "性能"],
            correctExplanation: "过度预加载会占用带宽,延迟其他资源,只应该预加载关键资源。",
            incorrectExplanation: [
                "过度预加载会降低性能",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Image组件的fill属性用于?",
            options: ["填充颜色", "填充父容器", "填充内容", "填充边距"],
            answer: 1,
            tags: ["Image组件", "fill", "布局"],
            correctExplanation: "fill属性使图片填充父容器,父容器需要设置position: relative。",
            incorrectExplanation: [
                "不是填充颜色",
                "",
                "不是填充内容",
                "不是填充边距"
            ]
        },
        {
            type: "多选题",
            question: "监控性能的工具包括?",
            options: ["Lighthouse", "WebPageTest", "Chrome DevTools", "ESLint"],
            answer: [0, 1, 2],
            tags: ["性能监控", "工具", "测试"],
            correctExplanation: "性能监控工具包括Lighthouse、WebPageTest、Chrome DevTools,ESLint是代码检查工具。",
            incorrectExplanation: [
                "",
                "",
                "",
                "ESLint是代码检查工具,不是性能监控工具"
            ]
        },
        {
            type: "单选题",
            question: "什么是关键渲染路径?",
            options: ["路由路径", "浏览器渲染页面的步骤", "代码执行路径", "网络请求路径"],
            answer: 1,
            tags: ["关键渲染路径", "概念", "性能"],
            correctExplanation: "关键渲染路径是浏览器将HTML、CSS、JavaScript转换为屏幕像素的步骤序列。",
            incorrectExplanation: [
                "不是路由路径",
                "",
                "不是代码执行路径",
                "不是网络请求路径"
            ]
        },
        {
            type: "判断题",
            question: "WebP格式比JPEG文件更小。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["WebP", "图片格式", "优化"],
            correctExplanation: "WebP格式通常比JPEG小30-50%,同时保持相似的图片质量。",
            incorrectExplanation: [
                "",
                "WebP确实比JPEG更小"
            ]
        },
        {
            type: "单选题",
            question: "ISR(增量静态再生)的revalidate参数单位是?",
            options: ["毫秒", "秒", "分钟", "小时"],
            answer: 1,
            tags: ["ISR", "revalidate", "单位"],
            correctExplanation: "revalidate参数的单位是秒,表示多少秒后重新验证页面。",
            incorrectExplanation: [
                "不是毫秒",
                "",
                "不是分钟",
                "不是小时"
            ]
        },
        {
            type: "多选题",
            question: "减少JavaScript执行时间的方法包括?",
            options: ["代码分割", "Tree Shaking", "压缩代码", "增加代码"],
            answer: [0, 1, 2],
            tags: ["JavaScript优化", "执行时间", "方法"],
            correctExplanation: "减少JavaScript执行时间可以使用代码分割、Tree Shaking、压缩代码,增加代码会增加执行时间。",
            incorrectExplanation: [
                "",
                "",
                "",
                "增加代码会增加执行时间"
            ]
        },
        {
            type: "单选题",
            question: "什么是Tree Shaking?",
            options: ["删除未使用代码", "代码压缩", "代码混淆", "代码分割"],
            answer: 0,
            tags: ["Tree Shaking", "概念", "优化"],
            correctExplanation: "Tree Shaking是删除未使用代码的过程,减少最终bundle大小。",
            incorrectExplanation: [
                "",
                "代码压缩是minification",
                "代码混淆是obfuscation",
                "代码分割是code splitting"
            ]
        },
        {
            type: "判断题",
            question: "所有第三方脚本都应该使用beforeInteractive策略。",
            options: ["正确", "错误"],
            answer: 1,
            tags: ["Script组件", "策略", "误区"],
            correctExplanation: "大多数第三方脚本应该使用afterInteractive或lazyOnload,只有关键脚本才用beforeInteractive。",
            incorrectExplanation: [
                "大多数第三方脚本不应该用beforeInteractive",
                ""
            ]
        },
        {
            type: "单选题",
            question: "Image组件的remotePatterns配置在哪里?",
            options: ["page.js", "layout.js", "next.config.js", "middleware.js"],
            answer: 2,
            tags: ["Image组件", "remotePatterns", "配置"],
            correctExplanation: "remotePatterns在next.config.js中配置,用于允许外部图片域名。",
            incorrectExplanation: [
                "不在page.js",
                "不在layout.js",
                "",
                "不在middleware.js"
            ]
        },
        {
            type: "多选题",
            question: "优化字体加载的方法包括?",
            options: ["使用next/font", "font-display: swap", "预加载字体", "使用多种字体"],
            answer: [0, 1, 2],
            tags: ["字体优化", "方法", "性能"],
            correctExplanation: "优化字体加载应该使用next/font、font-display: swap、预加载字体,使用多种字体会降低性能。",
            incorrectExplanation: [
                "",
                "",
                "",
                "使用多种字体会增加加载时间"
            ]
        },
        {
            type: "单选题",
            question: "什么是FOIT?",
            options: ["字体加载失败", "不可见文本闪烁", "字体格式错误", "字体太大"],
            answer: 1,
            tags: ["FOIT", "字体", "概念"],
            correctExplanation: "FOIT(Flash of Invisible Text)是指字体加载期间文本不可见,加载完成后突然显示。",
            incorrectExplanation: [
                "不是加载失败",
                "",
                "不是格式错误",
                "不是字体太大"
            ]
        },
        {
            type: "判断题",
            question: "Suspense可以用于优化首屏加载。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Suspense", "首屏优化", "React"],
            correctExplanation: "Suspense可以延迟加载非关键组件,优先显示首屏内容,改善FCP和LCP。",
            incorrectExplanation: [
                "",
                "Suspense确实可以优化首屏加载"
            ]
        },
        {
            type: "单选题",
            question: "什么是关键CSS?",
            options: ["所有CSS", "首屏CSS", "最大的CSS", "最后的CSS"],
            answer: 1,
            tags: ["关键CSS", "概念", "优化"],
            correctExplanation: "关键CSS是渲染首屏内容所需的最小CSS集合,应该内联到HTML中。",
            incorrectExplanation: [
                "不是所有CSS",
                "",
                "不是最大的CSS",
                "不是最后的CSS"
            ]
        },
        {
            type: "多选题",
            question: "性能预算应该包括哪些指标?",
            options: ["Bundle大小", "加载时间", "Core Web Vitals", "代码行数"],
            answer: [0, 1, 2],
            tags: ["性能预算", "指标", "监控"],
            correctExplanation: "性能预算应该包括Bundle大小、加载时间、Core Web Vitals等性能指标,代码行数不是性能指标。",
            incorrectExplanation: [
                "",
                "",
                "",
                "代码行数不是性能指标"
            ]
        },
        {
            type: "单选题",
            question: "什么是渐进式图片?",
            options: ["逐渐清晰的图片", "逐渐变大的图片", "逐渐变色的图片", "逐渐消失的图片"],
            answer: 0,
            tags: ["渐进式图片", "概念", "优化"],
            correctExplanation: "渐进式图片(Progressive JPEG)先显示低质量版本,然后逐渐加载到高质量,改善感知性能。",
            incorrectExplanation: [
                "",
                "不是逐渐变大",
                "不是逐渐变色",
                "不是逐渐消失"
            ]
        },
        {
            type: "判断题",
            question: "Service Worker可以实现离线访问。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["Service Worker", "离线", "PWA"],
            correctExplanation: "Service Worker可以缓存资源,实现离线访问和更快的重复访问。",
            incorrectExplanation: [
                "",
                "Service Worker确实可以实现离线访问"
            ]
        },
        {
            type: "单选题",
            question: "什么是骨架屏?",
            options: ["错误页面", "加载占位符", "空白页面", "404页面"],
            answer: 1,
            tags: ["骨架屏", "概念", "UX"],
            correctExplanation: "骨架屏是内容加载前显示的占位符,模拟页面结构,改善感知性能和避免CLS。",
            incorrectExplanation: [
                "不是错误页面",
                "",
                "不是空白页面",
                "不是404页面"
            ]
        },
        {
            type: "多选题",
            question: "减少网络请求的方法包括?",
            options: ["合并文件", "使用雪碧图", "内联关键资源", "增加CDN"],
            answer: [0, 1, 2],
            tags: ["网络请求", "优化", "方法"],
            correctExplanation: "减少网络请求可以合并文件、使用雪碧图、内联关键资源,增加CDN不会减少请求数。",
            incorrectExplanation: [
                "",
                "",
                "",
                "CDN不会减少请求数,只是加速"
            ]
        },
        {
            type: "单选题",
            question: "什么是HTTP/2的主要优势?",
            options: ["更安全", "多路复用", "更简单", "更兼容"],
            answer: 1,
            tags: ["HTTP/2", "多路复用", "网络"],
            correctExplanation: "HTTP/2的主要优势是多路复用,可以在单个连接上并行传输多个请求和响应。",
            incorrectExplanation: [
                "安全性不是主要优势",
                "",
                "HTTP/2更复杂",
                "兼容性不是主要优势"
            ]
        },
        {
            type: "判断题",
            question: "压缩图片会降低图片质量。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["图片压缩", "质量", "权衡"],
            correctExplanation: "压缩图片会降低质量,但可以通过调整压缩率在质量和文件大小之间取得平衡。",
            incorrectExplanation: [
                "",
                "压缩确实会降低质量"
            ]
        },
        {
            type: "单选题",
            question: "什么是资源提示(Resource Hints)?",
            options: ["错误提示", "性能提示", "预加载指令", "调试信息"],
            answer: 2,
            tags: ["资源提示", "概念", "优化"],
            correctExplanation: "资源提示(如preload、prefetch、preconnect)是告诉浏览器提前加载或连接资源的指令。",
            incorrectExplanation: [
                "不是错误提示",
                "不是性能提示",
                "",
                "不是调试信息"
            ]
        },
        {
            type: "多选题",
            question: "preload和prefetch的区别是?",
            options: ["preload优先级高", "prefetch用于未来导航", "preload用于当前页面", "没有区别"],
            answer: [0, 1, 2],
            tags: ["preload", "prefetch", "区别"],
            correctExplanation: "preload优先级高,用于当前页面的关键资源;prefetch优先级低,用于未来可能访问的资源。",
            incorrectExplanation: [
                "",
                "",
                "",
                "两者有明显区别"
            ]
        },
        {
            type: "单选题",
            question: "什么是虚拟滚动?",
            options: ["假的滚动", "只渲染可见项", "无限滚动", "平滑滚动"],
            answer: 1,
            tags: ["虚拟滚动", "概念", "性能"],
            correctExplanation: "虚拟滚动只渲染视口内可见的列表项,大幅减少DOM节点数量,提高性能。",
            incorrectExplanation: [
                "不是假的滚动",
                "",
                "不是无限滚动",
                "不是平滑滚动"
            ]
        },
        {
            type: "判断题",
            question: "减少DOM节点数量可以提高性能。",
            options: ["正确", "错误"],
            answer: 0,
            tags: ["DOM", "性能", "优化"],
            correctExplanation: "减少DOM节点数量可以降低内存占用,加快渲染和布局计算,提高性能。",
            incorrectExplanation: [
                "",
                "减少DOM节点确实可以提高性能"
            ]
        },
        {
            type: "单选题",
            question: "什么是Critical Rendering Path?",
            options: ["关键路由", "关键渲染路径", "关键代码", "关键错误"],
            answer: 1,
            tags: ["关键渲染路径", "概念", "性能"],
            correctExplanation: "关键渲染路径是浏览器将HTML、CSS、JavaScript转换为屏幕像素的必经步骤。",
            incorrectExplanation: [
                "不是关键路由",
                "",
                "不是关键代码",
                "不是关键错误"
            ]
        },
        {
            type: "多选题",
            question: "优化关键渲染路径的方法包括?",
            options: ["减少关键资源", "减少关键字节", "缩短关键路径长度", "增加资源"],
            answer: [0, 1, 2],
            tags: ["关键渲染路径", "优化", "方法"],
            correctExplanation: "优化关键渲染路径应该减少关键资源数量、减少关键字节、缩短关键路径长度。",
            incorrectExplanation: [
                "",
                "",
                "",
                "增加资源会降低性能"
            ]
        }
    ];
}
