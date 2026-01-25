// 生成梅花（五瓣花）顶点坐标
function arrangePlumPoints(count, centerX, centerY, radius) {
    const points = [];
    // 梅花花瓣的缩放比例
    const petalRadius = radius * 0.6;

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY - radius
        });
        return points;
    }

    const startAngle = -Math.PI / 2;
    const angleStep = (2 * Math.PI) / count;
    // 梅花5个花瓣的基础角度
    const plumAngleStep = (2 * Math.PI) / 5;

    for (let i = 0; i < count; i++) {
        const angle = startAngle + i * angleStep;
        // 计算花瓣位置（基于玫瑰线公式）
        const t = angle;
        const plumR = radius + petalRadius * Math.sin(5 * t); // 5瓣花的玫瑰线

        const x = centerX + plumR * Math.cos(t);
        const y = centerY + plumR * Math.sin(t);

        points.push({ x, y });
    }

    return points;
}

// 梅花排列主函数
async function arrange_plum(para_radius) {
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

        const points = arrangePlumPoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {
            validItems[i].setState_X(points[i].x);
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    } catch (error) {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }
}
