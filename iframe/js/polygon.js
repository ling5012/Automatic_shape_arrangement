function arrangePolygonPoints(count, centerX, centerY, radius, sides) {
    const points = [];

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY - radius
        });
        return points;
    }

    // 限制边数 3~9
    sides = parseInt(sides) || 6;
    sides = Math.max(3, Math.min(9, sides));

    // 1. 生成多边形的顶点
    const vertices = [];
    const angleStep = (2 * Math.PI) / sides;
    let angle = -Math.PI / 2; // 从正上方开始

    for (let i = 0; i < sides; i++) {
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push({ x, y });
        angle += angleStep;
    }

    // 2. 生成大量采样点（沿着多边形的边）
    const samples = [];
    const samplesPerEdge = 100; // 每条边采样 100 个点

    for (let i = 0; i < sides; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % sides];

        // 插值
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

async function arrange_polygon(para_radius, para_sides) {

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

        const points = arrangePolygonPoints(count, average_x, average_y, para_radius, para_sides);

        for (let i = 0; i < points.length; i++) {
            validItems[i].setState_X(points[i].x);
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    } catch (error) {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }
}
