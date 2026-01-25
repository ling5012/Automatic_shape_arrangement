function arrangeDropPoints(count, centerX, centerY, radius) {
    const points = [];

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY + radius * 0.6   // 尖点朝下
        });
        return points;
    }

    // 1. 生成水滴形采样点（上圆 + 下尖）
    const sampleCount = 1000;
    const samples = [];

    for (let i = 0; i < sampleCount; i++) {
        const t = (i / sampleCount) * 2 * Math.PI;

        // 水滴形公式（极坐标）
        const r = radius * (1 + 0.5 * Math.sin(3 * t));

        let x = r * Math.cos(t);
        let y = r * Math.sin(t);

        // 翻转 Y，让尖点朝下
        y = -y;

        samples.push({ x, y });
    }

    // 2. 计算总长度
    let totalLength = 0;
    const segmentLengths = [];

    for (let i = 1; i < sampleCount; i++) {
        const dx = samples[i].x - samples[i - 1].x;
        const dy = samples[i].y - samples[i - 1].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        segmentLengths.push(len);
        totalLength += len;
    }

    // 3. 等距取点
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

async function arrange_drop(para_radius) {

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

        const points = arrangeDropPoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {
            validItems[i].setState_X(points[i].x);
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    } catch (error) {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }
}
