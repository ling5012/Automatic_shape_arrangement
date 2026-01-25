// 生成五角星顶点坐标
function arrangeStarPoints(count, centerX, centerY, radius) {
    const points = [];
    // 五角星内外半径比例（0.382是黄金比例）
    const innerRadius = radius * 0.382;

    if (count === 1) {
        points.push({
            x: centerX,
            y: centerY - radius
        });
        return points;
    }

    const startAngle = -Math.PI / 2;
    const angleStep = (2 * Math.PI) / count;
    // 五角星每个角的角度步长
    const starAngleStep = (2 * Math.PI) / 10; // 10个顶点（5外5内）

    for (let i = 0; i < count; i++) {
        const angle = startAngle + i * angleStep;
        // 计算当前点在五角星上的位置（交替内外半径）
        const starIndex = i % 10;
        const useOuterRadius = starIndex % 2 === 0;
        const currentRadius = useOuterRadius ? radius : innerRadius;

        const x = centerX + currentRadius * Math.cos(angle);
        const y = centerY + currentRadius * Math.sin(angle);

        points.push({ x, y });
    }

    return points;
}

// 五角星排列主函数
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

