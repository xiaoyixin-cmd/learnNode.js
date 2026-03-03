// 阶段四：面试与实战题库
// 涵盖Node.js面试常见问题、实际项目场景、架构设计等实战知识点

window.stage4Questions = [
    // 1. 面试经典问题：Node.js特点
    {
        id: 1,
        type: 'multiple',
        question: 'Node.js的主要特点有哪些？（面试高频题）',
        options: [
            { value: 'A', text: '单线程事件循环' },
            { value: 'B', text: '非阻塞I/O' },
            { value: 'C', text: '跨平台' },
            { value: 'D', text: '基于V8引擎' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Node.js的核心特点包括单线程事件循环、非阻塞I/O、跨平台支持和基于V8引擎，这是面试中的经典问题。',
        optionExplanations: {
            'A': '正确。Node.js采用单线程事件循环模型。',
            'B': '正确。非阻塞I/O是Node.js的核心优势。',
            'C': '正确。Node.js支持Windows、Linux、macOS等平台。',
            'D': '正确。Node.js基于Google的V8 JavaScript引擎。'
        },
        tags: ['面试题', 'Node.js特点', '基础概念']
    },

    // 2. 事件循环面试题
    {
        id: 2,
        type: 'single',
        question: '以下代码的输出顺序是什么？\n```javascript\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nprocess.nextTick(() => console.log("3"));\nconsole.log("4");\n```',
        options: [
            { value: 'A', text: '1, 2, 3, 4' },
            { value: 'B', text: '1, 4, 3, 2' },
            { value: 'C', text: '1, 4, 2, 3' },
            { value: 'D', text: '1, 3, 4, 2' }
        ],
        correctAnswer: 'B',
        explanation: '执行顺序：同步代码先执行(1, 4)，然后是微任务process.nextTick(3)，最后是宏任务setTimeout(2)。',
        optionExplanations: {
            'A': '错误。没有考虑事件循环的执行顺序。',
            'B': '正确。同步代码 → 微任务 → 宏任务的执行顺序。',
            'C': '错误。process.nextTick优先于setTimeout。',
            'D': '错误。同步代码应该先执行完。'
        },
        tags: ['面试题', '事件循环', '执行顺序', '代码分析']
    },

    // 3. 回调地狱解决方案
    {
        id: 3,
        type: 'multiple',
        question: '解决回调地狱（Callback Hell）的方法有哪些？',
        options: [
            { value: 'A', text: 'Promise' },
            { value: 'B', text: 'async/await' },
            { value: 'C', text: '模块化拆分' },
            { value: 'D', text: '使用第三方库（如async.js）' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是解决回调地狱的有效方法，Promise和async/await是现代JavaScript的标准解决方案。',
        optionExplanations: {
            'A': '正确。Promise提供链式调用，避免嵌套。',
            'B': '正确。async/await让异步代码看起来像同步代码。',
            'C': '正确。模块化可以减少嵌套层级。',
            'D': '正确。async.js等库提供了流程控制工具。'
        },
        tags: ['面试题', '回调地狱', 'Promise', 'async/await']
    },

    // 4. 实战：错误处理
    {
        id: 4,
        type: 'single',
        question: '在Express应用中，全局错误处理中间件的正确写法是？',
        options: [
            { value: 'A', text: 'app.use((err, req, res) => {})' },
            { value: 'B', text: 'app.use((err, req, res, next) => {})' },
            { value: 'C', text: 'app.error((err, req, res, next) => {})' },
            { value: 'D', text: 'app.catch((err, req, res, next) => {})' }
        ],
        correctAnswer: 'B',
        explanation: 'Express错误处理中间件必须有4个参数：err, req, res, next，且必须放在所有路由之后。',
        optionExplanations: {
            'A': '错误。缺少next参数。',
            'B': '正确。错误处理中间件需要4个参数。',
            'C': '错误。Express没有error方法。',
            'D': '错误。Express没有catch方法。'
        },
        tags: ['实战', 'Express', '错误处理', '中间件']
    },

    // 5. 数据库连接池
    {
        id: 5,
        type: 'single',
        question: '在生产环境中，为什么要使用数据库连接池？',
        options: [
            { value: 'A', text: '提高查询速度' },
            { value: 'B', text: '减少数据库连接开销' },
            { value: 'C', text: '防止连接泄漏' },
            { value: 'D', text: '以上都是' }
        ],
        correctAnswer: 'D',
        explanation: '连接池可以复用连接减少开销，限制连接数量防止数据库过载，并自动管理连接生命周期。',
        optionExplanations: {
            'A': '部分正确。复用连接可以提高性能。',
            'B': '部分正确。避免频繁创建销毁连接。',
            'C': '部分正确。自动管理连接生命周期。',
            'D': '正确。连接池提供多重好处。'
        },
        tags: ['实战', '数据库', '连接池', '性能优化']
    },

    // 6. JWT实战问题
    {
        id: 6,
        type: 'single',
        question: 'JWT Token应该存储在客户端的哪里最安全？',
        options: [
            { value: 'A', text: 'localStorage' },
            { value: 'B', text: 'sessionStorage' },
            { value: 'C', text: 'HttpOnly Cookie' },
            { value: 'D', text: '内存中' }
        ],
        correctAnswer: 'C',
        explanation: 'HttpOnly Cookie最安全，因为JavaScript无法访问，可以防止XSS攻击窃取token。',
        optionExplanations: {
            'A': '错误。localStorage容易受到XSS攻击。',
            'B': '错误。sessionStorage也容易受到XSS攻击。',
            'C': '正确。HttpOnly Cookie防止XSS攻击。',
            'D': '部分正确，但刷新页面会丢失。'
        },
        tags: ['实战', 'JWT', '安全', '身份认证']
    },

    // 7. API设计最佳实践
    {
        id: 7,
        type: 'multiple',
        question: 'RESTful API设计的最佳实践包括？',
        options: [
            { value: 'A', text: '使用HTTP状态码表示结果' },
            { value: 'B', text: '使用名词而非动词作为URL' },
            { value: 'C', text: '支持分页和过滤' },
            { value: 'D', text: '版本控制' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是RESTful API设计的重要原则，有助于创建清晰、可维护的API。',
        optionExplanations: {
            'A': '正确。HTTP状态码清晰表达操作结果。',
            'B': '正确。URL应该表示资源，使用名词。',
            'C': '正确。大数据集需要分页和过滤功能。',
            'D': '正确。版本控制保证API的向后兼容性。'
        },
        tags: ['实战', 'RESTful API', 'API设计', '最佳实践']
    },

    // 8. 缓存策略实战
    {
        id: 8,
        type: 'single',
        question: '在Node.js应用中，哪种缓存策略适合频繁读取但很少更新的数据？',
        options: [
            { value: 'A', text: 'Write-through（写穿）' },
            { value: 'B', text: 'Write-behind（写回）' },
            { value: 'C', text: 'Cache-aside（旁路缓存）' },
            { value: 'D', text: 'Write-around（绕写）' }
        ],
        correctAnswer: 'C',
        explanation: 'Cache-aside适合读多写少的场景，应用程序直接管理缓存，读取时先查缓存，未命中再查数据库。',
        optionExplanations: {
            'A': '错误。Write-through适合写操作较多的场景。',
            'B': '错误。Write-behind适合写密集型应用。',
            'C': '正确。Cache-aside适合读多写少的场景。',
            'D': '错误。Write-around会绕过缓存写入。'
        },
        tags: ['实战', '缓存策略', '性能优化', '架构设计']
    },

    // 9. 内存泄漏排查
    {
        id: 9,
        type: 'multiple',
        question: 'Node.js应用出现内存泄漏时，可能的原因有哪些？',
        options: [
            { value: 'A', text: '全局变量未清理' },
            { value: 'B', text: '事件监听器未移除' },
            { value: 'C', text: '定时器未清除' },
            { value: 'D', text: '闭包引用未释放' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是Node.js应用中常见的内存泄漏原因，需要在开发中特别注意。',
        optionExplanations: {
            'A': '正确。全局变量会一直占用内存。',
            'B': '正确。未移除的监听器会阻止垃圾回收。',
            'C': '正确。未清除的定时器会持续占用内存。',
            'D': '正确。闭包可能意外保持对象引用。'
        },
        tags: ['实战', '内存泄漏', '性能调优', '故障排查']
    },

    // 10. 微服务架构
    {
        id: 10,
        type: 'single',
        question: '在微服务架构中，服务间通信失败时应该如何处理？',
        options: [
            { value: 'A', text: '立即返回错误' },
            { value: 'B', text: '实现重试机制和熔断器' },
            { value: 'C', text: '忽略错误继续执行' },
            { value: 'D', text: '重启服务' }
        ],
        correctAnswer: 'B',
        explanation: '微服务架构中应该实现重试机制、熔断器、降级策略等来处理服务间通信失败。',
        optionExplanations: {
            'A': '错误。应该有容错机制。',
            'B': '正确。重试和熔断器是微服务的重要模式。',
            'C': '错误。忽略错误会导致数据不一致。',
            'D': '错误。重启服务不能解决根本问题。'
        },
        tags: ['实战', '微服务', '容错机制', '架构设计']
    },

    // 11. 性能监控实战
    {
        id: 11,
        type: 'multiple',
        question: '生产环境中Node.js应用的关键监控指标包括？',
        options: [
            { value: 'A', text: 'QPS（每秒查询数）' },
            { value: 'B', text: '响应时间P99' },
            { value: 'C', text: '内存使用率' },
            { value: 'D', text: '错误率' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是生产环境中必须监控的关键指标，帮助及时发现和解决问题。',
        optionExplanations: {
            'A': '正确。QPS反映系统吞吐能力。',
            'B': '正确。P99响应时间反映用户体验。',
            'C': '正确。内存使用率防止OOM。',
            'D': '正确。错误率反映系统稳定性。'
        },
        tags: ['实战', '性能监控', '生产环境', '运维']
    },

    // 12. 安全实战：SQL注入防护
    {
        id: 12,
        type: 'single',
        question: '防止SQL注入攻击的最佳实践是？',
        options: [
            { value: 'A', text: '字符串拼接SQL' },
            { value: 'B', text: '使用参数化查询' },
            { value: 'C', text: '过滤特殊字符' },
            { value: 'D', text: '使用存储过程' }
        ],
        correctAnswer: 'B',
        explanation: '参数化查询（预编译语句）是防止SQL注入最有效的方法，将SQL代码和数据分离。',
        optionExplanations: {
            'A': '错误。字符串拼接容易导致SQL注入。',
            'B': '正确。参数化查询是最佳防护方法。',
            'C': '部分正确，但不如参数化查询安全。',
            'D': '部分正确，但不是最佳选择。'
        },
        tags: ['实战', '安全', 'SQL注入', '数据库安全']
    },

    // 13. 负载均衡策略
    {
        id: 13,
        type: 'single',
        question: '对于有状态的Node.js应用，最适合的负载均衡策略是？',
        options: [
            { value: 'A', text: '轮询（Round Robin）' },
            { value: 'B', text: '随机（Random）' },
            { value: 'C', text: '会话粘性（Session Affinity）' },
            { value: 'D', text: '最少连接（Least Connections）' }
        ],
        correctAnswer: 'C',
        explanation: '有状态应用需要会话粘性，确保同一用户的请求总是路由到同一台服务器。',
        optionExplanations: {
            'A': '错误。轮询不能保证会话一致性。',
            'B': '错误。随机分配会破坏会话状态。',
            'C': '正确。会话粘性保证状态一致性。',
            'D': '错误。最少连接不考虑会话状态。'
        },
        tags: ['实战', '负载均衡', '会话管理', '架构设计']
    },

    // 14. Docker容器化实战
    {
        id: 14,
        type: 'multiple',
        question: 'Node.js应用Docker化的最佳实践包括？',
        options: [
            { value: 'A', text: '使用.dockerignore排除不必要文件' },
            { value: 'B', text: '多阶段构建减小镜像大小' },
            { value: 'C', text: '使用非root用户运行应用' },
            { value: 'D', text: '设置健康检查' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是Node.js应用容器化的重要实践，提高安全性和可维护性。',
        optionExplanations: {
            'A': '正确。.dockerignore减少构建上下文大小。',
            'B': '正确。多阶段构建优化镜像大小。',
            'C': '正确。非root用户提高安全性。',
            'D': '正确。健康检查帮助容器编排。'
        },
        tags: ['实战', 'Docker', '容器化', '最佳实践']
    },

    // 15. 日志管理实战
    {
        id: 15,
        type: 'single',
        question: '在分布式系统中，如何关联不同服务的日志？',
        options: [
            { value: 'A', text: '使用时间戳' },
            { value: 'B', text: '使用Trace ID' },
            { value: 'C', text: '使用用户ID' },
            { value: 'D', text: '使用IP地址' }
        ],
        correctAnswer: 'B',
        explanation: 'Trace ID是分布式追踪的标准做法，可以跟踪一个请求在多个服务间的完整调用链。',
        optionExplanations: {
            'A': '错误。时间戳不能唯一标识请求链。',
            'B': '正确。Trace ID用于分布式追踪。',
            'C': '错误。用户ID不能覆盖所有请求。',
            'D': '错误。IP地址不能标识请求链。'
        },
        tags: ['实战', '分布式追踪', '日志管理', '微服务']
    },

    // 16. 数据库事务处理
    {
        id: 16,
        type: 'single',
        question: '在Node.js中处理数据库事务时，如果中间步骤失败应该怎么办？',
        options: [
            { value: 'A', text: '继续执行后续操作' },
            { value: 'B', text: '回滚整个事务' },
            { value: 'C', text: '只回滚失败的操作' },
            { value: 'D', text: '重试失败的操作' }
        ],
        correctAnswer: 'B',
        explanation: '事务的ACID特性要求原子性，任何步骤失败都应该回滚整个事务，保证数据一致性。',
        optionExplanations: {
            'A': '错误。会导致数据不一致。',
            'B': '正确。事务失败应该完全回滚。',
            'C': '错误。违反了事务的原子性。',
            'D': '错误。应该先回滚再考虑重试。'
        },
        tags: ['实战', '数据库事务', 'ACID', '数据一致性']
    },

    // 17. API限流实战
    {
        id: 17,
        type: 'single',
        question: '实现API限流最常用的算法是？',
        options: [
            { value: 'A', text: '令牌桶算法' },
            { value: 'B', text: '漏桶算法' },
            { value: 'C', text: '滑动窗口算法' },
            { value: 'D', text: '以上都常用' }
        ],
        correctAnswer: 'D',
        explanation: '令牌桶、漏桶、滑动窗口都是常用的限流算法，各有适用场景。',
        optionExplanations: {
            'A': '部分正确。令牌桶允许突发流量。',
            'B': '部分正确。漏桶平滑输出流量。',
            'C': '部分正确。滑动窗口更精确。',
            'D': '正确。这些都是常用的限流算法。'
        },
        tags: ['实战', 'API限流', '算法', '流量控制']
    },

    // 18. 消息队列选择
    {
        id: 18,
        type: 'single',
        question: '对于需要保证消息顺序的场景，应该选择哪种消息队列特性？',
        options: [
            { value: 'A', text: '高吞吐量' },
            { value: 'B', text: '分区有序' },
            { value: 'C', text: '低延迟' },
            { value: 'D', text: '高可用' }
        ],
        correctAnswer: 'B',
        explanation: '分区有序可以保证同一分区内消息的顺序性，是处理有序消息的关键特性。',
        optionExplanations: {
            'A': '错误。高吞吐量不能保证顺序。',
            'B': '正确。分区有序保证消息顺序。',
            'C': '错误。低延迟不能保证顺序。',
            'D': '错误。高可用不能保证顺序。'
        },
        tags: ['实战', '消息队列', '消息顺序', '架构选择']
    },

    // 19. 代码质量保证
    {
        id: 19,
        type: 'multiple',
        question: '保证Node.js项目代码质量的工具和实践有哪些？',
        options: [
            { value: 'A', text: 'ESLint代码检查' },
            { value: 'B', text: 'Jest单元测试' },
            { value: 'C', text: 'Prettier代码格式化' },
            { value: 'D', text: 'Husky Git钩子' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些工具组合使用可以有效保证代码质量，形成完整的质量保证体系。',
        optionExplanations: {
            'A': '正确。ESLint检查代码规范和潜在问题。',
            'B': '正确。Jest提供测试框架保证功能正确性。',
            'C': '正确。Prettier统一代码格式。',
            'D': '正确。Husky在提交前自动执行检查。'
        },
        tags: ['实战', '代码质量', '工具链', '最佳实践']
    },

    // 20. 部署策略选择
    {
        id: 20,
        type: 'single',
        question: '对于高可用性要求的Node.js应用，最适合的部署策略是？',
        options: [
            { value: 'A', text: '蓝绿部署' },
            { value: 'B', text: '滚动部署' },
            { value: 'C', text: '金丝雀部署' },
            { value: 'D', text: '根据具体需求选择' }
        ],
        correctAnswer: 'D',
        explanation: '不同部署策略各有优势：蓝绿部署快速回滚、滚动部署资源利用率高、金丝雀部署风险最小。',
        optionExplanations: {
            'A': '部分正确。蓝绿部署适合快速回滚场景。',
            'B': '部分正确。滚动部署适合资源受限场景。',
            'C': '部分正确。金丝雀部署适合风险控制场景。',
            'D': '正确。应该根据具体需求选择合适策略。'
        },
        tags: ['实战', '部署策略', '高可用', '架构设计']
    },

    // 21. 面试题：模块系统
    {
        id: 21,
        type: 'single',
        question: 'require()和import的主要区别是什么？',
        options: [
            { value: 'A', text: 'require是同步的，import是异步的' },
            { value: 'B', text: 'require是动态的，import是静态的' },
            { value: 'C', text: 'require是运行时的，import是编译时的' },
            { value: 'D', text: '以上都对' }
        ],
        correctAnswer: 'D',
        explanation: 'require是CommonJS的同步、动态、运行时加载；import是ES6的异步、静态、编译时分析。',
        optionExplanations: {
            'A': '部分正确。require同步，import异步。',
            'B': '部分正确。require动态，import静态。',
            'C': '部分正确。require运行时，import编译时。',
            'D': '正确。这些都是两者的重要区别。'
        },
        tags: ['面试题', '模块系统', 'CommonJS', 'ES6模块']
    },

    // 22. 内存管理面试题
    {
        id: 22,
        type: 'single',
        question: '如何增加Node.js应用的最大堆内存？',
        options: [
            { value: 'A', text: 'node --max-memory app.js' },
            { value: 'B', text: 'node --max-old-space-size=4096 app.js' },
            { value: 'C', text: 'node --heap-size=4096 app.js' },
            { value: 'D', text: 'node --memory=4096 app.js' }
        ],
        correctAnswer: 'B',
        explanation: '--max-old-space-size参数可以设置V8引擎老生代的最大内存大小（单位MB）。',
        optionExplanations: {
            'A': '错误。没有--max-memory参数。',
            'B': '正确。--max-old-space-size设置最大堆内存。',
            'C': '错误。没有--heap-size参数。',
            'D': '错误。没有--memory参数。'
        },
        tags: ['面试题', '内存管理', 'V8参数', '性能调优']
    },

    // 23. 异步编程面试题
    {
        id: 23,
        type: 'single',
        question: '以下哪种方式可以并行执行多个异步操作？',
        options: [
            { value: 'A', text: 'await promise1; await promise2;' },
            { value: 'B', text: 'Promise.all([promise1, promise2])' },
            { value: 'C', text: 'promise1.then(() => promise2)' },
            { value: 'D', text: 'async function() { return promise1 && promise2 }' }
        ],
        correctAnswer: 'B',
        explanation: 'Promise.all()可以并行执行多个Promise，等待所有Promise完成后返回结果数组。',
        optionExplanations: {
            'A': '错误。这是串行执行，不是并行。',
            'B': '正确。Promise.all()实现并行执行。',
            'C': '错误。这是串行执行。',
            'D': '错误。这不是正确的异步语法。'
        },
        tags: ['面试题', '异步编程', 'Promise.all', '并行执行']
    },

    // 24. 实战：文件上传处理
    {
        id: 24,
        type: 'multiple',
        question: '处理大文件上传时需要考虑哪些问题？',
        options: [
            { value: 'A', text: '分片上传' },
            { value: 'B', text: '断点续传' },
            { value: 'C', text: '文件类型验证' },
            { value: 'D', text: '上传进度显示' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '大文件上传需要考虑用户体验、网络稳定性、安全性等多个方面。',
        optionExplanations: {
            'A': '正确。分片上传减少单次传输压力。',
            'B': '正确。断点续传提高用户体验。',
            'C': '正确。文件类型验证保证安全性。',
            'D': '正确。进度显示改善用户体验。'
        },
        tags: ['实战', '文件上传', '用户体验', '性能优化']
    },

    // 25. 实战：数据验证
    {
        id: 25,
        type: 'single',
        question: '在Node.js API中，数据验证应该在哪个层面进行？',
        options: [
            { value: 'A', text: '只在前端验证' },
            { value: 'B', text: '只在数据库层验证' },
            { value: 'C', text: '前端和后端都要验证' },
            { value: 'D', text: '只在中间件层验证' }
        ],
        correctAnswer: 'C',
        explanation: '前端验证提升用户体验，后端验证保证数据安全，两者缺一不可。',
        optionExplanations: {
            'A': '错误。前端验证可以被绕过。',
            'B': '错误。数据库层验证太晚，影响性能。',
            'C': '正确。前后端都需要验证，各有作用。',
            'D': '错误。只在中间件验证不够全面。'
        },
        tags: ['实战', '数据验证', '安全', '最佳实践']
    },

    // 26. 性能优化实战
    {
        id: 26,
        type: 'multiple',
        question: 'Node.js应用性能优化的常用方法有哪些？',
        options: [
            { value: 'A', text: '使用缓存' },
            { value: 'B', text: '数据库查询优化' },
            { value: 'C', text: '启用Gzip压缩' },
            { value: 'D', text: '使用CDN' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是有效的性能优化方法，可以从不同角度提升应用性能。',
        optionExplanations: {
            'A': '正确。缓存减少重复计算和查询。',
            'B': '正确。优化查询减少数据库压力。',
            'C': '正确。Gzip压缩减少传输数据量。',
            'D': '正确。CDN加速静态资源访问。'
        },
        tags: ['实战', '性能优化', '缓存', 'CDN']
    },

    // 27. 实战：API版本管理
    {
        id: 27,
        type: 'single',
        question: 'RESTful API版本管理的最佳方式是？',
        options: [
            { value: 'A', text: '在URL路径中：/api/v1/users' },
            { value: 'B', text: '在请求头中：Accept: application/vnd.api+json;version=1' },
            { value: 'C', text: '在查询参数中：/api/users?version=1' },
            { value: 'D', text: '根据团队约定选择' }
        ],
        correctAnswer: 'D',
        explanation: '不同的版本管理方式各有优缺点，应该根据团队约定和项目需求选择合适的方式。',
        optionExplanations: {
            'A': '部分正确。URL版本简单直观。',
            'B': '部分正确。请求头版本更符合REST原则。',
            'C': '部分正确。查询参数版本灵活性好。',
            'D': '正确。应该根据具体情况选择合适方式。'
        },
        tags: ['实战', 'API版本管理', 'RESTful', '架构设计']
    },

    // 28. 实战：错误监控
    {
        id: 28,
        type: 'multiple',
        question: '生产环境中Node.js应用的错误监控应该包括哪些内容？',
        options: [
            { value: 'A', text: '未捕获异常监控' },
            { value: 'B', text: '业务错误统计' },
            { value: 'C', text: '性能异常告警' },
            { value: 'D', text: '用户行为追踪' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '全面的错误监控体系应该覆盖系统异常、业务错误、性能问题和用户行为。',
        optionExplanations: {
            'A': '正确。未捕获异常可能导致应用崩溃。',
            'B': '正确。业务错误影响用户体验。',
            'C': '正确。性能异常需要及时发现。',
            'D': '正确。用户行为有助于问题定位。'
        },
        tags: ['实战', '错误监控', '生产环境', '运维']
    },

    // 29. 实战：数据库连接管理
    {
        id: 29,
        type: 'single',
        question: '在高并发场景下，如何避免数据库连接耗尽？',
        options: [
            { value: 'A', text: '增加数据库服务器' },
            { value: 'B', text: '使用连接池并设置合理的连接数' },
            { value: 'C', text: '减少数据库查询' },
            { value: 'D', text: '使用缓存替代数据库' }
        ],
        correctAnswer: 'B',
        explanation: '连接池可以复用连接，设置合理的最大连接数可以防止连接耗尽，这是最直接有效的解决方案。',
        optionExplanations: {
            'A': '部分正确，但成本高且不是根本解决方案。',
            'B': '正确。连接池是管理数据库连接的最佳实践。',
            'C': '部分正确，但可能影响功能。',
            'D': '部分正确，但不能完全替代数据库。'
        },
        tags: ['实战', '数据库连接', '高并发', '连接池']
    },

    // 30. 实战：服务健康检查
    {
        id: 30,
        type: 'single',
        question: 'Node.js服务的健康检查接口应该检查哪些内容？',
        options: [
            { value: 'A', text: '只检查服务是否启动' },
            { value: 'B', text: '检查服务启动状态和依赖服务连接' },
            { value: 'C', text: '只检查数据库连接' },
            { value: 'D', text: '只检查内存使用情况' }
        ],
        correctAnswer: 'B',
        explanation: '健康检查应该全面检查服务状态，包括自身状态和关键依赖服务的连接状态。',
        optionExplanations: {
            'A': '错误。检查内容太简单。',
            'B': '正确。应该检查服务和依赖的整体健康状态。',
            'C': '错误。检查范围太窄。',
            'D': '错误。内存只是健康状态的一个方面。'
        },
        tags: ['实战', '健康检查', '服务监控', '运维']
    },

    // 31. 面试题：Stream处理
    {
        id: 31,
        type: 'single',
        question: '处理大文件时，为什么要使用Stream而不是一次性读取？',
        options: [
            { value: 'A', text: '提高处理速度' },
            { value: 'B', text: '减少内存占用' },
            { value: 'C', text: '提高代码可读性' },
            { value: 'D', text: '减少CPU使用' }
        ],
        correctAnswer: 'B',
        explanation: 'Stream可以分块处理数据，避免将整个文件加载到内存中，防止内存溢出。',
        optionExplanations: {
            'A': '错误。Stream主要优势不是速度。',
            'B': '正确。Stream的主要优势是减少内存占用。',
            'C': '错误。Stream代码通常更复杂。',
            'D': '错误。CPU使用不是主要考虑因素。'
        },
        tags: ['面试题', 'Stream', '内存管理', '大文件处理']
    },

    // 32. 实战：API限流实现
    {
        id: 32,
        type: 'single',
        question: '实现API限流时，如何存储用户的请求计数？',
        options: [
            { value: 'A', text: '存储在内存中' },
            { value: 'B', text: '存储在Redis中' },
            { value: 'C', text: '存储在数据库中' },
            { value: 'D', text: '根据场景选择存储方式' }
        ],
        correctAnswer: 'D',
        explanation: '单机应用可以用内存，分布式应用需要Redis，持久化需求可以用数据库，应根据具体场景选择。',
        optionExplanations: {
            'A': '部分正确。适合单机应用。',
            'B': '部分正确。适合分布式应用。',
            'C': '部分正确。适合需要持久化的场景。',
            'D': '正确。应该根据具体需求选择合适方案。'
        },
        tags: ['实战', 'API限流', '存储选择', '架构设计']
    },

    // 33. 实战：配置管理
    {
        id: 33,
        type: 'multiple',
        question: 'Node.js应用的配置管理最佳实践包括？',
        options: [
            { value: 'A', text: '使用环境变量' },
            { value: 'B', text: '配置文件分环境' },
            { value: 'C', text: '敏感信息加密存储' },
            { value: 'D', text: '配置热更新' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是配置管理的重要实践，有助于提高应用的可维护性和安全性。',
        optionExplanations: {
            'A': '正确。环境变量便于部署时配置。',
            'B': '正确。不同环境需要不同配置。',
            'C': '正确。敏感信息需要加密保护。',
            'D': '正确。热更新避免重启服务。'
        },
        tags: ['实战', '配置管理', '环境变量', '安全']
    },

    // 34. 实战：测试策略
    {
        id: 34,
        type: 'multiple',
        question: 'Node.js应用的测试策略应该包括哪些类型的测试？',
        options: [
            { value: 'A', text: '单元测试' },
            { value: 'B', text: '集成测试' },
            { value: 'C', text: '端到端测试' },
            { value: 'D', text: '性能测试' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '完整的测试策略应该包括不同层级的测试，确保应用的质量和稳定性。',
        optionExplanations: {
            'A': '正确。单元测试验证单个函数或模块。',
            'B': '正确。集成测试验证模块间协作。',
            'C': '正确。端到端测试验证完整用户流程。',
            'D': '正确。性能测试验证系统性能指标。'
        },
        tags: ['实战', '测试策略', '质量保证', '自动化测试']
    },

    // 35. 面试题：中间件原理
    {
        id: 35,
        type: 'single',
        question: 'Express中间件的执行顺序是？',
        options: [
            { value: 'A', text: '随机执行' },
            { value: 'B', text: '按照注册顺序执行' },
            { value: 'C', text: '按照优先级执行' },
            { value: 'D', text: '并行执行' }
        ],
        correctAnswer: 'B',
        explanation: 'Express中间件按照注册顺序依次执行，这是中间件模式的基本原理。',
        optionExplanations: {
            'A': '错误。中间件有明确的执行顺序。',
            'B': '正确。按照app.use()的注册顺序执行。',
            'C': '错误。Express中间件没有优先级概念。',
            'D': '错误。中间件是串行执行的。'
        },
        tags: ['面试题', 'Express', '中间件', '执行顺序']
    },

    // 36. 实战：跨域处理
    {
        id: 36,
        type: 'multiple',
        question: '处理跨域请求的方法有哪些？',
        options: [
            { value: 'A', text: '设置CORS头' },
            { value: 'B', text: 'JSONP' },
            { value: 'C', text: '代理服务器' },
            { value: 'D', text: 'WebSocket' }
        ],
        correctAnswer: ['A', 'B', 'C'],
        explanation: 'CORS、JSONP、代理服务器都是处理跨域的有效方法，WebSocket不是跨域解决方案。',
        optionExplanations: {
            'A': '正确。CORS是现代跨域解决方案。',
            'B': '正确。JSONP是传统跨域解决方案。',
            'C': '正确。代理服务器可以绕过跨域限制。',
            'D': '错误。WebSocket不是跨域解决方案。'
        },
        tags: ['实战', '跨域', 'CORS', '前端安全']
    },

    // 37. 实战：数据分页
    {
        id: 37,
        type: 'single',
        question: '大数据量分页查询的最佳实践是？',
        options: [
            { value: 'A', text: '使用OFFSET和LIMIT' },
            { value: 'B', text: '使用游标分页' },
            { value: 'C', text: '一次性返回所有数据' },
            { value: 'D', text: '使用缓存存储所有数据' }
        ],
        correctAnswer: 'B',
        explanation: '游标分页（基于ID或时间戳）在大数据量时性能更好，避免了OFFSET的性能问题。',
        optionExplanations: {
            'A': '错误。OFFSET在大数据量时性能很差。',
            'B': '正确。游标分页性能更好，适合大数据量。',
            'C': '错误。会导致内存和网络问题。',
            'D': '错误。缓存所有数据不现实。'
        },
        tags: ['实战', '数据分页', '性能优化', '数据库查询']
    },

    // 38. 实战：文件存储
    {
        id: 38,
        type: 'single',
        question: '在云环境中，Node.js应用的文件存储最佳选择是？',
        options: [
            { value: 'A', text: '本地文件系统' },
            { value: 'B', text: '数据库BLOB字段' },
            { value: 'C', text: '对象存储服务（如S3）' },
            { value: 'D', text: '内存存储' }
        ],
        correctAnswer: 'C',
        explanation: '对象存储服务提供高可用性、可扩展性和CDN集成，是云环境中文件存储的最佳选择。',
        optionExplanations: {
            'A': '错误。本地存储在云环境中不可靠。',
            'B': '错误。数据库存储文件效率低。',
            'C': '正确。对象存储是云环境的最佳选择。',
            'D': '错误。内存存储不持久。'
        },
        tags: ['实战', '文件存储', '云服务', '架构设计']
    },

    // 39. 面试题：Promise链式调用
    {
        id: 39,
        type: 'single',
        question: 'Promise链式调用中，如果某个.then()没有返回值，下一个.then()接收到的是什么？',
        options: [
            { value: 'A', text: 'null' },
            { value: 'B', text: 'undefined' },
            { value: 'C', text: '上一个Promise的值' },
            { value: 'D', text: '抛出错误' }
        ],
        correctAnswer: 'B',
        explanation: '如果.then()中的函数没有返回值，下一个.then()会接收到undefined。',
        optionExplanations: {
            'A': '错误。不是null。',
            'B': '正确。没有返回值时传递undefined。',
            'C': '错误。不会传递上一个Promise的值。',
            'D': '错误。不会抛出错误。'
        },
        tags: ['面试题', 'Promise', '链式调用', '异步编程']
    },

    // 40. 实战：服务发现
    {
        id: 40,
        type: 'single',
        question: '在微服务架构中，服务发现的作用是什么？',
        options: [
            { value: 'A', text: '负载均衡' },
            { value: 'B', text: '自动找到可用的服务实例' },
            { value: 'C', text: '服务监控' },
            { value: 'D', text: '配置管理' }
        ],
        correctAnswer: 'B',
        explanation: '服务发现的核心作用是让服务能够自动找到其他可用的服务实例，实现动态服务调用。',
        optionExplanations: {
            'A': '错误。负载均衡是另一个概念。',
            'B': '正确。服务发现的核心功能。',
            'C': '错误。服务监控是另一个功能。',
            'D': '错误。配置管理是另一个概念。'
        },
        tags: ['实战', '微服务', '服务发现', '架构设计']
    },

    // 41. 实战：缓存失效策略
    {
        id: 41,
        type: 'multiple',
        question: '缓存失效的策略有哪些？',
        options: [
            { value: 'A', text: 'TTL（生存时间）' },
            { value: 'B', text: 'LRU（最近最少使用）' },
            { value: 'C', text: '主动失效' },
            { value: 'D', text: '定时刷新' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是常用的缓存失效策略，可以根据不同场景选择合适的策略。',
        optionExplanations: {
            'A': '正确。TTL基于时间自动失效。',
            'B': '正确。LRU基于使用频率失效。',
            'C': '正确。主动失效在数据更新时触发。',
            'D': '正确。定时刷新保持数据新鲜度。'
        },
        tags: ['实战', '缓存策略', '缓存失效', '性能优化']
    },

    // 42. 实战：API文档管理
    {
        id: 42,
        type: 'single',
        question: 'Node.js API文档自动生成的最佳工具是？',
        options: [
            { value: 'A', text: 'Swagger/OpenAPI' },
            { value: 'B', text: 'JSDoc' },
            { value: 'C', text: 'Postman' },
            { value: 'D', text: '手动编写' }
        ],
        correctAnswer: 'A',
        explanation: 'Swagger/OpenAPI是API文档的行业标准，支持自动生成、交互式测试和多语言客户端生成。',
        optionExplanations: {
            'A': '正确。Swagger/OpenAPI是API文档的最佳选择。',
            'B': '错误。JSDoc主要用于代码文档。',
            'C': '错误。Postman主要用于API测试。',
            'D': '错误。手动编写效率低且容易过时。'
        },
        tags: ['实战', 'API文档', 'Swagger', '开发工具']
    },

    // 43. 面试题：内存泄漏排查
    {
        id: 43,
        type: 'single',
        question: '如何排查Node.js应用的内存泄漏？',
        options: [
            { value: 'A', text: '只看内存使用量' },
            { value: 'B', text: '使用heapdump生成堆快照分析' },
            { value: 'C', text: '重启应用' },
            { value: 'D', text: '增加服务器内存' }
        ],
        correctAnswer: 'B',
        explanation: 'heapdump可以生成堆快照，通过分析对象引用关系来定位内存泄漏的根本原因。',
        optionExplanations: {
            'A': '错误。只看使用量无法定位问题。',
            'B': '正确。堆快照分析是排查内存泄漏的有效方法。',
            'C': '错误。重启只是临时解决方案。',
            'D': '错误。增加内存不能解决根本问题。'
        },
        tags: ['面试题', '内存泄漏', '性能调试', '故障排查']
    },

    // 44. 实战：数据库事务隔离
    {
        id: 44,
        type: 'single',
        question: '在高并发场景下，数据库事务隔离级别应该如何选择？',
        options: [
            { value: 'A', text: '总是使用最高隔离级别' },
            { value: 'B', text: '总是使用最低隔离级别' },
            { value: 'C', text: '根据业务需求平衡一致性和性能' },
            { value: 'D', text: '不使用事务' }
        ],
        correctAnswer: 'C',
        explanation: '隔离级别的选择需要在数据一致性和系统性能之间找到平衡，根据具体业务需求决定。',
        optionExplanations: {
            'A': '错误。最高隔离级别性能差。',
            'B': '错误。最低隔离级别可能导致数据不一致。',
            'C': '正确。需要根据业务需求平衡选择。',
            'D': '错误。高并发更需要事务保证一致性。'
        },
        tags: ['实战', '数据库事务', '隔离级别', '高并发']
    },

    // 45. 实战：API安全
    {
        id: 45,
        type: 'multiple',
        question: 'Node.js API安全防护措施包括哪些？',
        options: [
            { value: 'A', text: 'HTTPS加密传输' },
            { value: 'B', text: 'JWT身份认证' },
            { value: 'C', text: '输入验证和清理' },
            { value: 'D', text: '限流和防DDoS' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是API安全的重要防护措施，需要综合使用来保证API的安全性。',
        optionExplanations: {
            'A': '正确。HTTPS保护数据传输安全。',
            'B': '正确。JWT提供身份认证机制。',
            'C': '正确。输入验证防止注入攻击。',
            'D': '正确。限流防止恶意攻击。'
        },
        tags: ['实战', 'API安全', 'HTTPS', '身份认证']
    },

    // 46. 实战：日志分析
    {
        id: 46,
        type: 'single',
        question: '在分布式系统中，如何实现日志的集中分析？',
        options: [
            { value: 'A', text: '每个服务单独查看日志' },
            { value: 'B', text: '使用ELK（Elasticsearch, Logstash, Kibana）栈' },
            { value: 'C', text: '只保存错误日志' },
            { value: 'D', text: '不记录日志' }
        ],
        correctAnswer: 'B',
        explanation: 'ELK栈是分布式系统日志集中分析的经典解决方案，提供日志收集、存储、搜索和可视化功能。',
        optionExplanations: {
            'A': '错误。分布式系统需要集中分析。',
            'B': '正确。ELK栈是日志分析的经典方案。',
            'C': '错误。需要记录多种类型的日志。',
            'D': '错误。日志对故障排查很重要。'
        },
        tags: ['实战', '日志分析', 'ELK', '分布式系统']
    },

    // 47. 面试题：垃圾回收
    {
        id: 47,
        type: 'single',
        question: '什么情况下Node.js的垃圾回收会影响应用性能？',
        options: [
            { value: 'A', text: '内存使用量很小时' },
            { value: 'B', text: '老生代内存占用过高时' },
            { value: 'C', text: '新生代内存占用过高时' },
            { value: 'D', text: '垃圾回收从不影响性能' }
        ],
        correctAnswer: 'B',
        explanation: '当老生代内存占用过高时，垃圾回收会进行标记-清除操作，这个过程会暂停应用执行，影响性能。',
        optionExplanations: {
            'A': '错误。内存使用量小时垃圾回收影响很小。',
            'B': '正确。老生代GC会暂停应用执行。',
            'C': '错误。新生代GC速度很快，影响较小。',
            'D': '错误。垃圾回收确实会影响性能。'
        },
        tags: ['面试题', '垃圾回收', 'V8引擎', '性能优化']
    },

    // 48. 实战：容器编排
    {
        id: 48,
        type: 'single',
        question: '在Kubernetes中部署Node.js应用时，如何处理应用的优雅关闭？',
        options: [
            { value: 'A', text: '直接杀死进程' },
            { value: 'B', text: '监听SIGTERM信号并优雅关闭' },
            { value: 'C', text: '设置更长的超时时间' },
            { value: 'D', text: '忽略关闭信号' }
        ],
        correctAnswer: 'B',
        explanation: 'Kubernetes发送SIGTERM信号通知Pod关闭，应用应该监听这个信号并优雅关闭连接和资源。',
        optionExplanations: {
            'A': '错误。直接杀死进程可能导致数据丢失。',
            'B': '正确。监听SIGTERM实现优雅关闭。',
            'C': '错误。超时时间不能解决根本问题。',
            'D': '错误。忽略信号会导致强制终止。'
        },
        tags: ['实战', 'Kubernetes', '优雅关闭', '容器编排']
    },

    // 49. 实战：性能基准测试
    {
        id: 49,
        type: 'multiple',
        question: 'Node.js应用性能基准测试应该关注哪些指标？',
        options: [
            { value: 'A', text: 'RPS（每秒请求数）' },
            { value: 'B', text: '平均响应时间' },
            { value: 'C', text: 'P95/P99响应时间' },
            { value: 'D', text: '错误率' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是性能测试的关键指标，全面反映应用的性能表现和稳定性。',
        optionExplanations: {
            'A': '正确。RPS反映系统吞吐能力。',
            'B': '正确。平均响应时间反映整体性能。',
            'C': '正确。P95/P99反映极端情况下的性能。',
            'D': '正确。错误率反映系统稳定性。'
        },
        tags: ['实战', '性能测试', '基准测试', '性能指标']
    },

    // 50. 综合实战：系统架构设计
    {
        id: 50,
        type: 'single',
        question: '设计一个高可用的Node.js电商系统，最重要的架构原则是什么？',
        options: [
            { value: 'A', text: '使用最新的技术栈' },
            { value: 'B', text: '单体架构简单易维护' },
            { value: 'C', text: '无状态设计和服务解耦' },
            { value: 'D', text: '追求极致的性能优化' }
        ],
        correctAnswer: 'C',
        explanation: '无状态设计使应用易于扩展，服务解耦提高系统的可维护性和容错能力，这是高可用系统的基础。',
        optionExplanations: {
            'A': '错误。技术选择应该基于需求，不是越新越好。',
            'B': '错误。大型系统需要适当的服务拆分。',
            'C': '正确。无状态和解耦是高可用的核心原则。',
            'D': '错误。性能重要但不是最重要的架构原则。'
        },
        tags: ['实战', '系统架构', '高可用', '设计原则', '电商系统']
    }
];