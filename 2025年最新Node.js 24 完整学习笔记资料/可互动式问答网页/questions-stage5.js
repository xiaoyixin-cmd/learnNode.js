// 阶段五：源码解析与内核探秘题库
// 涵盖Node.js底层原理、V8引擎、libuv、源码分析等深度技术内容

window.stage5Questions = [
    // 1. V8引擎基础
    {
        id: 1,
        type: 'single',
        question: 'V8引擎中，JavaScript代码的执行过程是什么？',
        options: [
            { value: 'A', text: '直接解释执行' },
            { value: 'B', text: '编译成字节码后执行' },
            { value: 'C', text: '解析→编译→优化→执行' },
            { value: 'D', text: '只进行JIT编译' }
        ],
        correctAnswer: 'C',
        explanation: 'V8引擎采用解析（Parse）→编译成字节码（Ignition）→优化编译（TurboFan）→执行的流程。',
        optionExplanations: {
            'A': '错误。V8不是纯解释器。',
            'B': '部分正确，但不完整。',
            'C': '正确。V8的完整执行流程。',
            'D': '错误。V8结合了解释和编译。'
        },
        tags: ['V8引擎', '执行流程', '编译原理', '源码解析']
    },

    // 2. libuv事件循环
    {
        id: 2,
        type: 'single',
        question: 'libuv事件循环的六个阶段中，哪个阶段处理setTimeout和setInterval？',
        options: [
            { value: 'A', text: 'Timer阶段' },
            { value: 'B', text: 'Poll阶段' },
            { value: 'C', text: 'Check阶段' },
            { value: 'D', text: 'Close阶段' }
        ],
        correctAnswer: 'A',
        explanation: 'Timer阶段专门处理setTimeout和setInterval的回调函数。',
        optionExplanations: {
            'A': '正确。Timer阶段处理定时器回调。',
            'B': '错误。Poll阶段处理I/O回调。',
            'C': '错误。Check阶段处理setImmediate。',
            'D': '错误。Close阶段处理关闭回调。'
        },
        tags: ['libuv', '事件循环', '定时器', '内核原理']
    },

    // 3. V8内存管理
    {
        id: 3,
        type: 'multiple',
        question: 'V8引擎的内存结构包括哪些部分？',
        options: [
            { value: 'A', text: '新生代（New Space）' },
            { value: 'B', text: '老生代（Old Space）' },
            { value: 'C', text: '大对象空间（Large Object Space）' },
            { value: 'D', text: '代码空间（Code Space）' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'V8内存分为新生代、老生代、大对象空间、代码空间等多个区域，各有不同的管理策略。',
        optionExplanations: {
            'A': '正确。新生代存储新创建的对象。',
            'B': '正确。老生代存储长期存活的对象。',
            'C': '正确。大对象空间存储大型对象。',
            'D': '正确。代码空间存储编译后的代码。'
        },
        tags: ['V8引擎', '内存管理', '垃圾回收', '内存结构']
    },

    // 4. Node.js启动过程
    {
        id: 4,
        type: 'single',
        question: 'Node.js启动时，以下哪个步骤最先执行？',
        options: [
            { value: 'A', text: '初始化V8引擎' },
            { value: 'B', text: '创建libuv事件循环' },
            { value: 'C', text: '加载内置模块' },
            { value: 'D', text: '解析命令行参数' }
        ],
        correctAnswer: 'D',
        explanation: 'Node.js启动时首先解析命令行参数，然后初始化V8引擎和libuv，最后加载模块。',
        optionExplanations: {
            'A': '错误。V8初始化在参数解析之后。',
            'B': '错误。libuv初始化在参数解析之后。',
            'C': '错误。模块加载是最后的步骤。',
            'D': '正确。命令行参数解析是第一步。'
        },
        tags: ['Node.js启动', '初始化流程', '源码分析', '系统架构']
    },

    // 5. 垃圾回收算法
    {
        id: 5,
        type: 'single',
        question: 'V8引擎新生代使用的垃圾回收算法是？',
        options: [
            { value: 'A', text: 'Mark-Sweep（标记清除）' },
            { value: 'B', text: 'Mark-Compact（标记整理）' },
            { value: 'C', text: 'Scavenge（清道夫算法）' },
            { value: 'D', text: 'Reference Counting（引用计数）' }
        ],
        correctAnswer: 'C',
        explanation: '新生代使用Scavenge算法，基于Cheney算法实现，通过复制存活对象来回收内存。',
        optionExplanations: {
            'A': '错误。Mark-Sweep用于老生代。',
            'B': '错误。Mark-Compact用于老生代整理。',
            'C': '正确。Scavenge是新生代的GC算法。',
            'D': '错误。V8不使用引用计数。'
        },
        tags: ['垃圾回收', 'Scavenge算法', '新生代', 'V8引擎']
    },

    // 6. 事件循环阶段详解
    {
        id: 6,
        type: 'single',
        question: '在libuv事件循环中，setImmediate回调在哪个阶段执行？',
        options: [
            { value: 'A', text: 'Timer阶段' },
            { value: 'B', text: 'Pending callbacks阶段' },
            { value: 'C', text: 'Poll阶段' },
            { value: 'D', text: 'Check阶段' }
        ],
        correctAnswer: 'D',
        explanation: 'setImmediate的回调函数在Check阶段执行，这是专门为setImmediate设计的阶段。',
        optionExplanations: {
            'A': '错误。Timer阶段处理setTimeout/setInterval。',
            'B': '错误。Pending callbacks处理系统级回调。',
            'C': '错误。Poll阶段处理I/O事件。',
            'D': '正确。Check阶段专门处理setImmediate。'
        },
        tags: ['事件循环', 'setImmediate', 'Check阶段', 'libuv']
    },

    // 7. V8优化编译
    {
        id: 7,
        type: 'single',
        question: 'V8引擎的TurboFan优化编译器什么时候会对函数进行优化？',
        options: [
            { value: 'A', text: '函数第一次被调用时' },
            { value: 'B', text: '函数被频繁调用且类型稳定时' },
            { value: 'C', text: '函数定义时' },
            { value: 'D', text: '随机优化' }
        ],
        correctAnswer: 'B',
        explanation: 'TurboFan会监控函数的调用频率和类型反馈，当函数热点且类型稳定时进行优化编译。',
        optionExplanations: {
            'A': '错误。第一次调用不会立即优化。',
            'B': '正确。基于热点检测和类型反馈优化。',
            'C': '错误。定义时不进行优化。',
            'D': '错误。优化是基于启发式算法的。'
        },
        tags: ['TurboFan', '优化编译', '热点检测', 'V8引擎']
    },

    // 8. 模块加载机制
    {
        id: 8,
        type: 'single',
        question: 'Node.js中require()函数的模块查找顺序是什么？',
        options: [
            { value: 'A', text: '核心模块→文件模块→node_modules' },
            { value: 'B', text: '文件模块→核心模块→node_modules' },
            { value: 'C', text: 'node_modules→核心模块→文件模块' },
            { value: 'D', text: '核心模块→node_modules→文件模块' }
        ],
        correctAnswer: 'A',
        explanation: 'Node.js模块查找顺序：核心模块→文件模块（相对/绝对路径）→node_modules目录。',
        optionExplanations: {
            'A': '正确。这是Node.js的模块解析顺序。',
            'B': '错误。核心模块优先级最高。',
            'C': '错误。核心模块应该最先查找。',
            'D': '错误。文件模块优先于node_modules。'
        },
        tags: ['模块加载', 'require机制', '模块解析', 'CommonJS']
    },

    // 9. Buffer内部实现
    {
        id: 9,
        type: 'single',
        question: 'Node.js中Buffer对象的底层实现基于什么？',
        options: [
            { value: 'A', text: 'JavaScript Array' },
            { value: 'B', text: 'C++ ArrayBuffer' },
            { value: 'C', text: 'V8 Uint8Array' },
            { value: 'D', text: '原生C内存分配' }
        ],
        correctAnswer: 'B',
        explanation: 'Buffer底层基于C++ ArrayBuffer实现，提供了对原始内存的直接访问能力。',
        optionExplanations: {
            'A': '错误。JavaScript Array无法直接操作内存。',
            'B': '正确。Buffer基于C++ ArrayBuffer实现。',
            'C': '错误。Uint8Array是JavaScript层面的。',
            'D': '错误。不是直接的C内存分配。'
        },
        tags: ['Buffer', 'ArrayBuffer', 'C++绑定', '内存管理']
    },

    // 10. 异步I/O实现
    {
        id: 10,
        type: 'single',
        question: 'Node.js中文件I/O操作的异步实现依赖于什么？',
        options: [
            { value: 'A', text: '操作系统的异步I/O' },
            { value: 'B', text: 'libuv的线程池' },
            { value: 'C', text: 'V8引擎的异步机制' },
            { value: 'D', text: 'JavaScript的Promise' }
        ],
        correctAnswer: 'B',
        explanation: '文件I/O在大多数操作系统上没有真正的异步支持，Node.js通过libuv的线程池模拟异步。',
        optionExplanations: {
            'A': '错误。大多数OS不支持文件异步I/O。',
            'B': '正确。libuv使用线程池处理文件I/O。',
            'C': '错误。V8不负责I/O操作。',
            'D': '错误。Promise只是语法糖。'
        },
        tags: ['异步I/O', 'libuv', '线程池', '文件系统']
    },

    // 11. 内存泄漏检测原理
    {
        id: 11,
        type: 'single',
        question: 'V8引擎如何检测内存泄漏？',
        options: [
            { value: 'A', text: '定期扫描所有对象' },
            { value: 'B', text: '通过可达性分析' },
            { value: 'C', text: '引用计数归零检测' },
            { value: 'D', text: '内存使用量阈值检测' }
        ],
        correctAnswer: 'B',
        explanation: 'V8使用可达性分析（从GC Root开始标记可达对象），无法到达的对象被认为是垃圾。',
        optionExplanations: {
            'A': '错误。不是定期扫描所有对象。',
            'B': '正确。基于可达性分析的标记清除算法。',
            'C': '错误。V8不使用引用计数。',
            'D': '错误。阈值检测不能准确识别泄漏。'
        },
        tags: ['内存泄漏', '可达性分析', 'GC Root', '垃圾回收']
    },

    // 12. Node.js C++扩展
    {
        id: 12,
        type: 'single',
        question: 'Node.js C++扩展中，如何将C++对象暴露给JavaScript？',
        options: [
            { value: 'A', text: '直接返回C++指针' },
            { value: 'B', text: '通过V8的ObjectTemplate' },
            { value: 'C', text: '序列化为JSON字符串' },
            { value: 'D', text: '使用共享内存' }
        ],
        correctAnswer: 'B',
        explanation: 'V8的ObjectTemplate和FunctionTemplate用于在C++和JavaScript之间建立绑定关系。',
        optionExplanations: {
            'A': '错误。不能直接暴露C++指针。',
            'B': '正确。ObjectTemplate是标准的绑定方式。',
            'C': '错误。序列化效率低且功能受限。',
            'D': '错误。共享内存不是对象绑定方式。'
        },
        tags: ['C++扩展', 'ObjectTemplate', 'V8绑定', 'Native模块']
    },

    // 13. 事件循环性能优化
    {
        id: 13,
        type: 'single',
        question: '什么情况下会导致Node.js事件循环阻塞？',
        options: [
            { value: 'A', text: '大量异步I/O操作' },
            { value: 'B', text: '主线程执行CPU密集型同步操作' },
            { value: 'C', text: '内存使用过多' },
            { value: 'D', text: '网络延迟' }
        ],
        correctAnswer: 'B',
        explanation: '事件循环运行在主线程上，CPU密集型同步操作会阻塞事件循环，影响其他事件处理。',
        optionExplanations: {
            'A': '错误。异步I/O不会阻塞事件循环。',
            'B': '正确。同步CPU密集型操作会阻塞主线程。',
            'C': '错误。内存使用不直接阻塞事件循环。',
            'D': '错误。网络延迟不会阻塞事件循环。'
        },
        tags: ['事件循环', '性能优化', 'CPU密集型', '阻塞检测']
    },

    // 14. V8隐藏类优化
    {
        id: 14,
        type: 'single',
        question: 'V8引擎的隐藏类（Hidden Class）优化的目的是什么？',
        options: [
            { value: 'A', text: '减少内存使用' },
            { value: 'B', text: '加速属性访问' },
            { value: 'C', text: '提高垃圾回收效率' },
            { value: 'D', text: '支持动态类型' }
        ],
        correctAnswer: 'B',
        explanation: '隐藏类通过为相同结构的对象创建共享的属性布局信息，加速属性访问和方法调用。',
        optionExplanations: {
            'A': '错误。主要目的不是减少内存。',
            'B': '正确。隐藏类优化属性访问性能。',
            'C': '错误。不是为了提高GC效率。',
            'D': '错误。是为了优化动态类型的性能。'
        },
        tags: ['隐藏类', '属性访问', 'V8优化', '性能优化']
    },

    // 15. libuv线程池
    {
        id: 15,
        type: 'single',
        question: 'libuv默认的线程池大小是多少？',
        options: [
            { value: 'A', text: '2个线程' },
            { value: 'B', text: '4个线程' },
            { value: 'C', text: '8个线程' },
            { value: 'D', text: '等于CPU核心数' }
        ],
        correctAnswer: 'B',
        explanation: 'libuv默认创建4个工作线程的线程池，可以通过UV_THREADPOOL_SIZE环境变量调整。',
        optionExplanations: {
            'A': '错误。默认不是2个线程。',
            'B': '正确。默认线程池大小为4。',
            'C': '错误。默认不是8个线程。',
            'D': '错误。不是基于CPU核心数。'
        },
        tags: ['libuv', '线程池', '并发处理', '配置优化']
    },

    // 16. Stream内部机制
    {
        id: 16,
        type: 'single',
        question: 'Node.js Stream的背压（backpressure）机制是如何工作的？',
        options: [
            { value: 'A', text: '直接丢弃多余数据' },
            { value: 'B', text: '通过内部缓冲区和暂停/恢复机制' },
            { value: 'C', text: '增加内存分配' },
            { value: 'D', text: '压缩数据' }
        ],
        correctAnswer: 'B',
        explanation: 'Stream通过内部缓冲区监控，当缓冲区满时暂停读取，空闲时恢复，防止内存溢出。',
        optionExplanations: {
            'A': '错误。不会丢弃数据。',
            'B': '正确。通过暂停/恢复机制控制流量。',
            'C': '错误。不是通过增加内存解决。',
            'D': '错误。背压不是数据压缩。'
        },
        tags: ['Stream', '背压机制', '流量控制', '内存管理']
    },

    // 17. V8内联缓存
    {
        id: 17,
        type: 'single',
        question: 'V8引擎的内联缓存（Inline Cache）优化什么操作？',
        options: [
            { value: 'A', text: '内存分配' },
            { value: 'B', text: '属性访问和方法调用' },
            { value: 'C', text: '垃圾回收' },
            { value: 'D', text: '模块加载' }
        ],
        correctAnswer: 'B',
        explanation: '内联缓存通过缓存属性访问和方法调用的位置信息，避免重复的属性查找过程。',
        optionExplanations: {
            'A': '错误。内联缓存不优化内存分配。',
            'B': '正确。优化属性访问和方法调用性能。',
            'C': '错误。不是优化垃圾回收。',
            'D': '错误。不是优化模块加载。'
        },
        tags: ['内联缓存', '属性访问', '方法调用', 'V8优化']
    },

    // 18. 异步钩子机制
    {
        id: 18,
        type: 'single',
        question: 'Node.js的async_hooks模块的主要用途是什么？',
        options: [
            { value: 'A', text: '创建异步操作' },
            { value: 'B', text: '跟踪异步资源的生命周期' },
            { value: 'C', text: '优化异步性能' },
            { value: 'D', text: '处理异步错误' }
        ],
        correctAnswer: 'B',
        explanation: 'async_hooks提供API来跟踪异步资源（如Promise、Timer等）的创建、执行和销毁。',
        optionExplanations: {
            'A': '错误。不是用来创建异步操作。',
            'B': '正确。跟踪异步资源生命周期。',
            'C': '错误。不是用来优化性能。',
            'D': '错误。不是专门处理错误。'
        },
        tags: ['async_hooks', '异步跟踪', '生命周期', '调试工具']
    },

    // 19. 模块缓存机制
    {
        id: 19,
        type: 'single',
        question: 'Node.js模块缓存存储在哪里？',
        options: [
            { value: 'A', text: 'require.cache对象' },
            { value: 'B', text: '全局变量' },
            { value: 'C', text: '文件系统' },
            { value: 'D', text: 'V8引擎内部' }
        ],
        correctAnswer: 'A',
        explanation: 'Node.js将已加载的模块缓存在require.cache对象中，键为模块的绝对路径。',
        optionExplanations: {
            'A': '正确。require.cache存储模块缓存。',
            'B': '错误。不是存储在全局变量。',
            'C': '错误。不是存储在文件系统。',
            'D': '错误。不是存储在V8内部。'
        },
        tags: ['模块缓存', 'require.cache', '模块系统', '性能优化']
    },

    // 20. 进程间通信
    {
        id: 20,
        type: 'multiple',
        question: 'Node.js中进程间通信（IPC）的方式有哪些？',
        options: [
            { value: 'A', text: 'child_process.fork()的内置IPC' },
            { value: 'B', text: 'Unix Domain Socket' },
            { value: 'C', text: '共享内存' },
            { value: 'D', text: '消息队列' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Node.js支持多种IPC方式，包括内置IPC通道、Unix套接字、共享内存和消息队列。',
        optionExplanations: {
            'A': '正确。fork()提供内置IPC通道。',
            'B': '正确。Unix Domain Socket是IPC方式。',
            'C': '正确。可以通过Buffer实现共享内存。',
            'D': '正确。可以使用第三方消息队列。'
        },
        tags: ['进程间通信', 'IPC', 'child_process', '并发编程']
    },

    // 21. V8编译优化级别
    {
        id: 21,
        type: 'single',
        question: 'V8引擎中，函数被"去优化"（deoptimization）的原因是什么？',
        options: [
            { value: 'A', text: '函数调用次数减少' },
            { value: 'B', text: '类型假设不再成立' },
            { value: 'C', text: '内存不足' },
            { value: 'D', text: '函数体过大' }
        ],
        correctAnswer: 'B',
        explanation: '当TurboFan的优化假设（如类型稳定性）不再成立时，V8会进行去优化，回退到解释执行。',
        optionExplanations: {
            'A': '错误。调用次数减少不会触发去优化。',
            'B': '正确。类型假设失效会触发去优化。',
            'C': '错误。内存不足不是去优化原因。',
            'D': '错误。函数大小不是去优化原因。'
        },
        tags: ['去优化', 'TurboFan', '类型假设', 'V8引擎']
    },

    // 22. 内存快照分析
    {
        id: 22,
        type: 'single',
        question: '在V8堆快照中，什么是"浅层大小"（Shallow Size）？',
        options: [
            { value: 'A', text: '对象及其引用对象的总大小' },
            { value: 'B', text: '对象本身占用的内存大小' },
            { value: 'C', text: '对象在栈中的大小' },
            { value: 'D', text: '对象的引用数量' }
        ],
        correctAnswer: 'B',
        explanation: '浅层大小指对象本身占用的内存，不包括其引用的其他对象的大小。',
        optionExplanations: {
            'A': '错误。这是保留大小（Retained Size）。',
            'B': '正确。浅层大小是对象本身的内存占用。',
            'C': '错误。不是栈中的大小。',
            'D': '错误。不是引用数量。'
        },
        tags: ['内存快照', '浅层大小', '内存分析', '性能调试']
    },

    // 23. libuv文件系统
    {
        id: 23,
        type: 'single',
        question: 'libuv处理文件系统操作时，为什么需要使用线程池？',
        options: [
            { value: 'A', text: '提高并发性能' },
            { value: 'B', text: '大多数操作系统不支持真正的异步文件I/O' },
            { value: 'C', text: '减少内存使用' },
            { value: 'D', text: '简化编程模型' }
        ],
        correctAnswer: 'B',
        explanation: '除了Linux的io_uring等少数情况，大多数操作系统不支持真正的异步文件I/O，需要线程池模拟。',
        optionExplanations: {
            'A': '部分正确，但不是主要原因。',
            'B': '正确。操作系统限制导致需要线程池。',
            'C': '错误。线程池不是为了减少内存。',
            'D': '错误。不是为了简化编程模型。'
        },
        tags: ['libuv', '文件系统', '线程池', '异步I/O']
    },

    // 24. V8字节码
    {
        id: 24,
        type: 'single',
        question: 'V8引擎的Ignition解释器生成的字节码有什么特点？',
        options: [
            { value: 'A', text: '直接映射到机器码' },
            { value: 'B', text: '平台无关的中间表示' },
            { value: 'C', text: '只能在V8中运行' },
            { value: 'D', text: '与JavaScript语法一一对应' }
        ],
        correctAnswer: 'B',
        explanation: 'V8字节码是平台无关的中间表示，可以在不同架构上解释执行，也可以作为优化编译的输入。',
        optionExplanations: {
            'A': '错误。字节码不直接映射到机器码。',
            'B': '正确。字节码是平台无关的中间表示。',
            'C': '错误。字节码设计是通用的。',
            'D': '错误。字节码是优化后的表示。'
        },
        tags: ['Ignition', '字节码', '中间表示', 'V8引擎']
    },

    // 25. 异步资源跟踪
    {
        id: 25,
        type: 'single',
        question: 'Node.js中AsyncLocalStorage的实现原理是什么？',
        options: [
            { value: 'A', text: '全局变量存储' },
            { value: 'B', text: '基于async_hooks的异步上下文传播' },
            { value: 'C', text: '线程本地存储' },
            { value: 'D', text: '闭包捕获' }
        ],
        correctAnswer: 'B',
        explanation: 'AsyncLocalStorage基于async_hooks机制，在异步操作间传播上下文信息。',
        optionExplanations: {
            'A': '错误。不是全局变量存储。',
            'B': '正确。基于async_hooks实现上下文传播。',
            'C': '错误。Node.js是单线程的。',
            'D': '错误。不是简单的闭包捕获。'
        },
        tags: ['AsyncLocalStorage', 'async_hooks', '上下文传播', '异步编程']
    },

    // 26. 内存对齐优化
    {
        id: 26,
        type: 'single',
        question: 'V8引擎中，对象属性的内存布局优化原理是什么？',
        options: [
            { value: 'A', text: '随机排列属性' },
            { value: 'B', text: '按照声明顺序排列' },
            { value: 'C', text: '根据属性类型和访问模式优化排列' },
            { value: 'D', text: '按照属性名字母顺序排列' }
        ],
        correctAnswer: 'C',
        explanation: 'V8会根据属性的类型、大小和访问模式来优化内存布局，提高缓存命中率和访问效率。',
        optionExplanations: {
            'A': '错误。不是随机排列。',
            'B': '错误。不完全按声明顺序。',
            'C': '正确。基于类型和访问模式优化。',
            'D': '错误。不是按字母顺序。'
        },
        tags: ['内存布局', '属性优化', 'V8引擎', '性能优化']
    },

    // 27. 事件循环调度
    {
        id: 27,
        type: 'single',
        question: 'process.nextTick和Promise.resolve().then()的执行优先级关系是？',
        options: [
            { value: 'A', text: 'Promise优先级更高' },
            { value: 'B', text: 'process.nextTick优先级更高' },
            { value: 'C', text: '优先级相同' },
            { value: 'D', text: '取决于调用顺序' }
        ],
        correctAnswer: 'B',
        explanation: 'process.nextTick的优先级高于Promise，会在每个事件循环阶段结束时优先执行。',
        optionExplanations: {
            'A': '错误。Promise优先级较低。',
            'B': '正确。process.nextTick优先级最高。',
            'C': '错误。优先级不同。',
            'D': '错误。不取决于调用顺序。'
        },
        tags: ['事件循环', 'process.nextTick', 'Promise', '微任务队列']
    },

    // 28. C++绑定性能
    {
        id: 28,
        type: 'single',
        question: 'Node.js C++扩展中，什么是最高效的数据传递方式？',
        options: [
            { value: 'A', text: 'JSON字符串' },
            { value: 'B', text: 'ArrayBuffer/TypedArray' },
            { value: 'C', text: '普通JavaScript对象' },
            { value: 'D', text: '函数回调' }
        ],
        correctAnswer: 'B',
        explanation: 'ArrayBuffer和TypedArray提供了JavaScript和C++之间最直接的内存共享方式，避免了数据拷贝。',
        optionExplanations: {
            'A': '错误。JSON需要序列化/反序列化。',
            'B': '正确。ArrayBuffer提供直接内存访问。',
            'C': '错误。对象需要属性转换开销。',
            'D': '错误。回调不是数据传递方式。'
        },
        tags: ['C++绑定', 'ArrayBuffer', '数据传递', '性能优化']
    },

    // 29. 垃圾回收触发
    {
        id: 29,
        type: 'single',
        question: 'V8引擎什么时候会触发垃圾回收？',
        options: [
            { value: 'A', text: '只在内存不足时' },
            { value: 'B', text: '定时触发' },
            { value: 'C', text: '基于分配速率和堆大小的启发式算法' },
            { value: 'D', text: '手动调用gc()时' }
        ],
        correctAnswer: 'C',
        explanation: 'V8使用复杂的启发式算法，考虑内存分配速率、堆大小、存活对象比例等因素来决定GC时机。',
        optionExplanations: {
            'A': '错误。不只是内存不足时。',
            'B': '错误。不是定时触发。',
            'C': '正确。基于启发式算法触发。',
            'D': '错误。手动调用只是触发方式之一。'
        },
        tags: ['垃圾回收', '启发式算法', 'GC触发', 'V8引擎']
    },

    // 30. 模块热重载
    {
        id: 30,
        type: 'single',
        question: 'Node.js中实现模块热重载的核心机制是什么？',
        options: [
            { value: 'A', text: '修改require.cache' },
            { value: 'B', text: '重启进程' },
            { value: 'C', text: '使用eval()重新执行' },
            { value: 'D', text: 'V8引擎内置支持' }
        ],
        correctAnswer: 'A',
        explanation: '通过删除require.cache中的模块缓存，可以强制重新加载模块，实现热重载。',
        optionExplanations: {
            'A': '正确。清除缓存实现热重载。',
            'B': '错误。重启进程不是热重载。',
            'C': '错误。eval()不是标准的热重载方式。',
            'D': '错误。V8不直接支持模块热重载。'
        },
        tags: ['模块热重载', 'require.cache', '开发工具', '模块系统']
    },

    // 31. 内存压缩
    {
        id: 31,
        type: 'single',
        question: 'V8引擎的指针压缩（Pointer Compression）技术的作用是什么？',
        options: [
            { value: 'A', text: '提高计算速度' },
            { value: 'B', text: '减少内存使用量' },
            { value: 'C', text: '增强安全性' },
            { value: 'D', text: '简化垃圾回收' }
        ],
        correctAnswer: 'B',
        explanation: '指针压缩将64位指针压缩为32位，在64位系统上可以显著减少内存使用量。',
        optionExplanations: {
            'A': '错误。主要目的不是提高计算速度。',
            'B': '正确。减少指针占用的内存空间。',
            'C': '错误。不是为了增强安全性。',
            'D': '错误。不是为了简化垃圾回收。'
        },
        tags: ['指针压缩', '内存优化', 'V8引擎', '64位系统']
    },

    // 32. 异步迭代器实现
    {
        id: 32,
        type: 'single',
        question: 'Node.js Stream实现异步迭代器的底层机制是什么？',
        options: [
            { value: 'A', text: '轮询数据' },
            { value: 'B', text: '基于事件监听和Promise' },
            { value: 'C', text: '定时器检查' },
            { value: 'D', text: '阻塞等待' }
        ],
        correctAnswer: 'B',
        explanation: 'Stream的异步迭代器通过监听readable事件和end事件，结合Promise来实现异步迭代。',
        optionExplanations: {
            'A': '错误。不是轮询机制。',
            'B': '正确。基于事件和Promise实现。',
            'C': '错误。不使用定时器。',
            'D': '错误。不是阻塞等待。'
        },
        tags: ['异步迭代器', 'Stream', '事件驱动', 'Promise']
    },

    // 33. V8快照技术
    {
        id: 33,
        type: 'single',
        question: 'V8引擎的启动快照（Startup Snapshot）包含什么内容？',
        options: [
            { value: 'A', text: '用户代码' },
            { value: 'B', text: '内置对象和函数的初始状态' },
            { value: 'C', text: '运行时数据' },
            { value: 'D', text: '编译后的机器码' }
        ],
        correctAnswer: 'B',
        explanation: '启动快照包含JavaScript内置对象、函数和上下文的预初始化状态，加速V8启动。',
        optionExplanations: {
            'A': '错误。不包含用户代码。',
            'B': '正确。包含内置对象的初始状态。',
            'C': '错误。不包含运行时数据。',
            'D': '错误。不是编译后的机器码。'
        },
        tags: ['启动快照', 'V8引擎', '启动优化', '内置对象']
    },

    // 34. 内存分代回收
    {
        id: 34,
        type: 'single',
        question: '为什么V8引擎要采用分代垃圾回收策略？',
        options: [
            { value: 'A', text: '简化实现' },
            { value: 'B', text: '基于"大多数对象都是短命的"假设' },
            { value: 'C', text: '减少内存使用' },
            { value: 'D', text: '提高并发性' }
        ],
        correctAnswer: 'B',
        explanation: '分代回收基于弱分代假设：大多数对象都是短命的，新生代频繁回收，老生代较少回收。',
        optionExplanations: {
            'A': '错误。分代回收实际上更复杂。',
            'B': '正确。基于对象生命周期的统计规律。',
            'C': '错误。不是为了减少内存使用。',
            'D': '错误。不是为了提高并发性。'
        },
        tags: ['分代回收', '弱分代假设', '垃圾回收', 'V8引擎']
    },

    // 35. 事件循环优化
    {
        id: 35,
        type: 'single',
        question: 'libuv事件循环中，Poll阶段的超时时间是如何计算的？',
        options: [
            { value: 'A', text: '固定1ms' },
            { value: 'B', text: '基于最近的Timer时间' },
            { value: 'C', text: '无限等待' },
            { value: 'D', text: '用户配置' }
        ],
        correctAnswer: 'B',
        explanation: 'Poll阶段的超时时间基于Timer队列中最近的定时器时间计算，确保定时器能及时执行。',
        optionExplanations: {
            'A': '错误。不是固定时间。',
            'B': '正确。基于Timer队列计算超时。',
            'C': '错误。不会无限等待。',
            'D': '错误。不是用户配置的。'
        },
        tags: ['事件循环', 'Poll阶段', '超时计算', 'libuv']
    },

    // 36. 原型链优化
    {
        id: 36,
        type: 'single',
        question: 'V8引擎如何优化原型链查找？',
        options: [
            { value: 'A', text: '缓存查找结果' },
            { value: 'B', text: '扁平化原型链' },
            { value: 'C', text: '内联缓存和隐藏类' },
            { value: 'D', text: '预编译原型方法' }
        ],
        correctAnswer: 'C',
        explanation: 'V8通过内联缓存记录属性查找路径，结合隐藏类信息，避免重复的原型链遍历。',
        optionExplanations: {
            'A': '部分正确，但不完整。',
            'B': '错误。不会扁平化原型链。',
            'C': '正确。内联缓存和隐藏类协同优化。',
            'D': '错误。不是预编译方法。'
        },
        tags: ['原型链', '内联缓存', '隐藏类', 'V8优化']
    },

    // 37. 并发模型深度
    {
        id: 37,
        type: 'single',
        question: 'Node.js的Worker Threads与主线程共享什么？',
        options: [
            { value: 'A', text: '所有内存空间' },
            { value: 'B', text: 'SharedArrayBuffer和MessagePort' },
            { value: 'C', text: '全局变量' },
            { value: 'D', text: '事件循环' }
        ],
        correctAnswer: 'B',
        explanation: 'Worker Threads有独立的V8实例和事件循环，只能通过SharedArrayBuffer和MessagePort共享数据。',
        optionExplanations: {
            'A': '错误。不共享所有内存。',
            'B': '正确。只共享特定的数据结构。',
            'C': '错误。不共享全局变量。',
            'D': '错误。每个Worker有独立事件循环。'
        },
        tags: ['Worker Threads', 'SharedArrayBuffer', '并发模型', '线程隔离']
    },

    // 38. 编译器优化级别
    {
        id: 38,
        type: 'single',
        question: 'V8引擎中，什么情况下会触发OSR（On-Stack Replacement）？',
        options: [
            { value: 'A', text: '函数第一次调用' },
            { value: 'B', text: '长时间运行的循环中' },
            { value: 'C', text: '内存不足时' },
            { value: 'D', text: '异常发生时' }
        ],
        correctAnswer: 'B',
        explanation: 'OSR允许在长时间运行的循环中，将解释执行的代码替换为优化编译的代码，无需等待函数重新调用。',
        optionExplanations: {
            'A': '错误。第一次调用不会触发OSR。',
            'B': '正确。长循环中触发OSR优化。',
            'C': '错误。内存不足不触发OSR。',
            'D': '错误。异常不触发OSR。'
        },
        tags: ['OSR', '栈上替换', '循环优化', 'V8编译器']
    },

    // 39. 内存管理高级
    {
        id: 39,
        type: 'single',
        question: 'V8引擎的增量标记（Incremental Marking）的目的是什么？',
        options: [
            { value: 'A', text: '提高标记精度' },
            { value: 'B', text: '减少GC暂停时间' },
            { value: 'C', text: '降低内存使用' },
            { value: 'D', text: '简化GC算法' }
        ],
        correctAnswer: 'B',
        explanation: '增量标记将标记过程分散到多个小步骤中，与应用程序交替执行，减少GC造成的长时间暂停。',
        optionExplanations: {
            'A': '错误。不是为了提高精度。',
            'B': '正确。减少GC暂停时间。',
            'C': '错误。不是为了降低内存使用。',
            'D': '错误。实际上增加了复杂性。'
        },
        tags: ['增量标记', 'GC暂停', '垃圾回收', 'V8引擎']
    },

    // 40. 异步资源管理
    {
        id: 40,
        type: 'single',
        question: 'Node.js中，异步资源的ID是如何生成的？',
        options: [
            { value: 'A', text: '随机生成' },
            { value: 'B', text: '基于时间戳' },
            { value: 'C', text: '全局递增计数器' },
            { value: 'D', text: '基于内存地址' }
        ],
        correctAnswer: 'C',
        explanation: 'Node.js使用全局递增的计数器为每个异步资源分配唯一ID，确保ID的唯一性和顺序性。',
        optionExplanations: {
            'A': '错误。不是随机生成。',
            'B': '错误。不基于时间戳。',
            'C': '正确。使用全局递增计数器。',
            'D': '错误。不基于内存地址。'
        },
        tags: ['异步资源', 'ID生成', 'async_hooks', '资源跟踪']
    },

    // 41. 性能监控深度
    {
        id: 41,
        type: 'single',
        question: 'Node.js的perf_hooks模块中，Performance Timeline的作用是什么？',
        options: [
            { value: 'A', text: '代码性能分析' },
            { value: 'B', text: '记录性能事件的时间线' },
            { value: 'C', text: '内存使用监控' },
            { value: 'D', text: '网络性能测试' }
        ],
        correctAnswer: 'B',
        explanation: 'Performance Timeline提供了标准化的API来记录和查询各种性能事件的时间信息。',
        optionExplanations: {
            'A': '部分正确，但不完整。',
            'B': '正确。记录性能事件时间线。',
            'C': '错误。不专门用于内存监控。',
            'D': '错误。不专门用于网络测试。'
        },
        tags: ['perf_hooks', 'Performance Timeline', '性能监控', '时间测量']
    },

    // 42. 模块解析深度
    {
        id: 42,
        type: 'single',
        question: 'Node.js中，ES模块和CommonJS模块的互操作是如何实现的？',
        options: [
            { value: 'A', text: '自动转换' },
            { value: 'B', text: '通过Module Wrapper' },
            { value: 'C', text: '运行时适配层' },
            { value: 'D', text: '不支持互操作' }
        ],
        correctAnswer: 'C',
        explanation: 'Node.js在运行时提供适配层，处理ES模块和CommonJS模块之间的导入导出转换。',
        optionExplanations: {
            'A': '错误。不是自动转换。',
            'B': '错误。Module Wrapper用于其他目的。',
            'C': '正确。运行时适配层处理互操作。',
            'D': '错误。Node.js支持互操作。'
        },
        tags: ['ES模块', 'CommonJS', '模块互操作', '运行时适配']
    },

    // 43. 底层网络实现
    {
        id: 43,
        type: 'single',
        question: 'Node.js的HTTP/2实现基于什么底层库？',
        options: [
            { value: 'A', text: '自研HTTP/2库' },
            { value: 'B', text: 'nghttp2库' },
            { value: 'C', text: 'curl库' },
            { value: 'D', text: 'OpenSSL' }
        ],
        correctAnswer: 'B',
        explanation: 'Node.js的HTTP/2实现基于nghttp2库，这是一个高性能的HTTP/2 C库。',
        optionExplanations: {
            'A': '错误。不是自研的。',
            'B': '正确。基于nghttp2库实现。',
            'C': '错误。不是基于curl。',
            'D': '错误。OpenSSL用于TLS，不是HTTP/2。'
        },
        tags: ['HTTP/2', 'nghttp2', '网络协议', '底层实现']
    },

    // 44. 调试器实现
    {
        id: 44,
        type: 'single',
        question: 'Node.js的调试器协议基于什么标准？',
        options: [
            { value: 'A', text: 'GDB协议' },
            { value: 'B', text: 'Chrome DevTools Protocol' },
            { value: 'C', text: '自定义协议' },
            { value: 'D', text: 'LLDB协议' }
        ],
        correctAnswer: 'B',
        explanation: 'Node.js调试器使用Chrome DevTools Protocol，与Chrome浏览器的调试工具兼容。',
        optionExplanations: {
            'A': '错误。不是GDB协议。',
            'B': '正确。使用Chrome DevTools Protocol。',
            'C': '错误。不是自定义协议。',
            'D': '错误。不是LLDB协议。'
        },
        tags: ['调试器', 'Chrome DevTools Protocol', '调试协议', '开发工具']
    },

    // 45. 安全机制深度
    {
        id: 45,
        type: 'single',
        question: 'Node.js的vm模块创建的上下文有什么安全限制？',
        options: [
            { value: 'A', text: '完全隔离，绝对安全' },
            { value: 'B', text: '不是安全边界，可能被绕过' },
            { value: 'C', text: '只能访问指定API' },
            { value: 'D', text: '自动过滤恶意代码' }
        ],
        correctAnswer: 'B',
        explanation: 'vm模块的上下文不是安全边界，恶意代码可能通过各种方式逃逸出沙箱环境。',
        optionExplanations: {
            'A': '错误。不是完全隔离的。',
            'B': '正确。不是安全边界，可能被绕过。',
            'C': '错误。限制不够严格。',
            'D': '错误。不会自动过滤恶意代码。'
        },
        tags: ['vm模块', '沙箱安全', '代码隔离', '安全边界']
    },

    // 46. 编译缓存
    {
        id: 46,
        type: 'single',
        question: 'V8引擎的代码缓存（Code Cache）存储什么内容？',
        options: [
            { value: 'A', text: '源代码' },
            { value: 'B', text: '编译后的字节码' },
            { value: 'C', text: '优化后的机器码' },
            { value: 'D', text: '语法分析结果' }
        ],
        correctAnswer: 'B',
        explanation: '代码缓存存储编译后的字节码，避免重复解析和编译相同的JavaScript代码。',
        optionExplanations: {
            'A': '错误。不存储源代码。',
            'B': '正确。存储编译后的字节码。',
            'C': '错误。不存储机器码。',
            'D': '错误。不只是语法分析结果。'
        },
        tags: ['代码缓存', '字节码', '编译优化', 'V8引擎']
    },

    // 47. 内存映射
    {
        id: 47,
        type: 'single',
        question: 'Node.js中，大文件处理时使用内存映射的优势是什么？',
        options: [
            { value: 'A', text: '减少内存使用' },
            { value: 'B', text: '提高读取速度' },
            { value: 'C', text: '避免将整个文件加载到内存' },
            { value: 'D', text: '简化代码逻辑' }
        ],
        correctAnswer: 'C',
        explanation: '内存映射允许操作系统按需加载文件部分到内存，避免一次性加载整个大文件。',
        optionExplanations: {
            'A': '部分正确，但不是主要优势。',
            'B': '部分正确，但不是主要优势。',
            'C': '正确。避免一次性加载整个文件。',
            'D': '错误。内存映射不会简化代码。'
        },
        tags: ['内存映射', '大文件处理', '操作系统', '内存管理']
    },

    // 48. 异步栈跟踪
    {
        id: 48,
        type: 'single',
        question: 'Node.js的异步栈跟踪（Async Stack Trace）是如何实现的？',
        options: [
            { value: 'A', text: '修改V8引擎' },
            { value: 'B', text: '基于async_hooks和Error.captureStackTrace' },
            { value: 'C', text: '运行时栈重建' },
            { value: 'D', text: '静态代码分析' }
        ],
        correctAnswer: 'B',
        explanation: 'Node.js通过async_hooks跟踪异步操作链，结合Error.captureStackTrace重建完整的异步调用栈。',
        optionExplanations: {
            'A': '错误。不需要修改V8引擎。',
            'B': '正确。基于async_hooks和Error API实现。',
            'C': '错误。不是运行时栈重建。',
            'D': '错误。不是静态分析。'
        },
        tags: ['异步栈跟踪', 'async_hooks', 'Error.captureStackTrace', '调试工具']
    },

    // 49. 性能分析工具
    {
        id: 49,
        type: 'single',
        question: 'Node.js的--prof参数生成的性能分析文件格式是什么？',
        options: [
            { value: 'A', text: 'JSON格式' },
            { value: 'B', text: 'V8 profiler格式' },
            { value: 'C', text: 'CSV格式' },
            { value: 'D', text: '二进制格式' }
        ],
        correctAnswer: 'B',
        explanation: '--prof参数生成V8 profiler格式的文件，需要使用--prof-process参数或tick-processor工具解析。',
        optionExplanations: {
            'A': '错误。不是JSON格式。',
            'B': '正确。生成V8 profiler格式文件。',
            'C': '错误。不是CSV格式。',
            'D': '错误。不是二进制格式。'
        },
        tags: ['性能分析', '--prof参数', 'V8 profiler', '性能调优']
    },

    // 50. 源码编译优化
    {
        id: 50,
        type: 'single',
        question: 'Node.js编译时，哪个选项可以启用更多的V8优化？',
        options: [
            { value: 'A', text: '--enable-optimizations' },
            { value: 'B', text: '--v8-options' },
            { value: 'C', text: '--experimental-vm-modules' },
            { value: 'D', text: '--max-old-space-size' }
        ],
        correctAnswer: 'B',
        explanation: '--v8-options可以查看和设置V8引擎的各种优化选项，包括编译优化参数。',
        optionExplanations: {
            'A': '错误。不是有效的Node.js选项。',
            'B': '正确。用于查看和设置V8选项。',
            'C': '错误。这是实验性模块选项。',
            'D': '错误。这是内存限制选项。'
        },
        tags: ['编译优化', 'V8选项', '性能调优', '启动参数']
    }
];