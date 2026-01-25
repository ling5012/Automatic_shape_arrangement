function arrangeHeartPoints(count, centerX, centerY, radius) {
    const points = [];

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY + radius * 0.6   // 尖尖朝下
        });
        return points;
    }

    // 1. 先生成大量采样点（1000 个），用于计算路径
    const sampleCount = 1000;
    const samples = [];

    for (let i = 0; i < sampleCount; i++) {
        const t = (i / sampleCount) * Math.PI * 2;

        // 心形公式（原版尖尖朝上）
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

        // ------------------------------
        // 关键：方向正确的那一版的代码
        // 翻转两次 Y，让尖尖朝下
        y = -y;
        y = -y;
        // ------------------------------

        samples.push({ x, y });
    }

    // 2. 计算每一段的长度，并累积总长度
    const segmentLengths = [];
    let totalLength = 0;

    for (let i = 1; i < sampleCount; i++) {
        const dx = samples[i].x - samples[i - 1].x;
        const dy = samples[i].y - samples[i - 1].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        segmentLengths.push(len);
        totalLength += len;
    }

    // 3. 按总长度平均分配每个点的位置
    const stepDistance = totalLength / count;
    let currentDistance = 0;
    let sampleIndex = 0;

    // 第一个点
    let first = samples[0];
    let scale = radius / 16;

    points.push({
        x: centerX + first.x * scale,
        y: centerY + first.y * scale
    });

    for (let i = 1; i < count; i++) {
        currentDistance += stepDistance;

        // 找到对应的采样点
        while (sampleIndex < segmentLengths.length && currentDistance > 0) {
            currentDistance -= segmentLengths[sampleIndex];
            sampleIndex++;
        }

        // 防止越界
        if (sampleIndex >= samples.length) sampleIndex = samples.length - 1;

        const p = samples[sampleIndex];

        // 缩放和平移
        scale = radius / 16;

        points.push({
            x: centerX + p.x * scale,
            y: centerY + p.y * scale
        });
    }

    return points;
}

async function arrange_heart(para_radius) {

    try
    {            
        const validItems = await eda.pcb_SelectControl.getAllSelectedPrimitives();
        
        const count = validItems.length; // 获取数字的个数
        console.log("选中的个数：", count);
        if (count<1) {
            throw new Error(`没有选中的目标`);
        }
        
        let sum_x = 0;
        let sum_y = 0;

        for (let i = 0; i < count; i++) {
            sum_x += validItems[i].getState_X();
            sum_y += validItems[i].getState_Y();
        }

        let average_x;
        average_x = sum_x / count;          
        console.log("x平均值：",average_x);

        let average_y;
        average_y = sum_y / count;          
        console.log("y平均值：",average_y);
        
        const points = arrangeHeartPoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {        
            validItems[i].setState_X(points[i].x);    
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    }
    catch (error)
    {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }

}

