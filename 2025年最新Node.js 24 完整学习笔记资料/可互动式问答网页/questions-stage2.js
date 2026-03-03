// 阶段二：进阶入门题库
// 涵盖Express框架、中间件、数据库操作、RESTful API等知识点

window.stage2Questions = [
    // 1. Express框架基础
    {
        id: 1,
        type: 'single',
        question: 'Express.js是什么？',
        options: [
            { value: 'A', text: 'Node.js的核心模块' },
            { value: 'B', text: '基于Node.js的Web应用框架' },
            { value: 'C', text: '数据库管理系统' },
            { value: 'D', text: 'JavaScript运行时环境' }
        ],
        correctAnswer: 'B',
        explanation: 'Express.js是一个基于Node.js的快速、开放、极简的Web应用框架，提供了一系列强大特性帮助你创建各种Web和移动设备应用。',
        optionExplanations: {
            'A': '错误。Express不是Node.js的核心模块，而是第三方框架。',
            'B': '正确。Express确实是基于Node.js的Web应用框架。',
            'C': '错误。Express不是数据库，而是Web框架。',
            'D': '错误。Node.js才是JavaScript运行时环境。'
        },
        tags: ['Express框架', 'Web框架', '基础概念']
    },

    // 2. Express安装
    {
        id: 2,
        type: 'single',
        question: '安装Express框架的命令是？',
        options: [
            { value: 'A', text: 'npm install express' },
            { value: 'B', text: 'npm get express' },
            { value: 'C', text: 'npm add express' },
            { value: 'D', text: 'npm setup express' }
        ],
        correctAnswer: 'A',
        explanation: 'npm install express 是安装Express框架的标准命令。',
        optionExplanations: {
            'A': '正确。npm install 是安装npm包的标准命令。',
            'B': '错误。npm没有get命令。',
            'C': '错误。npm没有add命令。',
            'D': '错误。npm没有setup命令。'
        },
        tags: ['Express安装', 'NPM', '包管理']
    },

    // 3. Express应用创建
    {
        id: 3,
        type: 'single',
        question: '创建Express应用实例的方法是？',
        options: [
            { value: 'A', text: 'const app = new Express()' },
            { value: 'B', text: 'const app = express()' },
            { value: 'C', text: 'const app = Express.create()' },
            { value: 'D', text: 'const app = createExpress()' }
        ],
        correctAnswer: 'B',
        explanation: 'express()函数是Express模块导出的顶级函数，调用它会创建一个Express应用。',
        optionExplanations: {
            'A': '错误。Express不是构造函数，不能用new关键字。',
            'B': '正确。express()是创建应用实例的标准方式。',
            'C': '错误。Express没有create方法。',
            'D': '错误。没有createExpress这个函数。'
        },
        tags: ['Express应用', '应用创建', '实例化']
    },

    // 4. 路由定义
    {
        id: 4,
        type: 'single',
        question: '在Express中定义GET路由的方法是？',
        options: [
            { value: 'A', text: 'app.route("/path", handler)' },
            { value: 'B', text: 'app.get("/path", handler)' },
            { value: 'C', text: 'app.path("/path", handler)' },
            { value: 'D', text: 'app.handle("/path", handler)' }
        ],
        correctAnswer: 'B',
        explanation: 'app.get()方法用于定义GET请求的路由处理器。',
        optionExplanations: {
            'A': '错误。route方法用于创建路由实例，不是直接定义路由。',
            'B': '正确。app.get()是定义GET路由的标准方法。',
            'C': '错误。没有path方法用于定义路由。',
            'D': '错误。没有handle方法用于定义路由。'
        },
        tags: ['Express路由', 'GET请求', '路由定义']
    },

    // 5. HTTP方法
    {
        id: 5,
        type: 'multiple',
        question: 'Express支持哪些HTTP方法？',
        options: [
            { value: 'A', text: 'GET' },
            { value: 'B', text: 'POST' },
            { value: 'C', text: 'PUT' },
            { value: 'D', text: 'DELETE' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Express支持所有标准的HTTP方法，包括GET、POST、PUT、DELETE、PATCH等。',
        optionExplanations: {
            'A': '正确。Express支持GET方法。',
            'B': '正确。Express支持POST方法。',
            'C': '正确。Express支持PUT方法。',
            'D': '正确。Express支持DELETE方法。'
        },
        tags: ['HTTP方法', 'RESTful', 'Express路由']
    },

    // 6. 中间件概念
    {
        id: 6,
        type: 'single',
        question: 'Express中间件的作用是什么？',
        options: [
            { value: 'A', text: '只处理路由' },
            { value: 'B', text: '在请求-响应循环中执行代码' },
            { value: 'C', text: '只处理错误' },
            { value: 'D', text: '只处理静态文件' }
        ],
        correctAnswer: 'B',
        explanation: '中间件函数是在请求-响应循环中执行的函数，可以访问请求对象(req)、响应对象(res)和下一个中间件函数(next)。',
        optionExplanations: {
            'A': '错误。中间件不仅处理路由，还有很多其他功能。',
            'B': '正确。中间件在请求-响应循环中执行，是Express的核心概念。',
            'C': '错误。中间件不仅处理错误，还有很多其他类型。',
            'D': '错误。中间件不仅处理静态文件。'
        },
        tags: ['中间件', '请求响应循环', 'Express概念']
    },

    // 7. 中间件使用
    {
        id: 7,
        type: 'single',
        question: '使用中间件的方法是？',
        options: [
            { value: 'A', text: 'app.use()' },
            { value: 'B', text: 'app.middleware()' },
            { value: 'C', text: 'app.apply()' },
            { value: 'D', text: 'app.add()' }
        ],
        correctAnswer: 'A',
        explanation: 'app.use()方法用于挂载中间件函数到应用程序。',
        optionExplanations: {
            'A': '正确。app.use()是使用中间件的标准方法。',
            'B': '错误。没有middleware方法。',
            'C': '错误。apply不是Express的方法。',
            'D': '错误。add不是Express的方法。'
        },
        tags: ['中间件', 'app.use', '中间件挂载']
    },

    // 8. next函数
    {
        id: 8,
        type: 'single',
        question: '在Express中间件中，next()函数的作用是？',
        options: [
            { value: 'A', text: '结束响应' },
            { value: 'B', text: '传递控制权给下一个中间件' },
            { value: 'C', text: '重启应用' },
            { value: 'D', text: '返回上一个中间件' }
        ],
        correctAnswer: 'B',
        explanation: 'next()函数用于将控制权传递给下一个中间件函数。如果不调用next()，请求将被挂起。',
        optionExplanations: {
            'A': '错误。结束响应使用res.end()或res.send()。',
            'B': '正确。next()将控制权传递给下一个中间件。',
            'C': '错误。next()不会重启应用。',
            'D': '错误。next()是向前传递，不是返回。'
        },
        tags: ['next函数', '中间件', '控制流']
    },

    // 9. 静态文件服务
    {
        id: 9,
        type: 'single',
        question: '在Express中提供静态文件服务的中间件是？',
        options: [
            { value: 'A', text: 'express.static()' },
            { value: 'B', text: 'express.files()' },
            { value: 'C', text: 'express.serve()' },
            { value: 'D', text: 'express.public()' }
        ],
        correctAnswer: 'A',
        explanation: 'express.static()是Express内置的中间件，用于提供静态文件服务。',
        optionExplanations: {
            'A': '正确。express.static()是提供静态文件的内置中间件。',
            'B': '错误。没有files中间件。',
            'C': '错误。没有serve中间件。',
            'D': '错误。没有public中间件。'
        },
        tags: ['静态文件', 'express.static', '内置中间件']
    },

    // 10. 请求对象
    {
        id: 10,
        type: 'multiple',
        question: 'Express请求对象(req)包含哪些常用属性？',
        options: [
            { value: 'A', text: 'req.params' },
            { value: 'B', text: 'req.query' },
            { value: 'C', text: 'req.body' },
            { value: 'D', text: 'req.headers' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Express请求对象包含params（路由参数）、query（查询参数）、body（请求体）、headers（请求头）等属性。',
        optionExplanations: {
            'A': '正确。req.params包含路由参数。',
            'B': '正确。req.query包含查询字符串参数。',
            'C': '正确。req.body包含请求体数据。',
            'D': '正确。req.headers包含请求头信息。'
        },
        tags: ['请求对象', 'req属性', 'Express API']
    },

    // 11. 响应对象
    {
        id: 11,
        type: 'multiple',
        question: 'Express响应对象(res)包含哪些常用方法？',
        options: [
            { value: 'A', text: 'res.send()' },
            { value: 'B', text: 'res.json()' },
            { value: 'C', text: 'res.status()' },
            { value: 'D', text: 'res.redirect()' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Express响应对象提供了send()、json()、status()、redirect()等方法来处理响应。',
        optionExplanations: {
            'A': '正确。res.send()发送响应数据。',
            'B': '正确。res.json()发送JSON响应。',
            'C': '正确。res.status()设置状态码。',
            'D': '正确。res.redirect()重定向请求。'
        },
        tags: ['响应对象', 'res方法', 'Express API']
    },

    // 12. 路由参数
    {
        id: 12,
        type: 'single',
        question: '在路由"/users/:id"中，如何获取id参数？',
        options: [
            { value: 'A', text: 'req.query.id' },
            { value: 'B', text: 'req.params.id' },
            { value: 'C', text: 'req.body.id' },
            { value: 'D', text: 'req.id' }
        ],
        correctAnswer: 'B',
        explanation: '路由参数通过req.params对象访问，冒号(:)定义的参数会成为params对象的属性。',
        optionExplanations: {
            'A': '错误。req.query用于查询字符串参数。',
            'B': '正确。req.params用于路由参数。',
            'C': '错误。req.body用于请求体数据。',
            'D': '错误。req对象没有直接的id属性。'
        },
        tags: ['路由参数', 'req.params', '动态路由']
    },

    // 13. 查询参数
    {
        id: 13,
        type: 'single',
        question: '对于URL"/search?q=node&type=tutorial"，如何获取q参数？',
        options: [
            { value: 'A', text: 'req.params.q' },
            { value: 'B', text: 'req.query.q' },
            { value: 'C', text: 'req.body.q' },
            { value: 'D', text: 'req.search.q' }
        ],
        correctAnswer: 'B',
        explanation: '查询字符串参数通过req.query对象访问，Express会自动解析URL中的查询参数。',
        optionExplanations: {
            'A': '错误。req.params用于路由参数，不是查询参数。',
            'B': '正确。req.query用于访问查询字符串参数。',
            'C': '错误。req.body用于请求体数据。',
            'D': '错误。没有req.search对象。'
        },
        tags: ['查询参数', 'req.query', 'URL参数']
    },

    // 14. 请求体解析
    {
        id: 14,
        type: 'single',
        question: '要解析JSON格式的请求体，需要使用哪个中间件？',
        options: [
            { value: 'A', text: 'express.json()' },
            { value: 'B', text: 'express.parse()' },
            { value: 'C', text: 'express.body()' },
            { value: 'D', text: 'express.decode()' }
        ],
        correctAnswer: 'A',
        explanation: 'express.json()是Express内置的中间件，用于解析JSON格式的请求体。',
        optionExplanations: {
            'A': '正确。express.json()用于解析JSON请求体。',
            'B': '错误。没有parse中间件。',
            'C': '错误。没有body中间件。',
            'D': '错误。没有decode中间件。'
        },
        tags: ['请求体解析', 'express.json', 'JSON解析']
    },

    // 15. URL编码解析
    {
        id: 15,
        type: 'single',
        question: '要解析URL编码的表单数据，需要使用哪个中间件？',
        options: [
            { value: 'A', text: 'express.form()' },
            { value: 'B', text: 'express.urlencoded()' },
            { value: 'C', text: 'express.encoded()' },
            { value: 'D', text: 'express.formdata()' }
        ],
        correctAnswer: 'B',
        explanation: 'express.urlencoded()中间件用于解析URL编码的请求体，通常用于HTML表单数据。',
        optionExplanations: {
            'A': '错误。没有form中间件。',
            'B': '正确。express.urlencoded()用于解析URL编码数据。',
            'C': '错误。没有encoded中间件。',
            'D': '错误。没有formdata中间件。'
        },
        tags: ['URL编码', 'express.urlencoded', '表单数据']
    },

    // 16. 错误处理中间件
    {
        id: 16,
        type: 'single',
        question: 'Express错误处理中间件的参数个数是？',
        options: [
            { value: 'A', text: '3个：err, req, res' },
            { value: 'B', text: '4个：err, req, res, next' },
            { value: 'C', text: '2个：err, next' },
            { value: 'D', text: '1个：err' }
        ],
        correctAnswer: 'B',
        explanation: 'Express错误处理中间件必须有4个参数：err, req, res, next，这样Express才能识别它是错误处理中间件。',
        optionExplanations: {
            'A': '错误。缺少next参数。',
            'B': '正确。错误处理中间件必须有4个参数。',
            'C': '错误。缺少req和res参数。',
            'D': '错误。参数太少。'
        },
        tags: ['错误处理', '错误中间件', '参数签名']
    },

    // 17. 路由器
    {
        id: 17,
        type: 'single',
        question: '创建Express路由器的方法是？',
        options: [
            { value: 'A', text: 'express.Router()' },
            { value: 'B', text: 'new express.Router()' },
            { value: 'C', text: 'express.createRouter()' },
            { value: 'D', text: 'express.newRouter()' }
        ],
        correctAnswer: 'A',
        explanation: 'express.Router()方法创建一个模块化的、可挂载的路由处理器。',
        optionExplanations: {
            'A': '正确。express.Router()是创建路由器的标准方法。',
            'B': '错误。Router不是构造函数。',
            'C': '错误。没有createRouter方法。',
            'D': '错误。没有newRouter方法。'
        },
        tags: ['路由器', 'express.Router', '模块化路由']
    },

    // 18. 模板引擎
    {
        id: 18,
        type: 'single',
        question: '在Express中设置模板引擎的方法是？',
        options: [
            { value: 'A', text: 'app.engine()' },
            { value: 'B', text: 'app.set("view engine", "ejs")' },
            { value: 'C', text: 'app.template()' },
            { value: 'D', text: 'app.view()' }
        ],
        correctAnswer: 'B',
        explanation: 'app.set("view engine", "模板引擎名")用于设置Express应用的模板引擎。',
        optionExplanations: {
            'A': '错误。app.engine()用于注册模板引擎，不是设置。',
            'B': '正确。app.set()用于设置应用配置，包括模板引擎。',
            'C': '错误。没有template方法。',
            'D': '错误。没有view方法用于设置模板引擎。'
        },
        tags: ['模板引擎', 'app.set', '视图配置']
    },

    // 19. 视图目录
    {
        id: 19,
        type: 'single',
        question: '设置Express视图文件目录的方法是？',
        options: [
            { value: 'A', text: 'app.set("views", "./views")' },
            { value: 'B', text: 'app.views("./views")' },
            { value: 'C', text: 'app.setViews("./views")' },
            { value: 'D', text: 'app.viewDir("./views")' }
        ],
        correctAnswer: 'A',
        explanation: 'app.set("views", "目录路径")用于设置视图文件的目录。',
        optionExplanations: {
            'A': '正确。使用app.set()设置views配置。',
            'B': '错误。没有views方法。',
            'C': '错误。没有setViews方法。',
            'D': '错误。没有viewDir方法。'
        },
        tags: ['视图目录', 'views配置', '模板路径']
    },

    // 20. 渲染视图
    {
        id: 20,
        type: 'single',
        question: '在Express中渲染视图的方法是？',
        options: [
            { value: 'A', text: 'res.view()' },
            { value: 'B', text: 'res.render()' },
            { value: 'C', text: 'res.template()' },
            { value: 'D', text: 'res.display()' }
        ],
        correctAnswer: 'B',
        explanation: 'res.render()方法用于渲染视图模板并发送渲染后的HTML到客户端。',
        optionExplanations: {
            'A': '错误。没有view方法。',
            'B': '正确。res.render()是渲染视图的标准方法。',
            'C': '错误。没有template方法。',
            'D': '错误。没有display方法。'
        },
        tags: ['视图渲染', 'res.render', '模板渲染']
    },

    // 21. Cookie处理
    {
        id: 21,
        type: 'single',
        question: '在Express中设置Cookie的方法是？',
        options: [
            { value: 'A', text: 'res.cookie()' },
            { value: 'B', text: 'res.setCookie()' },
            { value: 'C', text: 'res.addCookie()' },
            { value: 'D', text: 'res.putCookie()' }
        ],
        correctAnswer: 'A',
        explanation: 'res.cookie()方法用于设置Cookie值。',
        optionExplanations: {
            'A': '正确。res.cookie()是设置Cookie的标准方法。',
            'B': '错误。没有setCookie方法。',
            'C': '错误。没有addCookie方法。',
            'D': '错误。没有putCookie方法。'
        },
        tags: ['Cookie', 'res.cookie', '会话管理']
    },

    // 22. Session中间件
    {
        id: 22,
        type: 'single',
        question: 'Express中常用的Session中间件是？',
        options: [
            { value: 'A', text: 'express-session' },
            { value: 'B', text: 'express-cookie' },
            { value: 'C', text: 'express-auth' },
            { value: 'D', text: 'express-login' }
        ],
        correctAnswer: 'A',
        explanation: 'express-session是Express官方推荐的Session中间件。',
        optionExplanations: {
            'A': '正确。express-session是标准的Session中间件。',
            'B': '错误。express-cookie不是Session中间件。',
            'C': '错误。express-auth不是标准的Session中间件。',
            'D': '错误。express-login不是Session中间件。'
        },
        tags: ['Session', 'express-session', '会话管理']
    },

    // 23. CORS处理
    {
        id: 23,
        type: 'single',
        question: '处理跨域请求(CORS)常用的Express中间件是？',
        options: [
            { value: 'A', text: 'express-cors' },
            { value: 'B', text: 'cors' },
            { value: 'C', text: 'express-cross' },
            { value: 'D', text: 'cross-origin' }
        ],
        correctAnswer: 'B',
        explanation: 'cors是处理跨域资源共享(CORS)的流行中间件。',
        optionExplanations: {
            'A': '错误。包名是cors，不是express-cors。',
            'B': '正确。cors是标准的CORS中间件。',
            'C': '错误。没有express-cross这个包。',
            'D': '错误。没有cross-origin这个标准包。'
        },
        tags: ['CORS', '跨域', 'cors中间件']
    },

    // 24. 日志中间件
    {
        id: 24,
        type: 'single',
        question: 'Express中常用的HTTP请求日志中间件是？',
        options: [
            { value: 'A', text: 'express-logger' },
            { value: 'B', text: 'morgan' },
            { value: 'C', text: 'express-log' },
            { value: 'D', text: 'http-logger' }
        ],
        correctAnswer: 'B',
        explanation: 'morgan是Express中最流行的HTTP请求日志中间件。',
        optionExplanations: {
            'A': '错误。不是标准的日志中间件名称。',
            'B': '正确。morgan是广泛使用的日志中间件。',
            'C': '错误。不是标准的日志中间件名称。',
            'D': '错误。不是Express专用的日志中间件。'
        },
        tags: ['日志', 'morgan', 'HTTP日志']
    },

    // 25. 文件上传
    {
        id: 25,
        type: 'single',
        question: '处理文件上传常用的Express中间件是？',
        options: [
            { value: 'A', text: 'express-upload' },
            { value: 'B', text: 'multer' },
            { value: 'C', text: 'express-file' },
            { value: 'D', text: 'file-upload' }
        ],
        correctAnswer: 'B',
        explanation: 'multer是处理multipart/form-data类型表单数据的中间件，主要用于文件上传。',
        optionExplanations: {
            'A': '错误。不是标准的文件上传中间件。',
            'B': '正确。multer是标准的文件上传中间件。',
            'C': '错误。不是标准的文件上传中间件。',
            'D': '错误。不是Express专用的文件上传中间件。'
        },
        tags: ['文件上传', 'multer', '表单数据']
    },

    // 26. RESTful API
    {
        id: 26,
        type: 'boolean',
        question: 'RESTful API中，GET请求应该是幂等的。',
        correctAnswer: true,
        explanation: 'GET请求应该是幂等的，即多次执行相同的GET请求应该产生相同的结果，且不应该改变服务器状态。',
        tags: ['RESTful', 'GET请求', '幂等性']
    },

    // 27. HTTP状态码
    {
        id: 27,
        type: 'single',
        question: '创建资源成功时应该返回哪个HTTP状态码？',
        options: [
            { value: 'A', text: '200 OK' },
            { value: 'B', text: '201 Created' },
            { value: 'C', text: '202 Accepted' },
            { value: 'D', text: '204 No Content' }
        ],
        correctAnswer: 'B',
        explanation: '201 Created状态码表示请求成功并且服务器创建了新的资源。',
        optionExplanations: {
            'A': '错误。200 OK用于一般的成功响应。',
            'B': '正确。201 Created专门用于资源创建成功。',
            'C': '错误。202 Accepted表示请求已接受但未完成处理。',
            'D': '错误。204 No Content表示成功但无内容返回。'
        },
        tags: ['HTTP状态码', '201 Created', 'RESTful']
    },

    // 28. 数据库连接
    {
        id: 28,
        type: 'single',
        question: '连接MongoDB数据库常用的Node.js驱动是？',
        options: [
            { value: 'A', text: 'mongodb' },
            { value: 'B', text: 'mongoose' },
            { value: 'C', text: 'mongo-driver' },
            { value: 'D', text: 'A和B都可以' }
        ],
        correctAnswer: 'D',
        explanation: 'mongodb是官方驱动，mongoose是基于mongodb的ODM库，两者都可以用来连接MongoDB。',
        optionExplanations: {
            'A': '部分正确。mongodb是官方驱动。',
            'B': '部分正确。mongoose是流行的ODM库。',
            'C': '错误。不是标准的MongoDB驱动名称。',
            'D': '正确。mongodb和mongoose都可以连接MongoDB。'
        },
        tags: ['MongoDB', 'mongoose', '数据库驱动']
    },

    // 29. Mongoose模型
    {
        id: 29,
        type: 'single',
        question: '在Mongoose中定义数据模型的方法是？',
        options: [
            { value: 'A', text: 'mongoose.model()' },
            { value: 'B', text: 'mongoose.create()' },
            { value: 'C', text: 'mongoose.define()' },
            { value: 'D', text: 'mongoose.schema()' }
        ],
        correctAnswer: 'A',
        explanation: 'mongoose.model()方法用于定义和创建数据模型。',
        optionExplanations: {
            'A': '正确。mongoose.model()用于创建模型。',
            'B': '错误。create是模型实例的方法，不是定义模型的方法。',
            'C': '错误。没有define方法用于定义模型。',
            'D': '错误。Schema是用于定义结构的，不是模型。'
        },
        tags: ['Mongoose', '数据模型', 'mongoose.model']
    },

    // 30. Schema定义
    {
        id: 30,
        type: 'single',
        question: '在Mongoose中定义数据结构的类是？',
        options: [
            { value: 'A', text: 'Model' },
            { value: 'B', text: 'Schema' },
            { value: 'C', text: 'Document' },
            { value: 'D', text: 'Collection' }
        ],
        correctAnswer: 'B',
        explanation: 'Schema类用于定义文档的结构、默认值、验证器等。',
        optionExplanations: {
            'A': '错误。Model是基于Schema创建的。',
            'B': '正确。Schema用于定义数据结构。',
            'C': '错误。Document是模型实例。',
            'D': '错误。Collection是MongoDB的集合概念。'
        },
        tags: ['Mongoose', 'Schema', '数据结构']
    },

    // 31. 数据验证
    {
        id: 31,
        type: 'multiple',
        question: 'Mongoose Schema支持哪些内置验证器？',
        options: [
            { value: 'A', text: 'required' },
            { value: 'B', text: 'min/max' },
            { value: 'C', text: 'enum' },
            { value: 'D', text: 'match' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Mongoose提供了丰富的内置验证器，包括required、min/max、enum、match等。',
        optionExplanations: {
            'A': '正确。required验证字段是否必填。',
            'B': '正确。min/max验证数值或字符串长度范围。',
            'C': '正确。enum验证值是否在指定枚举中。',
            'D': '正确。match验证字符串是否匹配正则表达式。'
        },
        tags: ['数据验证', 'Mongoose验证器', 'Schema验证']
    },

    // 32. 查询方法
    {
        id: 32,
        type: 'multiple',
        question: 'Mongoose提供哪些查询方法？',
        options: [
            { value: 'A', text: 'find()' },
            { value: 'B', text: 'findOne()' },
            { value: 'C', text: 'findById()' },
            { value: 'D', text: 'findOneAndUpdate()' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'Mongoose提供了丰富的查询方法来操作数据库。',
        optionExplanations: {
            'A': '正确。find()查询多个文档。',
            'B': '正确。findOne()查询单个文档。',
            'C': '正确。findById()根据ID查询文档。',
            'D': '正确。findOneAndUpdate()查找并更新文档。'
        },
        tags: ['Mongoose查询', '数据库操作', '查询方法']
    },

    // 33. 中间件类型
    {
        id: 33,
        type: 'multiple',
        question: 'Mongoose中间件有哪些类型？',
        options: [
            { value: 'A', text: 'pre中间件' },
            { value: 'B', text: 'post中间件' },
            { value: 'C', text: 'validate中间件' },
            { value: 'D', text: 'aggregate中间件' }
        ],
        correctAnswer: ['A', 'B'],
        explanation: 'Mongoose主要有pre（前置）和post（后置）中间件，用于在特定操作前后执行自定义逻辑。',
        optionExplanations: {
            'A': '正确。pre中间件在操作执行前运行。',
            'B': '正确。post中间件在操作执行后运行。',
            'C': '错误。validate是验证器，不是中间件类型。',
            'D': '错误。aggregate是查询方法，不是中间件类型。'
        },
        tags: ['Mongoose中间件', 'pre/post', '生命周期钩子']
    },

    // 34. 环境变量
    {
        id: 34,
        type: 'single',
        question: '在Node.js中管理环境变量常用的包是？',
        options: [
            { value: 'A', text: 'env' },
            { value: 'B', text: 'dotenv' },
            { value: 'C', text: 'config' },
            { value: 'D', text: 'environment' }
        ],
        correctAnswer: 'B',
        explanation: 'dotenv是最流行的环境变量管理包，可以从.env文件加载环境变量。',
        optionExplanations: {
            'A': '错误。env不是标准的环境变量管理包。',
            'B': '正确。dotenv是广泛使用的环境变量管理包。',
            'C': '错误。config通常用于配置管理，不专门用于环境变量。',
            'D': '错误。environment不是标准包名。'
        },
        tags: ['环境变量', 'dotenv', '配置管理']
    },

    // 35. JWT认证
    {
        id: 35,
        type: 'single',
        question: 'JWT的全称是什么？',
        options: [
            { value: 'A', text: 'JavaScript Web Token' },
            { value: 'B', text: 'JSON Web Token' },
            { value: 'C', text: 'Java Web Token' },
            { value: 'D', text: 'JSON Web Technology' }
        ],
        correctAnswer: 'B',
        explanation: 'JWT全称是JSON Web Token，是一种用于安全传输信息的开放标准。',
        optionExplanations: {
            'A': '错误。不是JavaScript Web Token。',
            'B': '正确。JWT是JSON Web Token的缩写。',
            'C': '错误。不是Java Web Token。',
            'D': '错误。不是JSON Web Technology。'
        },
        tags: ['JWT', '认证', 'JSON Web Token']
    },

    // 36. 密码加密
    {
        id: 36,
        type: 'single',
        question: '在Node.js中进行密码哈希常用的库是？',
        options: [
            { value: 'A', text: 'crypto' },
            { value: 'B', text: 'bcrypt' },
            { value: 'C', text: 'hash' },
            { value: 'D', text: 'password' }
        ],
        correctAnswer: 'B',
        explanation: 'bcrypt是专门用于密码哈希的库，提供了安全的密码加密和验证功能。',
        optionExplanations: {
            'A': '部分正确。crypto是核心模块，可以用于哈希，但bcrypt更专业。',
            'B': '正确。bcrypt是密码哈希的标准选择。',
            'C': '错误。hash不是标准的密码哈希库。',
            'D': '错误。password不是标准库名。'
        },
        tags: ['密码加密', 'bcrypt', '安全']
    },

    // 37. API文档
    {
        id: 37,
        type: 'single',
        question: '为Express API生成文档常用的工具是？',
        options: [
            { value: 'A', text: 'swagger' },
            { value: 'B', text: 'apidoc' },
            { value: 'C', text: 'postman' },
            { value: 'D', text: 'A和B都可以' }
        ],
        correctAnswer: 'D',
        explanation: 'Swagger和ApiDoc都是流行的API文档生成工具，Postman主要用于API测试。',
        optionExplanations: {
            'A': '部分正确。Swagger是流行的API文档工具。',
            'B': '部分正确。ApiDoc也是常用的文档生成工具。',
            'C': '错误。Postman主要用于API测试，不是文档生成工具。',
            'D': '正确。Swagger和ApiDoc都可以生成API文档。'
        },
        tags: ['API文档', 'Swagger', 'ApiDoc']
    },

    // 38. 测试框架
    {
        id: 38,
        type: 'multiple',
        question: 'Node.js中常用的测试框架有哪些？',
        options: [
            { value: 'A', text: 'Mocha' },
            { value: 'B', text: 'Jest' },
            { value: 'C', text: 'Jasmine' },
            { value: 'D', text: 'Chai' }
        ],
        correctAnswer: ['A', 'B', 'C'],
        explanation: 'Mocha、Jest、Jasmine都是流行的JavaScript测试框架，Chai是断言库。',
        optionExplanations: {
            'A': '正确。Mocha是流行的测试框架。',
            'B': '正确。Jest是Facebook开发的测试框架。',
            'C': '正确。Jasmine是行为驱动的测试框架。',
            'D': '错误。Chai是断言库，不是测试框架。'
        },
        tags: ['测试框架', 'Mocha', 'Jest', 'Jasmine']
    },

    // 39. 性能监控
    {
        id: 39,
        type: 'single',
        question: '监控Express应用性能常用的工具是？',
        options: [
            { value: 'A', text: 'New Relic' },
            { value: 'B', text: 'PM2' },
            { value: 'C', text: 'Clinic.js' },
            { value: 'D', text: '以上都可以' }
        ],
        correctAnswer: 'D',
        explanation: 'New Relic、PM2、Clinic.js都可以用于监控Node.js应用的性能。',
        optionExplanations: {
            'A': '部分正确。New Relic是专业的应用性能监控工具。',
            'B': '部分正确。PM2提供了进程管理和基本监控功能。',
            'C': '部分正确。Clinic.js是Node.js性能诊断工具。',
            'D': '正确。这些工具都可以用于性能监控。'
        },
        tags: ['性能监控', 'New Relic', 'PM2', 'Clinic.js']
    },

    // 40. 进程管理
    {
        id: 40,
        type: 'single',
        question: '在生产环境中管理Node.js进程常用的工具是？',
        options: [
            { value: 'A', text: 'nodemon' },
            { value: 'B', text: 'PM2' },
            { value: 'C', text: 'forever' },
            { value: 'D', text: 'supervisor' }
        ],
        correctAnswer: 'B',
        explanation: 'PM2是生产环境中最流行的Node.js进程管理器，提供了负载均衡、监控、日志等功能。',
        optionExplanations: {
            'A': '错误。nodemon主要用于开发环境的自动重启。',
            'B': '正确。PM2是生产环境的标准选择。',
            'C': '错误。forever功能相对简单，不如PM2强大。',
            'D': '错误。supervisor主要用于开发环境。'
        },
        tags: ['进程管理', 'PM2', '生产环境']
    },

    // 41. 缓存策略
    {
        id: 41,
        type: 'multiple',
        question: 'Express应用中常用的缓存策略有哪些？',
        options: [
            { value: 'A', text: '内存缓存' },
            { value: 'B', text: 'Redis缓存' },
            { value: 'C', text: 'HTTP缓存头' },
            { value: 'D', text: 'CDN缓存' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: '常用的缓存策略包括内存缓存、Redis缓存、HTTP缓存头和CDN缓存。',
        optionExplanations: {
            'A': '正确。内存缓存速度快，适合小数据量。',
            'B': '正确。Redis提供了强大的缓存功能。',
            'C': '正确。HTTP缓存头可以控制浏览器缓存。',
            'D': '正确。CDN可以缓存静态资源。'
        },
        tags: ['缓存策略', 'Redis', 'HTTP缓存', 'CDN']
    },

    // 42. 安全中间件
    {
        id: 42,
        type: 'single',
        question: '提供Express应用安全防护的中间件是？',
        options: [
            { value: 'A', text: 'helmet' },
            { value: 'B', text: 'security' },
            { value: 'C', text: 'express-security' },
            { value: 'D', text: 'safe' }
        ],
        correctAnswer: 'A',
        explanation: 'helmet是Express应用的安全中间件，可以设置各种HTTP头来保护应用。',
        optionExplanations: {
            'A': '正确。helmet是标准的Express安全中间件。',
            'B': '错误。security不是标准的Express中间件。',
            'C': '错误。express-security不是标准包名。',
            'D': '错误。safe不是Express安全中间件。'
        },
        tags: ['安全', 'helmet', '安全中间件']
    },

    // 43. 限流中间件
    {
        id: 43,
        type: 'single',
        question: '实现API限流功能常用的Express中间件是？',
        options: [
            { value: 'A', text: 'express-rate-limit' },
            { value: 'B', text: 'rate-limiter' },
            { value: 'C', text: 'express-limit' },
            { value: 'D', text: 'api-limit' }
        ],
        correctAnswer: 'A',
        explanation: 'express-rate-limit是实现API限流的标准中间件。',
        optionExplanations: {
            'A': '正确。express-rate-limit是标准的限流中间件。',
            'B': '错误。rate-limiter不是Express专用中间件。',
            'C': '错误。express-limit不是标准包名。',
            'D': '错误。api-limit不是标准包名。'
        },
        tags: ['限流', 'express-rate-limit', 'API保护']
    },

    // 44. 数据库连接池
    {
        id: 44,
        type: 'boolean',
        question: '在生产环境中，应该使用数据库连接池来管理数据库连接。',
        correctAnswer: true,
        explanation: '连接池可以重用数据库连接，提高性能并控制并发连接数，是生产环境的最佳实践。',
        tags: ['数据库连接池', '性能优化', '最佳实践']
    },

    // 45. 错误日志
    {
        id: 45,
        type: 'single',
        question: 'Node.js中流行的日志库是？',
        options: [
            { value: 'A', text: 'winston' },
            { value: 'B', text: 'bunyan' },
            { value: 'C', text: 'pino' },
            { value: 'D', text: '以上都是' }
        ],
        correctAnswer: 'D',
        explanation: 'winston、bunyan、pino都是Node.js中流行的日志库。',
        optionExplanations: {
            'A': '部分正确。winston是最流行的日志库之一。',
            'B': '部分正确。bunyan也是流行的日志库。',
            'C': '部分正确。pino是高性能的日志库。',
            'D': '正确。这些都是流行的Node.js日志库。'
        },
        tags: ['日志', 'winston', 'bunyan', 'pino']
    },

    // 46. API版本控制
    {
        id: 46,
        type: 'multiple',
        question: 'RESTful API版本控制的常用方式有哪些？',
        options: [
            { value: 'A', text: 'URL路径版本控制' },
            { value: 'B', text: '请求头版本控制' },
            { value: 'C', text: '查询参数版本控制' },
            { value: 'D', text: '子域名版本控制' }
        ],
        correctAnswer: ['A', 'B', 'C', 'D'],
        explanation: 'API版本控制可以通过URL路径、请求头、查询参数、子域名等多种方式实现。',
        optionExplanations: {
            'A': '正确。如/api/v1/users是常用方式。',
            'B': '正确。通过Accept或自定义头控制版本。',
            'C': '正确。如/api/users?version=1。',
            'D': '正确。如v1.api.example.com。'
        },
        tags: ['API版本控制', 'RESTful', '版本管理']
    },

    // 47. 微服务架构
    {
        id: 47,
        type: 'boolean',
        question: 'Express应用可以作为微服务架构中的一个服务。',
        correctAnswer: true,
        explanation: 'Express应用轻量级且灵活，非常适合作为微服务架构中的独立服务。',
        tags: ['微服务', 'Express', '架构设计']
    },

    // 48. 容器化部署
    {
        id: 48,
        type: 'single',
        question: '将Node.js应用容器化常用的技术是？',
        options: [
            { value: 'A', text: 'Docker' },
            { value: 'B', text: 'Kubernetes' },
            { value: 'C', text: 'Podman' },
            { value: 'D', text: '以上都可以' }
        ],
        correctAnswer: 'D',
        explanation: 'Docker、Kubernetes、Podman都可以用于Node.js应用的容器化部署。',
        optionExplanations: {
            'A': '部分正确。Docker是最流行的容器化技术。',
            'B': '部分正确。Kubernetes用于容器编排。',
            'C': '部分正确。Podman是Docker的替代方案。',
            'D': '正确。这些技术都可以用于容器化部署。'
        },
        tags: ['容器化', 'Docker', 'Kubernetes', '部署']
    },

    // 49. 负载均衡
    {
        id: 49,
        type: 'single',
        question: '在Node.js集群中实现负载均衡的方式是？',
        options: [
            { value: 'A', text: '使用cluster模块' },
            { value: 'B', text: '使用PM2' },
            { value: 'C', text: '使用Nginx反向代理' },
            { value: 'D', text: '以上都可以' }
        ],
        correctAnswer: 'D',
        explanation: 'cluster模块、PM2、Nginx反向代理都可以实现Node.js应用的负载均衡。',
        optionExplanations: {
            'A': '部分正确。cluster模块可以创建多个工作进程。',
            'B': '部分正确。PM2提供了集群模式。',
            'C': '部分正确。Nginx可以做反向代理负载均衡。',
            'D': '正确。这些方式都可以实现负载均衡。'
        },
        tags: ['负载均衡', 'cluster', 'PM2', 'Nginx']
    },

    // 50. 最佳实践
    {
        id: 50,
        type: 'boolean',
        question: '在Express应用中，应该始终使用HTTPS来保护数据传输。',
        correctAnswer: true,
        explanation: 'HTTPS可以加密数据传输，防止中间人攻击，是生产环境的必要安全措施。',
        tags: ['HTTPS', '安全', '最佳实践']
    }
];

// 导出题库供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.stage2Questions;
}