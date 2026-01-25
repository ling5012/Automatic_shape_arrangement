// 生成心形顶点坐标（基于心形公式）
function arrangeHeartPoints(count, centerX, centerY, radius) {
    const points = [];

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
        // 心形参数方程：x = 16sin³θ, y = 13cosθ - 5cos2θ - 2cos3θ - cos4θ
        const t = angle;
        const heartX = 16 * Math.pow(Math.sin(t), 3);
        const heartY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        // 缩放并平移到中心位置
        const scale = radius / 16; // 适配半径
        const x = centerX + heartX * scale;
        const y = centerY - heartY * scale; // 反转y轴适配坐标系

        points.push({ x, y });
    }

    return points;
}

// 心形排列主函数
async function arrange_heart(para_radius) {
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

        const points = arrangeHeartPoints(count, average_x, average_y, para_radius);

        for (let i = 0; i < points.length; i++) {
            validItems[i].setState_X(points[i].x);
            validItems[i].setState_Y(points[i].y);
            validItems[i].done();
        }

    } catch (error) {
        eda.sys_ToastMessage.showMessage(error.message, 1);
    }
}
