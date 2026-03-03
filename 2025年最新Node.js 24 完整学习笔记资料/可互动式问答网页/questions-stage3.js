// 阶段三：高阶精进题库
// 涵盖性能优化、集群、流处理、事件循环、内存管理等高级知识点

window.stage3Questions = [
    // 1. 事件循环深入
    {
        id: 1,
        type: 'single',
        question: 'Node.js事件循环的六个阶段中，哪个阶段处理setTimeout和setInterval？',
        options: [
            { value: 'A', text: 'Timer阶段' },
            { value: 'B', text: 'Poll阶段' },
            { value: 'C', text: 'Check阶段' },
            { value: 'D', text: 'Close callbacks阶段' }
        ],
        correctAnswer: 'A',
        explanation: 'Timer阶段是事件循环的第一个阶段，专门处理setTimeout和setInterval的回调函数。',
        optionExplanations: {
            'A': '正确。Timer阶段处理setTimeout和setInterval的回调。',
            'B': '错误。Poll阶段主要处理I/O操作。',
            'C': '错误。Check阶段处理setImmediate回调。',
            'D': '错误。Close callbacks阶段处理关闭事件的回调。'
        },
        tags: ['事件循环', 'Timer阶段', '异步机制']
    },

    // 2. setImmediate vs setTimeout
    {
        id: 2,
        type: 'single',
        question: '在I/O回调中，setImmediate和setTimeout(fn, 0)的执行顺序是？',
        options: [
            { value: 'A', text: 'setTimeout先执行' },
            { value: 'B', text: 'setImmediate先执行' },
            { value: 'C', text: '执行顺序不确定' },
            { value: 'D', text: '同时执行' }
        ],
        correctAnswer: 'B',
        explanation: '在I/O回调中，setImmediate总是在setTimeout之前执行，因为Check阶段在Timer阶段之后。',
        optionExplanations: {
            'A': '错误。在I/O回调中，setImmediate优先级更高。',
            'B': '正确。setImmediate在Check阶段执行，优先于下一轮的Timer阶段。',
            'C': '错误。在I/O回调中执行顺序是确定的。',
            'D': '错误。它们不会同时执行。'
        },
        tags: ['setImmediate', 'setTimeout', '事件循环', '执行顺序']
    },

    // 3. process.nextTick
    {
        id: 3,
        type: 'single',
        question: 'process.nextTick的执行时机是？',
        options: [
            { value: 'A', text: '在当前阶段结束后，下一个阶段开始前' },
            { value: 'B', text: '在Timer阶段' },
            { value: 'C', text: '在Poll阶段' },
            { value: 'D', text: '在Check阶段' }
        ],
        correctAnswer: 'A',
        explanation: 'process.nextTick在每个事件循环阶段结束后立即执行，优先级最高。',
        optionExplanations: {
            'A': '正确。process.nextTick在每个阶段转换时执行。',
            'B': '错误。不是在特定阶段执行。',
            'C': '错误。不是在特定阶段执行。',
            'D': '错误。不是在特定阶段执行。'
        },
        tags: ['process.nextTick', '事件循环', '微任务']
    },

    // 4. 微任务队列
    {
        id: 4,
        type: 'multiple',
        question: 'Node.js中哪些属于微任务？',
        options: [
            { value: 'A', text: 'process.nextTick' },
            { value: 'B', text: 'Promise.then' },
            { value: 'C', text: 'queueMicrotask' },
            { value: 'D', text: 'setTimeout' }
        ],
        correctAnswer: ['A', 'B', 'C'],
        explanation: 'process.nextTick、Promise.then、queueMicrotask都是微任务，setTimeout是宏任务。',
        optionExplanations: {
            'A': '正确。process.nextTick是微任务。',
            'B': '正确。Promise.then是微任务。',
            'C': '正确。queueMicrotask是微任务。',
            'D': '错误。setTimeout是宏任务。'
        },
        tags: ['微任务', '宏任务', '异步队列']
    },

    // 5. 集群模块
    {
        id: 5,
        type: 'single',
        question: 'Node.js cluster模块的主要作用是？',
        options: [
            { value: 'A', text: '创建子进程' },
            { value: 'B', text: '创建多个工作进程共享同一端口' },
            { value: 'C', text: '管理内存' },
            { value: 'D', text: '处理文件系统' }
        ],
        correctAnswer: 'B',
        explanation: 'cluster模块允许创建多个工作进程，它们可以共享同一个服务器端口，实现负载均衡。',
        optionExplanations: {
            'A': '错误。child_process模块用于创建子进程。',
            'B': '正确。cluster模块实现多进程负载均衡。',
            'C': '错误。cluster不是用于内存管理。',
            'D': '错误。fs模块处理文件系统。'
        },
        tags: ['cluster模块', '多进程', '负载均衡']
    },

    // 6. 工作进程通信
    {
        id: 6,
        type: 'single',
        question: '在cluster模块中，主进程和工作进程之间如何通信？',
        options: [
            { value: 'A', text: '共享内存' },
            { value: 'B', text: 'IPC（进程间通信）' },
            { value: 'C', text: 'HTTP请求' },
            { value: 'D', text: '文件系统' }
        ],
        correctAnswer: 'B',
        explanation: 'cluster模块使用IPC（Inter-Process Communication）进行主进程和工作进程之间的通信。',
        optionExplanations: {
            'A': '错误。Node.js进程不共享内存。',
            'B': '正确。使用IPC进行进程间通信。',
            'C': '错误。不是通过HTTP通信。',
            'D': '错误。不是通过文件系统通信。'
        },
        tags: ['IPC', '进程通信', 'cluster']
    },

    // 7. 流的类型
    {
        id: 7,
        type: 'multiple',
        question: 'Node.js中有哪些类型的流？',
        options: [
            { value: 'A', text: 'Readable（可读流）' },
            { value: 'B', text: 'Writable（可写流）' },
            { value: 'C', text: 'Duplex（双工流）' },
            { value: 'D', text: 'Transform（转换流）' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Node.js有四种基本的流类型：Readable、Writable、Duplex和Transform。',
        optionExplanations: {
            'A': '正确。Readable流用于读取数据。',
            'B': '正确。Writable流用于写入数据。',
            'C': '正确。Duplex流既可读又可写。',
            'D': '正确。Transform流是特殊的Duplex流，可以修改数据。'
        },
        tags: ['流', 'Readable', 'Writable', 'Duplex', 'Transform']
    },

    // 8. 背压处理
    {
        id: 8,
        type: 'single',
        question: '在Node.js流中，背压（backpressure）是什么？',
        options: [
            { value: 'A', text: '数据压缩技术' },
            { value: 'B', text: '当写入速度超过处理速度时的流控机制' },
            { value: 'C', text: '错误处理机制' },
            { value: 'D', text: '内存管理技术' }
        ],
        correctAnswer: 'B',
        explanation: '背压是当数据写入速度超过处理速度时，流自动暂停写入以防止内存溢出的机制。',
        optionExplanations: {
            'A': '错误。背压不是压缩技术。',
            'B': '正确。背压是流控机制，防止内存溢出。',
            'C': '错误。背压不是错误处理机制。',
            'D': '错误。背压是流控制，不是内存管理。'
        },
        tags: ['背压', '流控制', '内存管理']
    },

    // 9. pipeline方法
    {
        id: 9,
        type: 'single',
        question: 'stream.pipeline()方法的主要优势是？',
        options: [
            { value: 'A', text: '提高性能' },
            { value: 'B', text: '自动处理错误和清理资源' },
            { value: 'C', text: '减少内存使用' },
            { value: 'D', text: '简化代码' }
        ],
        correctAnswer: 'B',
        explanation: 'pipeline方法的主要优势是自动处理错误传播和资源清理，避免内存泄漏。',
        optionExplanations: {
            'A': '部分正确，但不是主要优势。',
            'B': '正确。pipeline自动处理错误和资源清理。',
            'C': '部分正确，但不是主要优势。',
            'D': '部分正确，但不是主要优势。'
        },
        tags: ['pipeline', '错误处理', '资源管理']
    },

    // 10. Buffer性能
    {
        id: 10,
        type: 'single',
        question: '创建Buffer的最高效方式是？',
        options: [
            { value: 'A', text: 'new Buffer()' },
            { value: 'B', text: 'Buffer.alloc()' },
            { value: 'C', text: 'Buffer.allocUnsafe()' },
            { value: 'D', text: 'Buffer.from()' }
        ],
        correctAnswer: 'C',
        explanation: 'Buffer.allocUnsafe()最高效，因为它不会初始化内存，但需要手动清理敏感数据。',
        optionExplanations: {
            'A': '错误。new Buffer()已被废弃。',
            'B': '错误。Buffer.alloc()会初始化内存，性能较低。',
            'C': '正确。Buffer.allocUnsafe()性能最高，但需要注意安全性。',
            'D': '错误。Buffer.from()用于从现有数据创建Buffer。'
        },
        tags: ['Buffer', '性能优化', '内存管理']
    },

    // 11. 内存泄漏检测
    {
        id: 11,
        type: 'multiple',
        question: '检测Node.js内存泄漏的工具有哪些？',
        options: [
            { value: 'A', text: 'heapdump' },
            { value: 'B', text: 'clinic.js' },
            { value: 'C', text: 'node --inspect' },
            { value: 'D', text: 'memwatch-next' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是检测Node.js内存泄漏的有效工具。',
        optionExplanations: {
            'A': '正确。heapdump可以生成堆快照。',
            'B': '正确。clinic.js是性能诊断工具套件。',
            'C': '正确。--inspect可以启用调试器进行内存分析。',
            'D': '正确。memwatch-next可以监控内存使用。'
        },
        tags: ['内存泄漏', '性能调试', '诊断工具']
    },

    // 12. V8垃圾回收
    {
        id: 12,
        type: 'single',
        question: 'V8引擎的垃圾回收主要使用哪种算法？',
        options: [
            { value: 'A', text: '引用计数' },
            { value: 'B', text: '标记-清除' },
            { value: 'C', text: '复制算法' },
            { value: 'D', text: '分代收集' }
        ],
        correctAnswer: 'D',
        explanation: 'V8使用分代收集算法，将堆分为新生代和老生代，使用不同的回收策略。',
        optionExplanations: {
            'A': '错误。引用计数无法处理循环引用。',
            'B': '部分正确。标记-清除是分代收集的一部分。',
            'C': '部分正确。复制算法用于新生代。',
            'D': '正确。V8使用分代收集算法。'
        },
        tags: ['V8引擎', '垃圾回收', '分代收集']
    },

    // 13. 新生代垃圾回收
    {
        id: 13,
        type: 'single',
        question: 'V8新生代垃圾回收使用的算法是？',
        options: [
            { value: 'A', text: 'Scavenge算法' },
            { value: 'B', text: 'Mark-Sweep算法' },
            { value: 'C', text: 'Mark-Compact算法' },
            { value: 'D', text: 'Incremental算法' }
        ],
        correctAnswer: 'A',
        explanation: '新生代使用Scavenge算法，基于复制的方式进行垃圾回收。',
        optionExplanations: {
            'A': '正确。新生代使用Scavenge算法。',
            'B': '错误。Mark-Sweep用于老生代。',
            'C': '错误。Mark-Compact用于老生代。',
            'D': '错误。Incremental是优化技术，不是基本算法。'
        },
        tags: ['新生代', 'Scavenge算法', '垃圾回收']
    },

    // 14. 内存限制
    {
        id: 14,
        type: 'single',
        question: '默认情况下，Node.js进程的最大堆内存限制是？',
        options: [
            { value: 'A', text: '512MB' },
            { value: 'B', text: '1GB' },
            { value: 'C', text: '1.4GB（64位）' },
            { value: 'D', text: '无限制' }
        ],
        correctAnswer: 'C',
        explanation: '64位系统上Node.js默认最大堆内存约为1.4GB，32位系统约为512MB。',
        optionExplanations: {
            'A': '部分正确。32位系统的限制。',
            'B': '错误。不是默认限制。',
            'C': '正确。64位系统的默认限制约为1.4GB。',
            'D': '错误。有默认限制。'
        },
        tags: ['内存限制', '堆内存', 'V8限制']
    },

    // 15. 内存限制调整
    {
        id: 15,
        type: 'single',
        question: '增加Node.js最大堆内存的参数是？',
        options: [
            { value: 'A', text: '--max-memory' },
            { value: 'B', text: '--max-old-space-size' },
            { value: 'C', text: '--heap-size' },
            { value: 'D', text: '--memory-limit' }
        ],
        correctAnswer: 'B',
        explanation: '--max-old-space-size参数可以设置老生代的最大内存大小。',
        optionExplanations: {
            'A': '错误。没有这个参数。',
            'B': '正确。--max-old-space-size设置老生代最大内存。',
            'C': '错误。没有这个参数。',
            'D': '错误。没有这个参数。'
        },
        tags: ['内存调优', 'V8参数', '性能优化']
    },

    // 16. Worker Threads
    {
        id: 16,
        type: 'single',
        question: 'Node.js Worker Threads的主要用途是？',
        options: [
            { value: 'A', text: '处理I/O密集型任务' },
            { value: 'B', text: '处理CPU密集型任务' },
            { value: 'C', text: '管理数据库连接' },
            { value: 'D', text: '处理网络请求' }
        ],
        correctAnswer: 'B',
        explanation: 'Worker Threads主要用于处理CPU密集型任务，避免阻塞主线程。',
        optionExplanations: {
            'A': '错误。I/O密集型任务由事件循环处理。',
            'B': '正确。Worker Threads专门处理CPU密集型任务。',
            'C': '错误。数据库连接不需要Worker Threads。',
            'D': '错误。网络请求由事件循环处理。'
        },
        tags: ['Worker Threads', 'CPU密集型', '多线程']
    },

    // 17. 线程间通信
    {
        id: 17,
        type: 'single',
        question: 'Worker Threads之间如何共享数据？',
        options: [
            { value: 'A', text: '共享内存' },
            { value: 'B', text: 'SharedArrayBuffer' },
            { value: 'C', text: 'MessagePort' },
            { value: 'D', text: 'B和C都可以' }
        ],
        correctAnswer: 'D',
        explanation: 'Worker Threads可以通过SharedArrayBuffer共享内存，也可以通过MessagePort传递消息。',
        optionExplanations: {
            'A': '部分正确。通过SharedArrayBuffer实现。',
            'B': '部分正确。SharedArrayBuffer可以共享内存。',
            'C': '部分正确。MessagePort用于消息传递。',
            'D': '正确。两种方式都可以用于数据共享。'
        },
        tags: ['Worker Threads', 'SharedArrayBuffer', 'MessagePort']
    },

    // 18. 异步迭代器
    {
        id: 18,
        type: 'single',
        question: '异步迭代器的Symbol是？',
        options: [
            { value: 'A', text: 'Symbol.iterator' },
            { value: 'B', text: 'Symbol.asyncIterator' },
            { value: 'C', text: 'Symbol.async' },
            { value: 'D', text: 'Symbol.asyncIterable' }
        ],
        correctAnswer: 'B',
        explanation: 'Symbol.asyncIterator是异步迭代器的标识符。',
        optionExplanations: {
            'A': '错误。Symbol.iterator用于同步迭代器。',
            'B': '正确。Symbol.asyncIterator用于异步迭代器。',
            'C': '错误。没有这个Symbol。',
            'D': '错误。没有这个Symbol。'
        },
        tags: ['异步迭代器', 'Symbol.asyncIterator', 'ES2018']
    },

    // 19. for await...of
    {
        id: 19,
        type: 'boolean',
        question: 'for await...of循环可以用于处理异步可迭代对象。',
        correctAnswer: true,
        explanation: 'for await...of是ES2018引入的语法，专门用于处理异步可迭代对象。',
        tags: ['for await...of', '异步迭代', 'ES2018']
    },

    // 20. 流的异步迭代
    {
        id: 20,
        type: 'boolean',
        question: 'Node.js的Readable流支持异步迭代。',
        correctAnswer: true,
        explanation: 'Node.js的Readable流实现了异步迭代器接口，可以使用for await...of循环。',
        tags: ['Readable流', '异步迭代', '流处理']
    },

    // 21. 性能监控
    {
        id: 21,
        type: 'single',
        question: '监控Node.js应用性能的内置模块是？',
        options: [
            { value: 'A', text: 'perf_hooks' },
            { value: 'B', text: 'performance' },
            { value: 'C', text: 'monitor' },
            { value: 'D', text: 'profiler' }
        ],
        correctAnswer: 'A',
        explanation: 'perf_hooks模块提供了性能监控的API，包括Performance Observer等。',
        optionExplanations: {
            'A': '正确。perf_hooks是性能监控的内置模块。',
            'B': '错误。performance是浏览器API。',
            'C': '错误。没有monitor内置模块。',
            'D': '错误。没有profiler内置模块。'
        },
        tags: ['性能监控', 'perf_hooks', '性能分析']
    },

    // 22. Performance Observer
    {
        id: 22,
        type: 'single',
        question: 'Performance Observer可以监控哪些性能指标？',
        options: [
            { value: 'A', text: '只能监控HTTP请求' },
            { value: 'B', text: '只能监控函数执行时间' },
            { value: 'C', text: '可以监控多种性能指标' },
            { value: 'D', text: '只能监控内存使用' }
        ],
        correctAnswer: 'C',
        explanation: 'Performance Observer可以监控多种性能指标，包括HTTP请求、函数执行、GC等。',
        optionExplanations: {
            'A': '错误。不仅限于HTTP请求。',
            'B': '错误。不仅限于函数执行时间。',
            'C': '正确。可以监控多种性能指标。',
            'D': '错误。不仅限于内存使用。'
        },
        tags: ['Performance Observer', '性能指标', '监控']
    },

    // 23. 代码覆盖率
    {
        id: 23,
        type: 'single',
        question: 'Node.js内置的代码覆盖率功能使用哪个参数启用？',
        options: [
            { value: 'A', text: '--coverage' },
            { value: 'B', text: '--experimental-loader' },
            { value: 'C', text: '--experimental-coverage' },
            { value: 'D', text: '--inspect-coverage' }
        ],
        correctAnswer: 'C',
        explanation: '--experimental-coverage参数可以启用Node.js内置的代码覆盖率功能。',
        optionExplanations: {
            'A': '错误。没有--coverage参数。',
            'B': '错误。--experimental-loader用于模块加载。',
            'C': '正确。--experimental-coverage启用代码覆盖率。',
            'D': '错误。没有--inspect-coverage参数。'
        },
        tags: ['代码覆盖率', '测试', '性能分析']
    },

    // 24. 模块加载优化
    {
        id: 24,
        type: 'single',
        question: '提高模块加载性能的最佳实践是？',
        options: [
            { value: 'A', text: '使用require.cache' },
            { value: 'B', text: '延迟加载模块' },
            { value: 'C', text: '预编译模块' },
            { value: 'D', text: '以上都是' }
        ],
        correctAnswer: 'D',
        explanation: '使用缓存、延迟加载、预编译都是提高模块加载性能的有效方法。',
        optionExplanations: {
            'A': '部分正确。require.cache可以避免重复加载。',
            'B': '部分正确。延迟加载可以减少启动时间。',
            'C': '部分正确。预编译可以提高加载速度。',
            'D': '正确。这些都是有效的优化方法。'
        },
        tags: ['模块加载', '性能优化', '最佳实践']
    },

    // 25. HTTP/2支持
    {
        id: 25,
        type: 'single',
        question: 'Node.js中HTTP/2支持的模块是？',
        options: [
            { value: 'A', text: 'http' },
            { value: 'B', text: 'http2' },
            { value: 'C', text: 'https' },
            { value: 'D', text: 'spdy' }
        ],
        correctAnswer: 'B',
        explanation: 'Node.js提供了专门的http2模块来支持HTTP/2协议。',
        optionExplanations: {
            'A': '错误。http模块支持HTTP/1.1。',
            'B': '正确。http2模块支持HTTP/2协议。',
            'C': '错误。https模块支持HTTPS。',
            'D': '错误。spdy是第三方模块。'
        },
        tags: ['HTTP/2', 'http2模块', '网络协议']
    },

    // 26. HTTP/2优势
    {
        id: 26,
        type: 'multiple',
        question: 'HTTP/2相比HTTP/1.1的优势有哪些？',
        options: [
            { value: 'A', text: '多路复用' },
            { value: 'B', text: '服务器推送' },
            { value: 'C', text: '头部压缩' },
            { value: 'D', text: '二进制协议' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'HTTP/2的主要优势包括多路复用、服务器推送、头部压缩和二进制协议。',
        optionExplanations: {
            'A': '正确。多路复用允许并行请求。',
            'B': '正确。服务器可以主动推送资源。',
            'C': '正确。HPACK算法压缩头部。',
            'D': '正确。使用二进制格式传输。'
        },
        tags: ['HTTP/2', '多路复用', '服务器推送', '性能优化']
    },

    // 27. 诊断报告
    {
        id: 27,
        type: 'single',
        question: '生成Node.js诊断报告的参数是？',
        options: [
            { value: 'A', text: '--report' },
            { value: 'B', text: '--diagnostic-report' },
            { value: 'C', text: '--report-on-signal' },
            { value: 'D', text: '--generate-report' }
        ],
        correctAnswer: 'C',
        explanation: '--report-on-signal参数可以在接收到信号时生成诊断报告。',
        optionExplanations: {
            'A': '错误。--report不是正确的参数。',
            'B': '错误。没有--diagnostic-report参数。',
            'C': '正确。--report-on-signal生成诊断报告。',
            'D': '错误。没有--generate-report参数。'
        },
        tags: ['诊断报告', '调试', '故障排查']
    },

    // 28. 异步钩子
    {
        id: 28,
        type: 'single',
        question: 'Node.js中用于跟踪异步操作的模块是？',
        options: [
            { value: 'A', text: 'async_hooks' },
            { value: 'B', text: 'async_trace' },
            { value: 'C', text: 'async_context' },
            { value: 'D', text: 'async_monitor' }
        ],
        correctAnswer: 'A',
        explanation: 'async_hooks模块提供了跟踪异步资源生命周期的API。',
        optionExplanations: {
            'A': '正确。async_hooks用于跟踪异步操作。',
            'B': '错误。没有async_trace模块。',
            'C': '错误。没有async_context模块。',
            'D': '错误。没有async_monitor模块。'
        },
        tags: ['async_hooks', '异步跟踪', '调试']
    },

    // 29. 异步上下文
    {
        id: 29,
        type: 'single',
        question: 'AsyncLocalStorage的主要用途是？',
        options: [
            { value: 'A', text: '存储全局变量' },
            { value: 'B', text: '在异步调用链中传递上下文' },
            { value: 'C', text: '缓存数据' },
            { value: 'D', text: '管理内存' }
        ],
        correctAnswer: 'B',
        explanation: 'AsyncLocalStorage用于在异步调用链中传递和维护上下文信息。',
        optionExplanations: {
            'A': '错误。不是用于存储全局变量。',
            'B': '正确。用于在异步调用链中传递上下文。',
            'C': '错误。不是缓存工具。',
            'D': '错误。不是内存管理工具。'
        },
        tags: ['AsyncLocalStorage', '异步上下文', '上下文传递']
    },

    // 30. 实验性功能
    {
        id: 30,
        type: 'boolean',
        question: 'Node.js的实验性功能在生产环境中应该谨慎使用。',
        correctAnswer: true,
        explanation: '实验性功能可能不稳定，API可能会改变，因此在生产环境中应该谨慎使用。',
        tags: ['实验性功能', '生产环境', '最佳实践']
    },

    // 31. 模块解析
    {
        id: 31,
        type: 'single',
        question: 'Node.js模块解析算法中，查找模块的顺序是？',
        options: [
            { value: 'A', text: '先查找核心模块，再查找本地模块' },
            { value: 'B', text: '先查找本地模块，再查找核心模块' },
            { value: 'C', text: '同时查找' },
            { value: 'D', text: '随机查找' }
        ],
        correctAnswer: 'A',
        explanation: 'Node.js首先查找核心模块，然后查找本地模块，最后查找node_modules。',
        optionExplanations: {
            'A': '正确。核心模块优先级最高。',
            'B': '错误。核心模块优先级更高。',
            'C': '错误。有明确的查找顺序。',
            'D': '错误。不是随机查找。'
        },
        tags: ['模块解析', '模块系统', '查找算法']
    },

    // 32. ES模块支持
    {
        id: 32,
        type: 'single',
        question: 'Node.js中启用ES模块的方式是？',
        options: [
            { value: 'A', text: '使用.mjs扩展名' },
            { value: 'B', text: '在package.json中设置"type": "module"' },
            { value: 'C', text: '使用--experimental-modules参数' },
            { value: 'D', text: 'A和B都可以' }
        ],
        correctAnswer: 'D',
        explanation: '可以使用.mjs扩展名或在package.json中设置"type": "module"来启用ES模块。',
        optionExplanations: {
            'A': '部分正确。.mjs扩展名可以启用ES模块。',
            'B': '部分正确。package.json设置也可以启用ES模块。',
            'C': '错误。这个参数已经不需要了。',
            'D': '正确。两种方式都可以启用ES模块。'
        },
        tags: ['ES模块', 'ESM', '模块系统']
    },

    // 33. 动态导入
    {
        id: 33,
        type: 'single',
        question: 'ES模块中动态导入的语法是？',
        options: [
            { value: 'A', text: 'require()' },
            { value: 'B', text: 'import()' },
            { value: 'C', text: 'load()' },
            { value: 'D', text: 'include()' }
        ],
        correctAnswer: 'B',
        explanation: 'import()是ES模块中动态导入的语法，返回一个Promise。',
        optionExplanations: {
            'A': '错误。require()是CommonJS的语法。',
            'B': '正确。import()是动态导入语法。',
            'C': '错误。没有load()语法。',
            'D': '错误。没有include()语法。'
        },
        tags: ['动态导入', 'import()', 'ES模块']
    },

    // 34. 顶层await
    {
        id: 34,
        type: 'boolean',
        question: 'ES模块支持顶层await语法。',
        correctAnswer: true,
        explanation: 'ES模块支持在模块顶层使用await，无需包装在async函数中。',
        tags: ['顶层await', 'ES模块', 'async/await']
    },

    // 35. 模块缓存
    {
        id: 35,
        type: 'single',
        question: 'ES模块和CommonJS模块的缓存机制有什么区别？',
        options: [
            { value: 'A', text: 'ES模块不缓存' },
            { value: 'B', text: 'CommonJS不缓存' },
            { value: 'C', text: '两者都缓存，但缓存方式不同' },
            { value: 'D', text: '两者缓存方式完全相同' }
        ],
        correctAnswer: 'C',
        explanation: '两者都有缓存机制，但ES模块缓存的是模块记录，CommonJS缓存的是导出对象。',
        optionExplanations: {
            'A': '错误。ES模块也有缓存。',
            'B': '错误。CommonJS也有缓存。',
            'C': '正确。两者都缓存但方式不同。',
            'D': '错误。缓存方式有区别。'
        },
        tags: ['模块缓存', 'ES模块', 'CommonJS']
    },

    // 36. 循环依赖
    {
        id: 36,
        type: 'single',
        question: 'ES模块如何处理循环依赖？',
        options: [
            { value: 'A', text: '抛出错误' },
            { value: 'B', text: '忽略循环依赖' },
            { value: 'C', text: '通过活绑定处理' },
            { value: 'D', text: '随机选择一个模块' }
        ],
        correctAnswer: 'C',
        explanation: 'ES模块通过活绑定（live binding）机制可以更好地处理循环依赖。',
        optionExplanations: {
            'A': '错误。不会直接抛出错误。',
            'B': '错误。不会忽略。',
            'C': '正确。通过活绑定处理循环依赖。',
            'D': '错误。不是随机选择。'
        },
        tags: ['循环依赖', 'ES模块', '活绑定']
    },

    // 37. 内存映射文件
    {
        id: 37,
        type: 'single',
        question: 'Node.js中处理大文件的最佳方式是？',
        options: [
            { value: 'A', text: '一次性读取到内存' },
            { value: 'B', text: '使用流处理' },
            { value: 'C', text: '分块读取' },
            { value: 'D', text: 'B和C都可以' }
        ],
        correctAnswer: 'D',
        explanation: '处理大文件应该使用流或分块读取，避免内存溢出。',
        optionExplanations: {
            'A': '错误。会导致内存溢出。',
            'B': '部分正确。流处理是好方法。',
            'C': '部分正确。分块读取也是好方法。',
            'D': '正确。两种方式都适合处理大文件。'
        },
        tags: ['大文件处理', '流处理', '内存优化']
    },

    // 38. 文件监听
    {
        id: 38,
        type: 'single',
        question: 'Node.js中监听文件变化的方法是？',
        options: [
            { value: 'A', text: 'fs.watch()' },
            { value: 'B', text: 'fs.watchFile()' },
            { value: 'C', text: 'fs.monitor()' },
            { value: 'D', text: 'A和B都可以' }
        ],
        correctAnswer: 'D',
        explanation: 'fs.watch()和fs.watchFile()都可以监听文件变化，但实现方式不同。',
        optionExplanations: {
            'A': '部分正确。fs.watch()可以监听文件变化。',
            'B': '部分正确。fs.watchFile()也可以监听文件变化。',
            'C': '错误。没有fs.monitor()方法。',
            'D': '正确。两种方法都可以监听文件变化。'
        },
        tags: ['文件监听', 'fs.watch', 'fs.watchFile']
    },

    // 39. 网络性能优化
    {
        id: 39,
        type: 'multiple',
        question: 'Node.js网络性能优化的方法有哪些？',
        options: [
            { value: 'A', text: '启用Keep-Alive' },
            { value: 'B', text: '使用连接池' },
            { value: 'C', text: '启用压缩' },
            { value: 'D', text: '使用HTTP/2' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是有效的网络性能优化方法。',
        optionExplanations: {
            'A': '正确。Keep-Alive可以复用连接。',
            'B': '正确。连接池可以管理连接资源。',
            'C': '正确。压缩可以减少传输数据量。',
            'D': '正确。HTTP/2提供更好的性能。'
        },
        tags: ['网络优化', 'Keep-Alive', '连接池', '压缩']
    },

    // 40. CPU分析
    {
        id: 40,
        type: 'single',
        question: '分析Node.js应用CPU使用情况的工具是？',
        options: [
            { value: 'A', text: '0x' },
            { value: 'B', text: 'clinic.js flame' },
            { value: 'C', text: 'node --prof' },
            { value: 'D', text: '以上都是' }
        ],
        correctAnswer: 'D',
        explanation: '0x、clinic.js flame、--prof参数都可以用于CPU性能分析。',
        optionExplanations: {
            'A': '部分正确。0x是CPU分析工具。',
            'B': '部分正确。clinic.js flame用于火焰图分析。',
            'C': '部分正确。--prof可以生成性能分析文件。',
            'D': '正确。这些都是CPU分析工具。'
        },
        tags: ['CPU分析', '性能分析', '火焰图']
    },

    // 41. 安全最佳实践
    {
        id: 41,
        type: 'multiple',
        question: 'Node.js应用的安全最佳实践包括？',
        options: [
            { value: 'A', text: '定期更新依赖' },
            { value: 'B', text: '使用安全的HTTP头' },
            { value: 'C', text: '输入验证和清理' },
            { value: 'D', text: '使用HTTPS' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是Node.js应用安全的重要实践。',
        optionExplanations: {
            'A': '正确。及时更新可以修复安全漏洞。',
            'B': '正确。安全HTTP头可以防止攻击。',
            'C': '正确。输入验证可以防止注入攻击。',
            'D': '正确。HTTPS保护数据传输安全。'
        },
        tags: ['安全', '最佳实践', 'HTTPS', '输入验证']
    },

    // 42. 依赖安全
    {
        id: 42,
        type: 'single',
        question: '检查Node.js项目依赖安全漏洞的命令是？',
        options: [
            { value: 'A', text: 'npm audit' },
            { value: 'B', text: 'npm security' },
            { value: 'C', text: 'npm check' },
            { value: 'D', text: 'npm scan' }
        ],
        correctAnswer: 'A',
        explanation: 'npm audit命令可以检查项目依赖中的已知安全漏洞。',
        optionExplanations: {
            'A': '正确。npm audit检查安全漏洞。',
            'B': '错误。没有npm security命令。',
            'C': '错误。npm check不是安全检查命令。',
            'D': '错误。没有npm scan命令。'
        },
        tags: ['依赖安全', 'npm audit', '安全漏洞']
    },

    // 43. 容器优化
    {
        id: 43,
        type: 'multiple',
        question: 'Node.js Docker容器优化的方法有哪些？',
        options: [
            { value: 'A', text: '使用多阶段构建' },
            { value: 'B', text: '使用Alpine Linux基础镜像' },
            { value: 'C', text: '优化.dockerignore文件' },
            { value: 'D', text: '使用非root用户运行' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是Docker容器优化的有效方法。',
        optionExplanations: {
            'A': '正确。多阶段构建可以减小镜像大小。',
            'B': '正确。Alpine Linux镜像更小更安全。',
            'C': '正确。.dockerignore可以排除不必要的文件。',
            'D': '正确。非root用户提高安全性。'
        },
        tags: ['Docker优化', '容器化', '安全', '镜像优化']
    },

    // 44. 监控指标
    {
        id: 44,
        type: 'multiple',
        question: 'Node.js应用需要监控的关键指标有哪些？',
        options: [
            { value: 'A', text: '响应时间' },
            { value: 'B', text: '内存使用率' },
            { value: 'C', text: 'CPU使用率' },
            { value: 'D', text: '错误率' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是Node.js应用的关键监控指标。',
        optionExplanations: {
            'A': '正确。响应时间反映应用性能。',
            'B': '正确。内存使用率防止内存泄漏。',
            'C': '正确。CPU使用率反映负载情况。',
            'D': '正确。错误率反映应用稳定性。'
        },
        tags: ['监控指标', '性能监控', '应用监控']
    },

    // 45. 日志最佳实践
    {
        id: 45,
        type: 'multiple',
        question: 'Node.js应用日志的最佳实践包括？',
        options: [
            { value: 'A', text: '结构化日志' },
            { value: 'B', text: '日志级别管理' },
            { value: 'C', text: '日志轮转' },
            { value: 'D', text: '敏感信息过滤' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是日志管理的重要实践。',
        optionExplanations: {
            'A': '正确。结构化日志便于分析。',
            'B': '正确。日志级别便于过滤。',
            'C': '正确。日志轮转防止磁盘满。',
            'D': '正确。过滤敏感信息保护安全。'
        },
        tags: ['日志', '最佳实践', '结构化日志', '安全']
    },

    // 46. 缓存策略
    {
        id: 46,
        type: 'single',
        question: '应用级缓存和数据库级缓存的主要区别是？',
        options: [
            { value: 'A', text: '没有区别' },
            { value: 'B', text: '应用级缓存更接近用户' },
            { value: 'C', text: '数据库级缓存更快' },
            { value: 'D', text: '应用级缓存更安全' }
        ],
        correctAnswer: 'B',
        explanation: '应用级缓存更接近用户，可以减少数据库查询，提高响应速度。',
        optionExplanations: {
            'A': '错误。有明显区别。',
            'B': '正确。应用级缓存更接近用户，响应更快。',
            'C': '错误。应用级缓存通常更快。',
            'D': '错误。安全性不是主要区别。'
        },
        tags: ['缓存策略', '应用缓存', '数据库缓存']
    },

    // 47. 微服务通信
    {
        id: 47,
        type: 'multiple',
        question: 'Node.js微服务之间的通信方式有哪些？',
        options: [
            { value: 'A', text: 'HTTP/REST API' },
            { value: 'B', text: '消息队列' },
            { value: 'C', text: 'gRPC' },
            { value: 'D', text: 'GraphQL' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '这些都是微服务间常用的通信方式。',
        optionExplanations: {
            'A': '正确。HTTP/REST是最常用的通信方式。',
            'B': '正确。消息队列支持异步通信。',
            'C': '正确。gRPC提供高性能RPC通信。',
            'D': '正确。GraphQL提供灵活的数据查询。'
        },
        tags: ['微服务', '服务通信', 'gRPC', '消息队列']
    },

    // 48. 负载测试
    {
        id: 48,
        type: 'single',
        question: 'Node.js应用负载测试常用的工具是？',
        options: [
            { value: 'A', text: 'Artillery' },
            { value: 'B', text: 'Apache Bench' },
            { value: 'C', text: 'wrk' },
            { value: 'D', text: '以上都是' }
        ],
        correctAnswer: 'D',
        explanation: 'Artillery、Apache Bench、wrk都是常用的负载测试工具。',
        optionExplanations: {
            'A': '部分正确。Artillery是现代化的负载测试工具。',
            'B': '部分正确。Apache Bench是经典的测试工具。',
            'C': '部分正确。wrk是高性能的HTTP测试工具。',
            'D': '正确。这些都是常用的负载测试工具。'
        },
        tags: ['负载测试', 'Artillery', 'Apache Bench', 'wrk']
    },

    // 49. 部署策略
    {
        id: 49,
        type: 'multiple',
        question: 'Node.js应用的部署策略有哪些？',
        options: [
            { value: 'A', text: '蓝绿部署' },
            { value: 'B', text: '滚动部署' },
            { value: 'C', text: '金丝雀部署' },
            { value: 'D', text: '一次性部署' }
        ],
        correctAnswer: ['A', 'B', 'C'],
        explanation: '蓝绿部署、滚动部署、金丝雀部署都是现代化的部署策略，一次性部署风险较高。',
        optionExplanations: {
            'A': '正确。蓝绿部署可以快速回滚。',
            'B': '正确。滚动部署逐步更新实例。',
            'C': '正确。金丝雀部署先测试小部分流量。',
            'D': '错误。一次性部署风险太高，不推荐。'
        },
        tags: ['部署策略', '蓝绿部署', '滚动部署', '金丝雀部署']
    },

    // 50. 技术债务管理
    {
        id: 50,
        type: 'boolean',
        question: '定期重构代码和更新依赖是管理技术债务的重要方法。',
        correctAnswer: true,
        explanation: '定期重构和更新依赖可以保持代码质量，减少技术债务，提高系统的可维护性。',
        tags: ['技术债务', '代码重构', '依赖更新', '最佳实践']
    }
];

// 导出题库供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.stage3Questions;
}