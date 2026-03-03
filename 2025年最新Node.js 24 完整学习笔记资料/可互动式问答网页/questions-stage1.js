// 阶段一：基础入门题库
// 涵盖Node.js基础概念、环境搭建、核心模块等知识点

window.stage1Questions = [
    // 1. Node.js基础概念
    {
        id: 1,
        type: 'single',
        question: 'Node.js是什么？',
        options: [
            { value: 'A', text: '一个JavaScript前端框架' },
            { value: 'B', text: '基于Chrome V8引擎的JavaScript运行时环境' },
            { value: 'C', text: '一个数据库管理系统' },
            { value: 'D', text: '一个代码编辑器' }
        ],
        correctAnswer: 'B',
        explanation: 'Node.js是一个基于Chrome V8 JavaScript引擎构建的JavaScript运行时环境，让JavaScript能够在服务器端运行。',
        optionExplanations: {
            'A': '错误。Node.js不是前端框架，而是服务器端运行时环境。',
            'B': '正确。Node.js确实是基于Chrome V8引擎的JavaScript运行时环境。',
            'C': '错误。Node.js不是数据库，而是运行时环境。',
            'D': '错误。Node.js不是编辑器，而是运行时环境。'
        },
        tags: ['基础概念', 'Node.js定义', 'V8引擎']
    },

    // 2. Node.js特点
    {
        id: 2,
        type: 'multiple',
        question: 'Node.js具有哪些主要特点？',
        options: [
            { value: 'A', text: '事件驱动' },
            { value: 'B', text: '非阻塞I/O' },
            { value: 'C', text: '单线程' },
            { value: 'D', text: '跨平台' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Node.js的主要特点包括：事件驱动、非阻塞I/O、单线程（主线程）、跨平台等。这些特点使得Node.js特别适合构建高并发的网络应用。',
        optionExplanations: {
            'A': '正确。Node.js采用事件驱动架构，通过事件循环处理请求。',
            'B': '正确。Node.js使用非阻塞I/O操作，提高了性能。',
            'C': '正确。Node.js主线程是单线程的，但内部使用线程池处理I/O操作。',
            'D': '正确。Node.js可以在Windows、Linux、macOS等多个平台运行。'
        },
        tags: ['Node.js特点', '事件驱动', '非阻塞IO', '单线程']
    },

    // 3. 版本管理
    {
        id: 3,
        type: 'single',
        question: '查看当前Node.js版本的命令是？',
        options: [
            { value: 'A', text: 'node -v' },
            { value: 'B', text: 'node --info' },
            { value: 'C', text: 'node version' },
            { value: 'D', text: 'node -version' }
        ],
        correctAnswer: 'A',
        explanation: '使用 node -v 或 node --version 命令可以查看当前安装的Node.js版本。',
        optionExplanations: {
            'A': '正确。node -v 是查看Node.js版本的标准命令。',
            'B': '错误。--info 参数用于显示系统信息，不是版本信息。',
            'C': '错误。没有 version 这个子命令。',
            'D': '错误。正确的长参数形式是 --version，不是 -version。'
        },
        tags: ['版本管理', '命令行', '基础操作']
    },

    // 4. NPM基础
    {
        id: 4,
        type: 'single',
        question: 'NPM的全称是什么？',
        options: [
            { value: 'A', text: 'Node Package Manager' },
            { value: 'B', text: 'New Project Manager' },
            { value: 'C', text: 'Network Package Manager' },
            { value: 'D', text: 'Node Program Manager' }
        ],
        correctAnswer: 'A',
        explanation: 'NPM全称是Node Package Manager，是Node.js的包管理器，用于安装、管理和发布JavaScript包。',
        optionExplanations: {
            'A': '正确。NPM确实是Node Package Manager的缩写。',
            'B': '错误。不是New Project Manager。',
            'C': '错误。不是Network Package Manager。',
            'D': '错误。不是Node Program Manager。'
        },
        tags: ['NPM', '包管理', '基础概念']
    },

    // 5. 模块系统
    {
        id: 5,
        type: 'single',
        question: '在Node.js中，如何导入一个模块？',
        options: [
            { value: 'A', text: 'import module from "module"' },
            { value: 'B', text: 'const module = require("module")' },
            { value: 'C', text: 'include "module"' },
            { value: 'D', text: 'load("module")' }
        ],
        correctAnswer: 'B',
        explanation: '在Node.js中，使用CommonJS模块系统，通过require()函数导入模块。ES6的import语法需要特殊配置才能使用。',
        optionExplanations: {
            'A': '部分正确。这是ES6模块语法，在Node.js中需要特殊配置。',
            'B': '正确。这是Node.js中标准的CommonJS模块导入方式。',
            'C': '错误。include不是JavaScript的语法。',
            'D': '错误。load不是Node.js的标准函数。'
        },
        tags: ['模块系统', 'CommonJS', 'require']
    },

    // 6. 模块导出
    {
        id: 6,
        type: 'multiple',
        question: '在Node.js中，有哪些方式可以导出模块？',
        options: [
            { value: 'A', text: 'module.exports = {}' },
            { value: 'B', text: 'exports.property = value' },
            { value: 'C', text: 'export default {}' },
            { value: 'D', text: 'return {}' }
        ],
        correctAnswer: ['A', 'B'],
        explanation: '在Node.js的CommonJS模块系统中，可以使用module.exports或exports来导出模块。export default是ES6语法，return不是导出方式。',
        optionExplanations: {
            'A': '正确。module.exports是导出整个模块的标准方式。',
            'B': '正确。exports是module.exports的引用，可以用来导出属性。',
            'C': '错误。这是ES6模块语法，不是CommonJS标准。',
            'D': '错误。return不能用于模块导出。'
        },
        tags: ['模块系统', '导出', 'module.exports', 'exports']
    },

    // 7. 全局对象
    {
        id: 7,
        type: 'boolean',
        question: '在Node.js中，window对象是全局对象。',
        correctAnswer: false,
        explanation: '在Node.js中，全局对象是global，不是window。window是浏览器环境中的全局对象。',
        tags: ['全局对象', 'global', 'window']
    },

    // 8. __dirname
    {
        id: 8,
        type: 'single',
        question: '__dirname变量表示什么？',
        options: [
            { value: 'A', text: '当前文件的完整路径' },
            { value: 'B', text: '当前文件所在目录的路径' },
            { value: 'C', text: '项目根目录的路径' },
            { value: 'D', text: '用户主目录的路径' }
        ],
        correctAnswer: 'B',
        explanation: '__dirname是Node.js中的全局变量，表示当前执行脚本所在目录的绝对路径。',
        optionExplanations: {
            'A': '错误。__filename才是当前文件的完整路径。',
            'B': '正确。__dirname表示当前文件所在目录的绝对路径。',
            'C': '错误。这不是项目根目录，而是当前文件所在目录。',
            'D': '错误。这不是用户主目录。'
        },
        tags: ['全局变量', '__dirname', '路径']
    },

    // 9. process对象
    {
        id: 9,
        type: 'single',
        question: 'process.argv数组的第一个元素是什么？',
        options: [
            { value: 'A', text: '脚本文件名' },
            { value: 'B', text: 'Node.js可执行文件的路径' },
            { value: 'C', text: '第一个命令行参数' },
            { value: 'D', text: '当前工作目录' }
        ],
        correctAnswer: 'B',
        explanation: 'process.argv[0]是Node.js可执行文件的路径，process.argv[1]是脚本文件的路径，从process.argv[2]开始才是命令行参数。',
        optionExplanations: {
            'A': '错误。脚本文件名是process.argv[1]。',
            'B': '正确。process.argv[0]确实是Node.js可执行文件的路径。',
            'C': '错误。第一个命令行参数是process.argv[2]。',
            'D': '错误。当前工作目录是process.cwd()。'
        },
        tags: ['process对象', 'argv', '命令行参数']
    },

    // 10. 文件系统模块
    {
        id: 10,
        type: 'single',
        question: '要使用Node.js的文件系统功能，需要引入哪个核心模块？',
        options: [
            { value: 'A', text: 'file' },
            { value: 'B', text: 'fs' },
            { value: 'C', text: 'filesystem' },
            { value: 'D', text: 'io' }
        ],
        correctAnswer: 'B',
        explanation: 'fs（File System）是Node.js的核心模块，提供了文件系统相关的API。',
        optionExplanations: {
            'A': '错误。没有file这个核心模块。',
            'B': '正确。fs是文件系统模块的名称。',
            'C': '错误。模块名是fs，不是filesystem。',
            'D': '错误。io不是文件系统模块。'
        },
        tags: ['核心模块', 'fs', '文件系统']
    },

    // 11. 异步读取文件
    {
        id: 11,
        type: 'single',
        question: '使用fs模块异步读取文件的方法是？',
        options: [
            { value: 'A', text: 'fs.readFile()' },
            { value: 'B', text: 'fs.readFileSync()' },
            { value: 'C', text: 'fs.read()' },
            { value: 'D', text: 'fs.open()' }
        ],
        correctAnswer: 'A',
        explanation: 'fs.readFile()是异步读取文件的方法，fs.readFileSync()是同步方法。',
        optionExplanations: {
            'A': '正确。fs.readFile()是异步读取文件的标准方法。',
            'B': '错误。fs.readFileSync()是同步方法，不是异步的。',
            'C': '错误。fs.read()是底层的读取方法，通常不直接使用。',
            'D': '错误。fs.open()是打开文件的方法，不是读取文件。'
        },
        tags: ['fs模块', '异步操作', 'readFile']
    },

    // 12. 路径模块
    {
        id: 12,
        type: 'single',
        question: '要处理文件路径，应该使用哪个Node.js核心模块？',
        options: [
            { value: 'A', text: 'url' },
            { value: 'B', text: 'path' },
            { value: 'C', text: 'os' },
            { value: 'D', text: 'util' }
        ],
        correctAnswer: 'B',
        explanation: 'path模块提供了处理文件路径的实用工具，如path.join()、path.resolve()等。',
        optionExplanations: {
            'A': '错误。url模块用于处理URL，不是文件路径。',
            'B': '正确。path模块专门用于处理文件路径。',
            'C': '错误。os模块提供操作系统相关的实用工具。',
            'D': '错误。util模块提供通用的实用工具函数。'
        },
        tags: ['核心模块', 'path', '路径处理']
    },

    // 13. HTTP模块
    {
        id: 13,
        type: 'single',
        question: '创建HTTP服务器需要使用哪个核心模块？',
        options: [
            { value: 'A', text: 'net' },
            { value: 'B', text: 'http' },
            { value: 'C', text: 'server' },
            { value: 'D', text: 'web' }
        ],
        correctAnswer: 'B',
        explanation: 'http模块是Node.js的核心模块，用于创建HTTP服务器和客户端。',
        optionExplanations: {
            'A': '错误。net模块用于创建TCP服务器，不是HTTP。',
            'B': '正确。http模块专门用于HTTP协议相关功能。',
            'C': '错误。没有server这个核心模块。',
            'D': '错误。没有web这个核心模块。'
        },
        tags: ['核心模块', 'HTTP', '服务器']
    },

    // 14. 创建HTTP服务器
    {
        id: 14,
        type: 'single',
        question: '创建HTTP服务器的方法是？',
        options: [
            { value: 'A', text: 'http.createServer()' },
            { value: 'B', text: 'http.newServer()' },
            { value: 'C', text: 'http.server()' },
            { value: 'D', text: 'new http.Server()' }
        ],
        correctAnswer: 'A',
        explanation: 'http.createServer()是创建HTTP服务器的标准方法，返回一个Server实例。',
        optionExplanations: {
            'A': '正确。http.createServer()是创建HTTP服务器的标准方法。',
            'B': '错误。没有newServer这个方法。',
            'C': '错误。没有server这个方法。',
            'D': '错误。虽然可以用new http.Server()，但不是常用方式。'
        },
        tags: ['HTTP', 'createServer', '服务器创建']
    },

    // 15. 事件循环
    {
        id: 15,
        type: 'boolean',
        question: 'Node.js的事件循环是多线程的。',
        correctAnswer: false,
        explanation: 'Node.js的事件循环本身是单线程的，但底层的I/O操作使用线程池来处理。',
        tags: ['事件循环', '单线程', '多线程']
    },

    // 16. Buffer对象
    {
        id: 16,
        type: 'single',
        question: 'Buffer对象主要用于处理什么类型的数据？',
        options: [
            { value: 'A', text: '字符串数据' },
            { value: 'B', text: '二进制数据' },
            { value: 'C', text: 'JSON数据' },
            { value: 'D', text: '数组数据' }
        ],
        correctAnswer: 'B',
        explanation: 'Buffer是Node.js中用于处理二进制数据的类，特别适合处理文件、网络数据等。',
        optionExplanations: {
            'A': '错误。虽然Buffer可以处理字符串，但主要用途是二进制数据。',
            'B': '正确。Buffer专门用于处理二进制数据。',
            'C': '错误。JSON数据通常用字符串或对象处理。',
            'D': '错误。数组有专门的Array类型。'
        },
        tags: ['Buffer', '二进制数据', '数据处理']
    },

    // 17. 流（Stream）
    {
        id: 17,
        type: 'multiple',
        question: 'Node.js中有哪些类型的流？',
        options: [
            { value: 'A', text: '可读流（Readable）' },
            { value: 'B', text: '可写流（Writable）' },
            { value: 'C', text: '双工流（Duplex）' },
            { value: 'D', text: '转换流（Transform）' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Node.js中有四种基本的流类型：可读流、可写流、双工流和转换流。',
        optionExplanations: {
            'A': '正确。可读流用于读取数据。',
            'B': '正确。可写流用于写入数据。',
            'C': '正确。双工流既可读又可写。',
            'D': '正确。转换流是特殊的双工流，可以修改数据。'
        },
        tags: ['Stream', '流类型', '可读流', '可写流']
    },

    // 18. EventEmitter
    {
        id: 18,
        type: 'single',
        question: 'EventEmitter类属于哪个核心模块？',
        options: [
            { value: 'A', text: 'util' },
            { value: 'B', text: 'events' },
            { value: 'C', text: 'emitter' },
            { value: 'D', text: 'event' }
        ],
        correctAnswer: 'B',
        explanation: 'EventEmitter类是events模块的核心类，用于实现事件驱动编程。',
        optionExplanations: {
            'A': '错误。util模块提供实用工具，不包含EventEmitter。',
            'B': '正确。EventEmitter是events模块的主要类。',
            'C': '错误。没有emitter这个核心模块。',
            'D': '错误。模块名是events，不是event。'
        },
        tags: ['EventEmitter', 'events模块', '事件驱动']
    },

    // 19. 监听事件
    {
        id: 19,
        type: 'single',
        question: '在EventEmitter中，监听事件的方法是？',
        options: [
            { value: 'A', text: 'listen()' },
            { value: 'B', text: 'on()' },
            { value: 'C', text: 'watch()' },
            { value: 'D', text: 'bind()' }
        ],
        correctAnswer: 'B',
        explanation: 'on()方法用于监听事件，也可以使用addListener()方法，它们是等价的。',
        optionExplanations: {
            'A': '错误。listen()不是EventEmitter的方法。',
            'B': '正确。on()是监听事件的标准方法。',
            'C': '错误。watch()不是EventEmitter的方法。',
            'D': '错误。bind()不是用于监听事件的。'
        },
        tags: ['EventEmitter', '事件监听', 'on方法']
    },

    // 20. 触发事件
    {
        id: 20,
        type: 'single',
        question: '在EventEmitter中，触发事件的方法是？',
        options: [
            { value: 'A', text: 'fire()' },
            { value: 'B', text: 'trigger()' },
            { value: 'C', text: 'emit()' },
            { value: 'D', text: 'dispatch()' }
        ],
        correctAnswer: 'C',
        explanation: 'emit()方法用于触发事件，会调用所有注册的监听器。',
        optionExplanations: {
            'A': '错误。fire()不是EventEmitter的方法。',
            'B': '错误。trigger()不是EventEmitter的方法。',
            'C': '正确。emit()是触发事件的标准方法。',
            'D': '错误。dispatch()不是EventEmitter的方法。'
        },
        tags: ['EventEmitter', '事件触发', 'emit方法']
    },

    // 21. 包管理文件
    {
        id: 21,
        type: 'single',
        question: 'Node.js项目的包管理文件名是？',
        options: [
            { value: 'A', text: 'project.json' },
            { value: 'B', text: 'package.json' },
            { value: 'C', text: 'node.json' },
            { value: 'D', text: 'config.json' }
        ],
        correctAnswer: 'B',
        explanation: 'package.json是Node.js项目的包管理文件，包含项目信息、依赖关系等。',
        optionExplanations: {
            'A': '错误。不是project.json。',
            'B': '正确。package.json是标准的包管理文件。',
            'C': '错误。不是node.json。',
            'D': '错误。config.json不是包管理文件。'
        },
        tags: ['package.json', '包管理', '项目配置']
    },

    // 22. 依赖安装
    {
        id: 22,
        type: 'single',
        question: '安装项目依赖的命令是？',
        options: [
            { value: 'A', text: 'npm setup' },
            { value: 'B', text: 'npm install' },
            { value: 'C', text: 'npm download' },
            { value: 'D', text: 'npm get' }
        ],
        correctAnswer: 'B',
        explanation: 'npm install命令用于安装package.json中定义的所有依赖包。',
        optionExplanations: {
            'A': '错误。没有setup这个npm命令。',
            'B': '正确。npm install是安装依赖的标准命令。',
            'C': '错误。没有download这个npm命令。',
            'D': '错误。没有get这个npm命令。'
        },
        tags: ['NPM', '依赖安装', 'npm install']
    },

    // 23. 开发依赖
    {
        id: 23,
        type: 'single',
        question: '安装开发依赖的参数是？',
        options: [
            { value: 'A', text: '--dev' },
            { value: 'B', text: '--save-dev' },
            { value: 'C', text: '--development' },
            { value: 'D', text: '--dev-only' }
        ],
        correctAnswer: 'B',
        explanation: '--save-dev参数将包安装为开发依赖，只在开发阶段需要，不会在生产环境安装。',
        optionExplanations: {
            'A': '错误。--dev不是正确的参数。',
            'B': '正确。--save-dev是安装开发依赖的正确参数。',
            'C': '错误。--development不是npm的参数。',
            'D': '错误。--dev-only不是npm的参数。'
        },
        tags: ['NPM', '开发依赖', 'save-dev']
    },

    // 24. 全局安装
    {
        id: 24,
        type: 'single',
        question: '全局安装npm包的参数是？',
        options: [
            { value: 'A', text: '--global' },
            { value: 'B', text: '-g' },
            { value: 'C', text: '--system' },
            { value: 'D', text: '--worldwide' }
        ],
        correctAnswer: 'B',
        explanation: '-g或--global参数用于全局安装npm包，使其在系统任何位置都可以使用。',
        optionExplanations: {
            'A': '部分正确。--global也可以，但-g更常用。',
            'B': '正确。-g是全局安装的标准参数。',
            'C': '错误。--system不是npm的参数。',
            'D': '错误。--worldwide不是npm的参数。'
        },
        tags: ['NPM', '全局安装', '全局包']
    },

    // 25. 脚本执行
    {
        id: 25,
        type: 'single',
        question: '执行package.json中定义的脚本的命令是？',
        options: [
            { value: 'A', text: 'npm exec' },
            { value: 'B', text: 'npm run' },
            { value: 'C', text: 'npm script' },
            { value: 'D', text: 'npm start' }
        ],
        correctAnswer: 'B',
        explanation: 'npm run命令用于执行package.json中scripts字段定义的脚本。',
        optionExplanations: {
            'A': '错误。npm exec用于执行包中的可执行文件。',
            'B': '正确。npm run是执行脚本的标准命令。',
            'C': '错误。没有script这个npm命令。',
            'D': '错误。npm start只能执行start脚本，不是通用命令。'
        },
        tags: ['NPM', '脚本执行', 'npm run']
    },

    // 26. 模块查找
    {
        id: 26,
        type: 'boolean',
        question: 'Node.js在查找模块时，会先查找核心模块，再查找本地模块。',
        correctAnswer: true,
        explanation: 'Node.js的模块查找顺序是：核心模块 → 本地模块（相对路径）→ node_modules目录。',
        tags: ['模块查找', '核心模块', '查找顺序']
    },

    // 27. require缓存
    {
        id: 27,
        type: 'boolean',
        question: 'require()会缓存已加载的模块，多次require同一个模块只会执行一次。',
        correctAnswer: true,
        explanation: 'Node.js会缓存require的模块，同一个模块只会在第一次require时执行，后续require会直接返回缓存的结果。',
        tags: ['require', '模块缓存', '性能优化']
    },

    // 28. JSON文件
    {
        id: 28,
        type: 'boolean',
        question: '可以直接使用require()加载JSON文件。',
        correctAnswer: true,
        explanation: 'Node.js支持直接require JSON文件，会自动解析并返回JavaScript对象。',
        tags: ['require', 'JSON', '文件加载']
    },

    // 29. 环境变量
    {
        id: 29,
        type: 'single',
        question: '在Node.js中，如何访问环境变量？',
        options: [
            { value: 'A', text: 'process.env' },
            { value: 'B', text: 'system.env' },
            { value: 'C', text: 'global.env' },
            { value: 'D', text: 'node.env' }
        ],
        correctAnswer: 'A',
        explanation: 'process.env对象包含了所有环境变量，可以通过它访问系统环境变量。',
        optionExplanations: {
            'A': '正确。process.env是访问环境变量的标准方式。',
            'B': '错误。没有system.env这个对象。',
            'C': '错误。global.env不存在。',
            'D': '错误。没有node.env这个对象。'
        },
        tags: ['环境变量', 'process.env', '系统配置']
    },

    // 30. 退出进程
    {
        id: 30,
        type: 'single',
        question: '如何在Node.js中退出当前进程？',
        options: [
            { value: 'A', text: 'process.exit()' },
            { value: 'B', text: 'system.exit()' },
            { value: 'C', text: 'node.exit()' },
            { value: 'D', text: 'quit()' }
        ],
        correctAnswer: 'A',
        explanation: 'process.exit()方法用于退出当前Node.js进程，可以传入退出码。',
        optionExplanations: {
            'A': '正确。process.exit()是退出进程的标准方法。',
            'B': '错误。没有system.exit()这个方法。',
            'C': '错误。没有node.exit()这个方法。',
            'D': '错误。quit()不是Node.js的方法。'
        },
        tags: ['进程控制', 'process.exit', '程序退出']
    },

    // 31. 异步编程
    {
        id: 31,
        type: 'multiple',
        question: 'Node.js中处理异步操作的方式有哪些？',
        options: [
            { value: 'A', text: '回调函数（Callback）' },
            { value: 'B', text: 'Promise' },
            { value: 'C', text: 'async/await' },
            { value: 'D', text: '事件监听' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Node.js支持多种异步编程方式：回调函数、Promise、async/await和事件监听。',
        optionExplanations: {
            'A': '正确。回调函数是Node.js最传统的异步处理方式。',
            'B': '正确。Promise提供了更好的异步流程控制。',
            'C': '正确。async/await是基于Promise的语法糖。',
            'D': '正确。事件监听也是处理异步操作的方式。'
        },
        tags: ['异步编程', '回调函数', 'Promise', 'async/await']
    },

    // 32. 错误处理
    {
        id: 32,
        type: 'single',
        question: '在Node.js的回调函数中，错误参数通常放在第几个位置？',
        options: [
            { value: 'A', text: '最后一个' },
            { value: 'B', text: '第一个' },
            { value: 'C', text: '第二个' },
            { value: 'D', text: '没有固定位置' }
        ],
        correctAnswer: 'B',
        explanation: 'Node.js遵循"错误优先"的回调约定，错误参数总是回调函数的第一个参数。',
        optionExplanations: {
            'A': '错误。错误参数不在最后。',
            'B': '正确。Node.js的约定是错误参数在第一个位置。',
            'C': '错误。错误参数不在第二个位置。',
            'D': '错误。Node.js有明确的约定。'
        },
        tags: ['错误处理', '回调函数', '错误优先']
    },

    // 33. 定时器
    {
        id: 33,
        type: 'single',
        question: '在Node.js中，哪个函数用于设置延迟执行？',
        options: [
            { value: 'A', text: 'setTimeout()' },
            { value: 'B', text: 'setDelay()' },
            { value: 'C', text: 'delay()' },
            { value: 'D', text: 'wait()' }
        ],
        correctAnswer: 'A',
        explanation: 'setTimeout()函数用于在指定的毫秒数后执行函数，这是JavaScript的标准API。',
        optionExplanations: {
            'A': '正确。setTimeout()是设置延迟执行的标准函数。',
            'B': '错误。没有setDelay()这个函数。',
            'C': '错误。没有delay()这个全局函数。',
            'D': '错误。没有wait()这个全局函数。'
        },
        tags: ['定时器', 'setTimeout', '延迟执行']
    },

    // 34. 立即执行
    {
        id: 34,
        type: 'single',
        question: '在Node.js中，哪个函数用于在下一个事件循环迭代中执行回调？',
        options: [
            { value: 'A', text: 'setImmediate()' },
            { value: 'B', text: 'process.nextTick()' },
            { value: 'C', text: 'setTimeout(fn, 0)' },
            { value: 'D', text: '以上都可以' }
        ],
        correctAnswer: 'D',
        explanation: 'setImmediate()、process.nextTick()和setTimeout(fn, 0)都可以在下一个事件循环中执行回调，但执行优先级不同。',
        optionExplanations: {
            'A': '部分正确。setImmediate()确实可以，但不是唯一选择。',
            'B': '部分正确。process.nextTick()优先级最高。',
            'C': '部分正确。setTimeout(fn, 0)也可以实现。',
            'D': '正确。这些方法都可以实现异步执行，但优先级不同。'
        },
        tags: ['事件循环', 'setImmediate', 'nextTick']
    },

    // 35. URL模块
    {
        id: 35,
        type: 'single',
        question: '解析URL字符串应该使用哪个核心模块？',
        options: [
            { value: 'A', text: 'http' },
            { value: 'B', text: 'url' },
            { value: 'C', text: 'path' },
            { value: 'D', text: 'querystring' }
        ],
        correctAnswer: 'B',
        explanation: 'url模块提供了URL解析的功能，可以解析URL字符串为对象。',
        optionExplanations: {
            'A': '错误。http模块用于HTTP协议，不是URL解析。',
            'B': '正确。url模块专门用于URL解析。',
            'C': '错误。path模块用于文件路径处理。',
            'D': '错误。querystring模块只处理查询字符串。'
        },
        tags: ['URL', 'url模块', 'URL解析']
    },

    // 36. 查询字符串
    {
        id: 36,
        type: 'single',
        question: '处理URL查询字符串应该使用哪个核心模块？',
        options: [
            { value: 'A', text: 'url' },
            { value: 'B', text: 'querystring' },
            { value: 'C', text: 'query' },
            { value: 'D', text: 'params' }
        ],
        correctAnswer: 'B',
        explanation: 'querystring模块专门用于解析和格式化URL查询字符串。',
        optionExplanations: {
            'A': '部分正确。url模块也可以处理，但querystring更专业。',
            'B': '正确。querystring模块专门处理查询字符串。',
            'C': '错误。没有query这个核心模块。',
            'D': '错误。没有params这个核心模块。'
        },
        tags: ['查询字符串', 'querystring', 'URL参数']
    },

    // 37. 加密模块
    {
        id: 37,
        type: 'single',
        question: '要进行加密操作，应该使用哪个核心模块？',
        options: [
            { value: 'A', text: 'hash' },
            { value: 'B', text: 'crypto' },
            { value: 'C', text: 'encrypt' },
            { value: 'D', text: 'security' }
        ],
        correctAnswer: 'B',
        explanation: 'crypto模块提供了加密功能，包括哈希、HMAC、加密、解密等。',
        optionExplanations: {
            'A': '错误。没有hash这个核心模块。',
            'B': '正确。crypto模块提供完整的加密功能。',
            'C': '错误。没有encrypt这个核心模块。',
            'D': '错误。没有security这个核心模块。'
        },
        tags: ['加密', 'crypto模块', '安全']
    },

    // 38. 操作系统信息
    {
        id: 38,
        type: 'single',
        question: '获取操作系统信息应该使用哪个核心模块？',
        options: [
            { value: 'A', text: 'system' },
            { value: 'B', text: 'os' },
            { value: 'C', text: 'platform' },
            { value: 'D', text: 'info' }
        ],
        correctAnswer: 'B',
        explanation: 'os模块提供了操作系统相关的实用工具和信息。',
        optionExplanations: {
            'A': '错误。没有system这个核心模块。',
            'B': '正确。os模块提供操作系统信息。',
            'C': '错误。没有platform这个核心模块。',
            'D': '错误。没有info这个核心模块。'
        },
        tags: ['操作系统', 'os模块', '系统信息']
    },

    // 39. 子进程
    {
        id: 39,
        type: 'single',
        question: '创建子进程应该使用哪个核心模块？',
        options: [
            { value: 'A', text: 'process' },
            { value: 'B', text: 'child_process' },
            { value: 'C', text: 'spawn' },
            { value: 'D', text: 'exec' }
        ],
        correctAnswer: 'B',
        explanation: 'child_process模块提供了创建子进程的功能，如spawn、exec、fork等方法。',
        optionExplanations: {
            'A': '错误。process对象表示当前进程，不用于创建子进程。',
            'B': '正确。child_process模块专门用于子进程操作。',
            'C': '错误。spawn是child_process模块的方法，不是模块名。',
            'D': '错误。exec是child_process模块的方法，不是模块名。'
        },
        tags: ['子进程', 'child_process', '进程管理']
    },

    // 40. 集群
    {
        id: 40,
        type: 'single',
        question: '要创建Node.js集群应该使用哪个核心模块？',
        options: [
            { value: 'A', text: 'worker' },
            { value: 'B', text: 'cluster' },
            { value: 'C', text: 'thread' },
            { value: 'D', text: 'parallel' }
        ],
        correctAnswer: 'B',
        explanation: 'cluster模块允许创建共享服务器端口的子进程，实现负载均衡。',
        optionExplanations: {
            'A': '错误。worker_threads模块用于工作线程，不是集群。',
            'B': '正确。cluster模块用于创建进程集群。',
            'C': '错误。没有thread这个核心模块。',
            'D': '错误。没有parallel这个核心模块。'
        },
        tags: ['集群', 'cluster模块', '负载均衡']
    },

    // 41. 调试
    {
        id: 41,
        type: 'single',
        question: '启动Node.js调试模式的参数是？',
        options: [
            { value: 'A', text: '--debug' },
            { value: 'B', text: '--inspect' },
            { value: 'C', text: '--debugger' },
            { value: 'D', text: '--dev' }
        ],
        correctAnswer: 'B',
        explanation: '--inspect参数启动Node.js的调试模式，可以使用Chrome DevTools进行调试。',
        optionExplanations: {
            'A': '错误。--debug是旧版本的参数，已废弃。',
            'B': '正确。--inspect是当前的调试参数。',
            'C': '错误。--debugger不是正确的参数。',
            'D': '错误。--dev不是调试参数。'
        },
        tags: ['调试', 'inspect', '开发工具']
    },

    // 42. 性能监控
    {
        id: 42,
        type: 'single',
        question: '测量代码执行时间应该使用哪个对象？',
        options: [
            { value: 'A', text: 'Date' },
            { value: 'B', text: 'console.time' },
            { value: 'C', text: 'process.hrtime' },
            { value: 'D', text: '以上都可以' }
        ],
        correctAnswer: 'D',
        explanation: 'Date对象、console.time()和process.hrtime()都可以用于测量时间，但精度和用途略有不同。',
        optionExplanations: {
            'A': '部分正确。Date可以测量时间，但精度较低。',
            'B': '部分正确。console.time()很方便，适合调试。',
            'C': '部分正确。process.hrtime()提供高精度时间。',
            'D': '正确。这些方法都可以用于时间测量。'
        },
        tags: ['性能监控', '时间测量', 'hrtime']
    },

    // 43. 内存使用
    {
        id: 43,
        type: 'single',
        question: '查看Node.js进程内存使用情况的方法是？',
        options: [
            { value: 'A', text: 'process.memory()' },
            { value: 'B', text: 'process.memoryUsage()' },
            { value: 'C', text: 'system.memory()' },
            { value: 'D', text: 'os.memory()' }
        ],
        correctAnswer: 'B',
        explanation: 'process.memoryUsage()方法返回当前进程的内存使用情况，包括堆内存、外部内存等。',
        optionExplanations: {
            'A': '错误。没有process.memory()这个方法。',
            'B': '正确。process.memoryUsage()是查看内存使用的标准方法。',
            'C': '错误。没有system.memory()这个方法。',
            'D': '错误。os模块没有memory()方法。'
        },
        tags: ['内存监控', 'memoryUsage', '性能分析']
    },

    // 44. 垃圾回收
    {
        id: 44,
        type: 'boolean',
        question: 'Node.js会自动进行垃圾回收，开发者无需手动管理内存。',
        correctAnswer: true,
        explanation: 'Node.js基于V8引擎，具有自动垃圾回收机制，但开发者仍需注意避免内存泄漏。',
        tags: ['垃圾回收', '内存管理', 'V8引擎']
    },

    // 45. 错误类型
    {
        id: 45,
        type: 'multiple',
        question: 'Node.js中常见的错误类型有哪些？',
        options: [
            { value: 'A', text: 'SyntaxError' },
            { value: 'B', text: 'ReferenceError' },
            { value: 'C', text: 'TypeError' },
            { value: 'D', text: 'RangeError' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Node.js中常见的错误类型包括语法错误、引用错误、类型错误、范围错误等。',
        optionExplanations: {
            'A': '正确。SyntaxError是语法错误。',
            'B': '正确。ReferenceError是引用错误。',
            'C': '正确。TypeError是类型错误。',
            'D': '正确。RangeError是范围错误。'
        },
        tags: ['错误类型', '异常处理', '错误调试']
    },

    // 46. 异常捕获
    {
        id: 46,
        type: 'single',
        question: '捕获未处理的异常应该监听哪个事件？',
        options: [
            { value: 'A', text: 'uncaughtException' },
            { value: 'B', text: 'unhandledException' },
            { value: 'C', text: 'error' },
            { value: 'D', text: 'exception' }
        ],
        correctAnswer: 'A',
        explanation: 'process对象的uncaughtException事件用于捕获未处理的异常。',
        optionExplanations: {
            'A': '正确。uncaughtException是捕获未处理异常的事件。',
            'B': '错误。没有unhandledException这个事件。',
            'C': '错误。error事件太通用，不是专门用于未处理异常。',
            'D': '错误。没有exception这个事件。'
        },
        tags: ['异常处理', 'uncaughtException', '错误捕获']
    },

    // 47. Promise拒绝
    {
        id: 47,
        type: 'single',
        question: '捕获未处理的Promise拒绝应该监听哪个事件？',
        options: [
            { value: 'A', text: 'unhandledRejection' },
            { value: 'B', text: 'promiseRejection' },
            { value: 'C', text: 'rejectionHandled' },
            { value: 'D', text: 'uncaughtPromise' }
        ],
        correctAnswer: 'A',
        explanation: 'process对象的unhandledRejection事件用于捕获未处理的Promise拒绝。',
        optionExplanations: {
            'A': '正确。unhandledRejection是捕获未处理Promise拒绝的事件。',
            'B': '错误。没有promiseRejection这个事件。',
            'C': '错误。rejectionHandled是另一个相关事件，但不是用于捕获未处理拒绝。',
            'D': '错误。没有uncaughtPromise这个事件。'
        },
        tags: ['Promise', 'unhandledRejection', '异步错误处理']
    },

    // 48. 模块类型
    {
        id: 48,
        type: 'multiple',
        question: 'Node.js中的模块可以分为哪些类型？',
        options: [
            { value: 'A', text: '核心模块' },
            { value: 'B', text: '本地模块' },
            { value: 'C', text: '第三方模块' },
            { value: 'D', text: '内置模块' }
        ],
        correctAnswer: ['A', 'B', 'C'],
        explanation: 'Node.js模块分为：核心模块（Node.js内置）、本地模块（自己编写）、第三方模块（npm安装）。内置模块就是核心模块。',
        optionExplanations: {
            'A': '正确。核心模块是Node.js内置的模块。',
            'B': '正确。本地模块是开发者自己编写的模块。',
            'C': '正确。第三方模块是通过npm安装的模块。',
            'D': '错误。内置模块就是核心模块，不是单独的类型。'
        },
        tags: ['模块类型', '核心模块', '第三方模块']
    },

    // 49. 版本管理工具
    {
        id: 49,
        type: 'single',
        question: '管理多个Node.js版本最常用的工具是？',
        options: [
            { value: 'A', text: 'npm' },
            { value: 'B', text: 'nvm' },
            { value: 'C', text: 'yarn' },
            { value: 'D', text: 'npx' }
        ],
        correctAnswer: 'B',
        explanation: 'nvm（Node Version Manager）是管理多个Node.js版本的常用工具。',
        optionExplanations: {
            'A': '错误。npm是包管理器，不是版本管理工具。',
            'B': '正确。nvm专门用于Node.js版本管理。',
            'C': '错误。yarn是包管理器，不是版本管理工具。',
            'D': '错误。npx用于执行npm包，不是版本管理工具。'
        },
        tags: ['版本管理', 'nvm', '开发工具']
    },

    // 50. 最佳实践
    {
        id: 50,
        type: 'boolean',
        question: '在生产环境中，应该使用NODE_ENV=production环境变量。',
        correctAnswer: true,
        explanation: '设置NODE_ENV=production可以启用生产模式优化，提高性能并禁用开发时的调试功能。',
        tags: ['最佳实践', '环境变量', '生产环境']
    }
];

// 导出题库供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.stage1Questions;
}