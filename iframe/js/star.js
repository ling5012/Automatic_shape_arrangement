function arrangeStarPoints(count, centerX, centerY, radius) {
    const points = [];

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY - radius
        });
        return points;
    }

    // 1. 生成五角星的顶点（真正的五角星公式）
    const vertices = [];
    const outerRadius = radius;
    const innerRadius = radius * 0.382; // 五角星内圆半径比例（黄金比例）

    for (let i = 0; i < 10; i++) {
        const angle = -Math.PI / 2 + i * (Math.PI / 5);
        const r = (i % 2 === 0) ? outerRadius : innerRadius;

        let x = r * Math.cos(angle);
        let y = r * Math.sin(angle);

        // 关键：上下翻转 Y，让尖角朝上
        y = -y;

        vertices.push({ x, y });
    }

    // 2. 沿着五角星的边生成大量采样点
    const samples = [];
    const samplesPerEdge = 50;

    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];

        for (let j = 0; j < samplesPerEdge; j++) {
            const t = j / samplesPerEdge;
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

async function arrange_star(para_radius) {

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

        const points = arrangeStarPoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {
            validItems[i].setState_X(points[i].x);
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    } catch (error) {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }
}
