// 题库汇总文件 - 导入所有阶段的题目
// 这个文件将所有阶段的题目整合到一个统一的数据结构中

// 题库存储对象
const STAGE_QUESTIONS = {
    'stage1': [], // 基础入门
    'stage2': [], // 进阶入门  
    'stage3': [], // 高阶精进
    'stage4': [], // 面试与实战
    'stage5': []  // 源码解析与内核探秘
};

// 异步加载题库函数
async function loadQuestions() {
    try {
        console.log('开始加载题库...');
        
        // 等待所有题库文件加载完成
        // 由于题库文件通过script标签加载，我们需要等待它们完成
        await new Promise(resolve => {
            let loadedCount = 0;
            const totalFiles = 5;
            
            const checkLoaded = () => {
                if (window.stage1Questions && 
                    window.stage2Questions && 
                    window.stage3Questions && 
                    window.stage4Questions && 
                    window.stage5Questions) {
                    resolve();
                } else if (loadedCount < 50) { // 最多等待5秒
                    loadedCount++;
                    setTimeout(checkLoaded, 100);
                } else {
                    resolve(); // 超时也继续执行
                }
            };
            
            checkLoaded();
        });
        
        // 将题目分配到对应阶段
        STAGE_QUESTIONS['stage1'] = window.stage1Questions || [];
        STAGE_QUESTIONS['stage2'] = window.stage2Questions || [];
        STAGE_QUESTIONS['stage3'] = window.stage3Questions || [];
        STAGE_QUESTIONS['stage4'] = window.stage4Questions || [];
        STAGE_QUESTIONS['stage5'] = window.stage5Questions || [];
        
        console.log('题库加载完成:', {
            stage1: STAGE_QUESTIONS['stage1'].length,
            stage2: STAGE_QUESTIONS['stage2'].length,
            stage3: STAGE_QUESTIONS['stage3'].length,
            stage4: STAGE_QUESTIONS['stage4'].length,
            stage5: STAGE_QUESTIONS['stage5'].length
        });
        
        return true;
    } catch (error) {
        console.error('题库加载失败:', error);
        return false;
    }
}

// 获取指定阶段的题目
function getStageQuestions(stageId) {
    return STAGE_QUESTIONS[stageId] || [];
}

// 导出函数供其他模块使用
window.loadQuestions = loadQuestions;
window.getStageQuestions = getStageQuestions;
window.STAGE_QUESTIONS = STAGE_QUESTIONS;