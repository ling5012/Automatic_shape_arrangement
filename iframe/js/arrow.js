function arrangeArrowPoints(count, centerX, centerY, radius) {
    const points = [];

    if (count === 1) {
        points.push({
            x: centerX + radius * 0.6,
            y: centerY
        });
        return points;
    }

    // 箭头尺寸比例（保持你引用版本的参数）
    const headW = radius * 0.6;   // 箭头头部宽度
    const headL = radius * 0.4;   // 箭头头部长度
    const bodyW = radius * 0.2;   // 箭身宽度

    // 1. 定义箭头的顶点（只改尾部）
    const vertices = [
        { x:  radius * 0.6, y: 0 },                                   // 0 尖点
        { x:  radius * 0.6 - headL, y:  headW / 2 },                  // 1 右上
        { x:  radius * 0.6 - headL, y:  bodyW / 2 },                  // 2 箭身上沿开始
        { x: -radius * 0.6, y:  bodyW / 2 },                           // 3 尾部右上（平直）
        { x: -radius * 0.6, y: -bodyW / 2 },                           // 4 尾部左下（平直）
        { x:  radius * 0.6 - headL, y: -bodyW / 2 },                  // 5 箭身下沿开始
        { x:  radius * 0.6 - headL, y: -headW / 2 },                  // 6 右下
        { x:  radius * 0.6, y: 0 }                                    // 7 闭合到尖点
    ];

    // 2. 按弧长均匀采样（关键修复）
    const samples = [];
    const totalEdgeLength = [];
    let fullLength = 0;

    // 先计算每一条边的长度
    for (let i = 0; i < vertices.length - 1; i++) {
        const p1 = vertices[i];
        const p2 = vertices[i + 1];
        const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        totalEdgeLength.push(len);
        fullLength += len;
    }

    // 每条边按长度分配采样点（总采样点 1000）
    const sampleCount = 1000;
    for (let i = 0; i < vertices.length - 1; i++) {
        const p1 = vertices[i];
        const p2 = vertices[i + 1];
        const edgeLen = totalEdgeLength[i];
        const edgeSampleCount = Math.round((edgeLen / fullLength) * sampleCount);

        for (let j = 0; j < edgeSampleCount; j++) {
            const t = j / edgeSampleCount;
            const x = p1.x + t * (p2.x - p1.x);
            const y = p1.y + t * (p2.y - p1.y);
            samples.push({ x, y });
        }
    }

    // 3. 计算总长度
    let totalLength = 0;
    const segmentLengths = [];

    for (let i = 1; i < samples.length; i++) {
        const dx = samples[i].x - samples[i - 1].x;
        const dy = samples[i].y - samples[i - 1].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        segmentLengths.push(len);
        totalLength += len;
    }

    // 4. 等距取点
    const stepDistance = totalLength / count;
    let currentDistance = 0;
    let sampleIndex = 0;

    // 第一个点
    let first = samples[0];
    points.push({
        x: centerX + first.x,
        y: centerY + first.y
    });

    for (let i = 1; i < count; i++) {
        currentDistance += stepDistance;

        while (sampleIndex < segmentLengths.length && currentDistance > 0) {
            currentDistance -= segmentLengths[sampleIndex];
            sampleIndex++;
        }

        if (sampleIndex >= samples.length) sampleIndex = samples.length - 1;

        const p = samples[sampleIndex];

        points.push({
            x: centerX + p.x,
            y: centerY + p.y
        });
    }

    return points;
}

async function arrange_arrow(para_radius) {

    try {
        const validItems = await eda.pcb_SelectControl.getAllSelectedPrimitives();
        const count = validItems.length;
        console.log("选中的个数：", count);

        if (count < 1) {
            throw new Error(`没有选中的目标`);
        }

        let sum_x = 0, sum_y = 0;
        for (let i = 0; i < count; i++) {
            sum_x += validItems[i].getState_X();
            sum_y += validItems[i].getState_Y();
        }

        const average_x = sum_x / count;
        const average_y = sum_y / count;
        console.log("中心坐标：", average_x, average_y);

        const points = arrangeArrowPoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {
            validItems[i].setState_X(points[i].x);
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    } catch (error) {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }
}


