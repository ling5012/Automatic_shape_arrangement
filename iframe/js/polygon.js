// 生成多边形顶点坐标
function arrangePolygonPoints(count, centerX, centerY, radius, sides) {
    const points = [];
    sides = parseInt(sides) || 6; // 默认6边形
    sides = Math.max(3, Math.min(9, sides)); // 限制3-9边形

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY - radius
        });
        return points;
    }

    // 多边形起始角度（和圆形一致，向上）
    const startAngle = -Math.PI / 2;
    const angleStep = (2 * Math.PI) / count; // 选中元素的分布角度步长
    const polygonAngleStep = (2 * Math.PI) / sides; // 多边形自身的角度步长

    for (let i = 0; i < count; i++) {
        // 计算当前元素在多边形上的角度
        const distributeAngle = startAngle + i * angleStep;
        // 计算多边形顶点的基础角度（适配多边形边数）
        const polygonAngle = startAngle + (i % sides) * polygonAngleStep;

        const x = centerX + radius * Math.cos(polygonAngle);
        const y = centerY + radius * Math.sin(polygonAngle);

        points.push({ x, y });
    }

    return points;
}

// 多边形排列主函数（带边数参数）
async function arrange_polygon(para_radius, para_sides) {
    try {
        const validItems = await eda.pcb_SelectControl.getAllSelectedPrimitives();
        const count = validItems.length;
        console.log("选中的个数：", count);
        
        if (count < 1) {
            throw new Error(`没有选中的目标`);
        }

        // 计算选中元素的中心坐标
        let sum_x = 0, sum_y = 0;
        for (let i = 0; i < count; i++) {
            sum_x += validItems[i].getState_X();
            sum_y += validItems[i].getState_Y();
        }
        const average_x = sum_x / count;
        const average_y = sum_y / count;
        console.log("中心坐标：", average_x, average_y);

        // 生成多边形顶点
        const points = arrangePolygonPoints(count, average_x, average_y, para_radius, para_sides);

        // 分配坐标到选中元素
        for (let i = 0; i < points.length; i++) {
            validItems[i].setState_X(points[i].x);
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    } catch (error) {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }
}


