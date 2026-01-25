function arrangeMoonPoints(count, centerX, centerY, radius) {
    const points = [];

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY - radius
        });
        return points;
    }

    // 外圆半径
    const outerR = radius;
    // 内圆半径必须等于外圆半径（因为要贴端点）
    // 但我们只画右半边，所以看起来更小
    const innerR = outerR;

    // 外半圆（左半边）采样点
    const outerSamples = [];
    // 内半圆（右半边，向右凸）采样点
    const innerSamples = [];

    const sampleCount = 300;

    // 1. 外半圆：左半边（从 (0, +R) 到 (0, -R)）
    for (let i = 0; i <= sampleCount; i++) {
        const t = Math.PI / 2 + (i / sampleCount) * Math.PI;
        const x = outerR * Math.cos(t);
        const y = outerR * Math.sin(t);
        outerSamples.push({ x, y });
    }

    // 2. 内半圆：右半边（从 (0, -R) 到 (0, +R)）
    // 这样端点完全对齐
    for (let i = 0; i <= sampleCount; i++) {
        const t = 3 * Math.PI / 2 - (i / sampleCount) * Math.PI;
        const x = innerR * Math.cos(t);
        const y = innerR * Math.sin(t);
        // 内圆缩小一点，让月牙有厚度
        const scale = 0.6;
        innerSamples.push({ x: x * scale, y: y });
    }

    // 合并外半圆 + 内半圆 → 闭合半月形
    const samples = outerSamples.concat(innerSamples);

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

async function arrange_moon(para_radius) {

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

        const points = arrangeMoonPoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {
            validItems[i].setState_X(points[i].x);
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    } catch (error) {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }
}
