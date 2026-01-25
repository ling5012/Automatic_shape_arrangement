// 生成月亮（月牙）顶点坐标
function arrangeMoonPoints(count, centerX, centerY, radius) {
    const points = [];
    // 月亮的偏移半径（形成月牙效果）
    const offsetRadius = radius * 0.3;

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY - radius
        });
        return points;
    }

    const startAngle = -Math.PI / 2;
    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
        const angle = startAngle + i * angleStep;
        // 计算月亮外侧和内侧的坐标（偏移形成月牙）
        const outerX = centerX + radius * Math.cos(angle);
        const outerY = centerY + radius * Math.sin(angle);
        
        // 内侧偏移（向左）
        const innerX = centerX + (radius - offsetRadius) * Math.cos(angle + Math.PI / 6);
        const innerY = centerY + (radius - offsetRadius) * Math.sin(angle + Math.PI / 6);

        // 交替取外侧和内侧点，形成月牙
        const useOuter = i % 2 === 0;
        const x = useOuter ? outerX : innerX;
        const y = useOuter ? outerY : innerY;

        points.push({ x, y });
    }

    return points;
}

// 月亮排列主函数
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
